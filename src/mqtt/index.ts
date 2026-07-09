import WebSocket from 'ws';
import { inflateSync, deflateSync } from 'node:zlib';
import { randomBytes } from 'node:crypto';
import type * as https from 'node:https';
import type { CookieJar } from 'tough-cookie';
import type { TypedEventEmitter } from '../events/index.js';
import type { Logger } from '../logger/index.js';
import type { Config } from '../config/index.js';
import { MQTT_BROKERS, MQTT_APP_ID, MQTT_KEEPALIVE_SEC } from '../constants/index.js';
import { getCookieString } from '../cookies/index.js';

// ─── MQTT packet type constants ────────────────────────────────────────────────
const MQTT_CONNECT     = 0x10;
const MQTT_CONNACK     = 0x20;
const MQTT_PUBLISH     = 0x30;
const MQTT_PUBACK      = 0x40;
const MQTT_SUBSCRIBE   = 0x82;
const MQTT_SUBACK      = 0x90;
const MQTT_UNSUBSCRIBE = 0xa2;
const MQTT_UNSUBACK    = 0xb0;
const MQTT_PINGREQ     = 0xc0;
const MQTT_PINGRESP    = 0xd0;
const MQTT_DISCONNECT  = 0xe0;

/**
 * Core topics required for a complete Messenger real-time session.
 * These are subscribed on every connect (and restored after reconnect).
 * Additional topics can be added at runtime via `subscribeTopic()`.
 */
const CORE_TOPICS = [
  '/t_ms',        // Messenger delta events (messages, thread updates, reactions, …)
  '/t_p',         // Presence updates
  '/t_rtc',       // Typing indicators / WebRTC signalling
  '/webrtc',      // WebRTC media signalling
  '/sr_res',      // Send-receipt responses
  '/ls_resp',     // Lightspeed / Inbox v2 responses
  '/legacy_web',  // Legacy web channel — fallback for unsend and read-receipts
  '/br_sr',       // Browser send-receipt
] as const;

// ─── Packet encoding helpers ──────────────────────────────────────────────────

function encodeString(str: string): Buffer {
  const bytes = Buffer.from(str, 'utf8');
  const len   = Buffer.allocUnsafe(2);
  len.writeUInt16BE(bytes.length, 0);
  return Buffer.concat([len, bytes]);
}

function encodeVarint(n: number): Buffer {
  const bytes: number[] = [];
  do {
    let byte = n % 128;
    n = Math.floor(n / 128);
    if (n > 0) byte |= 0x80;
    bytes.push(byte);
  } while (n > 0);
  return Buffer.from(bytes);
}

// ─── CONNECT payload ──────────────────────────────────────────────────────────

interface ConnectMetadata {
  userId:      string;
  clientId:    string;
  sessionSeed: number;
  mqttSid:     string;
  cookieStr:   string;
}

/**
 * Build a Messenger MQTT CONNECT packet.
 *
 * The `username` JSON object carries Messenger-specific session metadata.
 * Fields are populated from the authenticated session; no values are
 * hardcoded beyond the static protocol constants (`cp`, `ecp`, `ct`).
 */
function buildConnectPacket(meta: ConnectMetadata): Buffer {
  const username = JSON.stringify({
    u:           meta.userId,       // authenticated Facebook user ID
    s:           meta.sessionSeed,  // stable per-session seed (unchanged on reconnect)
    cp:          3,                 // client protocol version (Messenger MQTT v3)
    ecp:         10,                // extended client protocol
    chat_on:     true,
    fg:          true,              // foreground — receive full event stream
    d:           meta.clientId,     // stable device/client identifier
    ct:          'websocket',       // connection type
    mqtt_sid:    meta.mqttSid,      // session ID for broker-side session resumption
    aid:         Number(MQTT_APP_ID),
    st:          [],                // subscriptions (managed via SUBSCRIBE packets)
    pm:          [],                // pending messages to flush on reconnect
    dc:          '',                // device context — server populates this
    no_auto_fg:  true,
    gas:         null,
    pack:        [],
  });

  const protocolName  = encodeString('MQIsdp');
  const protocolLevel = Buffer.from([3]);
  // 0xc6 = username+password flags set, clean-session = 0 (resume previous session)
  const connectFlags  = Buffer.from([0xc6]);
  const keepAlive     = Buffer.allocUnsafe(2);
  keepAlive.writeUInt16BE(MQTT_KEEPALIVE_SEC, 0);

  const variableHeader = Buffer.concat([protocolName, protocolLevel, connectFlags, keepAlive]);
  const payload        = Buffer.concat([
    encodeString(meta.clientId),
    encodeString(username),
    encodeString(meta.cookieStr),
  ]);
  const remaining = Buffer.concat([variableHeader, payload]);

  return Buffer.concat([Buffer.from([MQTT_CONNECT]), encodeVarint(remaining.length), remaining]);
}

function buildSubscribePacket(topics: readonly string[], packetId: number): Buffer {
  const pid       = Buffer.allocUnsafe(2);
  pid.writeUInt16BE(packetId, 0);
  const topicBufs = topics.map((t) => Buffer.concat([encodeString(t), Buffer.from([0x00])])); // QoS 0
  const payload   = Buffer.concat([pid, ...topicBufs]);
  return Buffer.concat([Buffer.from([MQTT_SUBSCRIBE]), encodeVarint(payload.length), payload]);
}

function buildUnsubscribePacket(topics: readonly string[], packetId: number): Buffer {
  const pid       = Buffer.allocUnsafe(2);
  pid.writeUInt16BE(packetId, 0);
  const topicBufs = topics.map((t) => encodeString(t));
  const payload   = Buffer.concat([pid, ...topicBufs]);
  return Buffer.concat([Buffer.from([MQTT_UNSUBSCRIBE]), encodeVarint(payload.length), payload]);
}

function buildPingPacket(): Buffer {
  return Buffer.from([MQTT_PINGREQ, 0x00]);
}

function buildDisconnectPacket(): Buffer {
  return Buffer.from([MQTT_DISCONNECT, 0x00]);
}

function buildPublishPacket(topic: string, payload: string, packetId: number): Buffer {
  const topicBuf   = encodeString(topic);
  const pid        = Buffer.allocUnsafe(2);
  pid.writeUInt16BE(packetId, 0);
  const payloadBuf = deflateSync(Buffer.from(payload, 'utf8'));
  const msg        = Buffer.concat([topicBuf, pid, payloadBuf]);
  // 0x32 = PUBLISH, QoS 1, no retain, no dup
  return Buffer.concat([Buffer.from([0x32]), encodeVarint(msg.length), msg]);
}

function buildPubackPacket(packetId: number): Buffer {
  const pid = Buffer.allocUnsafe(2);
  pid.writeUInt16BE(packetId, 0);
  return Buffer.concat([Buffer.from([MQTT_PUBACK, 0x02]), pid]);
}

// ─── Packet decoder ────────────────────────────────────────────────────────────

interface DecodedPacket {
  type:       number;
  topic?:     string;
  payload?:   Buffer;
  packetId?:  number;
}

function parsePackets(data: Buffer): DecodedPacket[] {
  const results: DecodedPacket[] = [];
  let offset = 0;

  while (offset < data.length) {
    const typeByte = data[offset] ?? 0;
    offset++;

    // Decode variable-length remaining-length field (up to 4 continuation bytes).
    let multiplier  = 1;
    let remaining   = 0;
    let varintBytes = 0;
    let byte: number;
    do {
      if (offset >= data.length) return results;
      byte = data[offset] ?? 0;
      offset++;
      remaining += (byte & 0x7f) * multiplier;
      multiplier *= 128;
      varintBytes++;
    } while ((byte & 0x80) !== 0 && varintBytes < 4);

    // Guard against truncated / malformed packets.
    if (offset + remaining > data.length) break;

    const packetData = data.subarray(offset, offset + remaining);
    offset += remaining;
    const packetType = typeByte & 0xf0;

    if (packetType === MQTT_PUBLISH) {
      if (packetData.length < 2) continue;
      const topicLen = packetData.readUInt16BE(0);
      const topicEnd = 2 + topicLen;
      if (topicEnd > packetData.length) continue; // malformed topic length

      const topic = packetData.subarray(2, topicEnd).toString('utf8');

      // QoS is encoded in header bits 2-1. A packet ID is only present for QoS > 0.
      const qos          = (typeByte & 0x06) >> 1;
      const hasPacketId  = qos > 0;
      let pid            = 0;
      let payloadStart   = topicEnd;

      if (hasPacketId) {
        if (topicEnd + 2 > packetData.length) continue; // malformed — no room for packet ID
        pid          = packetData.readUInt16BE(topicEnd);
        payloadStart = topicEnd + 2;
      }

      const payload = packetData.subarray(payloadStart);
      results.push({ type: packetType, topic, payload, packetId: pid });
    } else {
      results.push({ type: packetType });
    }
  }

  return results;
}

// ─── Thread-key helpers ────────────────────────────────────────────────────────

function extractThreadId(key: Record<string, unknown> | undefined): string {
  if (!key) return '';
  return String(key['threadFbId'] ?? key['otherUserFbId'] ?? '');
}

function isGroupThread(key: Record<string, unknown> | undefined): boolean {
  return key != null && 'threadFbId' in key;
}

// ─── MqttClient ───────────────────────────────────────────────────────────────

export class MqttClient {
  private ws:             WebSocket | null = null;
  private pingTimer:      ReturnType<typeof setInterval> | null  = null;
  private reconnectTimer: ReturnType<typeof setTimeout>  | null  = null;
  private isConnected  = false;
  private isClosed     = false;

  // Packet ID counter — wraps at 0xFFFF to remain within the two-byte field.
  private _packetId = 1;
  private nextPacketId(): number {
    const id      = this._packetId;
    this._packetId = (this._packetId % 0xffff) + 1;
    return id;
  }

  // Reconnect state
  private reconnectAttempts = 0;
  private activeBrokerIndex = 0;
  private readonly reconnectStartTimes = new Map<number, number>();

  /**
   * Session-stable identifiers — generated once at construction and reused
   * across every reconnect so the broker can resume the MQTT session.
   */
  private readonly clientId:    string;
  private readonly sessionSeed: number;
  private          mqttSid:     string = '';

  /**
   * Dynamic topic registry — starts with CORE_TOPICS and can be extended at
   * runtime. The full set is (re)subscribed after every CONNACK.
   */
  private readonly subscribedTopics = new Set<string>(CORE_TOPICS);

  constructor(
    private readonly jar:     CookieJar,
    private readonly userId:  string,
    private readonly emitter: TypedEventEmitter,
    private readonly config:  Config,
    private readonly logger:  Logger,
    /**
     * Optional callback invoked whenever a presence update arrives.
     * Used by the client to keep `PresenceModule`'s cache up to date without
     * re-emitting events from two places.
     */
    private readonly onPresenceUpdate?: (
      userId: string,
      isOnline: boolean,
      lastActiveAt: Date | null,
    ) => void,
    /**
     * Optional HTTPS agent that routes the WebSocket connection through a proxy.
     * Provided by `ProxyManager.getWebSocketAgent()` when a proxy is configured.
     */
    private readonly wsAgent?: https.Agent,
  ) {
    this.clientId    = `mqttwsclient_${userId}_${randomBytes(4).toString('hex')}`;
    this.sessionSeed = Math.floor(Math.random() * 1e9);
  }

  async connect(): Promise<void> {
    await this.openConnection();
  }

  // ── Broker fallback ──────────────────────────────────────────────────────────

  private async openConnection(): Promise<void> {
    let lastError: Error = new Error('No MQTT brokers configured');

    for (let i = 0; i < MQTT_BROKERS.length; i++) {
      const idx       = (this.activeBrokerIndex + i) % MQTT_BROKERS.length;
      const brokerUrl = MQTT_BROKERS[idx]!;
      try {
        await this.openConnectionToBroker(brokerUrl);
        this.activeBrokerIndex = idx;
        return;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const next = MQTT_BROKERS[(idx + 1) % MQTT_BROKERS.length];
        this.logger.warn('MQTT broker unavailable, trying next', {
          tag: 'MQTT', broker: brokerUrl, next, err: lastError.message,
        });
      }
    }

    throw lastError;
  }

  private openConnectionToBroker(brokerUrl: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      /**
       * `settled` ensures the Promise is only resolved/rejected once even if
       * multiple terminal events fire (e.g. timeout fires → terminate() → close).
       *
       * `connackReceived` distinguishes two cases for the `close` handler:
       *   false → close happened before CONNACK (probe failure) → reject.
       *   true  → live connection dropped after a successful session → reconnect.
       */
      let settled        = false;
      let connackReceived = false;
      const settle = (fn: () => void): void => {
        if (settled) return;
        settled = true;
        fn();
      };

      const cookieStr = getCookieString(this.jar, 'https://www.facebook.com/');

      const ws = new WebSocket(brokerUrl, 'MQIsdp', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Origin':     'https://www.facebook.com',
          'Cookie':     cookieStr,
        },
        perMessageDeflate: false,
        ...(this.wsAgent ? { agent: this.wsAgent } : {}),
      });

      const connectTimeout = setTimeout(() => {
        settle(() => {
          ws.terminate();
          reject(new Error(`MQTT connection timeout on ${brokerUrl}`));
        });
      }, 15000);

      ws.once('open', () => {
        clearTimeout(connectTimeout);
        ws.send(buildConnectPacket({
          userId:      this.userId,
          clientId:    this.clientId,
          sessionSeed: this.sessionSeed,
          mqttSid:     this.mqttSid,
          cookieStr,
        }));
      });

      ws.once('error', (err) => {
        clearTimeout(connectTimeout);
        settle(() => reject(err));
      });

      ws.on('message', (data: Buffer) => {
        const buf     = Buffer.isBuffer(data) ? data : Buffer.from(data as ArrayBuffer);
        const packets = parsePackets(buf);

        for (const pkt of packets) {
          switch (pkt.type) {
            case MQTT_CONNACK:
              clearTimeout(connectTimeout);
              connackReceived      = true;
              this.ws              = ws;
              this.isConnected     = true;
              this.reconnectAttempts = 0;
              // Persist the session ID so the broker can resume this session on reconnect.
              if (!this.mqttSid) this.mqttSid = randomBytes(8).toString('hex');
              this.startPing();
              this.restoreSubscriptions();
              this.emitter.emit('connected', { timestamp: new Date() });
              this.logger.info('MQTT connected', { tag: 'MQTT', broker: brokerUrl });
              settle(() => resolve());
              break;

            case MQTT_PUBLISH:
              if (pkt.topic && pkt.payload) {
                this.handleMessage(pkt.topic, pkt.payload, pkt.packetId ?? 0);
              }
              break;

            case MQTT_PINGRESP:
              this.logger.debug('MQTT pong', { tag: 'PING' });
              break;

            case MQTT_SUBACK:
              this.logger.debug('MQTT SUBACK', { tag: 'MQTT' });
              break;

            case MQTT_UNSUBACK:
              this.logger.debug('MQTT UNSUBACK', { tag: 'MQTT' });
              break;
          }
        }
      });

      ws.once('close', (code, reason) => {
        clearTimeout(connectTimeout);

        if (!connackReceived) {
          // Close before CONNACK: probe failure. Reject so openConnection()
          // can advance to the next broker. Do not schedule reconnect — the
          // caller controls retry logic while iterating the broker list.
          settle(() =>
            reject(new Error(`MQTT closed before CONNACK on ${brokerUrl} (code ${code})`)),
          );
          return;
        }

        // Live connection dropped after a successful session.
        this.isConnected = false;
        this.ws          = null;
        this.stopPing();

        if (!this.isClosed) {
          const willReconnect = this.reconnectAttempts < this.config.mqtt.reconnect.maxAttempts;
          this.emitter.emit('disconnected', { reason: reason.toString(), willReconnect });
          this.logger.warn('MQTT disconnected', {
            tag: 'MQTT', code, reason: reason.toString(), broker: brokerUrl,
          });
          if (willReconnect) this.scheduleReconnect();
          else this.emitter.emit('reconnect:failed', {
            attempts:  this.reconnectAttempts,
            lastError: new Error('Max reconnect attempts reached'),
          });
        }
      });

      this.ws = ws;
    });
  }

  // ── Topic management ─────────────────────────────────────────────────────────

  /** Add and immediately subscribe to a topic. No-op if already subscribed. */
  subscribeTopic(topic: string): void {
    if (this.subscribedTopics.has(topic)) return;
    this.subscribedTopics.add(topic);
    if (this.ws && this.isConnected) {
      this.ws.send(buildSubscribePacket([topic], this.nextPacketId()));
    }
  }

  /** Unsubscribe from a topic and remove it from the registry. No-op if absent. */
  unsubscribeTopic(topic: string): void {
    if (!this.subscribedTopics.has(topic)) return;
    this.subscribedTopics.delete(topic);
    if (this.ws && this.isConnected) {
      this.ws.send(buildUnsubscribePacket([topic], this.nextPacketId()));
    }
  }

  /**
   * Send SUBSCRIBE for all tracked topics.
   * Invoked after CONNACK (initial connect and every reconnect) to restore
   * the full subscription state the broker may have lost.
   */
  private restoreSubscriptions(): void {
    if (!this.ws) return;
    const topics = [...this.subscribedTopics];
    if (topics.length === 0) return;
    this.ws.send(buildSubscribePacket(topics, this.nextPacketId()));
    this.logger.debug('MQTT subscriptions sent', { tag: 'MQTT', count: topics.length });
  }

  // ── Message decoding ──────────────────────────────────────────────────────────

  private handleMessage(topic: string, payload: Buffer, packetId: number): void {
    // Acknowledge every QoS 1 publish immediately.
    if (packetId > 0 && this.ws) {
      this.ws.send(buildPubackPacket(packetId));
    }

    let text: string;
    try {
      text = inflateSync(payload).toString('utf8');
    } catch {
      text = payload.toString('utf8');
    }

    if (!text.trim()) return;

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      this.logger.debug('Non-JSON MQTT message', { tag: 'MQTT', topic, byteLength: payload.length });
      return;
    }

    this.dispatchMessage(topic, data);
  }

  private dispatchMessage(topic: string, data: Record<string, unknown>): void {
    switch (topic) {
      case '/t_ms':        return this.handleMessengerEvent(data);
      case '/t_p':         return this.handlePresenceEvent(data);
      case '/t_rtc':       return this.handleTypingEvent(data);
      case '/legacy_web':  return this.handleLegacyWebEvent(data);
      default:
        this.logger.debug('Unhandled MQTT topic', { tag: 'MQTT', topic });
    }
  }

  // ── Delta dispatcher ──────────────────────────────────────────────────────────

  private handleMessengerEvent(data: Record<string, unknown>): void {
    const deltas = (data['deltas'] as unknown[]) ?? [];
    for (const delta of deltas) {
      if (!delta || typeof delta !== 'object') continue;
      const d    = delta as Record<string, unknown>;
      const type = d['class'] as string | undefined;

      switch (type) {
        case 'NewMessage':           this.parseNewMessage(d);          break;
        case 'ClientPayload':        this.parseClientPayload(d);       break;
        case 'DeliveryReceipt':      this.parseDeliveryReceipt(d);     break;
        case 'ReadReceipt':          this.parseReadReceipt(d);         break;
        case 'UnsendMessage':        this.parseUnsendMessage(d);       break;
        case 'ThreadNameSet':        this.parseThreadNameSet(d);       break;
        case 'ParticipantsAdded':    this.parseParticipantsAdded(d);   break;
        case 'ParticipantRemoved':
        case 'ParticipantsRemoved':  this.parseParticipantRemoved(d);  break;
        case 'FolderActionChange':   this.parseFolderActionChange(d);  break;
        case 'ThreadImageSet':       this.parseThreadImageSet(d);      break;
        case 'AdminTextMessage':
          // System-generated group messages (theme changes, polls, etc.) —
          // no structured event emitted; callers listen on 'message' for body text.
          break;
        default:
          if (type) {
            this.logger.debug('Unhandled delta class', { tag: 'DELTA', class: type });
          }
      }
    }
  }

  // ── Delta parsers ─────────────────────────────────────────────────────────────

  private parseNewMessage(d: Record<string, unknown>): void {
    const msgMeta   = d['messageMetadata'] as Record<string, unknown> | undefined;
    if (!msgMeta) return;
    const threadKey = msgMeta['threadKey'] as Record<string, unknown> | undefined;
    const threadId  = extractThreadId(threadKey);
    const senderId  = String(msgMeta['actorFbId'] ?? '');
    const messageId = String(msgMeta['messageId'] ?? '');
    const timestamp = new Date(Number(msgMeta['timestamp'] ?? Date.now()));
    const body      = (d['body'] as string) ?? null;
    const isGroup   = isGroupThread(threadKey);

    // Extract reply-to reference when this message is a reply.
    const replyMeta    = d['replyToMessage'] as Record<string, unknown> | undefined;
    const replyMsgMeta = replyMeta?.['messageMetadata'] as Record<string, unknown> | undefined;
    const replyTo      = replyMeta
      ? (String(replyMsgMeta?.['messageId'] ?? replyMeta['messageId'] ?? '') || undefined)
      : undefined;

    this.emitter.emit('message', {
      messageId,
      threadId,
      senderId,
      senderName:  String(d['senderName'] ?? msgMeta['senderName'] ?? ''),
      body,
      attachments: this.parseAttachments(d['attachments'] as unknown[]),
      timestamp,
      isGroup,
      replyTo,
    });
  }

  private parseAttachments(raw: unknown[]): Array<{
    id: string; type: string; url?: string; name?: string; size?: number;
    stickerId?: string; shareTitle?: string; shareDescription?: string;
  }> {
    if (!Array.isArray(raw)) return [];
    return raw.map((a) => {
      if (!a || typeof a !== 'object') return { id: '', type: 'unknown' };
      const att  = a as Record<string, unknown>;
      const type = String(att['attach_type'] ?? att['type'] ?? 'unknown');
      const id   = String(att['id'] ?? att['fbid'] ?? '');

      if (type === 'sticker') {
        return {
          id,
          type: 'sticker',
          url:       att['url'] ? String(att['url']) : undefined,
          stickerId: String(att['sticker_id'] ?? id),
        };
      }

      if (type === 'share') {
        const share = att['share'] as Record<string, unknown> | undefined;
        return {
          id,
          type: 'share',
          url:              share?.['href']        ? String(share['href'])        : (att['url'] ? String(att['url']) : undefined),
          shareTitle:       share?.['title']       ? String(share['title'])       : undefined,
          shareDescription: share?.['description'] ? String(share['description']) : undefined,
        };
      }

      if (type === 'location') {
        const coord = att['coordinate'] as Record<string, unknown> | undefined;
        return {
          id,
          type: 'location',
          url:  coord ? `geo:${String(coord['latitude'] ?? '')},${String(coord['longitude'] ?? '')}` : undefined,
          name: att['name'] ? String(att['name']) : undefined,
        };
      }

      return {
        id,
        type,
        url:  att['url']      ? String(att['url'])      : undefined,
        name: att['name']     ? String(att['name'])     : undefined,
        size: att['fileSize'] ? Number(att['fileSize']) : undefined,
      };
    });
  }

  private parseDeliveryReceipt(d: Record<string, unknown>): void {
    const threadKey     = d['threadKey'] as Record<string, unknown> | undefined;
    const threadId      = extractThreadId(threadKey);
    const messageId     = String(d['messageId'] ?? '');
    const deliveredToId = String(d['actorFbId'] ?? d['userId'] ?? '');
    const timestamp     = new Date(Number(d['deliveredTime'] ?? d['timestamp'] ?? Date.now()));
    if (!messageId && !threadId) return;
    this.emitter.emit('message:delivered', {
      messageId,
      threadId,
      deliveredTo: deliveredToId ? [deliveredToId] : [],
      timestamp,
    });
  }

  private parseReadReceipt(d: Record<string, unknown>): void {
    const threadKey     = d['threadKey'] as Record<string, unknown> | undefined;
    const threadId      = extractThreadId(threadKey);
    const actorId       = String(d['actorFbId'] ?? d['userId'] ?? '');
    const readByIds     = actorId ? [actorId] : [];
    const watermarkRaw  = d['watermarkTimestamp'] ?? d['actionTimestampMs'] ?? Date.now();
    const upToTimestamp = new Date(Number(watermarkRaw));
    if (!threadId) return;

    this.emitter.emit('thread:read', { threadId, readBy: readByIds, upToTimestamp });

    const lastReadMsgId = String(
      d['lastDeliveredActionTimestampHasLateDelivery'] ?? d['messageId'] ?? '',
    );
    if (lastReadMsgId) {
      this.emitter.emit('message:seen', {
        messageId:  lastReadMsgId,
        threadId,
        seenBy:     readByIds,
        timestamp:  upToTimestamp,
      });
    }
  }

  private parseUnsendMessage(d: Record<string, unknown>): void {
    const msgMeta   = d['messageMetadata'] as Record<string, unknown> | undefined;
    const threadKey = (msgMeta?.['threadKey'] ?? d['threadKey']) as Record<string, unknown> | undefined;
    const threadId  = extractThreadId(threadKey) || String(d['threadId'] ?? '');
    const messageId = String(msgMeta?.['messageId'] ?? d['messageId'] ?? '');
    const senderId  = String(msgMeta?.['actorFbId'] ?? d['actorFbId'] ?? '');
    const timestamp = new Date(Number(msgMeta?.['timestamp'] ?? d['timestamp'] ?? Date.now()));
    if (!messageId) return;
    this.emitter.emit('message:unsend', { messageId, threadId, senderId, timestamp });
  }

  private parseClientPayload(d: Record<string, unknown>): void {
    const raw = d['payload'];
    if (!raw) return;

    // The payload field is a Uint8Array. Decode as UTF-8 and attempt JSON parse;
    // non-JSON (e.g. Thrift-encoded) payloads are logged and skipped.
    let text: string;
    try {
      text = Buffer.from(raw as Uint8Array).toString('utf8');
    } catch {
      this.logger.debug('ClientPayload: cannot decode bytes', { tag: 'DELTA' });
      return;
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(text) as Record<string, unknown>;
    } catch {
      this.logger.debug('ClientPayload: non-JSON payload', {
        tag: 'DELTA', byteLength: (raw as Uint8Array).byteLength,
      });
      return;
    }

    const payloadType = Number(parsed['type'] ?? -1);

    // Type 2 = user reaction mutation (add or remove)
    if (payloadType === 2) {
      const reaction  = parsed['userReactionMutation'] as Record<string, unknown> | undefined;
      if (!reaction) return;
      const action    = String(reaction['action'] ?? 'ADD_REACTION');
      const messageId = String(reaction['messageId'] ?? '');
      const threadId  = String(reaction['threadId'] ?? '');
      const senderId  = String(reaction['userId'] ?? '');
      const timestamp = new Date();

      if (action === 'REMOVE_REACTION') {
        this.emitter.emit('message:reaction:removed', { messageId, threadId, senderId, timestamp });
      } else {
        this.emitter.emit('message:reaction', {
          messageId,
          threadId,
          senderId,
          senderName: String(reaction['senderName'] ?? ''),
          reaction:   String(reaction['reaction'] ?? ''),
          timestamp,
        });
      }
      return;
    }

    this.logger.debug('ClientPayload: unhandled type', { tag: 'DELTA', payloadType });
  }

  // ── Thread delta parsers ──────────────────────────────────────────────────────

  private parseThreadNameSet(d: Record<string, unknown>): void {
    const msgMeta   = d['messageMetadata'] as Record<string, unknown> | undefined;
    const threadKey = msgMeta?.['threadKey'] as Record<string, unknown> | undefined;
    const threadId  = extractThreadId(threadKey);
    const changedBy = String(msgMeta?.['actorFbId'] ?? '');
    const newName   = String(d['name'] ?? '');
    if (!threadId) return;
    this.emitter.emit('thread:renamed', { threadId, newName, changedBy });
  }

  private parseParticipantsAdded(d: Record<string, unknown>): void {
    const msgMeta       = d['messageMetadata'] as Record<string, unknown> | undefined;
    const threadKey     = msgMeta?.['threadKey'] as Record<string, unknown> | undefined;
    const threadId      = extractThreadId(threadKey);
    const addedByUserId = String(msgMeta?.['actorFbId'] ?? '');
    const participants  = (d['addedParticipants'] as unknown[]) ?? [];
    if (!threadId) return;

    for (const p of participants) {
      if (!p || typeof p !== 'object') continue;
      const addedUserId = String(
        (p as Record<string, unknown>)['userFbId'] ??
        (p as Record<string, unknown>)['userId'] ?? '',
      );
      if (addedUserId) {
        this.emitter.emit('thread:participant:added', { threadId, addedUserId, addedByUserId });
      }
    }
  }

  private parseParticipantRemoved(d: Record<string, unknown>): void {
    const msgMeta         = d['messageMetadata'] as Record<string, unknown> | undefined;
    const threadKey       = (msgMeta?.['threadKey'] ?? d['threadKey']) as Record<string, unknown> | undefined;
    const threadId        = extractThreadId(threadKey);
    const removedByUserId = String(msgMeta?.['actorFbId'] ?? d['actorFbId'] ?? '');
    const removedUserId   = String(
      d['leftParticipantFbId'] ?? d['removedParticipantFbId'] ?? '',
    );
    if (!threadId || !removedUserId) return;
    this.emitter.emit('thread:participant:removed', { threadId, removedUserId, removedByUserId });
  }

  private parseFolderActionChange(d: Record<string, unknown>): void {
    const threadKey = d['threadKey'] as Record<string, unknown> | undefined;
    const threadId  = extractThreadId(threadKey);
    const folder    = String(d['folder'] ?? '');
    if (!threadId) return;
    // ARCHIVED = moved to archive; anything else (INBOX, etc.) = unarchived
    this.emitter.emit('thread:archived', { threadId, archived: folder === 'ARCHIVED' });
  }

  private parseThreadImageSet(d: Record<string, unknown>): void {
    const msgMeta     = d['messageMetadata'] as Record<string, unknown> | undefined;
    const threadKey   = msgMeta?.['threadKey'] as Record<string, unknown> | undefined;
    const threadId    = extractThreadId(threadKey);
    const changedBy   = String(msgMeta?.['actorFbId'] ?? '');
    const image       = d['image'] as Record<string, unknown> | undefined;
    const newPhotoUrl = image ? String(image['uri'] ?? image['url'] ?? '') : '';
    if (!threadId) return;
    this.emitter.emit('thread:photo:changed', { threadId, newPhotoUrl, changedBy });
  }

  // ── Presence & typing ─────────────────────────────────────────────────────────

  private handlePresenceEvent(data: Record<string, unknown>): void {
    const list = (data['list'] as unknown[]) ?? [];
    for (const item of list) {
      if (!item || typeof item !== 'object') continue;
      const p           = item as Record<string, unknown>;
      const userId      = String(p['u'] ?? '');
      if (!userId) continue;
      // p === 2 is the Messenger protocol's active/online indicator.
      const isOnline     = Number(p['p'] ?? 0) === 2;
      const lastActiveAt = p['lat'] ? new Date(Number(p['lat']) * 1000) : null;

      this.emitter.emit('presence:update', { userId, isOnline, lastActiveAt });
      // Notify the PresenceModule so its cache stays warm.
      this.onPresenceUpdate?.(userId, isOnline, lastActiveAt);
    }
  }

  private handleTypingEvent(data: Record<string, unknown>): void {
    const threadId = String(data['thread_fbid'] ?? data['to'] ?? '');
    const senderId = String(data['from'] ?? '');
    const isTyping = Boolean(data['st']);

    this.emitter.emit('thread:typing', { threadId, senderId, senderName: '', isTyping });
    if (senderId) {
      this.emitter.emit('presence:typing', { userId: senderId, threadId, isTyping });
    }
  }

  private handleLegacyWebEvent(data: Record<string, unknown>): void {
    const type = String(data['type'] ?? data['class'] ?? '');
    if (type === 'UnsendMessage') {
      this.parseUnsendMessage(data);
    } else if (type === 'ReadReceipt' || type === 'ReadReceiptAction') {
      this.parseReadReceipt(data);
    } else if (type === 'DeliveryReceipt') {
      this.parseDeliveryReceipt(data);
    }
  }

  // ── Ping / keepalive ──────────────────────────────────────────────────────────

  private startPing(): void {
    this.pingTimer = setInterval(() => {
      if (this.ws && this.isConnected) {
        this.ws.send(buildPingPacket());
        this.logger.debug('MQTT ping sent', { tag: 'PING' });
      }
    }, this.config.mqtt.heartbeat.interval);
    this.pingTimer.unref?.();
  }

  private stopPing(): void {
    if (this.pingTimer) { clearInterval(this.pingTimer); this.pingTimer = null; }
  }

  // ── Reconnect ─────────────────────────────────────────────────────────────────

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = Math.min(
      this.config.mqtt.reconnect.baseDelay * 2 ** (this.reconnectAttempts - 1),
      30000,
    );
    this.emitter.emit('reconnecting', {
      attempt:     this.reconnectAttempts,
      maxAttempts: this.config.mqtt.reconnect.maxAttempts,
      delayMs:     delay,
    });
    this.logger.info('Scheduling MQTT reconnect', {
      tag: 'RECONNECT', attempt: this.reconnectAttempts, delayMs: delay,
    });

    const start = Date.now();
    this.reconnectStartTimes.set(this.reconnectAttempts, start);

    this.reconnectTimer = setTimeout(async () => {
      // Rotate broker on each reconnect attempt for better availability.
      this.activeBrokerIndex = (this.activeBrokerIndex + 1) % MQTT_BROKERS.length;
      try {
        await this.openConnection();
        const durationMs = Date.now() - (this.reconnectStartTimes.get(this.reconnectAttempts) ?? start);
        this.emitter.emit('reconnected', { attempt: this.reconnectAttempts, durationMs });
        this.reconnectAttempts = 0;
        this.reconnectStartTimes.clear();
      } catch (err) {
        this.logger.warn('MQTT reconnect attempt failed', { tag: 'RECONNECT', err });
        if (this.reconnectAttempts < this.config.mqtt.reconnect.maxAttempts) {
          this.scheduleReconnect();
        } else {
          this.emitter.emit('reconnect:failed', {
            attempts:  this.reconnectAttempts,
            lastError: err instanceof Error ? err : new Error(String(err)),
          });
        }
      }
    }, delay);
  }

  // ── Public API ────────────────────────────────────────────────────────────────

  publish(topic: string, payload: string): void {
    if (!this.ws || !this.isConnected) return;
    this.ws.send(buildPublishPacket(topic, payload, this.nextPacketId()));
  }

  getStats(): {
    isConnected:    boolean;
    reconnectCount: number;
    activeBroker:   string;
    topicCount:     number;
  } {
    return {
      isConnected:    this.isConnected,
      reconnectCount: this.reconnectAttempts,
      activeBroker:   MQTT_BROKERS[this.activeBrokerIndex] ?? '',
      topicCount:     this.subscribedTopics.size,
    };
  }

  async disconnect(): Promise<void> {
    this.isClosed = true;
    this.stopPing();
    if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
    if (this.ws) {
      try { this.ws.send(buildDisconnectPacket()); } catch { /* socket may already be closing */ }
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}
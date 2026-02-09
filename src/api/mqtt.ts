import mqtt from 'mqtt';
import { ApiCtx } from '../auth';
import { MQTT_BROKER_URL, USER_AGENTS, MQTT_TOPICS, MQTT_CAPABILITIES, FACEBOOK_URL, FACEBOOK_APP_ID, MQTT_CONFIG } from '../utils/constants';
import { PerformanceManager } from '../utils/PerformanceManager';
import { randomBytes } from 'crypto';
import { logger } from '../utils/Logger';

export class MQTTClient {
  private client: mqtt.MqttClient | null = null;
  private ctx: ApiCtx;
  private eventCallback: (event: any) => void;
  private perfMgr: PerformanceManager;
  private syncToken: string | null = null;
  private capabilities: number = MQTT_CAPABILITIES.VOIP | MQTT_CAPABILITIES.VIDEO | MQTT_CAPABILITIES.AUDIO | MQTT_CAPABILITIES.STICKER | MQTT_CAPABILITIES.GIF | MQTT_CAPABILITIES.TYPING; // Realistic capabilities
  private sessionID: number;

  constructor(ctx: ApiCtx, callback: (event: any) => void) {
    this.ctx = ctx;
    this.eventCallback = callback;
    this.perfMgr = PerformanceManager.getInstance();
    this.sessionID = parseInt(randomBytes(6).toString('hex'), 16);
  }

  public connect() {
    // Generate a real 64-bit equivalent random session ID
    // JavaScript Numbers are doubles, so we use string or BigInt to be safe, but MQTT often takes a number.
    // However, FB's session ID is usually a large random integer.
    // Let's use a safe large random integer within JS safe integer range (2^53 - 1) which is often sufficient,
    // or generate a random string ID if the protocol supports it.
    // For FB MQTT, it expects a number.
    const sessionID = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    
    const deviceID = this.ctx.clientID;
    
    // Construct the MQTT username payload required by Facebook
    const username = JSON.stringify({
      u: this.ctx.userID,
      s: sessionID,
      cp: this.capabilities,
      ec: 0,
      chat_on: MQTT_CONFIG.CHAT_ON,
      fg: MQTT_CONFIG.FOREGROUND,
      d: deviceID,
      ct: MQTT_CONFIG.CONNECTION_TYPE,
      mqtt_sid: '',
      aid: FACEBOOK_APP_ID,
      st: [],
      pm: [],
      dc: '',
      no_auto_fg: MQTT_CONFIG.NO_AUTO_FG,
      p_device_id: deviceID,
      rc: 0
    });

    // Generate a short, unique ClientID compliant with MQTT 3.1 (< 23 chars)
    // Format: mqttwsclient-xxxxxx (12 + 1 + 6 = 19 chars)
    const shortId = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
    const clientId = 'mqttwsclient-' + shortId;

    const options: mqtt.IClientOptions = {
      clientId: clientId,
      protocolId: MQTT_CONFIG.PROTOCOL_NAME,
      protocolVersion: MQTT_CONFIG.PROTOCOL_LEVEL,
      username: username,
      clean: true,
      wsOptions: {
        headers: {
          'Cookie': this.ctx.jar.map(c => `${c.key}=${c.value}`).join('; '),
          'Origin': FACEBOOK_URL,
          'User-Agent': this.ctx.userAgent || this.ctx.globalOptions?.userAgent || USER_AGENTS[0],
          'Referer': FACEBOOK_URL + '/',
        },
        origin: FACEBOOK_URL
      },
      keepalive: this.ctx.globalOptions?.autoRefresh?.mqttKeepAliveInterval || MQTT_CONFIG.KEEP_ALIVE_DEFAULT,
      reschedulePings: true,
      connectTimeout: MQTT_CONFIG.CONNECT_TIMEOUT,
      reconnectPeriod: MQTT_CONFIG.RECONNECT_PERIOD,
    };

    this.client = mqtt.connect(MQTT_BROKER_URL, options);

    this.client.on('connect', () => {
      logger.success('MQTT Connected');
      this.perfMgr.recordRequest(0, 0, 0, false); // Record connection event
      this.subscribe();
    });

    this.client.on('message', (topic, message) => {
      this.handleMessage(topic, message);
    });

    this.client.on('error', (err) => {
      logger.error('MQTT Error:', err);
      this.perfMgr.recordRequest(0, 0, 0, true); // Record error
      this.eventCallback({ type: 'mqtt_error', error: err });
    });

    this.client.on('close', () => {
      logger.warn('MQTT Disconnected');
    });
    
    this.client.on('reconnect', () => {
        logger.info('MQTT Reconnecting...');
    });
  }

  private subscribe() {
    if (!this.client) return;
    
    const topics: Record<string, { qos: 0 | 1 | 2 }> = {
      [MQTT_TOPICS.MESSAGING]: { qos: 0 },
      [MQTT_TOPICS.TYPING]: { qos: 0 },
      [MQTT_TOPICS.PRESENCE]: { qos: 0 },
      [MQTT_TOPICS.LEGACY_WEB]: { qos: 0 },
      [MQTT_TOPICS.WEBRTC]: { qos: 0 },
      [MQTT_TOPICS.NOTIFICATIONS]: { qos: 0 }
    };

    this.client.subscribe(topics, (err) => {
      if (err) {
        console.error('Subscription failed:', err);
        this.eventCallback({ type: 'mqtt_subscribe_error', error: err });
      } else {
        console.log('Subscribed to topics');
      }
    });
  }

  private handleMessage(topic: string, message: Buffer) {
    const startTime = Date.now();
    const payloadSize = message.length;

    try {
      const payloadString = message.toString();
      let data: any;

      try {
        data = JSON.parse(payloadString);
      } catch (jsonErr) {
        // If not JSON, it might be raw data or specific format.
        // For now, we emit as raw if JSON parse fails.
        this.eventCallback({ type: 'mqtt_raw', topic, data: message });
        this.perfMgr.recordRequest(Date.now() - startTime, payloadSize, 0, true);
        return;
      }

      // Record metrics
      this.perfMgr.recordRequest(Date.now() - startTime, payloadSize, 0, false);

      if (topic === MQTT_TOPICS.MESSAGING) {
        if (data.deltas) {
          // Handle delta array
          data.deltas.forEach((delta: any) => {
            // Update sync token if present
            if (data.firstDeltaSeqId) {
                this.syncToken = data.firstDeltaSeqId;
            }
            this.eventCallback({ type: 'message', delta });
          });
        } else {
           this.eventCallback({ type: 'mqtt_event', topic, data });
        }
      } else if (topic === MQTT_TOPICS.TYPING || topic === MQTT_TOPICS.NOTIFICATIONS) {
        this.eventCallback({ type: 'typ', data });
      } else if (topic === MQTT_TOPICS.PRESENCE) {
        this.eventCallback({ type: 'presence', data });
      } else {
        this.eventCallback({ type: 'mqtt_event', topic, data });
      }

    } catch (e) {
      console.error('Error handling MQTT message:', e);
      this.perfMgr.recordRequest(Date.now() - startTime, payloadSize, 0, true);
    }
  }

  public publish(topic: string, payload: any, qos: 0 | 1 | 2 = 0): void {
      if (!this.client || !this.client.connected) {
          console.warn('MQTT Client not connected, cannot publish');
          return;
      }

      const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
      
      this.client.publish(topic, message, { qos }, (err) => {
          if (err) {
              console.error(`Failed to publish to ${topic}:`, err);
          } else {
              this.perfMgr.recordRequest(0, 0, message.length, false);
          }
      });
  }

  public disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
  }
  
  public getStatus(): boolean {
      return this.client?.connected || false;
  }
}

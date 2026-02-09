import mqtt from 'mqtt';
import websocket from 'websocket-stream';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { ApiCtx } from '../auth';
import { MQTT_BROKER_URL, USER_AGENTS, MQTT_TOPICS, FACEBOOK_APP_ID, MQTT_CONFIG } from '../utils/constants';
import { PerformanceManager } from '../utils/PerformanceManager';
import { logger } from '../utils/Logger';

export class MQTTClient {
  private client: mqtt.MqttClient | null = null;
  private ctx: ApiCtx;
  private eventCallback: (event: any) => void;
  private perfMgr: PerformanceManager;
  private syncToken: string | null = null;

  public getSyncToken(): string | null {
    return this.syncToken;
  }
  private capabilities: number = 3;
  private sessionID: number;

  public isConnecting: boolean = false;

  constructor(ctx: ApiCtx, callback: (event: any) => void) {
    this.ctx = ctx;
    this.eventCallback = callback;
    this.perfMgr = PerformanceManager.getInstance();
    this.sessionID = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  }

  public connect() {
    if (this.isConnecting || (this.client && this.client.connected)) {
        logger.warn('MQTT Client is already connecting or connected.');
        return;
    }
    this.isConnecting = true;

    // Generate a real 64-bit equivalent random session ID
    const sessionID = this.sessionID;
    
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
      rc: 0,
      a: this.ctx.userAgent || this.ctx.globalOptions?.userAgent || USER_AGENTS[0]
    });

    // Use static clientId
    const clientId = 'mqttwsclient';
    
    // Host construction logic
    let host = MQTT_BROKER_URL;
    const mqttUrl = `${host}?sid=${sessionID}&cid=${deviceID}`;

    const options: mqtt.IClientOptions = {
      clientId: clientId,
      protocolId: MQTT_CONFIG.PROTOCOL_NAME,
      protocolVersion: MQTT_CONFIG.PROTOCOL_LEVEL,
      username: username,
      clean: true,
      wsOptions: {
        headers: {
          'Cookie': this.ctx.jar.map(c => `${c.key || c.name}=${c.value}`).join('; '),
          'Origin': 'https://www.facebook.com',
          'User-Agent': this.ctx.userAgent || this.ctx.globalOptions?.userAgent || USER_AGENTS[0],
          'Referer': 'https://www.facebook.com/',
          'Host': new URL(host).hostname
        },
        origin: 'https://www.facebook.com',
        protocolVersion: 13,
        binaryType: 'arraybuffer'
      } as any,
      keepalive: MQTT_CONFIG.KEEP_ALIVE_DEFAULT,
      reschedulePings: true,
      connectTimeout: MQTT_CONFIG.CONNECT_TIMEOUT,
      reconnectPeriod: MQTT_CONFIG.RECONNECT_PERIOD,
    };

    if (this.ctx.globalOptions?.proxy) {
        (options.wsOptions as any).agent = new HttpsProxyAgent(this.ctx.globalOptions.proxy);
    }

    // Exact replica of stream creation using websocket-stream
    this.client = new mqtt.Client(() => websocket(mqttUrl, options.wsOptions), options);

    this.client.on('connect', () => {
      this.isConnecting = false;
      logger.success('MQTT Connected');
      logger.info(`MQTT Session ID: ${sessionID}`);
      logger.info(`MQTT Broker: ${host}`);
      logger.info(`MQTT Region: ${options.wsOptions.headers['x-msgr-region'] || 'Global'}`);
      this.perfMgr.recordRequest(0, 0, 0, false); // Record connection event
      this.subscribe();
    });

    this.client.on('message', (topic, message) => {
      this.handleMessage(topic, message);
    });

    this.client.on('error', (err) => {
      this.isConnecting = false;
      logger.error('MQTT Error:', err);
      this.perfMgr.recordRequest(0, 0, 0, true); // Record error
      this.eventCallback({ type: 'mqtt_error', error: err });
    });

    this.client.on('close', () => {
      this.isConnecting = false;
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
        logger.error('MQTT Subscription failed:', err);
        this.eventCallback({ type: 'mqtt_subscribe_error', error: err });
      } else {
        logger.info('MQTT Subscribed to topics: ' + Object.keys(topics).join(', '));
      }
    });
  }

  private handleMessage(topic: string, message: Buffer) {
    const startTime = Date.now();
    const payloadSize = message.length;
    
    // Log raw message reception
    logger.info(`MQTT Received message on topic: ${topic} (Size: ${payloadSize} bytes)`);

    try {
      const payloadString = message.toString();
      let data: any;

      try {
        data = JSON.parse(payloadString);
        // Log parsed data for debugging (professional logs)
        logger.info(`MQTT Parsed Payload [${topic}]:`, JSON.stringify(data, null, 2));
      } catch (jsonErr) {
          logger.error('Error parsing MQTT payload:', jsonErr as Error);
          logger.debug('Raw Payload:', payloadString);
          this.eventCallback({ type: 'mqtt_raw', topic, data: message });
        this.perfMgr.recordRequest(Date.now() - startTime, payloadSize, 0, true);
        return;
      }

      this.perfMgr.recordRequest(Date.now() - startTime, payloadSize, 0, false);

      if (topic === MQTT_TOPICS.MESSAGING) {
        if (data.deltas) {
          data.deltas.forEach((delta: any) => {
            logger.info('Processing Delta:', JSON.stringify(delta, null, 2));
            if (data.firstDeltaSeqId) {
                this.syncToken = data.firstDeltaSeqId;
            }
            this.eventCallback({ type: 'message', delta });
          });
        } else {
           logger.info('Processing Messaging Event (No Deltas):', data);
           this.eventCallback({ type: 'mqtt_event', topic, data });
        }
      } else if (topic === MQTT_TOPICS.TYPING || topic === MQTT_TOPICS.NOTIFICATIONS) {
        logger.info('Processing Typing/Notification:', JSON.stringify(data));
        this.eventCallback({ type: 'typ', data });
      } else if (topic === MQTT_TOPICS.PRESENCE) {
        logger.info('Processing Presence:', data);
        this.eventCallback({ type: 'presence', data });
      } else {
        logger.info('Processing Other MQTT Event:', data);
        this.eventCallback({ type: 'mqtt_event', topic, data });
      }

    } catch (e) {
      logger.error('Error handling MQTT message:', e as Error);
      this.perfMgr.recordRequest(Date.now() - startTime, payloadSize, 0, true);
    }
  }

  public publish(topic: string, payload: any, qos: 0 | 1 | 2 = 0): void {
      if (!this.client || !this.client.connected) {
          logger.warn('MQTT Client not connected, cannot publish');
          return;
      }

      const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
      logger.info(`MQTT Publishing to ${topic}:`, message);
      
      this.client.publish(topic, message, { qos }, (err) => {
          if (err) {
              logger.error(`Failed to publish to ${topic}:`, err);
          } else {
              this.perfMgr.recordRequest(0, 0, message.length, false);
              logger.info(`Successfully published to ${topic}`);
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

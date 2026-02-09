"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MQTTClient = void 0;
const mqtt_1 = __importDefault(require("mqtt"));
const websocket_stream_1 = __importDefault(require("websocket-stream"));
const https_proxy_agent_1 = require("https-proxy-agent");
const constants_1 = require("../utils/constants");
const PerformanceManager_1 = require("../utils/PerformanceManager");
const Logger_1 = require("../utils/Logger");
class MQTTClient {
    getSyncToken() {
        return this.syncToken;
    }
    constructor(ctx, callback) {
        this.client = null;
        this.syncToken = null;
        this.capabilities = 3;
        this.isConnecting = false;
        this.ctx = ctx;
        this.eventCallback = callback;
        this.perfMgr = PerformanceManager_1.PerformanceManager.getInstance();
        this.sessionID = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    }
    connect() {
        if (this.isConnecting || (this.client && this.client.connected)) {
            Logger_1.logger.warn('MQTT Client is already connecting or connected.');
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
            chat_on: constants_1.MQTT_CONFIG.CHAT_ON,
            fg: constants_1.MQTT_CONFIG.FOREGROUND,
            d: deviceID,
            ct: constants_1.MQTT_CONFIG.CONNECTION_TYPE,
            mqtt_sid: '',
            aid: constants_1.FACEBOOK_APP_ID,
            st: [],
            pm: [],
            dc: '',
            no_auto_fg: constants_1.MQTT_CONFIG.NO_AUTO_FG,
            p_device_id: deviceID,
            rc: 0,
            a: this.ctx.userAgent || this.ctx.globalOptions?.userAgent || constants_1.USER_AGENTS[0]
        });
        // Use static clientId
        const clientId = 'mqttwsclient';
        // Host construction logic
        let host = constants_1.MQTT_BROKER_URL;
        const mqttUrl = `${host}?sid=${sessionID}&cid=${deviceID}`;
        const options = {
            clientId: clientId,
            protocolId: constants_1.MQTT_CONFIG.PROTOCOL_NAME,
            protocolVersion: constants_1.MQTT_CONFIG.PROTOCOL_LEVEL,
            username: username,
            clean: true,
            wsOptions: {
                headers: {
                    'Cookie': this.ctx.jar.map(c => `${c.key || c.name}=${c.value}`).join('; '),
                    'Origin': 'https://www.facebook.com',
                    'User-Agent': this.ctx.userAgent || this.ctx.globalOptions?.userAgent || constants_1.USER_AGENTS[0],
                    'Referer': 'https://www.facebook.com/',
                    'Host': new URL(host).hostname
                },
                origin: 'https://www.facebook.com',
                protocolVersion: 13,
                binaryType: 'arraybuffer'
            },
            keepalive: constants_1.MQTT_CONFIG.KEEP_ALIVE_DEFAULT,
            reschedulePings: true,
            connectTimeout: constants_1.MQTT_CONFIG.CONNECT_TIMEOUT,
            reconnectPeriod: constants_1.MQTT_CONFIG.RECONNECT_PERIOD,
        };
        if (this.ctx.globalOptions?.proxy) {
            options.wsOptions.agent = new https_proxy_agent_1.HttpsProxyAgent(this.ctx.globalOptions.proxy);
        }
        // Exact replica of stream creation using websocket-stream
        this.client = new mqtt_1.default.Client(() => (0, websocket_stream_1.default)(mqttUrl, options.wsOptions), options);
        this.client.on('connect', () => {
            this.isConnecting = false;
            Logger_1.logger.success('MQTT Connected');
            Logger_1.logger.info(`MQTT Session ID: ${sessionID}`);
            Logger_1.logger.info(`MQTT Broker: ${host}`);
            Logger_1.logger.info(`MQTT Region: ${options.wsOptions.headers['x-msgr-region'] || 'Global'}`);
            this.perfMgr.recordRequest(0, 0, 0, false); // Record connection event
            this.subscribe();
        });
        this.client.on('message', (topic, message) => {
            this.handleMessage(topic, message);
        });
        this.client.on('error', (err) => {
            this.isConnecting = false;
            Logger_1.logger.error('MQTT Error:', err);
            this.perfMgr.recordRequest(0, 0, 0, true); // Record error
            this.eventCallback({ type: 'mqtt_error', error: err });
        });
        this.client.on('close', () => {
            this.isConnecting = false;
            Logger_1.logger.warn('MQTT Disconnected');
        });
        this.client.on('reconnect', () => {
            Logger_1.logger.info('MQTT Reconnecting...');
        });
    }
    subscribe() {
        if (!this.client)
            return;
        const topics = {
            [constants_1.MQTT_TOPICS.MESSAGING]: { qos: 0 },
            [constants_1.MQTT_TOPICS.TYPING]: { qos: 0 },
            [constants_1.MQTT_TOPICS.PRESENCE]: { qos: 0 },
            [constants_1.MQTT_TOPICS.LEGACY_WEB]: { qos: 0 },
            [constants_1.MQTT_TOPICS.WEBRTC]: { qos: 0 },
            [constants_1.MQTT_TOPICS.NOTIFICATIONS]: { qos: 0 }
        };
        this.client.subscribe(topics, (err) => {
            if (err) {
                Logger_1.logger.error('MQTT Subscription failed:', err);
                this.eventCallback({ type: 'mqtt_subscribe_error', error: err });
            }
            else {
                Logger_1.logger.info('MQTT Subscribed to topics: ' + Object.keys(topics).join(', '));
            }
        });
    }
    handleMessage(topic, message) {
        const startTime = Date.now();
        const payloadSize = message.length;
        // Log raw message reception
        Logger_1.logger.info(`MQTT Received message on topic: ${topic} (Size: ${payloadSize} bytes)`);
        try {
            const payloadString = message.toString();
            let data;
            try {
                data = JSON.parse(payloadString);
                // Log parsed data for debugging (professional logs)
                Logger_1.logger.info(`MQTT Parsed Payload [${topic}]:`, JSON.stringify(data, null, 2));
            }
            catch (jsonErr) {
                Logger_1.logger.error('Error parsing MQTT payload:', jsonErr);
                Logger_1.logger.debug('Raw Payload:', payloadString);
                this.eventCallback({ type: 'mqtt_raw', topic, data: message });
                this.perfMgr.recordRequest(Date.now() - startTime, payloadSize, 0, true);
                return;
            }
            this.perfMgr.recordRequest(Date.now() - startTime, payloadSize, 0, false);
            if (topic === constants_1.MQTT_TOPICS.MESSAGING) {
                if (data.deltas) {
                    data.deltas.forEach((delta) => {
                        Logger_1.logger.info('Processing Delta:', JSON.stringify(delta, null, 2));
                        if (data.firstDeltaSeqId) {
                            this.syncToken = data.firstDeltaSeqId;
                        }
                        this.eventCallback({ type: 'message', delta });
                    });
                }
                else {
                    Logger_1.logger.info('Processing Messaging Event (No Deltas):', data);
                    this.eventCallback({ type: 'mqtt_event', topic, data });
                }
            }
            else if (topic === constants_1.MQTT_TOPICS.TYPING || topic === constants_1.MQTT_TOPICS.NOTIFICATIONS) {
                Logger_1.logger.info('Processing Typing/Notification:', JSON.stringify(data));
                this.eventCallback({ type: 'typ', data });
            }
            else if (topic === constants_1.MQTT_TOPICS.PRESENCE) {
                Logger_1.logger.info('Processing Presence:', JSON.stringify(data));
                this.eventCallback({ type: 'presence', data });
            }
            else {
                Logger_1.logger.info('Processing Other MQTT Event:', JSON.stringify(data));
                this.eventCallback({ type: 'mqtt_event', topic, data });
            }
        }
        catch (e) {
            Logger_1.logger.error('Error handling MQTT message:', e);
            this.perfMgr.recordRequest(Date.now() - startTime, payloadSize, 0, true);
        }
    }
    publish(topic, payload, qos = 0) {
        if (!this.client || !this.client.connected) {
            Logger_1.logger.warn('MQTT Client not connected, cannot publish');
            return;
        }
        const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
        Logger_1.logger.info(`MQTT Publishing to ${topic}:`, message);
        this.client.publish(topic, message, { qos }, (err) => {
            if (err) {
                Logger_1.logger.error(`Failed to publish to ${topic}:`, err);
            }
            else {
                this.perfMgr.recordRequest(0, 0, message.length, false);
                Logger_1.logger.info(`Successfully published to ${topic}`);
            }
        });
    }
    disconnect() {
        if (this.client) {
            this.client.end();
            this.client = null;
        }
    }
    getStatus() {
        return this.client?.connected || false;
    }
}
exports.MQTTClient = MQTTClient;

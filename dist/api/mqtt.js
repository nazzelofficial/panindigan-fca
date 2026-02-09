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
        this.ctx = ctx;
        this.eventCallback = callback;
        this.perfMgr = PerformanceManager_1.PerformanceManager.getInstance();
        this.sessionID = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    }
    connect() {
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
            keepalive: 10,
            reschedulePings: true,
            connectTimeout: 60000,
            reconnectPeriod: 3000,
        };
        if (this.ctx.globalOptions?.proxy) {
            options.wsOptions.agent = new https_proxy_agent_1.HttpsProxyAgent(this.ctx.globalOptions.proxy);
        }
        // Exact replica of stream creation using websocket-stream
        this.client = new mqtt_1.default.Client(() => (0, websocket_stream_1.default)(mqttUrl, options.wsOptions), options);
        this.client.on('connect', () => {
            Logger_1.logger.success('MQTT Connected');
            this.perfMgr.recordRequest(0, 0, 0, false); // Record connection event
            this.subscribe();
        });
        this.client.on('message', (topic, message) => {
            this.handleMessage(topic, message);
        });
        this.client.on('error', (err) => {
            Logger_1.logger.error('MQTT Error:', err);
            this.perfMgr.recordRequest(0, 0, 0, true); // Record error
            this.eventCallback({ type: 'mqtt_error', error: err });
        });
        this.client.on('close', () => {
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
                console.error('Subscription failed:', err);
                this.eventCallback({ type: 'mqtt_subscribe_error', error: err });
            }
            else {
                console.log('Subscribed to topics');
            }
        });
    }
    handleMessage(topic, message) {
        const startTime = Date.now();
        const payloadSize = message.length;
        try {
            const payloadString = message.toString();
            let data;
            try {
                data = JSON.parse(payloadString);
            }
            catch (jsonErr) {
                // If not JSON, it might be raw data or specific format.
                // For now, we emit as raw if JSON parse fails.
                this.eventCallback({ type: 'mqtt_raw', topic, data: message });
                this.perfMgr.recordRequest(Date.now() - startTime, payloadSize, 0, true);
                return;
            }
            // Record metrics
            this.perfMgr.recordRequest(Date.now() - startTime, payloadSize, 0, false);
            if (topic === constants_1.MQTT_TOPICS.MESSAGING) {
                if (data.deltas) {
                    // Handle delta array
                    data.deltas.forEach((delta) => {
                        // Update sync token if present
                        if (data.firstDeltaSeqId) {
                            this.syncToken = data.firstDeltaSeqId;
                        }
                        this.eventCallback({ type: 'message', delta });
                    });
                }
                else {
                    this.eventCallback({ type: 'mqtt_event', topic, data });
                }
            }
            else if (topic === constants_1.MQTT_TOPICS.TYPING || topic === constants_1.MQTT_TOPICS.NOTIFICATIONS) {
                this.eventCallback({ type: 'typ', data });
            }
            else if (topic === constants_1.MQTT_TOPICS.PRESENCE) {
                this.eventCallback({ type: 'presence', data });
            }
            else {
                this.eventCallback({ type: 'mqtt_event', topic, data });
            }
        }
        catch (e) {
            console.error('Error handling MQTT message:', e);
            this.perfMgr.recordRequest(Date.now() - startTime, payloadSize, 0, true);
        }
    }
    publish(topic, payload, qos = 0) {
        if (!this.client || !this.client.connected) {
            console.warn('MQTT Client not connected, cannot publish');
            return;
        }
        const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
        this.client.publish(topic, message, { qos }, (err) => {
            if (err) {
                console.error(`Failed to publish to ${topic}:`, err);
            }
            else {
                this.perfMgr.recordRequest(0, 0, message.length, false);
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

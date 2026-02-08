"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MQTTClient = void 0;
const mqtt_1 = __importDefault(require("mqtt"));
const constants_1 = require("../utils/constants");
class MQTTClient {
    constructor(ctx, callback) {
        this.client = null;
        this.ctx = ctx;
        this.eventCallback = callback;
    }
    connect() {
        const sessionID = Math.floor(Math.random() * 9007199254740991) + 1;
        const deviceID = this.ctx.clientID;
        const username = JSON.stringify({
            u: this.ctx.userID,
            s: sessionID,
            cp: 3,
            ec: 0,
            chat_on: true,
            fg: false,
            d: deviceID,
            ct: 'websocket',
            mqtt_sid: '',
            aid: 219994525426954,
            st: [],
            pm: [],
            dc: '',
            no_auto_fg: true,
            p_device_id: deviceID,
            rc: 0
        });
        const options = {
            clientId: 'mqttwsclient',
            protocolId: 'MQIsdp',
            protocolVersion: 3,
            username: username,
            clean: true,
            wsOptions: {
                headers: {
                    'Cookie': this.ctx.jar.map(c => `${c.key}=${c.value}`).join('; '),
                    'Origin': 'https://www.facebook.com',
                    'User-Agent': constants_1.USER_AGENTS[0],
                    'Referer': 'https://www.facebook.com/',
                },
                origin: 'https://www.facebook.com'
            },
            keepalive: this.ctx.globalOptions?.autoRefresh?.mqttKeepAliveInterval || 30, // Default 30s as requested
            reschedulePings: true,
            connectTimeout: 10000,
        };
        this.client = mqtt_1.default.connect(constants_1.MQTT_BROKER_URL, options);
        this.client.on('connect', () => {
            console.log('MQTT Connected');
            this.subscribe();
        });
        this.client.on('message', (topic, message) => {
            try {
                const payload = message.toString();
                // Parse the delta/message payload here
                // This is a simplification; actual payload is often Thrift or compressed JSON
                // We will assume JSON for this implementation as some endpoints support it
                const data = JSON.parse(payload);
                this.eventCallback({ type: 'mqtt_event', topic, data });
            }
            catch (e) {
                // Fallback for non-JSON payloads (just emit raw)
                this.eventCallback({ type: 'mqtt_raw', topic, data: message });
            }
        });
        this.client.on('error', (err) => {
            console.error('MQTT Error:', err);
        });
    }
    subscribe() {
        if (!this.client)
            return;
        const topics = {
            '/t_ms': { qos: 0 },
            '/thread_typing': { qos: 0 },
            '/orca_typing_notifications': { qos: 0 },
            '/legacy_web': { qos: 0 },
            '/webrtc': { qos: 0 }
        };
        this.client.subscribe(topics, (err) => {
            if (err)
                console.error('Subscription failed:', err);
        });
    }
    disconnect() {
        if (this.client) {
            this.client.end();
        }
    }
}
exports.MQTTClient = MQTTClient;

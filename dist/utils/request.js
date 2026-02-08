"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const UserAgentRotator_1 = require("./UserAgentRotator");
const FingerprintManager_1 = require("./FingerprintManager");
class Request {
    constructor(appState, antiDetection) {
        this._jar = [];
        this._jar = appState || [];
        this._antiDetection = antiDetection;
        this._defaultHeaders = { ...constants_1.HEADERS };
        this._uaRotator = new UserAgentRotator_1.UserAgentRotator();
        this._fingerprintMgr = new FingerprintManager_1.FingerprintManager();
        if (this._antiDetection?.fingerprint?.enable) {
            if (this._antiDetection.fingerprint.autoRotate) {
                this._fingerprintMgr.startRotation(this._antiDetection.fingerprint.rotationInterval);
            }
        }
        this._instance = axios_1.default.create({
            baseURL: constants_1.FACEBOOK_URL,
            withCredentials: true,
            headers: this._defaultHeaders,
            validateStatus: () => true // Handle errors manually
        });
        this._instance.interceptors.request.use(async (config) => {
            // Anti-Detection: Random Delays
            if (this._antiDetection?.enable && this._antiDetection.randomDelays) {
                const delay = Math.floor(Math.random() * 400) + 100; // 100-500ms
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            // Anti-Detection: User Agent Rotation
            if (this._antiDetection?.enable && this._antiDetection.userAgentRotation) {
                config.headers['User-Agent'] = this._uaRotator.getRandomUserAgent('Desktop');
            }
            else if (this._antiDetection?.enable) {
                // Even if rotation is off, ensure we have a valid UA (already in HEADERS but good to enforce)
            }
            // Fingerprint Injection (Simulated headers)
            if (this._antiDetection?.fingerprint?.enable) {
                const fp = this._fingerprintMgr.getFingerprint();
                // Inject consistent timezone offset if needed (example custom header)
                // config.headers['X-Timezone-Offset'] = fp.timezone.offset; 
                // config.headers['X-Screen-Width'] = fp.screen.width;
                // Note: Actual FB headers are more complex, but this maintains internal state consistency
            }
            // Attach cookies
            const cookieHeader = (0, utils_1.formatCookie)(this._jar, config.url || constants_1.FACEBOOK_URL);
            if (cookieHeader) {
                config.headers['Cookie'] = cookieHeader;
            }
            return config;
        });
        this._instance.interceptors.response.use(response => {
            // Update cookies
            const setCookie = response.headers['set-cookie'];
            if (setCookie) {
                setCookie.forEach((c) => {
                    const parts = c.split(';')[0].split('=');
                    const key = parts[0];
                    const value = parts.slice(1).join('=');
                    const domain = c.match(/domain=([^;]+)/i)?.[1] || '.facebook.com';
                    const existing = this._jar.findIndex(k => k.key === key && domain.includes(k.domain.replace(/^\./, '')));
                    if (existing > -1) {
                        this._jar[existing].value = value;
                    }
                    else {
                        this._jar.push({
                            key,
                            value,
                            domain,
                            path: '/',
                            hostOnly: false,
                            creation: new Date().toISOString(),
                            lastAccessed: new Date().toISOString()
                        });
                    }
                });
            }
            return response;
        });
    }
    getJar() {
        return this._jar;
    }
    setJar(jar) {
        this._jar = jar;
    }
    async get(url, config) {
        return this._instance.get(url, config);
    }
    async post(url, data, config) {
        return this._instance.post(url, data, config);
    }
}
exports.Request = Request;

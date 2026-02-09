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
const BehavioralSimulator_1 = require("./BehavioralSimulator");
const SecurityGuard_1 = require("./SecurityGuard");
const PerformanceManager_1 = require("./PerformanceManager");
class Request {
    constructor(appState, antiDetection) {
        this._jar = [];
        this._jar = appState || [];
        this._antiDetection = antiDetection;
        this._defaultHeaders = { ...constants_1.HEADERS };
        this._uaRotator = new UserAgentRotator_1.UserAgentRotator();
        this._fingerprintMgr = new FingerprintManager_1.FingerprintManager();
        this._behavioralSim = new BehavioralSimulator_1.BehavioralSimulator(antiDetection?.behavioralSimulation || { enable: false });
        this._securityGuard = new SecurityGuard_1.SecurityGuard(antiDetection?.securityGuard || { enable: false });
        this._perfMgr = PerformanceManager_1.PerformanceManager.getInstance();
        if (this._antiDetection?.fingerprint?.enable) {
            if (this._antiDetection.fingerprint.autoRotate) {
                this._fingerprintMgr.startRotation(this._antiDetection.fingerprint.rotationInterval);
            }
        }
        const axiosConfig = {
            baseURL: constants_1.FACEBOOK_URL,
            withCredentials: true,
            headers: this._defaultHeaders,
            validateStatus: () => true, // Handle errors manually
            httpAgent: this._perfMgr.httpAgent,
            httpsAgent: this._perfMgr.httpsAgent,
            decompress: true // Enable automatic decompression
        };
        // Compression Header
        this._defaultHeaders['Accept-Encoding'] = 'gzip, deflate, br';
        // Proxy Configuration
        if (this._antiDetection?.proxy?.enable && this._antiDetection.proxy.proxies?.length) {
            const proxyUrl = this._antiDetection.proxy.proxies[Math.floor(Math.random() * this._antiDetection.proxy.proxies.length)];
            try {
                const url = new URL(proxyUrl);
                axiosConfig.proxy = {
                    protocol: url.protocol.replace(':', ''),
                    host: url.hostname,
                    port: parseInt(url.port),
                    auth: (url.username && url.password) ? { username: url.username, password: url.password } : undefined
                };
            }
            catch (e) {
                console.warn('[Request] Invalid proxy URL provided:', proxyUrl);
            }
        }
        this._instance = axios_1.default.create(axiosConfig);
        this._instance.interceptors.request.use(async (config) => {
            config.startTime = Date.now();
            // Security Guard: Rate Limiting
            await this._securityGuard.checkRateLimits();
            // Anti-Detection: Behavioral Delays
            if (this._antiDetection?.behavioralSimulation?.enable) {
                await this._behavioralSim.simulateDelay('action');
            }
            else if (this._antiDetection?.enable && this._antiDetection.randomDelays) {
                const delay = Math.floor(Math.random() * 400) + 100; // 100-500ms
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            // Anti-Detection: User Agent Rotation
            if (this._antiDetection?.enable && this._antiDetection.userAgentRotation) {
                config.headers['User-Agent'] = this._uaRotator.getRandomUserAgent('Desktop');
            }
            // Fingerprint Injection
            if (this._antiDetection?.fingerprint?.enable) {
                const fpHeaders = this._fingerprintMgr.getSecurityHeaders();
                config.headers = { ...config.headers, ...fpHeaders };
            }
            // Attach cookies
            const cookieHeader = (0, utils_1.formatCookie)(this._jar, config.url || constants_1.FACEBOOK_URL);
            if (cookieHeader) {
                config.headers['Cookie'] = cookieHeader;
            }
            return config;
        }, error => {
            // Record Error Metrics
            const duration = Date.now() - (error.config?.startTime || Date.now());
            this._perfMgr.recordRequest(duration, 0, 0, true);
            return Promise.reject(error);
        });
        this._instance.interceptors.response.use(async (response) => {
            // Record Metrics
            const duration = Date.now() - (response.config?.startTime || Date.now());
            const bytesIn = parseInt(response.headers['content-length'] || '0');
            const bytesOut = 0; // Approx, hard to get exact from axios
            this._perfMgr.recordRequest(duration, bytesIn, bytesOut, false);
            // Checkpoint Detection
            if (response.data && typeof response.data === 'string') {
                const handled = await this._securityGuard.handleCheckpoint(response.data);
                if (!handled) {
                    // Log warning but don't break flow unless critical
                }
            }
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
    getUserAgent() {
        return this._defaultHeaders['User-Agent'];
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

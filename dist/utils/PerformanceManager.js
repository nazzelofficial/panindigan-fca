"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceManager = void 0;
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
class PerformanceManager {
    constructor() {
        this.cache = new Map();
        this.metrics = {
            requests: 0,
            errors: 0,
            bytesReceived: 0,
            bytesSent: 0,
            totalResponseTime: 0
        };
        // Connection Pooling
        const agentOptions = {
            keepAlive: true,
            keepAliveMsecs: 1000,
            maxSockets: 50, // Concurrency limit
            maxFreeSockets: 10,
            timeout: 60000
        };
        this._httpsAgent = new https_1.default.Agent(agentOptions);
        this._httpAgent = new http_1.default.Agent(agentOptions);
    }
    static getInstance() {
        if (!PerformanceManager.instance) {
            PerformanceManager.instance = new PerformanceManager();
        }
        return PerformanceManager.instance;
    }
    get httpsAgent() { return this._httpsAgent; }
    get httpAgent() { return this._httpAgent; }
    // Response Caching (LRU-like with TTL)
    getCache(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }
    setCache(key, value, ttlSeconds = 60) {
        // Simple memory limit: remove oldest if size > 1000
        if (this.cache.size > 1000) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey)
                this.cache.delete(firstKey);
        }
        this.cache.set(key, {
            value,
            expiry: Date.now() + (ttlSeconds * 1000)
        });
    }
    // Metrics
    recordRequest(responseTime, bytesIn, bytesOut, isError = false) {
        this.metrics.requests++;
        this.metrics.totalResponseTime += responseTime;
        this.metrics.bytesReceived += bytesIn;
        this.metrics.bytesSent += bytesOut;
        if (isError)
            this.metrics.errors++;
    }
    getMetrics() {
        return {
            ...this.metrics,
            avgResponseTime: this.metrics.requests ? (this.metrics.totalResponseTime / this.metrics.requests).toFixed(2) + 'ms' : '0ms'
        };
    }
}
exports.PerformanceManager = PerformanceManager;

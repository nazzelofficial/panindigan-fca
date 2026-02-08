import https from 'https';
import http from 'http';

interface CacheEntry<T> {
  value: T;
  expiry: number;
}

export class PerformanceManager {
  private static instance: PerformanceManager;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private metrics: {
    requests: number;
    errors: number;
    bytesReceived: number;
    bytesSent: number;
    totalResponseTime: number;
  } = {
    requests: 0,
    errors: 0,
    bytesReceived: 0,
    bytesSent: 0,
    totalResponseTime: 0
  };

  private _httpsAgent: https.Agent;
  private _httpAgent: http.Agent;

  private constructor() {
    // Connection Pooling
    const agentOptions = {
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: 50, // Concurrency limit
      maxFreeSockets: 10,
      timeout: 60000
    };
    this._httpsAgent = new https.Agent(agentOptions);
    this._httpAgent = new http.Agent(agentOptions);
  }

  public static getInstance(): PerformanceManager {
    if (!PerformanceManager.instance) {
      PerformanceManager.instance = new PerformanceManager();
    }
    return PerformanceManager.instance;
  }

  public get httpsAgent() { return this._httpsAgent; }
  public get httpAgent() { return this._httpAgent; }

  // Response Caching (LRU-like with TTL)
  public getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  public setCache<T>(key: string, value: T, ttlSeconds: number = 60): void {
    // Simple memory limit: remove oldest if size > 1000
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttlSeconds * 1000)
    });
  }

  // Metrics
  public recordRequest(responseTime: number, bytesIn: number, bytesOut: number, isError: boolean = false) {
    this.metrics.requests++;
    this.metrics.totalResponseTime += responseTime;
    this.metrics.bytesReceived += bytesIn;
    this.metrics.bytesSent += bytesOut;
    if (isError) this.metrics.errors++;
  }

  public getMetrics() {
    return {
      ...this.metrics,
      avgResponseTime: this.metrics.requests ? (this.metrics.totalResponseTime / this.metrics.requests).toFixed(2) + 'ms' : '0ms'
    };
  }
}

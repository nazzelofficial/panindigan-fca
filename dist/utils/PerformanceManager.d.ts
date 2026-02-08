import https from 'https';
import http from 'http';
export declare class PerformanceManager {
    private static instance;
    private cache;
    private metrics;
    private _httpsAgent;
    private _httpAgent;
    private constructor();
    static getInstance(): PerformanceManager;
    get httpsAgent(): https.Agent;
    get httpAgent(): http.Agent;
    getCache<T>(key: string): T | null;
    setCache<T>(key: string, value: T, ttlSeconds?: number): void;
    recordRequest(responseTime: number, bytesIn: number, bytesOut: number, isError?: boolean): void;
    getMetrics(): {
        avgResponseTime: string;
        requests: number;
        errors: number;
        bytesReceived: number;
        bytesSent: number;
        totalResponseTime: number;
    };
}

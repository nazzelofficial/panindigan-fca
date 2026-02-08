"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAgentRotator = void 0;
class UserAgentRotator {
    constructor() {
        this.userAgents = [
            // --- Desktop Windows (Chrome) ---
            {
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                browser: 'Chrome',
                os: 'Windows',
                platform: 'Desktop',
                version: '121.0.0.0',
                weight: 10
            },
            {
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                browser: 'Chrome',
                os: 'Windows',
                platform: 'Desktop',
                version: '122.0.0.0',
                weight: 10
            },
            // --- Desktop Windows (Edge) ---
            {
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
                browser: 'Edge',
                os: 'Windows',
                platform: 'Desktop',
                version: '121.0.0.0',
                weight: 8
            },
            // --- Desktop Mac (Chrome) ---
            {
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                browser: 'Chrome',
                os: 'Mac',
                platform: 'Desktop',
                version: '121.0.0.0',
                weight: 5
            },
            // --- Mobile Android (Chrome) ---
            {
                userAgent: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36',
                browser: 'Chrome',
                os: 'Android',
                platform: 'Mobile',
                version: '121.0.0.0',
                weight: 3
            }
        ];
    }
    getRandomUserAgent(platform) {
        let pool = this.userAgents;
        if (platform) {
            pool = pool.filter(ua => ua.platform === platform);
        }
        // Weight-based selection
        const totalWeight = pool.reduce((sum, ua) => sum + ua.weight, 0);
        let random = Math.random() * totalWeight;
        for (const ua of pool) {
            random -= ua.weight;
            if (random <= 0) {
                return ua.userAgent;
            }
        }
        return pool[0].userAgent; // Fallback
    }
    addCustomUserAgent(ua) {
        this.userAgents.push(ua);
    }
}
exports.UserAgentRotator = UserAgentRotator;

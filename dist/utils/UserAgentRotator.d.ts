export interface UserAgent {
    userAgent: string;
    browser: 'Chrome' | 'Edge' | 'Firefox' | 'Safari';
    os: 'Windows' | 'Mac' | 'Linux' | 'Android' | 'iOS';
    platform: 'Desktop' | 'Mobile';
    version: string;
    weight: number;
}
export declare class UserAgentRotator {
    private userAgents;
    getRandomUserAgent(platform?: 'Desktop' | 'Mobile'): string;
    addCustomUserAgent(ua: UserAgent): void;
}

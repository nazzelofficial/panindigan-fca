export interface Fingerprint {
    screen: {
        width: number;
        height: number;
        pixelRatio: number;
        colorDepth: number;
    };
    timezone: {
        name: string;
        offset: number;
    };
    browser: {
        userAgent: string;
        language: string;
        platform: string;
        plugins: string[];
    };
    hardware: {
        concurrency: number;
        memory: number;
    };
    signatures: {
        canvas: string;
        webgl: string;
        audio: string;
    };
}
export declare class FingerprintManager {
    private fingerprint;
    private rotationInterval;
    private lastRotation;
    constructor();
    getFingerprint(): Fingerprint;
    startRotation(intervalMs?: number): void;
    stopRotation(): void;
    rotateFingerprint(): void;
    getSecurityHeaders(): any;
    private getRandomFriendlyName;
    private generateFingerprint;
    private generatePluginList;
}

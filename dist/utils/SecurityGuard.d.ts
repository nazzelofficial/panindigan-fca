export declare class SecurityGuard {
    private options;
    private requestCounts;
    private lastRequestReset;
    private cooldownMode;
    private readonly MAX_REQUESTS_PER_MINUTE;
    private readonly COOLDOWN_DURATION;
    constructor(options: any);
    checkRateLimits(): Promise<void>;
    handleCheckpoint(body: string, pageUrl?: string): Promise<boolean>;
    private solveCaptcha;
}

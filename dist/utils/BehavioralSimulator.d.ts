export declare class BehavioralSimulator {
    private options;
    private lastActivity;
    private isIdle;
    constructor(options: any);
    simulateDelay(type?: 'typing' | 'read' | 'action'): Promise<void>;
    getTypingDuration(textLength: number): number;
}

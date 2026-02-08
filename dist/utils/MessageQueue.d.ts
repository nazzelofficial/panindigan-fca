export declare class MessageQueue {
    private queue;
    private processing;
    private lastProcessTime;
    private readonly minInterval;
    constructor();
    enqueue<T>(fn: () => Promise<T>, priority?: number): Promise<T>;
    private process;
}

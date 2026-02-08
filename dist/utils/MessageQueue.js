"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageQueue = void 0;
class MessageQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.lastProcessTime = 0;
        this.minInterval = 200; // 5 requests per second max
    }
    enqueue(fn, priority = 0) {
        return new Promise((resolve, reject) => {
            this.queue.push({ fn, resolve, reject, priority });
            this.queue.sort((a, b) => b.priority - a.priority); // High priority first
            this.process();
        });
    }
    async process() {
        if (this.processing || this.queue.length === 0)
            return;
        const now = Date.now();
        const timeSinceLast = now - this.lastProcessTime;
        if (timeSinceLast < this.minInterval) {
            setTimeout(() => this.process(), this.minInterval - timeSinceLast);
            return;
        }
        this.processing = true;
        const item = this.queue.shift();
        if (item) {
            try {
                this.lastProcessTime = Date.now();
                const result = await item.fn();
                item.resolve(result);
            }
            catch (error) {
                item.reject(error);
            }
        }
        this.processing = false;
        if (this.queue.length > 0) {
            // Next tick
            setTimeout(() => this.process(), 0);
        }
    }
}
exports.MessageQueue = MessageQueue;

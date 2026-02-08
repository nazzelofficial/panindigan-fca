import { ApiCtx } from '../auth';

type QueueItem = {
  fn: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  priority: number; // Higher is better
};

export class MessageQueue {
  private queue: QueueItem[] = [];
  private processing: boolean = false;
  private lastProcessTime: number = 0;
  private readonly minInterval: number = 200; // 5 requests per second max

  constructor() {}

  public enqueue<T>(fn: () => Promise<T>, priority: number = 0): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject, priority });
      this.queue.sort((a, b) => b.priority - a.priority); // High priority first
      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;

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
      } catch (error) {
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

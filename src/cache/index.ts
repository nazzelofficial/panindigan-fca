import { LRUCache } from 'lru-cache';
import { CacheError } from '../errors/index.js';

interface CacheEntry<T> {
  value: T;
}

export class CacheManager {
  private readonly lru: LRUCache<string, CacheEntry<unknown>>;
  private hitCount = 0;
  private missCount = 0;

  constructor(options: { maxSize: number; ttlMs: number }) {
    this.lru = new LRUCache({
      max: options.maxSize,
      ttl: options.ttlMs,
      updateAgeOnGet: false,
      updateAgeOnHas: false,
    });
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const entry = this.lru.get(key) as CacheEntry<T> | undefined;
      if (entry === undefined) {
        this.missCount++;
        return undefined;
      }
      this.hitCount++;
      return entry.value;
    } catch (err) {
      throw new CacheError(`Cache get failed for key "${key}"`, { key }, err);
    }
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    try {
      const options = ttlMs !== undefined ? { ttl: ttlMs } : undefined;
      this.lru.set(key, { value } as CacheEntry<unknown>, options);
    } catch (err) {
      throw new CacheError(`Cache set failed for key "${key}"`, { key }, err);
    }
  }

  async delete(key: string): Promise<void> {
    this.lru.delete(key);
  }

  async clear(): Promise<void> {
    this.lru.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  async has(key: string): Promise<boolean> {
    return this.lru.has(key);
  }

  getStats() {
    const total = this.hitCount + this.missCount;
    return {
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: total > 0 ? this.hitCount / total : 0,
      entryCount: this.lru.size,
    };
  }
}

export function nsKey(namespace: string, key: string): string {
  return `${namespace}:${key}`;
}

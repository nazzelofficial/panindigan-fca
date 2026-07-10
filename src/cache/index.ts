import { LRUCache } from 'lru-cache';
import { CacheError } from '../errors/index.js';

interface CacheEntry<T> {
  value: T;
}

/** Options accepted by {@link CacheManager}. Every field is optional — safe defaults are applied. */
export interface CacheManagerOptions {
  /** Max number of entries. Must be a finite number > 0, otherwise the default is used. */
  maxSize?: number;
  /** Entry TTL in milliseconds. Must be a finite number >= 0, otherwise the default is used. */
  ttlMs?: number;
  /** Refresh an entry's TTL when it's read. Defaults to false (matches pre-0.1.2 behavior). */
  updateAgeOnGet?: boolean;
}

/** Fully normalized, guaranteed-valid options passed straight into `new LRUCache(...)`. */
interface NormalizedCacheOptions {
  max: number;
  ttl: number;
  updateAgeOnGet: boolean;
}

/** Default max entries used whenever `maxSize` is missing or invalid. */
export const DEFAULT_CACHE_MAX_SIZE = 1000;
/** Default entry TTL (30 minutes) used whenever `ttlMs` is missing or invalid. */
export const DEFAULT_CACHE_TTL_MS = 1000 * 60 * 30;

/**
 * Normalizes arbitrary/partial cache options into a configuration that is always safe to pass to
 * `lru-cache` v11+, which throws `TypeError: At least one of max, maxSize, or ttl is required`
 * when none of those fields are set. This is the single choke point that guarantees a valid
 * `LRUCache` constructor call regardless of what upstream callers (or misconfigured env-derived
 * config) pass in — defaults are merged in, never used to silently replace explicit valid values,
 * and out-of-range values (<=0 for maxSize, <0 for ttl) are normalized back to the safe default
 * instead of throwing.
 */
export function normalizeCacheOptions(options?: CacheManagerOptions): NormalizedCacheOptions {
  const rawMax = options?.maxSize;
  const max =
    typeof rawMax === 'number' && Number.isFinite(rawMax) && rawMax > 0
      ? Math.floor(rawMax)
      : DEFAULT_CACHE_MAX_SIZE;

  const rawTtl = options?.ttlMs;
  const ttl =
    typeof rawTtl === 'number' && Number.isFinite(rawTtl) && rawTtl >= 0
      ? Math.floor(rawTtl)
      : DEFAULT_CACHE_TTL_MS;

  return {
    max,
    ttl,
    updateAgeOnGet: options?.updateAgeOnGet ?? false,
  };
}

export class CacheManager {
  private readonly lru: LRUCache<string, CacheEntry<unknown>>;
  private hitCount = 0;
  private missCount = 0;

  constructor(options: CacheManagerOptions = {}) {
    const normalized = normalizeCacheOptions(options);
    this.lru = new LRUCache({
      max: normalized.max,
      ttl: normalized.ttl,
      updateAgeOnGet: normalized.updateAgeOnGet,
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

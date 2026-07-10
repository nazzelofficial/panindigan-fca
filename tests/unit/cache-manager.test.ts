import { describe, expect, it } from 'vitest';
import {
  CacheManager,
  normalizeCacheOptions,
  DEFAULT_CACHE_MAX_SIZE,
  DEFAULT_CACHE_TTL_MS,
} from '../../src/cache/index.js';
import { loadConfig } from '../../src/config/index.js';

describe('normalizeCacheOptions', () => {
  it('applies safe defaults when no options are provided', () => {
    const result = normalizeCacheOptions();
    expect(result).toEqual({ max: DEFAULT_CACHE_MAX_SIZE, ttl: DEFAULT_CACHE_TTL_MS, updateAgeOnGet: false });
  });

  it('defaults updateAgeOnGet to false to preserve pre-0.1.2 fixed-TTL eviction behavior', () => {
    expect(normalizeCacheOptions().updateAgeOnGet).toBe(false);
    expect(normalizeCacheOptions({ maxSize: 10, ttlMs: 1000 }).updateAgeOnGet).toBe(false);
  });

  it('applies safe defaults when max, maxSize, and ttl are all undefined', () => {
    const result = normalizeCacheOptions({});
    expect(result.max).toBe(DEFAULT_CACHE_MAX_SIZE);
    expect(result.ttl).toBe(DEFAULT_CACHE_TTL_MS);
  });

  it('honors a valid custom maxSize', () => {
    const result = normalizeCacheOptions({ maxSize: 250 });
    expect(result.max).toBe(250);
    expect(result.ttl).toBe(DEFAULT_CACHE_TTL_MS);
  });

  it('honors a valid custom ttl', () => {
    const result = normalizeCacheOptions({ ttlMs: 5000 });
    expect(result.ttl).toBe(5000);
    expect(result.max).toBe(DEFAULT_CACHE_MAX_SIZE);
  });

  it('honors ttlMs: 0 (disables expiry) without falling back to the default', () => {
    const result = normalizeCacheOptions({ ttlMs: 0 });
    expect(result.ttl).toBe(0);
  });

  it('honors both custom maxSize and ttlMs together', () => {
    const result = normalizeCacheOptions({ maxSize: 42, ttlMs: 999 });
    expect(result).toEqual({ max: 42, ttl: 999, updateAgeOnGet: false });
  });

  it('normalizes an invalid maxSize (<= 0) back to the default instead of throwing', () => {
    expect(normalizeCacheOptions({ maxSize: 0 }).max).toBe(DEFAULT_CACHE_MAX_SIZE);
    expect(normalizeCacheOptions({ maxSize: -5 }).max).toBe(DEFAULT_CACHE_MAX_SIZE);
  });

  it('normalizes an invalid ttl (< 0) back to the default instead of throwing', () => {
    expect(normalizeCacheOptions({ ttlMs: -1 }).ttl).toBe(DEFAULT_CACHE_TTL_MS);
  });

  it('normalizes non-finite/NaN values back to defaults', () => {
    expect(normalizeCacheOptions({ maxSize: Number.NaN }).max).toBe(DEFAULT_CACHE_MAX_SIZE);
    expect(normalizeCacheOptions({ ttlMs: Number.POSITIVE_INFINITY }).ttl).toBe(DEFAULT_CACHE_TTL_MS);
  });

  it('floors fractional values', () => {
    expect(normalizeCacheOptions({ maxSize: 10.9 }).max).toBe(10);
    expect(normalizeCacheOptions({ ttlMs: 10.9 }).ttl).toBe(10);
  });

  it('respects an explicit updateAgeOnGet override', () => {
    expect(normalizeCacheOptions({ updateAgeOnGet: false }).updateAgeOnGet).toBe(false);
  });
});

describe('CacheManager construction', () => {
  it('constructs with no options at all (backward compatibility for defaults)', () => {
    expect(() => new CacheManager()).not.toThrow();
  });

  it('constructs with an empty options object without throwing the lru-cache TypeError', () => {
    expect(() => new CacheManager({})).not.toThrow();
  });

  it('constructs with only maxSize provided', async () => {
    const cache = new CacheManager({ maxSize: 5 });
    await cache.set('a', 1);
    expect(await cache.get('a')).toBe(1);
  });

  it('constructs with only ttlMs provided', async () => {
    const cache = new CacheManager({ ttlMs: 1000 });
    await cache.set('a', 1);
    expect(await cache.get('a')).toBe(1);
  });

  it('constructs with explicitly invalid values without throwing, using safe defaults instead', async () => {
    const cache = new CacheManager({ maxSize: -1, ttlMs: -1 });
    await cache.set('a', 1);
    expect(await cache.get('a')).toBe(1);
  });

  it('remains fully functional (get/set/has/delete/clear/stats) with default construction', async () => {
    const cache = new CacheManager();
    await cache.set('k', 'v');
    expect(await cache.get('k')).toBe('v');
    expect(await cache.has('k')).toBe(true);
    await cache.delete('k');
    expect(await cache.has('k')).toBe(false);
    await cache.set('k2', 'v2');
    await cache.clear();
    expect(cache.getStats().entryCount).toBe(0);
  });
});

describe('createClient cache config regression (LRUCache TypeError)', () => {
  it('handles loadConfig() output as-is, even when cache.maxSize/ttl come through as undefined', () => {
    // Reproduces the exact reported crash: with no cache overrides, zod's nested
    // `.default(() => ({}))` does not backfill the inner `maxSize`/`ttl` field
    // defaults, so `config.cache` can legitimately be `{}` — i.e. maxSize/ttl
    // are undefined here, which used to be passed straight into `new LRUCache()`
    // and throw. normalizeCacheOptions must absorb this without throwing.
    const config = loadConfig({});
    expect(() => new CacheManager({ maxSize: config.cache.maxSize, ttlMs: config.cache.ttl })).not.toThrow();
    const normalized = normalizeCacheOptions({ maxSize: config.cache.maxSize, ttlMs: config.cache.ttl });
    expect(normalized.max).toBeGreaterThan(0);
    expect(normalized.ttl).toBeGreaterThanOrEqual(0);
  });

  it('never throws the lru-cache "at least one of max, maxSize, or ttl is required" error, even for adversarial config-shaped input', () => {
    const adversarialInputs: Array<Record<string, unknown> | undefined> = [
      undefined,
      {},
      { maxSize: undefined, ttlMs: undefined },
      { maxSize: null as unknown as number },
      { maxSize: 0, ttlMs: 0 },
      { maxSize: -1, ttlMs: -1 },
      { maxSize: Number.NaN, ttlMs: Number.NaN },
    ];
    for (const input of adversarialInputs) {
      expect(() => new CacheManager(input)).not.toThrow();
    }
  });
});

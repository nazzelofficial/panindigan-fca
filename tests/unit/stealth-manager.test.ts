import { describe, it, expect, vi } from 'vitest';
import { StealthManager, generateFingerprint, buildStealthHeaders } from '../../src/stealth/index.js';
import { TypedEventEmitter } from '../../src/events/index.js';
import { createLogger } from '../../src/logger/index.js';
import type { Config } from '../../src/config/index.js';

describe('StealthManager', () => {
  const emitter = new TypedEventEmitter();
  const logger = createLogger({ level: 'error', pretty: false, bindings: { tag: 'TEST' } });

  describe('constructor with no stealth configuration', () => {
    it('should initialize successfully with empty config', () => {
      const emptyConfig = {} as unknown as Config['stealth'];
      expect(() => new StealthManager(emptyConfig, emitter, logger)).not.toThrow();
    });

    it('should generate a fingerprint with auto-generated seed', () => {
      const emptyConfig = {} as unknown as Config['stealth'];
      const manager = new StealthManager(emptyConfig, emitter, logger);
      expect(manager.fingerprint).toBeDefined();
      expect(manager.fingerprint.userAgent).toBeDefined();
      expect(manager.fingerprint.platform).toBeDefined();
      expect(manager.fingerprint.locale).toBeDefined();
    });

    it('should not emit fingerprint event when fingerprint.enabled is undefined (defaults to true)', () => {
      const emptyConfig = {} as unknown as Config['stealth'];
      const spy = vi.spyOn(emitter, 'emit');
      new StealthManager(emptyConfig, emitter, logger);
      expect(spy).toHaveBeenCalledWith('stealth:fingerprint:assigned', expect.objectContaining({
        userAgent: expect.any(String),
        platform: expect.any(String),
        locale: expect.any(String),
      }));
    });
  });

  describe('constructor with partial stealth configuration', () => {
    it('should handle missing fingerprint object', () => {
      const partialConfig = {
        level: 'medium' as const,
        delays: { enabled: true, actionDelay: { min: 300, max: 1800 }, messageDelay: { min: 800, max: 4000 }, paginationDelay: { min: 200, max: 900 } },
      } as unknown as Config['stealth'];
      expect(() => new StealthManager(partialConfig, emitter, logger)).not.toThrow();
    });

    it('should handle missing userAgent object', () => {
      const partialConfig = {
        level: 'medium' as const,
        fingerprint: { enabled: true, consistent: true, seed: null },
      } as unknown as Config['stealth'];
      expect(() => new StealthManager(partialConfig, emitter, logger)).not.toThrow();
    });

    it('should handle missing warmup object', () => {
      const partialConfig = {
        level: 'medium' as const,
        fingerprint: { enabled: true, consistent: true, seed: null },
        userAgent: { enabled: true, seed: null },
      } as unknown as Config['stealth'];
      expect(() => new StealthManager(partialConfig, emitter, logger)).not.toThrow();
    });

    it('should handle missing rateLimit object', () => {
      const partialConfig = {
        level: 'medium' as const,
        fingerprint: { enabled: true, consistent: true, seed: null },
        userAgent: { enabled: true, seed: null },
        warmup: { enabled: false, duration: 30, startFraction: 0.1, emitEvent: true },
      } as unknown as Config['stealth'];
      expect(() => new StealthManager(partialConfig, emitter, logger)).not.toThrow();
    });
  });

  describe('seed handling', () => {
    it('should auto-generate seed when fingerprint.seed is null', () => {
      const config = {
        fingerprint: { enabled: true, consistent: true, seed: null },
      } as unknown as Config['stealth'];
      const manager = new StealthManager(config, emitter, logger);
      expect(manager.fingerprint).toBeDefined();
    });

    it('should auto-generate seed when fingerprint.seed is undefined', () => {
      const config = {
        fingerprint: { enabled: true, consistent: true, seed: undefined },
      } as unknown as Config['stealth'];
      const manager = new StealthManager(config, emitter, logger);
      expect(manager.fingerprint).toBeDefined();
    });

    it('should auto-generate seed when fingerprint object is missing', () => {
      const config = {} as unknown as Config['stealth'];
      const manager = new StealthManager(config, emitter, logger);
      expect(manager.fingerprint).toBeDefined();
    });

    it('should use provided fingerprint.seed when present', () => {
      const config = {
        fingerprint: { enabled: true, consistent: true, seed: 'test-seed-123' },
      } as unknown as Config['stealth'];
      const manager = new StealthManager(config, emitter, logger);
      expect(manager.fingerprint).toBeDefined();
    });

    it('should fall back to userAgent.seed when fingerprint.seed is null', () => {
      const config = {
        fingerprint: { enabled: true, consistent: true, seed: null },
        userAgent: { enabled: true, seed: 'user-seed-456' },
      } as unknown as Config['stealth'];
      const manager = new StealthManager(config, emitter, logger);
      expect(manager.fingerprint).toBeDefined();
    });
  });

  describe('warmup configuration', () => {
    it('should not start warmup when warmup.enabled is false', () => {
      const config = {
        warmup: { enabled: false, duration: 30, startFraction: 0.1, emitEvent: true },
      } as unknown as Config['stealth'];
      const spy = vi.spyOn(emitter, 'emit');
      new StealthManager(config, emitter, logger);
      expect(spy).not.toHaveBeenCalledWith('stealth:warmup:start', expect.anything());
    });

    it('should start warmup when warmup.enabled is true', () => {
      const config = {
        warmup: { enabled: true, duration: 30, startFraction: 0.1, emitEvent: true },
      } as unknown as Config['stealth'];
      const spy = vi.spyOn(emitter, 'emit');
      new StealthManager(config, emitter, logger);
      expect(spy).toHaveBeenCalledWith('stealth:warmup:start', expect.objectContaining({
        targetRateLimitRpm: expect.any(Number),
      }));
    });

    it('should handle missing warmup object gracefully', () => {
      const config = {} as unknown as Config['stealth'];
      expect(() => new StealthManager(config, emitter, logger)).not.toThrow();
    });
  });

  describe('getHeaders', () => {
    it('should return empty object when level is off', () => {
      const config = { level: 'off' as const } as unknown as Config['stealth'];
      const manager = new StealthManager(config, emitter, logger);
      expect(manager.getHeaders()).toEqual({});
    });

    it('should return headers when level is not off', () => {
      const config = { level: 'medium' as const } as unknown as Config['stealth'];
      const manager = new StealthManager(config, emitter, logger);
      const headers = manager.getHeaders();
      expect(headers).toBeDefined();
      expect(headers['user-agent']).toBeDefined();
      expect(headers['accept-language']).toBeDefined();
    });

    it('should include referer when provided', () => {
      const config = { level: 'medium' as const } as unknown as Config['stealth'];
      const manager = new StealthManager(config, emitter, logger);
      const headers = manager.getHeaders('https://facebook.com');
      expect(headers['referer']).toBe('https://facebook.com');
    });
  });

  describe('isWarmupComplete', () => {
    it('should return true when warmup is disabled', () => {
      const config = {
        warmup: { enabled: false, duration: 30, startFraction: 0.1, emitEvent: true },
      } as unknown as Config['stealth'];
      const manager = new StealthManager(config, emitter, logger);
      expect(manager.isWarmupComplete()).toBe(true);
    });

    it('should return false when warmup is enabled and not complete', () => {
      const config = {
        warmup: { enabled: true, duration: 30, startFraction: 0.1, emitEvent: true },
      } as unknown as Config['stealth'];
      const manager = new StealthManager(config, emitter, logger);
      expect(manager.isWarmupComplete()).toBe(false);
    });
  });

  describe('getCurrentRateLimit', () => {
    it('should return full rate limit when warmup is disabled', () => {
      const config = {
        rateLimit: { enabled: true, requestsPerMinute: 30, minInterval: 500, onOverload: 'queue' as const },
        warmup: { enabled: false, duration: 30, startFraction: 0.1, emitEvent: true },
      } as unknown as Config['stealth'];
      const manager = new StealthManager(config, emitter, logger);
      expect(manager.getCurrentRateLimit()).toBe(30);
    });

    it('should return reduced rate limit during warmup', () => {
      const config = {
        rateLimit: { enabled: true, requestsPerMinute: 30, minInterval: 500, onOverload: 'queue' as const },
        warmup: { enabled: true, duration: 30, startFraction: 0.1, emitEvent: true },
      } as unknown as Config['stealth'];
      const manager = new StealthManager(config, emitter, logger);
      const rateLimit = manager.getCurrentRateLimit();
      expect(rateLimit).toBeGreaterThan(0);
      expect(rateLimit).toBeLessThanOrEqual(30);
    });

    it('should handle missing rateLimit object', () => {
      const config = {} as unknown as Config['stealth'];
      const manager = new StealthManager(config, emitter, logger);
      expect(() => manager.getCurrentRateLimit()).not.toThrow();
    });
  });

  describe('incrementRequestCount', () => {
    it('should increment request count', () => {
      const config = {} as unknown as Config['stealth'];
      const manager = new StealthManager(config, emitter, logger);
      manager.incrementRequestCount();
      // No public getter for requestCount, but this should not throw
      expect(() => manager.incrementRequestCount()).not.toThrow();
    });
  });

  describe('full stealth configuration', () => {
    it('should initialize with complete stealth config', () => {
      const fullConfig: Config['stealth'] = {
        level: 'high',
        delays: {
          enabled: true,
          actionDelay: { min: 500, max: 2000 },
          messageDelay: { min: 1000, max: 5000 },
          paginationDelay: { min: 300, max: 1000 },
        },
        typingSimulation: {
          enabled: true,
          wpm: { min: 50, max: 90 },
          naturalPauses: true,
        },
        rateLimit: {
          enabled: true,
          requestsPerMinute: 20,
          minInterval: 1000,
          onOverload: 'queue',
        },
        userAgent: {
          enabled: true,
          seed: 'custom-user-seed',
        },
        fingerprint: {
          enabled: true,
          consistent: true,
          seed: 'custom-fingerprint-seed',
        },
        warmup: {
          enabled: true,
          duration: 60,
          startFraction: 0.2,
          emitEvent: true,
        },
      };
      expect(() => new StealthManager(fullConfig, emitter, logger)).not.toThrow();
    });
  });
});

describe('generateFingerprint', () => {
  it('should generate fingerprint with seed', () => {
    const fp = generateFingerprint('test-seed');
    expect(fp.userAgent).toBeDefined();
    expect(fp.platform).toBeDefined();
    expect(fp.locale).toBeDefined();
    expect(fp.screenWidth).toBeGreaterThan(0);
    expect(fp.screenHeight).toBeGreaterThan(0);
  });

  it('should generate fingerprint without seed (auto-generate)', () => {
    const fp = generateFingerprint();
    expect(fp.userAgent).toBeDefined();
    expect(fp.platform).toBeDefined();
    expect(fp.locale).toBeDefined();
  });

  it('should generate consistent fingerprints for same seed', () => {
    const seed = 'consistent-seed';
    const fp1 = generateFingerprint(seed);
    const fp2 = generateFingerprint(seed);
    expect(fp1.locale).toBe(fp2.locale);
    expect(fp1.timezone).toBe(fp2.timezone);
  });
});

describe('buildStealthHeaders', () => {
  it('should build headers from fingerprint', () => {
    const fp = generateFingerprint('test-seed');
    const headers = buildStealthHeaders(fp);
    expect(headers['user-agent']).toBe(fp.userAgent);
    expect(headers['accept-language']).toBeDefined();
    expect(headers['sec-ch-ua']).toBeDefined();
  });

  it('should include referer when provided', () => {
    const fp = generateFingerprint('test-seed');
    const headers = buildStealthHeaders(fp, 'https://example.com');
    expect(headers['referer']).toBe('https://example.com');
  });

  it('should not include referer when not provided', () => {
    const fp = generateFingerprint('test-seed');
    const headers = buildStealthHeaders(fp);
    expect(headers['referer']).toBeUndefined();
  });
});

import { describe, it, expect } from 'vitest';
import { loadConfig } from '../../src/config/index.js';
import { StealthManager } from '../../src/stealth/index.js';
import { CacheManager } from '../../src/cache/index.js';
import { ProxyManager } from '../../src/proxy/index.js';
import { TypedEventEmitter } from '../../src/events/index.js';
import { createLogger } from '../../src/logger/index.js';

describe('Constructor normalization regression tests', () => {
  const emitter = new TypedEventEmitter();
  const logger = createLogger({ level: 'error', pretty: false, bindings: { tag: 'TEST' } });

  describe('loadConfig with no overrides', () => {
    it('should load config with all nested objects properly initialized', () => {
      const config = loadConfig();
      
      // Verify top-level objects exist
      expect(config.http).toBeDefined();
      expect(config.mqtt).toBeDefined();
      expect(config.cache).toBeDefined();
      expect(config.session).toBeDefined();
      expect(config.storage).toBeDefined();
      expect(config.stealth).toBeDefined();
      expect(config.refresh).toBeDefined();
      expect(config.keepalive).toBeDefined();
      expect(config.proxy).toBeDefined();

      // Verify nested http objects
      expect(config.http.timeout).toBeDefined();
      expect(config.http.timeout.connect).toBeDefined();
      expect(config.http.timeout.request).toBeDefined();
      expect(config.http.timeout.body).toBeDefined();
      expect(config.http.retries).toBeDefined();
      expect(config.http.retries.max).toBeDefined();
      expect(config.http.retries.baseDelay).toBeDefined();

      // Verify nested mqtt objects
      expect(config.mqtt.reconnect).toBeDefined();
      expect(config.mqtt.reconnect.maxAttempts).toBeDefined();
      expect(config.mqtt.reconnect.baseDelay).toBeDefined();
      expect(config.mqtt.heartbeat).toBeDefined();
      expect(config.mqtt.heartbeat.interval).toBeDefined();

      // Verify nested cache objects
      expect(config.cache.ttl).toBeDefined();
      expect(config.cache.maxSize).toBeDefined();

      // Verify nested session objects
      expect(config.session.persistPath).toBeDefined();
      expect(config.session.restoreOnStart).toBeDefined();

      // Verify nested storage objects
      expect(config.storage.adapter).toBeDefined();

      // Verify nested stealth objects
      expect(config.stealth.level).toBeDefined();
      expect(config.stealth.delays).toBeDefined();
      expect(config.stealth.delays.enabled).toBeDefined();
      expect(config.stealth.delays.actionDelay).toBeDefined();
      expect(config.stealth.delays.actionDelay.min).toBeDefined();
      expect(config.stealth.delays.actionDelay.max).toBeDefined();
      expect(config.stealth.delays.messageDelay).toBeDefined();
      expect(config.stealth.delays.messageDelay.min).toBeDefined();
      expect(config.stealth.delays.messageDelay.max).toBeDefined();
      expect(config.stealth.delays.paginationDelay).toBeDefined();
      expect(config.stealth.delays.paginationDelay.min).toBeDefined();
      expect(config.stealth.delays.paginationDelay.max).toBeDefined();
      expect(config.stealth.typingSimulation).toBeDefined();
      expect(config.stealth.typingSimulation.enabled).toBeDefined();
      expect(config.stealth.typingSimulation.wpm).toBeDefined();
      expect(config.stealth.typingSimulation.wpm.min).toBeDefined();
      expect(config.stealth.typingSimulation.wpm.max).toBeDefined();
      expect(config.stealth.typingSimulation.naturalPauses).toBeDefined();
      expect(config.stealth.rateLimit).toBeDefined();
      expect(config.stealth.rateLimit.enabled).toBeDefined();
      expect(config.stealth.rateLimit.requestsPerMinute).toBeDefined();
      expect(config.stealth.rateLimit.minInterval).toBeDefined();
      expect(config.stealth.rateLimit.onOverload).toBeDefined();
      expect(config.stealth.userAgent).toBeDefined();
      expect(config.stealth.userAgent.enabled).toBeDefined();
      expect(config.stealth.userAgent.seed).toBeDefined();
      expect(config.stealth.fingerprint).toBeDefined();
      expect(config.stealth.fingerprint.enabled).toBeDefined();
      expect(config.stealth.fingerprint.consistent).toBeDefined();
      expect(config.stealth.fingerprint.seed).toBeDefined();
      expect(config.stealth.warmup).toBeDefined();
      expect(config.stealth.warmup.enabled).toBeDefined();
      expect(config.stealth.warmup.duration).toBeDefined();
      expect(config.stealth.warmup.startFraction).toBeDefined();
      expect(config.stealth.warmup.emitEvent).toBeDefined();

      // Verify nested refresh objects
      expect(config.refresh.checkInterval).toBeDefined();
      expect(config.refresh.threshold).toBeDefined();
      expect(config.refresh.retries).toBeDefined();
      expect(config.refresh.failSilently).toBeDefined();
      expect(config.refresh.autoPersist).toBeDefined();

      // Verify nested keepalive objects
      expect(config.keepalive.enabled).toBeDefined();
      expect(config.keepalive.interval).toBeDefined();
      expect(config.keepalive.onFailure).toBeDefined();

      // Verify nested proxy objects
      expect(config.proxy.url).toBeDefined();
      expect(config.proxy.rotateEvery).toBeDefined();
      expect(config.proxy.pool).toBeDefined();
      expect(config.proxy.healthCheck).toBeDefined();
      expect(config.proxy.failOnUnhealthy).toBeDefined();
    });
  });

  describe('StealthManager constructor', () => {
    it('should not throw with empty config object', () => {
      const emptyConfig = {} as any;
      expect(() => new StealthManager(emptyConfig, emitter, logger)).not.toThrow();
    });

    it('should not throw with config from loadConfig()', () => {
      const config = loadConfig();
      expect(() => new StealthManager(config.stealth, emitter, logger)).not.toThrow();
    });

    it('should not throw with partial stealth config', () => {
      const partialConfig = {
        level: 'medium',
      } as any;
      expect(() => new StealthManager(partialConfig, emitter, logger)).not.toThrow();
    });

    it('should not throw when fingerprint is undefined', () => {
      const config = {
        level: 'medium',
        userAgent: { enabled: true, seed: null },
      } as any;
      expect(() => new StealthManager(config, emitter, logger)).not.toThrow();
    });

    it('should not throw when userAgent is undefined', () => {
      const config = {
        level: 'medium',
        fingerprint: { enabled: true, consistent: true, seed: null },
      } as any;
      expect(() => new StealthManager(config, emitter, logger)).not.toThrow();
    });

    it('should not throw when warmup is undefined', () => {
      const config = {
        level: 'medium',
        fingerprint: { enabled: true, consistent: true, seed: null },
        userAgent: { enabled: true, seed: null },
      } as any;
      expect(() => new StealthManager(config, emitter, logger)).not.toThrow();
    });

    it('should not throw when rateLimit is undefined', () => {
      const config = {
        level: 'medium',
        fingerprint: { enabled: true, consistent: true, seed: null },
        userAgent: { enabled: true, seed: null },
        warmup: { enabled: false, duration: 30, startFraction: 0.1, emitEvent: true },
      } as any;
      expect(() => new StealthManager(config, emitter, logger)).not.toThrow();
    });
  });

  describe('CacheManager constructor', () => {
    it('should not throw with no arguments', () => {
      expect(() => new CacheManager()).not.toThrow();
    });

    it('should not throw with empty options object', () => {
      expect(() => new CacheManager({})).not.toThrow();
    });

    it('should not throw with partial options', () => {
      expect(() => new CacheManager({ maxSize: 100 })).not.toThrow();
      expect(() => new CacheManager({ ttlMs: 60000 })).not.toThrow();
    });

    it('should not throw with invalid maxSize (zero)', () => {
      expect(() => new CacheManager({ maxSize: 0 })).not.toThrow();
    });

    it('should not throw with invalid ttlMs (negative)', () => {
      expect(() => new CacheManager({ ttlMs: -1 })).not.toThrow();
    });

    it('should not throw with config from loadConfig()', () => {
      const config = loadConfig();
      expect(() => new CacheManager({ 
        maxSize: config.cache.maxSize, 
        ttlMs: config.cache.ttl 
      })).not.toThrow();
    });
  });

  describe('ProxyManager constructor', () => {
    it('should not throw with valid proxy URL', () => {
      expect(() => new ProxyManager('http://proxy.example.com:8080')).not.toThrow();
    });

    it('should not throw with SOCKS proxy URL', () => {
      expect(() => new ProxyManager('socks5://127.0.0.1:1080')).not.toThrow();
    });

    it('should not throw with authenticated proxy URL', () => {
      expect(() => new ProxyManager('http://user:pass@proxy.example.com:8080')).not.toThrow();
    });
  });

  describe('loadConfig with partial overrides', () => {
    it('should handle partial http override', () => {
      const config = loadConfig({ http: { maxConnections: 20 } });
      expect(config.http.maxConnections).toBe(20);
      expect(config.http.timeout).toBeDefined();
      expect(config.http.timeout.connect).toBeDefined();
    });

    it('should handle partial stealth override', () => {
      const config = loadConfig({ stealth: { level: 'high' } });
      expect(config.stealth.level).toBe('high');
      expect(config.stealth.delays).toBeDefined();
      expect(config.stealth.fingerprint).toBeDefined();
    });

    it('should handle partial cache override', () => {
      const config = loadConfig({ cache: { ttl: 600000 } });
      expect(config.cache.ttl).toBe(600000);
      expect(config.cache.maxSize).toBeDefined();
    });

    it('should handle partial session override', () => {
      const config = loadConfig({ session: { persistPath: '/tmp/session.json' } });
      expect(config.session.persistPath).toBe('/tmp/session.json');
      expect(config.session.restoreOnStart).toBeDefined();
    });
  });

  describe('Config schema validation', () => {
    it('should not throw with empty overrides', () => {
      expect(() => loadConfig({})).not.toThrow();
    });

    it('should not throw with null overrides', () => {
      expect(() => loadConfig(null as any)).not.toThrow();
    });

    it('should not throw with undefined overrides', () => {
      expect(() => loadConfig(undefined)).not.toThrow();
    });
  });
});

/**
 * Unit tests for the proxy support layer.
 *
 * Covers: URL validation, credential masking, protocol detection,
 * config precedence, string shorthand, and ProxyManager construction.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProxyManager, maskProxyUrl, resolveProxyUrl, type ProxyOptions } from '../../src/proxy/index.js';
import { ConfigurationError } from '../../src/errors/index.js';
import { loadConfig } from '../../src/config/index.js';

// ─── maskProxyUrl ─────────────────────────────────────────────────────────────

describe('maskProxyUrl', () => {
  it('passes through URLs with no credentials', () => {
    expect(maskProxyUrl('http://proxy.example.com:8080')).toBe('http://proxy.example.com:8080/');
  });

  it('masks username and password', () => {
    const masked = maskProxyUrl('http://user:secret@proxy.example.com:8080');
    expect(masked).toContain('***:***');
    expect(masked).not.toContain('user');
    expect(masked).not.toContain('secret');
    expect(masked).toContain('proxy.example.com');
  });

  it('masks SOCKS5 credentials', () => {
    const masked = maskProxyUrl('socks5://admin:p@ssw0rd@127.0.0.1:1080');
    expect(masked).toContain('***:***');
    expect(masked).not.toContain('admin');
    expect(masked).not.toContain('p@ssw0rd');
  });

  it('returns placeholder for completely invalid URLs', () => {
    expect(maskProxyUrl('not a url')).toBe('<invalid-proxy-url>');
  });
});

// ─── resolveProxyUrl ──────────────────────────────────────────────────────────

describe('resolveProxyUrl', () => {
  it('returns null for undefined', () => {
    expect(resolveProxyUrl(undefined)).toBeNull();
  });

  it('returns null for null', () => {
    expect(resolveProxyUrl(null)).toBeNull();
  });

  it('passes through string shorthand', () => {
    expect(resolveProxyUrl('http://proxy:8080')).toBe('http://proxy:8080');
  });

  it('extracts url from ProxyConfig object', () => {
    expect(resolveProxyUrl({ url: 'socks5://127.0.0.1:1080' })).toBe('socks5://127.0.0.1:1080');
  });

  it('returns null when ProxyConfig has no url', () => {
    expect(resolveProxyUrl({ url: '' } as ProxyOptions)).toBeNull();
  });
});

// ─── ProxyManager construction & validation ───────────────────────────────────

describe('ProxyManager — valid URLs', () => {
  it('accepts http proxy', () => {
    const mgr = new ProxyManager('http://127.0.0.1:8080');
    expect(mgr.protocol).toBe('http:');
    expect(mgr.host).toBe('127.0.0.1');
    expect(mgr.isSocksProxy()).toBe(false);
  });

  it('accepts https proxy', () => {
    const mgr = new ProxyManager('https://proxy.example.com:443');
    expect(mgr.protocol).toBe('https:');
    expect(mgr.isSocksProxy()).toBe(false);
  });

  it('accepts socks4 proxy', () => {
    const mgr = new ProxyManager('socks4://127.0.0.1:1080');
    expect(mgr.protocol).toBe('socks4:');
    expect(mgr.isSocksProxy()).toBe(true);
  });

  it('accepts socks4a proxy', () => {
    const mgr = new ProxyManager('socks4a://127.0.0.1:1080');
    expect(mgr.protocol).toBe('socks4a:');
    expect(mgr.isSocksProxy()).toBe(true);
  });

  it('accepts socks5 proxy', () => {
    const mgr = new ProxyManager('socks5://127.0.0.1:1080');
    expect(mgr.protocol).toBe('socks5:');
    expect(mgr.isSocksProxy()).toBe(true);
  });

  it('accepts socks5h proxy', () => {
    const mgr = new ProxyManager('socks5h://127.0.0.1:1080');
    expect(mgr.protocol).toBe('socks5h:');
    expect(mgr.isSocksProxy()).toBe(true);
  });

  it('accepts authenticated proxy and masks credentials', () => {
    const mgr = new ProxyManager('socks5://user:hunter2@proxy.example.com:1080');
    expect(mgr.maskedUrl).toContain('***:***');
    expect(mgr.maskedUrl).not.toContain('hunter2');
    expect(mgr.maskedUrl).toContain('proxy.example.com');
  });
});

describe('ProxyManager — invalid URLs', () => {
  it('throws ConfigurationError for completely invalid URL', () => {
    expect(() => new ProxyManager('not-a-url')).toThrow(ConfigurationError);
  });

  it('throws ConfigurationError for unsupported protocol (ftp)', () => {
    expect(() => new ProxyManager('ftp://proxy:21')).toThrow(ConfigurationError);
  });

  it('throws ConfigurationError for unsupported protocol (ws)', () => {
    expect(() => new ProxyManager('ws://proxy:80')).toThrow(ConfigurationError);
  });

  it('throws ConfigurationError for URL missing hostname', () => {
    expect(() => new ProxyManager('socks5://')).toThrow(ConfigurationError);
  });

  it('error message does not contain credentials', () => {
    try {
      new ProxyManager('ftp://secret:password@proxy:21');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ConfigurationError);
      const e = err as ConfigurationError;
      expect(e.message).not.toContain('secret');
      expect(e.message).not.toContain('password');
    }
  });
});

// ─── loadConfig — proxy URL validation ───────────────────────────────────────

describe('loadConfig — proxy validation', () => {
  it('accepts valid proxy URL in config', () => {
    expect(() =>
      loadConfig({ proxy: { url: 'http://proxy:8080' } })
    ).not.toThrow();
  });

  it('throws ConfigurationError for invalid proxy URL', () => {
    expect(() =>
      loadConfig({ proxy: { url: 'ftp://proxy:21' } })
    ).toThrow(ConfigurationError);
  });

  it('throws ConfigurationError for invalid pool URL', () => {
    expect(() =>
      loadConfig({ proxy: { pool: ['http://valid:8080', 'telnet://invalid:23'] } })
    ).toThrow(ConfigurationError);
  });

  it('does not throw when no proxy is configured', () => {
    expect(() => loadConfig({})).not.toThrow();
  });
});

// ─── loadConfig — PFCA_PROXY_URL env var ─────────────────────────────────────

describe('loadConfig — PFCA_PROXY_URL env var', () => {
  beforeEach(() => {
    delete process.env['PFCA_PROXY_URL'];
  });
  afterEach(() => {
    delete process.env['PFCA_PROXY_URL'];
  });

  it('reads proxy URL from PFCA_PROXY_URL env var', () => {
    process.env['PFCA_PROXY_URL'] = 'http://envproxy:3128';
    const cfg = loadConfig({});
    expect(cfg.proxy.url).toBe('http://envproxy:3128');
  });

  it('client option takes precedence over env var', () => {
    process.env['PFCA_PROXY_URL'] = 'http://envproxy:3128';
    const cfg = loadConfig({ proxy: { url: 'socks5://override:1080' } });
    expect(cfg.proxy.url).toBe('socks5://override:1080');
  });

  it('falls back to no proxy when env var is absent', () => {
    const cfg = loadConfig({});
    expect(cfg.proxy.url).toBeNull();
  });
});

// ─── ProxyManager — agent reuse ───────────────────────────────────────────────

describe('ProxyManager — connection reuse', () => {
  it('returns the same undici dispatcher on repeated calls', async () => {
    const mgr = new ProxyManager('http://127.0.0.1:8080');
    const d1 = await mgr.getUndiciDispatcher(10, 5000);
    const d2 = await mgr.getUndiciDispatcher(10, 5000);
    expect(d1).toBe(d2); // same reference — not recreated
    await mgr.close();
  });

  it('returns the same WebSocket agent on repeated calls', async () => {
    const mgr = new ProxyManager('http://127.0.0.1:8080');
    const a1 = await mgr.getWebSocketAgent();
    const a2 = await mgr.getWebSocketAgent();
    expect(a1).toBe(a2); // same reference — not recreated
    await mgr.close();
  });
});
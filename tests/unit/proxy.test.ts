/**
 * Unit tests for the proxy support layer.
 *
 * Covers: URL validation, credential masking, protocol detection,
 * config precedence, string shorthand, and ProxyManager construction.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventEmitter } from 'node:events';
import { ProxyManager, maskProxyUrl, resolveProxyUrl, type ProxyOptions } from '../../src/proxy/index.js';
import { ConfigurationError } from '../../src/errors/index.js';
import { loadConfig } from '../../src/config/index.js';

const { createConnectionMock, tlsConnectMock, netConnectMock, agentConstructorMock, proxyAgentConstructorMock } = vi.hoisted(() => ({
  createConnectionMock: vi.fn(),
  tlsConnectMock: vi.fn(),
  netConnectMock: vi.fn(),
  agentConstructorMock: vi.fn(),
  proxyAgentConstructorMock: vi.fn(),
}));

vi.mock('socks', () => ({
  SocksClient: { createConnection: createConnectionMock },
}));

vi.mock('node:tls', () => ({
  connect: tlsConnectMock,
}));

vi.mock('node:net', () => ({
  connect: netConnectMock,
}));

vi.mock('undici', () => ({
  Agent: class {
    public readonly options: unknown;
    constructor(options: unknown) {
      this.options = options;
      agentConstructorMock(options);
    }
    close = vi.fn().mockResolvedValue(undefined);
  },
  ProxyAgent: class {
    public readonly options: unknown;
    constructor(options: unknown) {
      this.options = options;
      proxyAgentConstructorMock(options);
    }
    close = vi.fn().mockResolvedValue(undefined);
  },
}));

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
  beforeEach(() => {
    createConnectionMock.mockReset();
    tlsConnectMock.mockReset();
    netConnectMock.mockReset();
    agentConstructorMock.mockReset();
    proxyAgentConstructorMock.mockReset();
  });

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

  it('builds SOCKS and HTTP CONNECT agents for different proxy types', async () => {
    const socksManager = new ProxyManager('socks5://user:pass@127.0.0.1:1080');
    const socksDispatcher = await socksManager.getUndiciDispatcher(4, 1000);
    expect(socksDispatcher).toBeDefined();

    const httpManager = new ProxyManager('http://127.0.0.1:8080');
    const wsAgent = await httpManager.getWebSocketAgent();
    expect(wsAgent).toBeDefined();

    await socksManager.close();
    await httpManager.close();
  });

  it('invokes the SOCKS WebSocket and undici connect callbacks', async () => {
    const socksManager = new ProxyManager('socks5://user:pass@127.0.0.1:1080');
    const wsAgent = await socksManager.getWebSocketAgent();
    const tlsSocket = new EventEmitter() as EventEmitter & { once: typeof EventEmitter.prototype.once };
    tlsConnectMock.mockReturnValue(tlsSocket as never);
    createConnectionMock.mockResolvedValue({ socket: new EventEmitter() as never });

    const callback = vi.fn();
    (wsAgent as never).createConnection({ host: 'facebook.com', port: 443, servername: 'facebook.com' }, callback);
    await Promise.resolve();
    tlsSocket.emit('secureConnect');

    expect(createConnectionMock).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(null, tlsSocket);

    const dispatcher = await socksManager.getUndiciDispatcher(4, 1000);
    const undiciConnect = (dispatcher as never).options.connect;
    const undiciCallback = vi.fn();
    undiciConnect({ hostname: 'facebook.com', port: '443', protocol: 'https:' }, undiciCallback);
    await Promise.resolve();
    tlsSocket.emit('secureConnect');

    expect(undiciCallback).toHaveBeenCalledWith(null, tlsSocket);
    await socksManager.close();
  });

  it('handles CONNECT tunnel failures and raw socket errors', async () => {
    const httpManager = new ProxyManager('http://127.0.0.1:8080');
    const wsAgent = await httpManager.getWebSocketAgent();

    const proxySocket = new EventEmitter() as EventEmitter & {
      write: ReturnType<typeof vi.fn>;
      destroy: ReturnType<typeof vi.fn>;
      unshift: ReturnType<typeof vi.fn>;
    };
    proxySocket.write = vi.fn();
    proxySocket.destroy = vi.fn();
    proxySocket.unshift = vi.fn();
    netConnectMock.mockReturnValue(proxySocket as never);

    const callback = vi.fn();
    (wsAgent as never).createConnection({ host: 'facebook.com', port: 443 }, callback);
    proxySocket.emit('connect');
    proxySocket.emit('data', Buffer.from('HTTP/1.1 403 Forbidden\r\n\r\n'));

    expect(callback).toHaveBeenCalledWith(expect.any(Error), null);

    const secondCallback = vi.fn();
    (wsAgent as never).createConnection({ host: 'facebook.com', port: 443 }, secondCallback);
    proxySocket.emit('error', new Error('socket down'));

    expect(secondCallback).toHaveBeenCalledWith(expect.any(Error), null);
    await httpManager.close();
  });

  it('handles SOCKS WebSocket agent connection errors', async () => {
    const socksManager = new ProxyManager('socks5://user:pass@127.0.0.1:1080');
    const wsAgent = await socksManager.getWebSocketAgent();
    
    const tlsSocket = new EventEmitter() as EventEmitter & { once: typeof EventEmitter.prototype.once };
    tlsConnectMock.mockReturnValue(tlsSocket as never);
    createConnectionMock.mockRejectedValueOnce(new Error('SOCKS connection failed'));
    
    const callback = vi.fn();
    (wsAgent as never).createConnection({ host: 'facebook.com', port: 443 }, callback);
    
    // Wait for the promise to be rejected
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(callback).toHaveBeenCalledWith(expect.any(Error), null);
    await socksManager.close();
  });

  it('handles CONNECT tunnel with remaining TLS handshake bytes', async () => {
    const httpManager = new ProxyManager('http://127.0.0.1:8080');
    const wsAgent = await httpManager.getWebSocketAgent();

    const proxySocket = new EventEmitter() as EventEmitter & {
      write: ReturnType<typeof vi.fn>;
      destroy: ReturnType<typeof vi.fn>;
      unshift: ReturnType<typeof vi.fn>;
    };
    proxySocket.write = vi.fn();
    proxySocket.destroy = vi.fn();
    proxySocket.unshift = vi.fn();
    netConnectMock.mockReturnValue(proxySocket as never);

    const tlsSocket = new EventEmitter() as EventEmitter & { once: typeof EventEmitter.prototype.once };
    tlsConnectMock.mockReturnValue(tlsSocket as never);

    const callback = vi.fn();
    (wsAgent as never).createConnection({ host: 'facebook.com', port: 443 }, callback);
    proxySocket.emit('connect');
    // Send CONNECT response with some TLS handshake bytes in the same chunk
    proxySocket.emit('data', Buffer.from('HTTP/1.1 200 OK\r\n\r\n\x16\x03\x01'));

    expect(proxySocket.unshift).toHaveBeenCalled();
    await httpManager.close();
  });

  it('handles SOCKS undici agent for non-HTTPS connections', async () => {
    const socksManager = new ProxyManager('socks5://127.0.0.1:1080');
    const dispatcher = await socksManager.getUndiciDispatcher(4, 1000);
    
    const plainSocket = new EventEmitter() as EventEmitter & { once: typeof EventEmitter.prototype.once };
    createConnectionMock.mockResolvedValue({ socket: plainSocket as never });

    const callback = vi.fn();
    const undiciConnect = (dispatcher as never).options.connect;
    undiciConnect({ hostname: 'example.com', port: '80', protocol: 'http:' }, callback);
    await Promise.resolve();
    
    // For non-HTTPS, it should call callback directly with the socket
    expect(callback).toHaveBeenCalledWith(null, plainSocket);
    await socksManager.close();
  });
});
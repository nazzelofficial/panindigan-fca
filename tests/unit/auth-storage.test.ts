import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createAuthManager } from '../../src/auth/index.js';
import { CookieJar } from 'tough-cookie';
import {
  SessionExpiredError,
  CheckpointRequiredError,
  LoginFailedError,
  ConfigurationError,
} from '../../src/errors/index.js';
import { loadConfig } from '../../src/config/index.js';
import { StorageApiClient } from '../../src/storage/api-client.js';

/**
 * Mock undici so StorageApiClient makes no real network requests.
 *
 * ROOT CAUSE FIX context (v0.1.8):
 *   Previous tests mocked `node:http` / `node:https` because the old transport
 *   used `require('https')`. The new transport uses `undici.request()` which is
 *   ESM-safe. We now mock undici instead.
 *
 * NOTE: vi.mock is hoisted before variable declarations, so we must use
 * vi.hoisted() to initialize the fn() before the factory runs.
 */
const { mockUndiciRequest } = vi.hoisted(() => ({
  mockUndiciRequest: vi.fn(),
}));
vi.mock('undici', () => ({
  request: mockUndiciRequest,
  // Proxy module imports these — include stubs to avoid undefined errors
  Agent: class MockAgent {},
  ProxyAgent: class MockProxyAgent {},
}));

describe('auth and storage coverage', () => {
  beforeEach(() => {
    mockUndiciRequest.mockReset();
  });

  it('covers storage API client request and retry behavior', async () => {
    const client = new StorageApiClient({ baseUrl: 'https://example.com', authToken: 'token', retries: 1 });
    const sendRequestSpy = vi
      .spyOn(client as any, 'sendRequest')
      // First call: 500 → retried once → second call succeeds
      .mockResolvedValueOnce({ statusCode: 500, body: 'bad', latencyMs: 10 })
      .mockResolvedValueOnce({ statusCode: 200, body: JSON.stringify({ ok: true }), latencyMs: 5 })
      .mockResolvedValue({ statusCode: 200, body: JSON.stringify({ found: true, value: 'bar', expiresAt: null }), latencyMs: 5 });

    await expect(client.health()).resolves.toEqual({ ok: true });
    await expect(client.get('foo')).resolves.toEqual({ found: true, value: 'bar', expiresAt: null });
    await expect(client.set('foo', 'bar', null)).resolves.toEqual({ found: true, value: 'bar', expiresAt: null });
    await expect(client.delete('foo')).resolves.toEqual({ found: true, value: 'bar', expiresAt: null });
    await expect(client.clear()).resolves.toEqual({ found: true, value: 'bar', expiresAt: null });
    expect(sendRequestSpy).toHaveBeenCalledTimes(6);
  });

  it('exercises storage client transport via undici with correct request shape', async () => {
    const client = new StorageApiClient({ baseUrl: 'https://example.com', authToken: 'Bearer-tok', retries: 0 });

    mockUndiciRequest.mockResolvedValueOnce({
      statusCode: 200,
      headers: {},
      body: { text: async () => JSON.stringify({ status: 'healthy', database: 'connected' }) },
    });

    await expect(client.health()).resolves.toMatchObject({ status: 'healthy', database: 'connected' });

    // Verify undici was called with the right URL and auth header
    expect(mockUndiciRequest).toHaveBeenCalledWith(
      'https://example.com/v1/health',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer Bearer-tok' }),
      }),
    );
  });

  it('exercises auth manager checkpoints, suspension, and refresh paths', async () => {
    const jar = new CookieJar();
    // Add required cookies to pass pre-flight checks
    jar.setCookieSync('c_user=1234567890', 'https://facebook.com');
    jar.setCookieSync('xs=test-xs-token', 'https://facebook.com');
    jar.setCookieSync('datr=test-datr-token', 'https://facebook.com');
    
    const http = {
      get: vi.fn()
        .mockResolvedValueOnce({ text: async () => '<html>account has been suspended</html>' })
        .mockResolvedValueOnce({ text: async () => '<html>/checkpoint/</html>' })
        .mockResolvedValueOnce({ text: async () => '<html>"DTSGInitialData", [], {"token":"abc"} "LSD", [], {"token":"def"}</html>' }),
      post: vi.fn(async () => ({ text: async () => '<html>login_error</html>' })),
    };
    const emitter = { emit: vi.fn() };
    const storage = { get: vi.fn(), set: vi.fn(), delete: vi.fn(), clear: vi.fn(), has: vi.fn() };
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), trace: vi.fn(), fatal: vi.fn(), child: vi.fn(() => logger) };
    const config = {
      refresh: { autoPersist: true, retries: 1, checkInterval: 1000, failSilently: true },
      session: { persistPath: '/tmp/session.json' },
      keepalive: { enabled: true, interval: 1000, onFailure: 'warn' },
    };

    const manager = new (await import('../../src/auth/index.js')).AuthManager(
      jar as never, http as never, emitter as never, storage as never, config as never, logger as never,
    );
    await expect(manager.bootstrap()).rejects.toThrow(SessionExpiredError);
    await expect(manager.loginWithCredentials('a', 'b')).rejects.toThrow(LoginFailedError);
    await expect(manager.refreshCookies()).resolves.toBeUndefined();
    manager.stopTimers();
  });

  it('covers checkpoint and two-factor auth branches', async () => {
    const jar = new CookieJar();
    const http = {
      get: vi.fn(async () => ({ text: async () => '<html>"DTSGInitialData", [], {"token":"abc"}</html>' })),
      post: vi.fn()
        .mockResolvedValueOnce({ text: async () => '<html>two_factor_authentication</html>' })
        .mockResolvedValueOnce({ text: async () => '<html>/checkpoint/</html>' })
        .mockResolvedValueOnce({ text: async () => '<html>"DTSGInitialData", [], {"token":"abc"}</html>' }),
    };
    const emitter = { emit: vi.fn() };
    const storage = { get: vi.fn(), set: vi.fn(), delete: vi.fn(), clear: vi.fn(), has: vi.fn() };
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), trace: vi.fn(), fatal: vi.fn(), child: vi.fn(() => logger) };
    const config = {
      refresh: { autoPersist: false, retries: 1, checkInterval: 1000, failSilently: true },
      session: { persistPath: null },
      keepalive: { enabled: false, interval: 1000, onFailure: 'warn' },
    };

    const manager = new (await import('../../src/auth/index.js')).AuthManager(
      jar as never, http as never, emitter as never, storage as never, config as never, logger as never,
    );
    await expect(manager.loginWithCredentials('a', 'b', '1234')).rejects.toThrow(CheckpointRequiredError);
    await expect(manager.keepalive()).resolves.toBeUndefined();
  });

  it('creates auth managers from app state and validates config errors', async () => {
    const jar = new CookieJar();
    const http = {
      get: vi.fn(async () => ({ text: async () => '<html>"DTSGInitialData", [], {"token":"abc"} "LSD", [], {"token":"def"}</html>' })),
      post: vi.fn(async () => ({ text: async () => '<html></html>' })),
    };
    const emitter = { emit: vi.fn() };
    const storage = { get: vi.fn(), set: vi.fn(), delete: vi.fn(), clear: vi.fn(), has: vi.fn() };
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), trace: vi.fn(), fatal: vi.fn(), child: vi.fn(() => logger) };
    const config = { refresh: { autoPersist: true, retries: 1, checkInterval: 1000, failSilently: true }, session: { persistPath: null }, keepalive: { enabled: false, interval: 1000, onFailure: 'warn' } };

    const appState = [
      { key: 'c_user', value: '1', domain: '.facebook.com', path: '/' },
      { key: 'xs', value: 'x', domain: '.facebook.com', path: '/' },
      { key: 'datr', value: 'd', domain: '.facebook.com', path: '/' },
    ];

    const manager = await createAuthManager({
      appState,
      jar,
      http: http as never,
      emitter: emitter as never,
      storage: storage as never,
      config: config as never,
      logger: logger as never,
    });
    expect(manager).toBeDefined();
    expect(() => loadConfig({ proxy: { url: 'ftp://example.com' } })).toThrow(ConfigurationError);
  });
});

import { describe, expect, it, vi } from 'vitest';
import { createAuthManager } from '../../src/auth/index.js';
import { CookieJar } from 'tough-cookie';
import { SessionExpiredError, CheckpointRequiredError, LoginFailedError, ConfigurationError } from '../../src/errors/index.js';
import { loadConfig } from '../../src/config/index.js';
import { StorageApiClient } from '../../src/storage/api-client.js';

const { httpRequestMock } = vi.hoisted(() => ({
  httpRequestMock: vi.fn(),
}));

vi.mock('node:http', () => ({ request: httpRequestMock }));
vi.mock('node:https', () => ({ request: httpRequestMock }));

describe('auth and storage coverage', () => {
  it('covers storage API client request and retry behavior', async () => {
    const client = new StorageApiClient({ baseUrl: 'https://example.com', authToken: 'token', retries: 1 });
    const sendRequestSpy = vi
      .spyOn(client as any, 'sendRequest')
      .mockResolvedValueOnce({ statusCode: 500, body: 'bad' })
      .mockResolvedValueOnce({ statusCode: 200, body: JSON.stringify({ ok: true }) })
      .mockResolvedValue({ statusCode: 200, body: JSON.stringify({ found: true, value: 'bar', expiresAt: null }) });

    await expect(client.health()).resolves.toEqual({ ok: true });
    await expect(client.get('foo')).resolves.toEqual({ found: true, value: 'bar', expiresAt: null });
    await expect(client.set('foo', 'bar', null)).resolves.toEqual({ found: true, value: 'bar', expiresAt: null });
    await expect(client.delete('foo')).resolves.toEqual({ found: true, value: 'bar', expiresAt: null });
    await expect(client.clear()).resolves.toEqual({ found: true, value: 'bar', expiresAt: null });
    expect(sendRequestSpy).toHaveBeenCalledTimes(6);
  });

  it('exercises storage client transport error branches and request building', async () => {
    const client = new StorageApiClient({ baseUrl: 'https://example.com', authToken: 'token', retries: 0 });
    const previousRequire = (globalThis as any).require;
    (globalThis as any).require = (moduleName: string) => {
      if (moduleName === 'http' || moduleName === 'https') {
        return { request: httpRequestMock };
      }
      throw new Error(`Unexpected module request: ${moduleName}`);
    };

    httpRequestMock.mockImplementation((_url: string, _options: unknown, callback?: (response: unknown) => void) => {
      const response = {
        statusCode: 0,
        on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
          if (event === 'end') {
            handler();
          }
          return response;
        }),
      };
      callback?.(response as never);
      return {
        on: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
        destroy: vi.fn(),
      } as never;
    });

    const sendRequest = (client as any).sendRequest('https://example.com', '/v1/health', 'GET', { Accept: 'application/json' }, undefined);
    // latencyMs is now included in the response shape
    await expect(sendRequest).resolves.toMatchObject({ statusCode: 0, body: '' });

    if (previousRequire === undefined) {
      delete (globalThis as any).require;
    } else {
      (globalThis as any).require = previousRequire;
    }
  });

  it('exercises auth manager checkpoints, suspension, and refresh paths', async () => {
    const jar = new CookieJar();
    const http = {
      get: vi.fn()
        .mockResolvedValueOnce({ text: async () => '<html>account has been suspended</html>' })
        .mockResolvedValueOnce({ text: async () => '<html>/checkpoint/</html>' })
        .mockResolvedValueOnce({ text: async () => '<html>"DTSGInitialData", [], {"token":"abc"}</html>' }),
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

    const manager = new (await import('../../src/auth/index.js')).AuthManager(jar as never, http as never, emitter as never, storage as never, config as never, logger as never);
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

    const manager = new (await import('../../src/auth/index.js')).AuthManager(jar as never, http as never, emitter as never, storage as never, config as never, logger as never);
    await expect(manager.loginWithCredentials('a', 'b', '1234')).rejects.toThrow(CheckpointRequiredError);
    await expect(manager.keepalive()).resolves.toBeUndefined();
  });

  it('creates auth managers from app state and validates config errors', async () => {
    const jar = new CookieJar();
    const http = { get: vi.fn(async () => ({ text: async () => '<html>"DTSGInitialData", [], {"token":"abc"} "LSD", [], {"token":"def"}</html>' })), post: vi.fn(async () => ({ text: async () => '<html></html>' })) };
    const emitter = { emit: vi.fn() };
    const storage = { get: vi.fn(), set: vi.fn(), delete: vi.fn(), clear: vi.fn(), has: vi.fn() };
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), trace: vi.fn(), fatal: vi.fn(), child: vi.fn(() => logger) };
    const config = { refresh: { autoPersist: true, retries: 1, checkInterval: 1000, failSilently: true }, session: { persistPath: null }, keepalive: { enabled: false, interval: 1000, onFailure: 'warn' } };

    const appState = [
      { key: 'c_user', value: '1', domain: '.facebook.com', path: '/' },
      { key: 'xs', value: 'x', domain: '.facebook.com', path: '/' },
      { key: 'datr', value: 'd', domain: '.facebook.com', path: '/' },
    ];

    const manager = await createAuthManager({ appState, jar, http: http as never, emitter: emitter as never, storage: storage as never, config: config as never, logger: logger as never });
    expect(manager).toBeDefined();
    expect(() => loadConfig({ proxy: { url: 'ftp://example.com' } })).toThrow(ConfigurationError);
  });

});
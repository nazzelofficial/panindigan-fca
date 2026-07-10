import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthManager } from '../../src/auth/index.js';
import {
  InvalidAppStateError,
  SessionExpiredError,
  LoginApprovalRequiredError,
  FacebookRateLimitError,
  CheckpointRequiredError,
} from '../../src/errors/index.js';
import { CookieJar } from 'tough-cookie';
import type { HttpClient } from '../../src/http/index.js';
import type { TypedEventEmitter } from '../../src/events/index.js';
import type { StorageAdapter } from '../../src/storage/index.js';
import type { Logger } from '../../src/logger/index.js';
import type { Config } from '../../src/config/index.js';
import type { HttpResponse } from '../../src/http/index.js';

describe('AuthManager bootstrap diagnostics', () => {
  let jar: CookieJar;
  let http: HttpClient;
  let emitter: TypedEventEmitter;
  let storage: StorageAdapter;
  let config: Config;
  let logger: Logger;

  const createMockResponse = (html: string): HttpResponse => ({
    status: 200,
    headers: {},
    text: async () => html,
    json: async () => JSON.parse(html),
    buffer: async () => Buffer.from(html),
  });

  beforeEach(() => {
    jar = new CookieJar();
    http = {
      get: vi.fn(),
      post: vi.fn(),
    } as unknown as HttpClient;
    emitter = {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    } as unknown as TypedEventEmitter;
    storage = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    } as unknown as StorageAdapter;
    config = {
      refresh: {
        checkInterval: 300000,
        threshold: 3600000,
        retries: 3,
        failSilently: false,
        autoPersist: false,
      },
      session: {
        persistPath: null,
        restoreOnStart: false,
      },
      keepalive: {
        enabled: false,
        interval: 300000,
        onFailure: 'warn',
      },
      stealth: {
        level: 'medium',
        delays: {
          enabled: true,
          actionDelay: { min: 300, max: 1800 },
          messageDelay: { min: 800, max: 4000 },
          paginationDelay: { min: 200, max: 900 },
        },
        typingSimulation: {
          enabled: true,
          wpm: { min: 40, max: 80 },
          naturalPauses: true,
        },
        rateLimit: {
          enabled: true,
          requestsPerMinute: 30,
          minInterval: 500,
          onOverload: 'queue',
        },
        userAgent: {
          enabled: true,
          seed: null,
        },
        fingerprint: {
          enabled: true,
          consistent: true,
          seed: null,
        },
        warmup: {
          enabled: false,
          duration: 30,
          startFraction: 0.1,
          emitEvent: true,
        },
      },
      http: {
        maxConnections: 10,
        timeout: {
          connect: 10000,
          request: 60000,
          body: 120000,
        },
        retries: {
          max: 3,
          baseDelay: 1000,
        },
      },
      proxy: {
        url: null,
        rotateEvery: null,
        pool: [],
        healthCheck: true,
        failOnUnhealthy: false,
      },
      cache: {
        ttl: 1800000,
        maxSize: 1000,
      },
      mqtt: {
        enabled: true,
        reconnect: {
          enabled: true,
          maxAttempts: 5,
          delayMs: 1000,
        },
        heartbeat: {
          enabled: true,
          interval: 30000,
        },
      },
      storage: {
        adapter: 'memory',
      },
      logLevel: 'info',
      logPretty: false,
    } as unknown as Config;
    logger = {
      info: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      fatal: vi.fn(),
      trace: vi.fn(),
    } as unknown as Logger;

    // Set up required cookies
    jar.setCookieSync('c_user=1234567890', 'https://facebook.com');
    jar.setCookieSync('xs=test-token', 'https://facebook.com');
    jar.setCookieSync('datr=test-datr', 'https://facebook.com');
  });

  describe('token extraction failure detection', () => {
    it('should detect login page redirect (expired AppState)', async () => {
      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><title>Facebook - log in or sign up</title></head>
        <body>
          <form id="login_form">
            <input type="email" name="email" />
            <input type="password" name="pass" />
            <button type="submit">Log In</button>
          </form>
        </body>
        </html>
      `;

      vi.mocked(http.get).mockResolvedValue(createMockResponse(html));

      const authManager = new AuthManager(jar, http, emitter, storage, config, logger);

      await expect(authManager.bootstrap()).rejects.toThrow(InvalidAppStateError);
      await expect(authManager.bootstrap()).rejects.toMatchObject({
        message: expect.stringContaining('AppState is expired — redirected to login page'),
        context: expect.objectContaining({
          failureReason: 'AppState is expired — redirected to login page',
        }),
      });
    });

    it('should detect checkpoint requirement', async () => {
      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body>
          <div class="checkpoint">
            <h2>Security Check</h2>
            <p>We need to verify your identity</p>
            <a href="/checkpoint/">Continue</a>
          </div>
        </body>
        </html>
      `;

      vi.mocked(http.get).mockResolvedValue(createMockResponse(html));

      const authManager = new AuthManager(jar, http, emitter, storage, config, logger);

      await expect(authManager.bootstrap()).rejects.toThrow(CheckpointRequiredError);
      expect(emitter.emit).toHaveBeenCalledWith('account:checkpoint', expect.any(Object));
    });

    it('should detect account suspension', async () => {
      const html = `
        <!DOCTYPE html>
        <html>
        <body>
          <h1>Your account has been disabled</h1>
          <p>For security reasons, your account has been suspended.</p>
        </body>
        </html>
      `;

      vi.mocked(http.get).mockResolvedValue(createMockResponse(html));

      const authManager = new AuthManager(jar, http, emitter, storage, config, logger);

      await expect(authManager.bootstrap()).rejects.toThrow(SessionExpiredError);
      expect(emitter.emit).toHaveBeenCalledWith('account:suspended', expect.any(Object));
    });

    it('should detect rate limiting', async () => {
      const html = `
        <!DOCTYPE html>
        <html>
        <body>
          <h1>Too Many Requests</h1>
          <p>You are temporarily blocked from performing this action.</p>
        </body>
        </html>
      `;

      vi.mocked(http.get).mockResolvedValue(createMockResponse(html));

      const authManager = new AuthManager(jar, http, emitter, storage, config, logger);

      await expect(authManager.bootstrap()).rejects.toThrow(FacebookRateLimitError);
      expect(emitter.emit).toHaveBeenCalledWith('account:rate_limited', expect.any(Object));
    });

    it('should detect login approval requirement', async () => {
      const html = `
        <!DOCTYPE html>
        <html>
        <body>
          <h1>Review Recent Login</h1>
          <p>Was this you? We need to approve this login.</p>
        </body>
        </html>
      `;

      vi.mocked(http.get).mockResolvedValue(createMockResponse(html));

      const authManager = new AuthManager(jar, http, emitter, storage, config, logger);

      await expect(authManager.bootstrap()).rejects.toThrow(LoginApprovalRequiredError);
      expect(emitter.emit).toHaveBeenCalledWith('account:approval_required', expect.any(Object));
    });

    it('should detect session expiration message', async () => {
      const html = `
        <!DOCTYPE html>
        <html>
        <body>
          <h1>Session Expired</h1>
          <p>Your session has expired. Please log in again.</p>
        </body>
        </html>
      `;

      vi.mocked(http.get).mockResolvedValue(createMockResponse(html));

      const authManager = new AuthManager(jar, http, emitter, storage, config, logger);

      await expect(authManager.bootstrap()).rejects.toThrow(SessionExpiredError);
      expect(emitter.emit).toHaveBeenCalledWith('account:session_expired', expect.any(Object));
    });

    it('should detect HTML structure change (no Facebook content)', async () => {
      const html = `
        <!DOCTYPE html>
        <html>
        <body>
          <h1>Page Not Found</h1>
          <p>The requested resource was not found.</p>
        </body>
        </html>
      `;

      vi.mocked(http.get).mockResolvedValue(createMockResponse(html));

      const authManager = new AuthManager(jar, http, emitter, storage, config, logger);

      await expect(authManager.bootstrap()).rejects.toThrow(InvalidAppStateError);
      await expect(authManager.bootstrap()).rejects.toMatchObject({
        message: expect.stringContaining('HTML structure changed significantly'),
        context: expect.objectContaining({
          failureReason: 'HTML structure changed significantly or response is not a Facebook page',
        }),
      });
    });

    it('should detect partial HTML structure change (only DTSG missing)', async () => {
      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body>
          <input type="hidden" name="lsd" value="AVqX2m9c" />
          <div class="fb-content">Facebook content</div>
        </body>
        </html>
      `;

      vi.mocked(http.get).mockResolvedValue(createMockResponse(html));

      const authManager = new AuthManager(jar, http, emitter, storage, config, logger);

      await expect(authManager.bootstrap()).rejects.toThrow(InvalidAppStateError);
      await expect(authManager.bootstrap()).rejects.toMatchObject({
        message: expect.stringContaining('DTSG token missing'),
        context: expect.objectContaining({
          failureReason: 'DTSG token missing — Facebook may have changed HTML structure',
        }),
      });
    });

    it('should detect partial HTML structure change (only LSD missing)', async () => {
      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body>
          <script>
            requireLazy(["DTSGInitialData"], function(DTSGInit) {
              DTSGInit.init({"token":"AQE5X2m9c"});
            });
          </script>
          <div class="facebook">Facebook content</div>
        </body>
        </html>
      `;

      vi.mocked(http.get).mockResolvedValue(createMockResponse(html));

      const authManager = new AuthManager(jar, http, emitter, storage, config, logger);

      await expect(authManager.bootstrap()).rejects.toThrow(InvalidAppStateError);
      await expect(authManager.bootstrap()).rejects.toMatchObject({
        message: expect.stringContaining('LSD token missing'),
        context: expect.objectContaining({
          failureReason: 'LSD token missing — Facebook may have changed HTML structure',
        }),
      });
    });

    it('should detect token extraction regex pattern issue', async () => {
      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body>
          <div class="facebook">Facebook content</div>
          <input type="hidden" name="DTSGInitialData" value="old_format" />
          <input type="hidden" name="fb_dtsg" value="another_old_format" />
        </body>
        </html>
      `;

      vi.mocked(http.get).mockResolvedValue(createMockResponse(html));

      const authManager = new AuthManager(jar, http, emitter, storage, config, logger);

      await expect(authManager.bootstrap()).rejects.toThrow(InvalidAppStateError);
      await expect(authManager.bootstrap()).rejects.toMatchObject({
        message: expect.stringContaining('Token extraction regex patterns'),
        context: expect.objectContaining({
          failureReason: 'Token extraction regex patterns may need updating',
        }),
      });
    });

    it('should provide generic failure reason for unknown issues', async () => {
      const html = `
        <!DOCTYPE html>
        <html>
        <body>
          <div class="facebook">Facebook</div>
        </body>
        </html>
      `;

      vi.mocked(http.get).mockResolvedValue(createMockResponse(html));

      const authManager = new AuthManager(jar, http, emitter, storage, config, logger);

      await expect(authManager.bootstrap()).rejects.toThrow(InvalidAppStateError);
      await expect(authManager.bootstrap()).rejects.toMatchObject({
        message: expect.stringContaining('AppState may be expired or Facebook HTML structure has changed'),
        context: expect.objectContaining({
          failureReason: 'AppState may be expired or Facebook HTML structure has changed',
        }),
      });
    });
  });

  describe('successful bootstrap', () => {
    it('should successfully extract tokens from valid Facebook HTML', async () => {
      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body>
          <script>
            requireLazy(["DTSGInitialData"], function(DTSGInit) {
              DTSGInit.init({"token":"AQE5X2m9c"});
            });
          </script>
          <input type="hidden" name="lsd" value="AVqX2m9c" />
          <div class="facebook">Facebook content</div>
        </body>
        </html>
      `;

      vi.mocked(http.get).mockResolvedValue(createMockResponse(html));

      const authManager = new AuthManager(jar, http, emitter, storage, config, logger);

      const tokens = await authManager.bootstrap();

      expect(tokens).toBeDefined();
      expect(tokens.dtsg).toBe('AQE5X2m9c');
      expect(tokens.lsd).toBe('AVqX2m9c');
      expect(tokens.userId).toBe('1234567890');
    });
  });

  describe('error context does not expose sensitive data', () => {
    it('should not include cookie values in error context', async () => {
      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body>
          <h1>Session Expired</h1>
        </body>
        </html>
      `;

      vi.mocked(http.get).mockResolvedValue(createMockResponse(html));

      const authManager = new AuthManager(jar, http, emitter, storage, config, logger);

      try {
        await authManager.bootstrap();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(SessionExpiredError);
        const errorObj = error as SessionExpiredError;
        const contextStr = JSON.stringify(errorObj.context);
        
        // Should not contain sensitive cookie values
        expect(contextStr).not.toContain('test-token');
        expect(contextStr).not.toContain('test-datr');
        
        // Should contain diagnostic info (failureReason from InvalidAppStateError)
        // SessionExpiredError is thrown by checkForExpiredSession, not bootstrap
        // So we need to check that the error has appropriate context
        expect(errorObj.code).toBe('PFCA_SESSION_EXPIRED');
      }
    });
  });
});

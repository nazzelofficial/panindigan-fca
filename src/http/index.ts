import { Pool, type Agent, type ProxyAgent, fetch as undicicFetch } from 'undici';
import type { CookieJar } from 'tough-cookie';
import pRetry from 'p-retry';
import {
  ConnectionError,
  TimeoutError,
  RateLimitError,
  ServerError,
  ForbiddenError,
  NotFoundError,
  ProxyError,
} from '../errors/index.js';
import { FB_BASE_URL, DEFAULT_HEADERS, CONTENT_TYPE_FORM, RETRY_STATUS_CODES } from '../constants/index.js';
import { getCookieString } from '../cookies/index.js';
import type { Config } from '../config/index.js';
import type { Logger } from '../logger/index.js';
import type { StealthManager } from '../stealth/index.js';
import type { MiddlewarePipeline } from '../middleware/index.js';
import type { TypedEventEmitter } from '../events/index.js';
import { v4 as uuidv4 } from 'uuid';
import { ProxyManager, maskProxyUrl } from '../proxy/index.js';

export interface HttpRequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: string | Buffer | null;
  signal?: AbortSignal;
  priority?: 'high' | 'normal' | 'low';
  skipRetry?: boolean;
}

export interface HttpResponse {
  status: number;
  headers: Record<string, string>;
  text: () => Promise<string>;
  json: () => Promise<unknown>;
  buffer: () => Promise<Buffer>;
}

/**
 * A ProxyEntry pairs a human-readable masked URL (for logging/events) with
 * the undici Dispatcher that routes traffic through it, and the ProxyManager
 * that owns the lifecycle of that dispatcher.
 */
interface ProxyEntry {
  maskedUrl: string;
  dispatcher: Agent | ProxyAgent;
  manager: ProxyManager;
}

const SLOW_REQUEST_THRESHOLD_MS = 5000;

export class HttpClient {
  /** Default connection pool for direct (non-proxied) requests. */
  private readonly pool: Pool;
  /** Ordered list of proxy entries for rotation. */
  private readonly proxies: ProxyEntry[] = [];
  private currentProxyIndex = 0;
  private requestCount = 0;
  private readonly proxyRotateEvery: number | null;

  /** Optional callback invoked after every request for diagnostics/metrics. */
  private requestRecorder?: (latencyMs: number, isError: boolean) => void;

  /** ProxyManager instances — one per configured proxy URL, in pool order. */
  private readonly managers: ProxyManager[] = [];

  constructor(
    private readonly jar: CookieJar,
    private readonly config: Config,
    private readonly stealth: StealthManager,
    private readonly pipeline: MiddlewarePipeline,
    private readonly logger: Logger,
    private readonly emitter?: TypedEventEmitter,
  ) {
    this.proxyRotateEvery = config.proxy.rotateEvery ?? null;

    this.pool = new Pool(FB_BASE_URL, {
      connections: config.http.maxConnections,
      keepAliveTimeout: 30000,
      keepAliveMaxTimeout: 300000,
      connectTimeout: config.http.timeout.connect,
      headersTimeout: config.http.timeout.request,
      bodyTimeout: config.http.timeout.body,
    });

    // Create ProxyManager instances for every configured proxy URL.
    // Dispatcher construction (which may be async for SOCKS) happens in init().
    const allProxyUrls = [
      ...(config.proxy.url ? [config.proxy.url] : []),
      ...(config.proxy.pool ?? []),
    ];
    for (const url of allProxyUrls) {
      this.managers.push(new ProxyManager(url));
    }

    if (this.managers.length > 0) {
      this.logger.debug('Proxy configured', {
        tag: 'HTTP',
        count: this.managers.length,
        proxies: this.managers.map((m) => m.maskedUrl),
      });
    }
  }

  /**
   * Asynchronously initialise proxy dispatchers. Must be awaited before the
   * first request. Is a no-op when no proxies are configured.
   */
  async init(): Promise<void> {
    for (const manager of this.managers) {
      try {
        const dispatcher = await manager.getUndiciDispatcher(
          this.config.http.maxConnections,
          this.config.http.timeout.connect,
        );
        this.proxies.push({ maskedUrl: manager.maskedUrl, dispatcher, manager });
        this.logger.info('Proxy initialised', {
          tag: 'HTTP',
          proxy: manager.maskedUrl,
          protocol: manager.protocol,
        });
      } catch (err) {
        throw new ProxyError(
          `Failed to initialise proxy "${manager.maskedUrl}"`,
          { proxyUrl: manager.maskedUrl },
          err,
        );
      }
    }
  }

  /** Register a callback that is invoked after every HTTP request (for diagnostics). */
  setRequestRecorder(fn: (latencyMs: number, isError: boolean) => void): void {
    this.requestRecorder = fn;
  }

  private getActiveDispatcher(): Agent | ProxyAgent | Pool {
    if (this.proxies.length === 0) return this.pool;

    // Rotate proxy when the request count crosses a multiple of rotateEvery
    if (
      this.proxyRotateEvery !== null &&
      this.requestCount > 0 &&
      this.requestCount % this.proxyRotateEvery === 0 &&
      this.proxies.length > 1
    ) {
      const prevEntry = this.proxies[this.currentProxyIndex];
      this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
      const nextEntry = this.proxies[this.currentProxyIndex];
      this.logger.debug('Rotating proxy', {
        tag: 'HTTP',
        from: prevEntry?.maskedUrl,
        to: nextEntry?.maskedUrl,
        requestCount: this.requestCount,
      });
      if (prevEntry && nextEntry) {
        this.emitter?.emit('proxy:rotate', {
          from: prevEntry.maskedUrl,
          to: nextEntry.maskedUrl,
          requestCount: this.requestCount,
        });
      }
    }

    return this.proxies[this.currentProxyIndex]?.dispatcher ?? this.pool;
  }

  async request(options: HttpRequestOptions): Promise<HttpResponse> {
    const correlationId = uuidv4();
    const method = options.method ?? 'GET';
    const cookieHeader = getCookieString(this.jar, options.url);
    const stealthHeaders = this.stealth.getHeaders(`https://www.facebook.com/`);

    const headers: Record<string, string> = {
      ...DEFAULT_HEADERS,
      ...stealthHeaders,
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      ...(options.body && !options.headers?.['content-type']
        ? { 'content-type': CONTENT_TYPE_FORM }
        : {}),
      ...options.headers,
      'x-correlation-id': correlationId,
    };

    const reqCtx = {
      url: options.url,
      method,
      headers,
      body: options.body ?? undefined,
      meta: { correlationId, startTime: performance.now() },
    };

    await this.pipeline.runRequest(reqCtx);

    const attempt = async (): Promise<HttpResponse> => {
      const startMs = performance.now();

      this.requestCount++;
      const dispatcher = this.getActiveDispatcher();

      // Debug: log which proxy (if any) handles this request
      const activeEntry = this.proxies[this.currentProxyIndex];
      if (activeEntry) {
        this.logger.debug('Sending request via proxy', {
          tag: 'HTTP',
          proxy: activeEntry.maskedUrl,
          url: options.url,
          correlationId,
        });
      }

      let resp: Awaited<ReturnType<typeof undicicFetch>>;
      try {
        resp = await undicicFetch(reqCtx.url, {
          method: reqCtx.method,
          headers: reqCtx.headers as Record<string, string>,
          body: options.body ?? undefined,
          signal: options.signal,
          dispatcher,
        });
      } catch (err: unknown) {
        const latencyMs = performance.now() - startMs;
        this.requestRecorder?.(latencyMs, true);
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('timeout') || msg.includes('ETIMEDOUT')) {
          if (activeEntry) {
            this.logger.debug('Proxy connection timed out', {
              tag: 'HTTP', proxy: activeEntry.maskedUrl, url: options.url, correlationId,
            });
          }
          throw new TimeoutError(
            `Request to ${options.url} timed out`,
            { url: options.url, correlationId },
            err,
          );
        }
        if (activeEntry && (msg.includes('ECONNREFUSED') || msg.includes('proxy') || msg.includes('SOCKS'))) {
          this.logger.debug('Proxy connection failed', {
            tag: 'HTTP', proxy: activeEntry.maskedUrl, url: options.url, correlationId,
          });
          throw new ProxyError(
            `Proxy connection failed for ${options.url}: ${msg}`,
            { proxyUrl: activeEntry.maskedUrl, url: options.url, correlationId },
            err,
          );
        }
        throw new ConnectionError(
          `Connection failed to ${options.url}: ${msg}`,
          { url: options.url, correlationId },
          err,
        );
      }

      const latencyMs = performance.now() - startMs;
      this.requestRecorder?.(latencyMs, false);

      this.logger.debug('HTTP response', {
        tag: 'HTTP',
        url: options.url,
        status: resp.status,
        latencyMs: Math.round(latencyMs),
        correlationId,
      });

      // Slow request detection
      if (latencyMs > SLOW_REQUEST_THRESHOLD_MS) {
        this.logger.warn('Slow HTTP request detected', {
          tag: 'HTTP',
          url: options.url,
          durationMs: Math.round(latencyMs),
          threshold: SLOW_REQUEST_THRESHOLD_MS,
        });
        this.emitter?.emit('slow:request', {
          url: options.url,
          durationMs: Math.round(latencyMs),
          threshold: SLOW_REQUEST_THRESHOLD_MS,
        });
      }

      if (resp.status === 429) {
        const retryAfter = resp.headers.get('retry-after');
        const retryAfterMs = retryAfter ? Number(retryAfter) * 1000 : 60000;
        throw new RateLimitError(`Rate limited by Facebook`, retryAfterMs, { url: options.url });
      }

      if (resp.status === 403) {
        throw new ForbiddenError(`Forbidden: ${options.url}`, { url: options.url });
      }

      if (resp.status === 404) {
        throw new NotFoundError(`Not found: ${options.url}`, { url: options.url });
      }

      if (resp.status >= 500) {
        throw new ServerError(
          `Server error ${resp.status} from ${options.url}`,
          resp.status,
          { url: options.url },
        );
      }

      const responseHeaders: Record<string, string> = {};
      resp.headers.forEach((v, k) => {
        responseHeaders[k] = v;
      });

      const respCtx = {
        url: options.url,
        method,
        status: resp.status,
        headers: responseHeaders,
        meta: reqCtx.meta,
      };
      await this.pipeline.runResponse(respCtx);

      const bodyBuffer = Buffer.from(await resp.arrayBuffer());

      return {
        status: resp.status,
        headers: responseHeaders,
        text: async () => bodyBuffer.toString('utf8'),
        json: async () => JSON.parse(bodyBuffer.toString('utf8')) as unknown,
        buffer: async () => bodyBuffer,
      };
    };

    if (options.skipRetry) return attempt();

    return pRetry(attempt, {
      retries: this.config.http.retries.max,
      factor: 2,
      minTimeout: this.config.http.retries.baseDelay,
      maxTimeout: 30000,
      randomize: true,
      shouldRetry: (err: unknown) => {
        if (err instanceof RateLimitError) return false;
        if (err instanceof ForbiddenError) return false;
        if (err instanceof NotFoundError) return false;
        if (err instanceof ServerError && RETRY_STATUS_CODES.has(err.statusCode)) return true;
        if (err instanceof ConnectionError || err instanceof TimeoutError) return true;
        if (err instanceof ProxyError) return true;
        return false;
      },
    });
  }

  async get(url: string, opts?: Partial<HttpRequestOptions>): Promise<HttpResponse> {
    return this.request({ ...opts, url, method: 'GET' });
  }

  async post(url: string, body: string, opts?: Partial<HttpRequestOptions>): Promise<HttpResponse> {
    return this.request({ ...opts, url, method: 'POST', body });
  }

  /** POST with a raw Buffer body — use for binary/multipart uploads. */
  async postBuffer(url: string, body: Buffer, opts?: Partial<HttpRequestOptions>): Promise<HttpResponse> {
    return this.request({ ...opts, url, method: 'POST', body });
  }

  async close(): Promise<void> {
    await this.pool.close();
    for (const entry of this.proxies) {
      try {
        await entry.manager.close();
      } catch {
        // ignore close errors
      }
    }
  }
}
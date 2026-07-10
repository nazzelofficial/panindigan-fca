import { StorageError } from '../errors/index.js';

declare function require(moduleName: string): unknown;

interface IncomingMessageLike {
  on(event: 'data' | 'error' | 'end', listener: (...args: unknown[]) => void): IncomingMessageLike;
  statusCode?: number;
}

interface ClientRequestLike {
  on(event: 'timeout' | 'error', listener: (...args: unknown[]) => void): ClientRequestLike;
  write(chunk: string): void;
  end(): void;
  destroy(error?: Error): void;
}

interface HttpModuleLike {
  request(
    url: string,
    options: { method?: string; headers?: Record<string, string>; timeout?: number },
    callback?: (response: IncomingMessageLike) => void,
  ): ClientRequestLike;
}

interface HttpClientResponse {
  statusCode: number;
  body: string;
  latencyMs: number;
}

/**
 * Configuration options for the remote storage API client.
 */
export interface ApiClientOptions {
  baseUrl?: string;
  authToken?: string;
  endpoints?: readonly string[];
  timeoutMs?: number;
  retries?: number;
}

/**
 * Request payload for the storage get endpoint.
 */
export interface StorageGetRequest {
  key: string;
}

/**
 * Response payload for the storage get endpoint.
 */
export interface StorageGetResponse {
  found: boolean;
  value: string | null;
  expiresAt: number | null;
}

/**
 * Request payload for the storage set endpoint.
 */
export interface StorageSetRequest {
  key: string;
  value: string;
  expiresAt: number | null;
}

/**
 * Response payload for the storage set endpoint.
 */
export interface StorageSetResponse {
  ok: boolean;
}

/**
 * Request payload for the storage delete endpoint.
 */
export interface StorageDeleteRequest {
  key: string;
}

/**
 * Response payload for the storage delete endpoint.
 */
export interface StorageDeleteResponse {
  ok: boolean;
}

/**
 * Response payload for the storage clear endpoint.
 */
export interface StorageClearResponse {
  ok: boolean;
}

/**
 * Response payload for the health endpoint.
 */
export interface StorageHealthResponse {
  status: string;
  timestamp: string;
}

/**
 * Request payload for session save endpoint.
 */
export interface StorageSessionSaveRequest {
  id: string;
  appState: unknown[];
  userId?: string | null;
  ttlMs?: number;
}

/**
 * Response payload for session save endpoint.
 */
export interface StorageSessionSaveResponse {
  ok: boolean;
}

/**
 * Response payload for session restore endpoint.
 */
export interface StorageSessionRestoreResponse {
  found: boolean;
  id: string | null;
  userId: string | null;
  appState: unknown[] | null;
  createdAt: number | null;
  updatedAt: number | null;
  expiresAt: number | null;
}

/**
 * Response payload for session list endpoint.
 */
export interface StorageSessionListResponse {
  sessions: Array<{
    id: string;
    userId: string | null;
    appState: unknown[];
    createdAt: number;
    updatedAt: number;
    expiresAt: number | null;
  }>;
}

/**
 * Response payload for session delete endpoint.
 */
export interface StorageSessionDeleteResponse {
  ok: boolean;
}

/**
 * Response payload for session purge endpoint.
 */
export interface StorageSessionPurgeResponse {
  deletedCount: number;
}

/**
 * Response payload for session touch endpoint.
 */
export interface StorageSessionTouchResponse {
  ok: boolean;
}

// ── Backoff ────────────────────────────────────────────────────────────────────

/** Exponential backoff with full-jitter: delay = rand(0, base * 2^attempt). */
function backoffDelayMs(attempt: number, baseMs = 200, maxMs = 8_000): number {
  const cap = Math.min(maxMs, baseMs * Math.pow(2, attempt));
  return Math.random() * cap;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms).unref?.() ?? setTimeout(resolve, ms));
}

/**
 * Reusable HTTP client for communicating with the remote Panindigan storage API.
 *
 * Retry strategy: each endpoint is attempted `retries + 1` times with
 * exponential back-off and full jitter between retries. When all retries for
 * one endpoint are exhausted the client moves to the next endpoint in the list.
 * A {@link StorageError} is thrown only after every endpoint-retry combination
 * has failed.
 */
export class StorageApiClient {
  private readonly endpoints: readonly string[];
  private readonly authToken: string | undefined;
  private readonly timeoutMs: number;
  private readonly retries: number;

  constructor(options: ApiClientOptions = {}) {
    this.endpoints = this.normalizeEndpoints(options.baseUrl, options.endpoints);
    this.authToken = options.authToken?.trim() ? options.authToken : undefined;
    this.timeoutMs = options.timeoutMs ?? 10000;
    this.retries = options.retries ?? 2;
  }

  async health(): Promise<StorageHealthResponse> {
    return this.request<StorageHealthResponse>('GET', '/v1/health');
  }

  async get(key: string): Promise<StorageGetResponse> {
    return this.request<StorageGetResponse, StorageGetRequest>('POST', '/v1/storage/get', { key });
  }

  async set(key: string, value: string, expiresAt: number | null): Promise<StorageSetResponse> {
    return this.request<StorageSetResponse, StorageSetRequest>('POST', '/v1/storage/set', {
      key,
      value,
      expiresAt,
    });
  }

  async delete(key: string): Promise<StorageDeleteResponse> {
    return this.request<StorageDeleteResponse, StorageDeleteRequest>('POST', '/v1/storage/delete', { key });
  }

  async clear(): Promise<StorageClearResponse> {
    return this.request<StorageClearResponse>('POST', '/v1/storage/clear');
  }

  async sessionSave(id: string, appState: unknown[], userId?: string | null, ttlMs?: number): Promise<StorageSessionSaveResponse> {
    return this.request<StorageSessionSaveResponse, StorageSessionSaveRequest>('POST', '/v1/sessions/save', {
      id,
      appState,
      userId,
      ttlMs,
    });
  }

  async sessionRestore(id: string): Promise<StorageSessionRestoreResponse> {
    return this.request<StorageSessionRestoreResponse, { id: string }>('POST', '/v1/sessions/restore', { id });
  }

  async sessionList(userId?: string): Promise<StorageSessionListResponse> {
    return this.request<StorageSessionListResponse, { userId?: string }>('POST', '/v1/sessions/list', { userId });
  }

  async sessionDelete(id: string): Promise<StorageSessionDeleteResponse> {
    return this.request<StorageSessionDeleteResponse, { id: string }>('POST', '/v1/sessions/delete', { id });
  }

  async sessionPurgeExpired(): Promise<StorageSessionPurgeResponse> {
    return this.request<StorageSessionPurgeResponse>('POST', '/v1/sessions/purge');
  }

  async sessionTouch(id: string, ttlMs?: number): Promise<StorageSessionTouchResponse> {
    return this.request<StorageSessionTouchResponse, { id: string; ttlMs?: number }>('POST', '/v1/sessions/touch', {
      id,
      ttlMs,
    });
  }

  private async request<TResponse, TRequest = undefined>(
    method: 'GET' | 'POST',
    path: string,
    body?: TRequest,
  ): Promise<TResponse> {
    const errors: Error[] = [];

    for (const endpoint of this.endpoints) {
      for (let attempt = 0; attempt <= this.retries; attempt += 1) {
        try {
          return await this.fetchJson<TResponse, TRequest>(endpoint, method, path, body);
        } catch (error) {
          errors.push(error instanceof Error ? error : new Error(String(error)));

          const isLastAttempt = attempt >= this.retries;
          if (!isLastAttempt) {
            // Exponential back-off with full jitter between retries.
            await sleep(backoffDelayMs(attempt));
          }
        }
      }
    }

    throw new StorageError(
      `Storage API request failed for ${path} after exhausting all endpoints and retries`,
      { path, endpoints: [...this.endpoints], retries: this.retries },
      errors.at(-1),
    );
  }

  private async fetchJson<TResponse, TRequest>(
    endpoint: string,
    method: 'GET' | 'POST',
    path: string,
    body?: TRequest,
  ): Promise<TResponse> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Connection: 'keep-alive',
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const payload = body !== undefined && method === 'POST' ? JSON.stringify(body) : undefined;

    try {
      const response = await this.sendRequest(endpoint, path, method, headers, payload);

      let parsedPayload: unknown = undefined;
      if (response.body) {
        try {
          parsedPayload = JSON.parse(response.body);
        } catch {
          parsedPayload = response.body;
        }
      }

      if (response.statusCode >= 400) {
        throw new StorageError(`Storage API returned HTTP ${response.statusCode}`, {
          endpoint,
          path,
          statusCode: response.statusCode,
          latencyMs: Math.round(response.latencyMs),
          payload: parsedPayload,
        });
      }

      return parsedPayload as TResponse;
    } catch (error) {
      if (error instanceof StorageError) throw error;
      throw new StorageError('Storage API request failed', { endpoint, path }, error);
    }
  }

  private sendRequest(
    endpoint: string,
    path: string,
    method: 'GET' | 'POST',
    headers: Record<string, string>,
    payload?: string,
  ): Promise<HttpClientResponse> {
    return new Promise<HttpClientResponse>((resolve, reject) => {
      const startMs = Date.now();
      const transport = this.getTransport(endpoint);

      const request = transport.request(
        this.buildUrl(endpoint, path),
        { method, headers, timeout: this.timeoutMs },
        (response: IncomingMessageLike) => {
          const chunks: string[] = [];
          response.on('data', (chunk: unknown) => {
            chunks.push(typeof chunk === 'string' ? chunk : String(chunk));
          });
          response.on('error', reject);
          response.on('end', () => {
            resolve({
              statusCode: response.statusCode ?? 0,
              body: chunks.join(''),
              latencyMs: Date.now() - startMs,
            });
          });
        },
      );

      request.on('timeout', () => {
        request.destroy(new Error(`Request to ${this.buildUrl(endpoint, path)} timed out after ${this.timeoutMs} ms`));
      });
      request.on('error', reject);

      if (payload) request.write(payload);
      request.end();
    });
  }

  private getTransport(endpoint: string): HttpModuleLike {
    const moduleName = endpoint.startsWith('https://') ? 'https' : 'http';
    const globalRequire = (globalThis as typeof globalThis & { require?: (moduleName: string) => unknown }).require;
    if (globalRequire) return globalRequire(moduleName) as HttpModuleLike;
    return require(moduleName) as HttpModuleLike;
  }

  private buildUrl(endpoint: string, path: string): string {
    const normalizedEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${normalizedEndpoint}${normalizedPath}`;
  }

  private normalizeEndpoints(baseUrl?: string, endpoints?: readonly string[]): string[] {
    const values = new Set<string>();

    if (endpoints) {
      for (const endpoint of endpoints) {
        const normalized = endpoint.trim();
        if (normalized) values.add(normalized);
      }
    }

    if (baseUrl) {
      for (const entry of baseUrl.split(',')) {
        const normalized = entry.trim();
        if (normalized) values.add(normalized);
      }
    }

    if (values.size === 0) {
      // Built-in HA pair: primary → secondary automatic failover.
      values.add('https://storage.panindigan.com');
      values.add('https://storage2.panindigan.com');
    }

    return Array.from(values);
  }
}

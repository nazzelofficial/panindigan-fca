/**
 * Production SDK for the Panindigan remote storage API.
 *
 * ROOT CAUSE FIX (v0.1.8):
 *   Previous implementation used `require('https')` / `require('http')` to load
 *   Node.js built-in HTTP modules. In the ESM build (`dist/index.js`) Node.js
 *   has no global `require`, so every request threw `ReferenceError` before
 *   reaching the network — causing the 599 ms fallback seen in production logs.
 *   Replaced with `undici.request()` which is fully ESM-compatible and was
 *   already a declared dependency.
 *
 * Features:
 *   - Undici-based HTTP with native HTTPS, keep-alive, and connection pooling
 *   - Per-endpoint circuit breaker (CLOSED → OPEN → auto-recovery probe)
 *   - Exponential back-off with full jitter between retries
 *   - Endpoint rotation: primary → secondary failover per request
 *   - Structured latency metrics (avg, p95, per-request)
 *   - All public methods are identical to v0.1.7 — zero breaking changes
 */
import { request as undiciRequest } from 'undici';
import { StorageError } from '../errors/index.js';

// ── Types ─────────────────────────────────────────────────────────────────────

interface HttpClientResponse {
  statusCode: number;
  body: string;
  latencyMs: number;
}

/** Circuit-breaker state per endpoint. */
type CircuitState = 'closed' | 'open';

interface EndpointCircuit {
  state: CircuitState;
  consecutiveFailures: number;
  openedAt: number;
  /** True while a recovery probe is in-flight (prevents concurrent probes). */
  probeInFlight: boolean;
}

/**
 * Live metrics snapshot returned by {@link StorageApiClient.getMetrics}.
 */
export interface StorageClientMetrics {
  /** Total HTTP requests attempted (all endpoints, all attempts). */
  totalRequests: number;
  /** Requests that returned a 2xx status. */
  successRequests: number;
  /** Requests that failed (non-2xx, timeout, or network error). */
  errorRequests: number;
  /** Number of times any endpoint's circuit breaker tripped to OPEN. */
  circuitBreakerTrips: number;
  /** Latency of the most recent completed request (ms). */
  lastLatencyMs: number;
  /** Rolling average latency over the last ≤200 samples (ms). */
  avgLatencyMs: number;
  /**
   * 95th-percentile latency over the last ≤200 samples (ms).
   * `null` until at least 10 samples have been collected.
   */
  p95LatencyMs: number | null;
}

// ── Request / response payload types (unchanged from v0.1.7) ─────────────────

export interface ApiClientOptions {
  baseUrl?: string;
  authToken?: string;
  endpoints?: readonly string[];
  timeoutMs?: number;
  retries?: number;
  /** Consecutive per-endpoint failures before opening the circuit. Default 3. */
  circuitBreakerThreshold?: number;
  /**
   * Milliseconds the circuit stays OPEN before a recovery probe is allowed.
   * Default 30 000 (30 s).
   */
  circuitBreakerRecoveryMs?: number;
}

export interface StorageGetRequest { key: string; }
export interface StorageGetResponse { found: boolean; value: string | null; expiresAt: number | null; }
export interface StorageSetRequest { key: string; value: string; expiresAt: number | null; }
export interface StorageSetResponse { ok: boolean; }
export interface StorageDeleteRequest { key: string; }
export interface StorageDeleteResponse { ok: boolean; }
export interface StorageClearResponse { ok: boolean; }
export interface StorageHealthResponse { status: string; timestamp: string; }
export interface StorageSessionSaveRequest {
  id: string; appState: unknown[]; userId?: string | null; ttlMs?: number;
}
export interface StorageSessionSaveResponse { ok: boolean; }
export interface StorageSessionRestoreResponse {
  found: boolean; id: string | null; userId: string | null;
  appState: unknown[] | null;
  createdAt: number | null; updatedAt: number | null; expiresAt: number | null;
}
export interface StorageSessionListResponse {
  sessions: Array<{
    id: string; userId: string | null; appState: unknown[];
    createdAt: number; updatedAt: number; expiresAt: number | null;
  }>;
}
export interface StorageSessionDeleteResponse { ok: boolean; }
export interface StorageSessionPurgeResponse { deletedCount: number; }
export interface StorageSessionTouchResponse { ok: boolean; }

// ── Back-off helpers ──────────────────────────────────────────────────────────

/** Full-jitter exponential back-off: delay = rand(0, base × 2^attempt). */
function backoffDelayMs(attempt: number, baseMs = 200, maxMs = 8_000): number {
  const cap = Math.min(maxMs, baseMs * Math.pow(2, attempt));
  return Math.random() * cap;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    const t = setTimeout(resolve, ms);
    (t as unknown as { unref?: () => void }).unref?.();
  });
}

// ── StorageApiClient ──────────────────────────────────────────────────────────

/**
 * Production HTTP client for the Panindigan remote storage API.
 *
 * Uses `undici` for ESM-compatible HTTPS with native keep-alive and
 * connection pooling. A per-endpoint circuit breaker prevents thundering-herd
 * retries when an endpoint is confirmed down.
 *
 * Retry strategy: each endpoint is attempted `retries + 1` times with
 * full-jitter exponential back-off. After all attempts for one endpoint are
 * exhausted, the client moves to the next endpoint. A {@link StorageError} is
 * thrown only after every endpoint-retry combination has been tried or the
 * circuit breaker has blocked all of them.
 */
export class StorageApiClient {
  private readonly endpoints: readonly string[];
  private readonly authToken: string | undefined;
  private readonly timeoutMs: number;
  private readonly retries: number;
  private readonly circuitThreshold: number;
  private readonly circuitRecoveryMs: number;

  // ── Circuit-breaker state ────────────────────────────────────────────────────
  private readonly circuits = new Map<string, EndpointCircuit>();

  // ── Metrics ───────────────────────────────────────────────────────────────────
  private readonly _metrics: StorageClientMetrics = {
    totalRequests: 0,
    successRequests: 0,
    errorRequests: 0,
    circuitBreakerTrips: 0,
    lastLatencyMs: 0,
    avgLatencyMs: 0,
    p95LatencyMs: null,
  };
  private readonly latencySamples: number[] = [];

  constructor(options: ApiClientOptions = {}) {
    this.endpoints = this.normalizeEndpoints(options.baseUrl, options.endpoints);
    this.authToken = options.authToken?.trim() ? options.authToken : undefined;
    this.timeoutMs = options.timeoutMs ?? 10_000;
    this.retries = options.retries ?? 2;
    this.circuitThreshold = options.circuitBreakerThreshold ?? 3;
    this.circuitRecoveryMs = options.circuitBreakerRecoveryMs ?? 30_000;
  }

  // ── Public API (unchanged from v0.1.7) ────────────────────────────────────────

  async health(): Promise<StorageHealthResponse> {
    return this.request<StorageHealthResponse>('GET', '/v1/health');
  }

  async get(key: string): Promise<StorageGetResponse> {
    return this.request<StorageGetResponse, StorageGetRequest>('POST', '/v1/storage/get', { key });
  }

  async set(key: string, value: string, expiresAt: number | null): Promise<StorageSetResponse> {
    return this.request<StorageSetResponse, StorageSetRequest>('POST', '/v1/storage/set', { key, value, expiresAt });
  }

  async delete(key: string): Promise<StorageDeleteResponse> {
    return this.request<StorageDeleteResponse, StorageDeleteRequest>('POST', '/v1/storage/delete', { key });
  }

  async clear(): Promise<StorageClearResponse> {
    return this.request<StorageClearResponse>('POST', '/v1/storage/clear');
  }

  async sessionSave(
    id: string, appState: unknown[], userId?: string | null, ttlMs?: number,
  ): Promise<StorageSessionSaveResponse> {
    return this.request<StorageSessionSaveResponse, StorageSessionSaveRequest>(
      'POST', '/v1/sessions/save', { id, appState, userId, ttlMs },
    );
  }

  async sessionRestore(id: string): Promise<StorageSessionRestoreResponse> {
    return this.request<StorageSessionRestoreResponse, { id: string }>(
      'POST', '/v1/sessions/restore', { id },
    );
  }

  async sessionList(userId?: string): Promise<StorageSessionListResponse> {
    return this.request<StorageSessionListResponse, { userId?: string }>(
      'POST', '/v1/sessions/list', { userId },
    );
  }

  async sessionDelete(id: string): Promise<StorageSessionDeleteResponse> {
    return this.request<StorageSessionDeleteResponse, { id: string }>(
      'POST', '/v1/sessions/delete', { id },
    );
  }

  async sessionPurgeExpired(): Promise<StorageSessionPurgeResponse> {
    return this.request<StorageSessionPurgeResponse>('POST', '/v1/sessions/purge');
  }

  async sessionTouch(id: string, ttlMs?: number): Promise<StorageSessionTouchResponse> {
    return this.request<StorageSessionTouchResponse, { id: string; ttlMs?: number }>(
      'POST', '/v1/sessions/touch', { id, ttlMs },
    );
  }

  // ── Observability ─────────────────────────────────────────────────────────────

  /** Return a snapshot of accumulated request metrics. */
  getMetrics(): StorageClientMetrics {
    return { ...this._metrics };
  }

  /** Return the current circuit-breaker state for each known endpoint. */
  getCircuitStates(): Record<string, CircuitState> {
    const out: Record<string, CircuitState> = {};
    for (const ep of this.endpoints) {
      out[ep] = this.getCircuit(ep).state;
    }
    return out;
  }

  // ── Circuit-breaker internals ─────────────────────────────────────────────────

  private getCircuit(endpoint: string): EndpointCircuit {
    let c = this.circuits.get(endpoint);
    if (!c) {
      c = { state: 'closed', consecutiveFailures: 0, openedAt: 0, probeInFlight: false };
      this.circuits.set(endpoint, c);
    }
    return c;
  }

  /**
   * Returns true when a request to this endpoint is permitted.
   * CLOSED → always true.
   * OPEN → true only when the recovery window has elapsed AND no probe is
   * already in-flight (prevents concurrent half-open probes).
   */
  private canAttempt(endpoint: string): boolean {
    const c = this.getCircuit(endpoint);
    if (c.state === 'closed') return true;
    // OPEN: allow one recovery probe after the window expires.
    if (Date.now() - c.openedAt >= this.circuitRecoveryMs && !c.probeInFlight) {
      c.probeInFlight = true;
      return true;
    }
    return false;
  }

  private onSuccess(endpoint: string): void {
    const c = this.getCircuit(endpoint);
    c.state = 'closed';
    c.consecutiveFailures = 0;
    c.probeInFlight = false;
  }

  private onFailure(endpoint: string): void {
    const c = this.getCircuit(endpoint);
    c.consecutiveFailures += 1;
    c.probeInFlight = false;
    if (c.consecutiveFailures >= this.circuitThreshold || c.state === 'open') {
      if (c.state !== 'open') this._metrics.circuitBreakerTrips += 1;
      c.state = 'open';
      c.openedAt = Date.now();
    }
  }

  // ── Metrics helpers ───────────────────────────────────────────────────────────

  private recordLatency(latencyMs: number, success: boolean): void {
    this._metrics.totalRequests += 1;
    if (success) this._metrics.successRequests += 1;
    else this._metrics.errorRequests += 1;

    this._metrics.lastLatencyMs = latencyMs;
    this.latencySamples.push(latencyMs);
    if (this.latencySamples.length > 200) this.latencySamples.shift();

    const n = this.latencySamples.length;
    this._metrics.avgLatencyMs = this.latencySamples.reduce((a, b) => a + b, 0) / n;
    if (n >= 10) {
      const sorted = [...this.latencySamples].sort((a, b) => a - b);
      this._metrics.p95LatencyMs = sorted[Math.floor(n * 0.95)] ?? null;
    }
  }

  // ── Core request logic ────────────────────────────────────────────────────────

  private async request<TResponse, TRequest = undefined>(
    method: 'GET' | 'POST',
    path: string,
    body?: TRequest,
  ): Promise<TResponse> {
    const errors: Error[] = [];

    for (const endpoint of this.endpoints) {
      if (!this.canAttempt(endpoint)) {
        errors.push(
          new StorageError(`Circuit breaker OPEN for ${endpoint} — request blocked`, { endpoint, path }),
        );
        continue;
      }

      for (let attempt = 0; attempt <= this.retries; attempt++) {
        try {
          const result = await this.fetchJson<TResponse, TRequest>(endpoint, method, path, body);
          this.onSuccess(endpoint);
          return result;
        } catch (error) {
          this.onFailure(endpoint);
          errors.push(error instanceof Error ? error : new Error(String(error)));

          const isLastAttempt = attempt >= this.retries;
          if (!isLastAttempt) {
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

  /**
   * Low-level HTTP transport using undici.
   *
   * ESM-safe: no `require()` calls. Undici is imported as a regular ESM
   * dependency and works identically in both the CJS and ESM builds.
   *
   * Connection keep-alive, TLS, DNS, IPv4/IPv6 preference, and connection
   * pooling are all handled transparently by undici's global dispatcher.
   */
  async sendRequest(
    endpoint: string,
    path: string,
    method: 'GET' | 'POST',
    headers: Record<string, string>,
    payload?: string,
  ): Promise<HttpClientResponse> {
    const url = this.buildUrl(endpoint, path);
    const startMs = Date.now();

    try {
      const response = await undiciRequest(url, {
        method,
        headers,
        body: payload,
        // AbortSignal.timeout() requires Node.js >= 17.3 (we require >= 22)
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      const body = await response.body.text();
      const latencyMs = Date.now() - startMs;
      const success = response.statusCode < 400;
      this.recordLatency(latencyMs, success);

      return { statusCode: response.statusCode, body, latencyMs };
    } catch (err) {
      const latencyMs = Date.now() - startMs;
      this.recordLatency(latencyMs, false);

      if (err instanceof StorageError) throw err;
      throw new StorageError('Storage API transport error', { endpoint, path }, err);
    }
  }

  // ── URL helpers ───────────────────────────────────────────────────────────────

  private buildUrl(endpoint: string, path: string): string {
    const normalizedEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${normalizedEndpoint}${normalizedPath}`;
  }

  private normalizeEndpoints(baseUrl?: string, endpoints?: readonly string[]): string[] {
    const values = new Set<string>();

    if (endpoints) {
      for (const ep of endpoints) {
        const n = ep.trim();
        if (n) values.add(n);
      }
    }

    if (baseUrl) {
      for (const entry of baseUrl.split(',')) {
        const n = entry.trim();
        if (n) values.add(n);
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

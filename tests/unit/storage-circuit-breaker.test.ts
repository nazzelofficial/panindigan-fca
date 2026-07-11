/**
 * Tests for the StorageApiClient circuit breaker, retry/backoff, endpoint
 * failover, queue replay, metrics, and reconnect behaviour introduced in v0.1.8.
 *
 * Also verifies the ROOT CAUSE FIX: undici is used instead of require('https').
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { StorageApiClient } from '../../src/storage/api-client.js';
import { StorageError } from '../../src/errors/index.js';
import { LibSqlStorageAdapter } from '../../src/storage/libsql.js';

// ── Undici mock ────────────────────────────────────────────────────────────────
// vi.mock is hoisted before variable declarations; use vi.hoisted() to avoid
// "Cannot access before initialization" errors.

const { mockUndiciRequest } = vi.hoisted(() => ({
  mockUndiciRequest: vi.fn(),
}));
vi.mock('undici', () => ({
  request: mockUndiciRequest,
  // Proxy module also imports these — provide stubs so the import graph works
  Agent: class MockAgent {},
  ProxyAgent: class MockProxyAgent {},
}));

// ── Helper to create a healthy undici response ────────────────────────────────

function okResponse(body: Record<string, unknown>) {
  return {
    statusCode: 200,
    headers: {},
    body: { text: async () => JSON.stringify(body) },
  };
}

function errResponse(statusCode: number, msg = 'error') {
  return {
    statusCode,
    headers: {},
    body: { text: async () => msg },
  };
}

// ── StorageApiClient unit tests ───────────────────────────────────────────────

describe('StorageApiClient', () => {
  beforeEach(() => {
    mockUndiciRequest.mockReset();
  });

  describe('undici transport (root cause fix)', () => {
    it('uses undici.request — no require() calls', async () => {
      const client = new StorageApiClient({ baseUrl: 'https://example.com', retries: 0 });
      mockUndiciRequest.mockResolvedValueOnce(okResponse({ status: 'healthy', database: 'connected' }));

      await expect(client.health()).resolves.toMatchObject({ status: 'healthy' });
      expect(mockUndiciRequest).toHaveBeenCalledTimes(1);
      expect(mockUndiciRequest).toHaveBeenCalledWith(
        'https://example.com/v1/health',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('passes Authorization header when authToken is set', async () => {
      const client = new StorageApiClient({ baseUrl: 'https://example.com', authToken: 'secret', retries: 0 });
      mockUndiciRequest.mockResolvedValueOnce(okResponse({ ok: true }));
      await client.health();
      expect(mockUndiciRequest).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer secret' }) }),
      );
    });

    it('omits Authorization header when no token configured', async () => {
      const client = new StorageApiClient({ baseUrl: 'https://example.com', retries: 0 });
      mockUndiciRequest.mockResolvedValueOnce(okResponse({ ok: true }));
      await client.health();
      const callHeaders = (mockUndiciRequest.mock.calls[0]?.[1] as { headers: Record<string, string> }).headers;
      expect(callHeaders).not.toHaveProperty('Authorization');
    });

    it('throws StorageError when undici rejects (network failure)', async () => {
      const client = new StorageApiClient({ baseUrl: 'https://example.com', retries: 0 });
      mockUndiciRequest.mockRejectedValueOnce(new Error('ECONNREFUSED'));
      await expect(client.health()).rejects.toThrow(StorageError);
    });

    it('throws StorageError when server returns HTTP 4xx / 5xx', async () => {
      const client = new StorageApiClient({ baseUrl: 'https://example.com', retries: 0 });
      mockUndiciRequest.mockResolvedValueOnce(errResponse(503, 'Service Unavailable'));
      await expect(client.health()).rejects.toThrow(StorageError);
    });
  });

  describe('retry with exponential back-off', () => {
    it('retries failed requests up to the configured count', async () => {
      const client = new StorageApiClient({ baseUrl: 'https://example.com', retries: 2 });
      // Spy sendRequest to skip actual sleep
      const spy = vi.spyOn(client as any, 'sendRequest')
        .mockRejectedValueOnce(new StorageError('attempt 1'))
        .mockRejectedValueOnce(new StorageError('attempt 2'))
        .mockResolvedValueOnce({ statusCode: 200, body: JSON.stringify({ ok: true }), latencyMs: 5 });

      await expect(client.health()).resolves.toMatchObject({ ok: true });
      expect(spy).toHaveBeenCalledTimes(3); // 1 original + 2 retries
    });

    it('throws after all retries are exhausted', async () => {
      const client = new StorageApiClient({ baseUrl: 'https://example.com', retries: 1 });
      vi.spyOn(client as any, 'sendRequest')
        .mockRejectedValue(new StorageError('always fails'));

      await expect(client.health()).rejects.toThrow(StorageError);
      await expect(client.health()).rejects.toThrow(/exhausting all endpoints/);
    });
  });

  describe('endpoint failover', () => {
    it('moves to the next endpoint when the first is unreachable', async () => {
      const client = new StorageApiClient({
        endpoints: ['https://primary.example.com', 'https://secondary.example.com'],
        retries: 0,
      });

      mockUndiciRequest
        // Primary: fail
        .mockRejectedValueOnce(new Error('ECONNREFUSED'))
        // Secondary: succeed
        .mockResolvedValueOnce(okResponse({ status: 'healthy' }));

      await expect(client.health()).resolves.toMatchObject({ status: 'healthy' });
      expect(mockUndiciRequest).toHaveBeenCalledTimes(2);
      expect((mockUndiciRequest.mock.calls[0]?.[0] as string)).toContain('primary');
      expect((mockUndiciRequest.mock.calls[1]?.[0] as string)).toContain('secondary');
    });

    it('throws when all endpoints fail', async () => {
      const client = new StorageApiClient({
        endpoints: ['https://a.example.com', 'https://b.example.com'],
        retries: 0,
      });
      mockUndiciRequest.mockRejectedValue(new Error('down'));
      await expect(client.health()).rejects.toThrow(StorageError);
    });
  });

  describe('circuit breaker', () => {
    it('opens circuit after threshold consecutive failures', async () => {
      const client = new StorageApiClient({
        baseUrl: 'https://example.com',
        retries: 0,
        circuitBreakerThreshold: 2,
        circuitBreakerRecoveryMs: 60_000,
      });

      vi.spyOn(client as any, 'sendRequest').mockRejectedValue(new StorageError('down'));

      // Two failures → circuit threshold reached
      await expect(client.health()).rejects.toThrow(StorageError);
      await expect(client.health()).rejects.toThrow(StorageError);

      // Circuit is now OPEN — next call is blocked without hitting the network
      await expect(client.health()).rejects.toThrow(StorageError);

      // The circuit state should be 'open'
      expect(client.getCircuitStates()['https://example.com']).toBe('open');
    });

    it('records circuit trip in metrics', async () => {
      const client = new StorageApiClient({
        baseUrl: 'https://example.com',
        retries: 0,
        circuitBreakerThreshold: 1,
        circuitBreakerRecoveryMs: 60_000,
      });
      vi.spyOn(client as any, 'sendRequest').mockRejectedValue(new StorageError('down'));

      await expect(client.health()).rejects.toThrow();
      expect(client.getMetrics().circuitBreakerTrips).toBe(1);
    });

    it('recovers (circuit closes) after the recovery window elapses', async () => {
      vi.useFakeTimers();
      try {
        const client = new StorageApiClient({
          baseUrl: 'https://example.com',
          retries: 0,
          circuitBreakerThreshold: 1,
          circuitBreakerRecoveryMs: 500,
        });
        const sendSpy = vi.spyOn(client as any, 'sendRequest')
          // First call fails → opens circuit
          .mockRejectedValueOnce(new StorageError('down'))
          // Recovery probe succeeds
          .mockResolvedValueOnce({ statusCode: 200, body: JSON.stringify({ status: 'ok' }), latencyMs: 5 });

        await expect(client.health()).rejects.toThrow();
        expect(client.getCircuitStates()['https://example.com']).toBe('open');

        // Advance past the recovery window
        vi.advanceTimersByTime(600);

        // Recovery probe allowed
        await expect(client.health()).resolves.toMatchObject({ status: 'ok' });
        expect(client.getCircuitStates()['https://example.com']).toBe('closed');
        expect(sendSpy).toHaveBeenCalledTimes(2);
      } finally {
        vi.useRealTimers();
      }
    });

    it('prevents concurrent recovery probes', async () => {
      vi.useFakeTimers();
      try {
        const client = new StorageApiClient({
          baseUrl: 'https://example.com',
          retries: 0,
          circuitBreakerThreshold: 1,
          circuitBreakerRecoveryMs: 100,
        });
        const sendSpy = vi.spyOn(client as any, 'sendRequest')
          .mockRejectedValueOnce(new StorageError('down'))
          // Slow probe (won't resolve immediately — leave pending)
          .mockImplementationOnce(() => new Promise<never>(() => {}));

        await expect(client.health()).rejects.toThrow();
        vi.advanceTimersByTime(200);

        // Launch two concurrent calls after window elapses
        const p1 = client.health();
        const p2 = client.health();

        // p2 should be blocked (probe already in-flight) → reject immediately
        await expect(p2).rejects.toThrow(StorageError);

        // sendRequest should have been called only once for the probe (p1)
        expect(sendSpy).toHaveBeenCalledTimes(2); // 1 failure + 1 probe
      } finally {
        vi.useRealTimers();
      }
    });

    it('circuit stays open when recovery probe fails', async () => {
      vi.useFakeTimers();
      try {
        const client = new StorageApiClient({
          baseUrl: 'https://example.com',
          retries: 0,
          circuitBreakerThreshold: 1,
          circuitBreakerRecoveryMs: 100,
        });
        vi.spyOn(client as any, 'sendRequest').mockRejectedValue(new StorageError('still down'));

        await expect(client.health()).rejects.toThrow(); // opens circuit
        vi.advanceTimersByTime(150);
        await expect(client.health()).rejects.toThrow(); // recovery probe fails
        // Circuit re-opens
        expect(client.getCircuitStates()['https://example.com']).toBe('open');
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('metrics', () => {
    it('tracks totalRequests, successRequests, errorRequests', async () => {
      const client = new StorageApiClient({ baseUrl: 'https://example.com', retries: 0 });
      mockUndiciRequest
        .mockResolvedValueOnce(okResponse({ ok: true }))
        .mockResolvedValueOnce(errResponse(500));

      await client.health().catch(() => {});
      await client.health().catch(() => {});

      const m = client.getMetrics();
      expect(m.totalRequests).toBe(2);
      expect(m.successRequests).toBe(1);
      expect(m.errorRequests).toBe(1);
    });

    it('reports lastLatencyMs and avgLatencyMs', async () => {
      const client = new StorageApiClient({ baseUrl: 'https://example.com', retries: 0 });
      mockUndiciRequest.mockResolvedValue(okResponse({ ok: true }));
      await client.health();
      const m = client.getMetrics();
      expect(m.lastLatencyMs).toBeGreaterThanOrEqual(0);
      expect(m.avgLatencyMs).toBeGreaterThanOrEqual(0);
    });

    it('reports p95LatencyMs after 10 samples', async () => {
      const client = new StorageApiClient({ baseUrl: 'https://example.com', retries: 0 });
      mockUndiciRequest.mockResolvedValue(okResponse({ ok: true }));
      for (let i = 0; i < 10; i++) {
        await client.health();
      }
      expect(client.getMetrics().p95LatencyMs).not.toBeNull();
    });

    it('getMetrics returns a snapshot, not a live reference', async () => {
      const client = new StorageApiClient({ baseUrl: 'https://example.com', retries: 0 });
      mockUndiciRequest.mockResolvedValue(okResponse({ ok: true }));
      const m1 = client.getMetrics();
      await client.health();
      const m2 = client.getMetrics();
      expect(m1.totalRequests).toBe(0);
      expect(m2.totalRequests).toBe(1);
    });
  });

  describe('getCircuitStates', () => {
    it('returns all known endpoints with initial state closed', () => {
      const client = new StorageApiClient({
        endpoints: ['https://a.com', 'https://b.com'],
      });
      const states = client.getCircuitStates();
      expect(states['https://a.com']).toBe('closed');
      expect(states['https://b.com']).toBe('closed');
    });
  });
});

// ── LibSqlStorageAdapter integration ─────────────────────────────────────────
//
// These tests use vi.spyOn on the adapter's internal StorageApiClient instance
// rather than mocking undici responses. This approach bypasses the circuit
// breaker — which opens after bootstrap exhausts all retries at the transport
// layer — letting us test the adapter's reconnect/replay logic in isolation.

describe('LibSqlStorageAdapter with circuit breaker', () => {
  it('enters fallback mode when all endpoints are unreachable at bootstrap', async () => {
    // All undici calls fail → bootstrap health check fails → fallback mode
    mockUndiciRequest.mockReset();
    mockUndiciRequest.mockRejectedValue(new Error('ECONNREFUSED'));

    const adapter = new LibSqlStorageAdapter('https://example.com', 'token');
    await (adapter as any).ready;

    const diag = adapter.getDiagnostics();
    expect(diag.fallbackMode).toBe(true);
    expect(diag.failoverUsed).toBe(true);

    // Operations still work (in-memory fallback)
    await expect(adapter.set('k', 'v')).resolves.toBeUndefined();
    await expect(adapter.get('k')).resolves.toBe('v');
    await adapter.close();
  });

  it('recovers from fallback mode when remote becomes available', async () => {
    mockUndiciRequest.mockReset();
    mockUndiciRequest.mockRejectedValue(new Error('down'));

    const adapter = new LibSqlStorageAdapter('https://example.com', 'token');
    await (adapter as any).ready;
    expect(adapter.getDiagnostics().fallbackMode).toBe(true);

    // Spy directly on the internal client's methods so we bypass the circuit
    // breaker (which opened after bootstrap exhausted its 3 attempts).
    const internalClient = (adapter as any).client as StorageApiClient;
    vi.spyOn(internalClient, 'health').mockResolvedValueOnce({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });

    await (adapter as any).backgroundSync();

    expect(adapter.getDiagnostics().fallbackMode).toBe(false);
    await adapter.close();
  });

  it('queues pending writes in fallback mode and replays on reconnect', async () => {
    mockUndiciRequest.mockReset();
    mockUndiciRequest.mockRejectedValue(new Error('down'));

    const adapter = new LibSqlStorageAdapter('https://example.com', 'token');
    await (adapter as any).ready;

    // Write in fallback mode — queued for replay
    await adapter.set('queued-key', { hello: 'world' });
    expect(adapter.getDiagnostics().pendingWriteCount).toBe(1);

    // Spy directly on the internal client so the circuit breaker is bypassed
    const internalClient = (adapter as any).client as StorageApiClient;
    vi.spyOn(internalClient, 'health').mockResolvedValueOnce({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
    vi.spyOn(internalClient, 'set').mockResolvedValueOnce({ ok: true });

    // backgroundSync: reconnects → then calls replayPendingWrites
    await (adapter as any).backgroundSync();

    expect(adapter.getDiagnostics().pendingWriteCount).toBe(0);
    await adapter.close();
  });

  it('keeps pending writes queued when replay fails', async () => {
    mockUndiciRequest.mockReset();
    mockUndiciRequest.mockRejectedValue(new Error('down'));

    const adapter = new LibSqlStorageAdapter('https://example.com', 'token');
    await (adapter as any).ready;

    await adapter.set('k1', 'v1');
    await adapter.set('k2', 'v2');
    expect(adapter.getDiagnostics().pendingWriteCount).toBe(2);

    const internalClient = (adapter as any).client as StorageApiClient;
    // Health succeeds (reconnect) but the set replay fails
    vi.spyOn(internalClient, 'health').mockResolvedValueOnce({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
    vi.spyOn(internalClient, 'set').mockRejectedValueOnce(new StorageError('set failed'));

    await (adapter as any).backgroundSync();

    // Writes are still queued — stop-at-first-failure semantics
    expect(adapter.getDiagnostics().pendingWriteCount).toBe(2);
    await adapter.close();
  });
});

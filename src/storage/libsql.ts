import type { StorageAdapter } from './interface.js';
import { StorageError } from '../errors/index.js';
import { MemoryStorageAdapter } from './memory.js';
import {
  STORAGE_API_URL,
  STORAGE_API_ENDPOINTS,
  STORAGE_API_TOKEN,
  STORAGE_API_TIMEOUT_MS,
  STORAGE_API_RETRIES,
} from './api-config.js';
import { StorageApiClient } from './api-client.js';
import type { Logger } from '../logger/index.js';

// ─── Pending write queue ───────────────────────────────────────────────────────

interface PendingWrite {
  op: 'set' | 'delete' | 'clear';
  key?: string;
  value?: string;
  expiresAt?: number | null;
  enqueuedAt: number;
}

// ─── Diagnostics snapshot ─────────────────────────────────────────────────────

export interface StorageDiagnostics {
  /** 'remote' when connected, 'memory-fallback' when degraded. */
  provider: string;
  /** The primary remote endpoint URL. */
  endpoint: string;
  /** Current connection lifecycle state. */
  connectionState: 'connecting' | 'connected' | 'fallback' | 'closed';
  /** True when a secondary endpoint was used after the primary failed. */
  failoverUsed: boolean;
  /** True when operating in in-memory fallback mode. */
  fallbackMode: boolean;
  /** How long the initial health-check round-trip took (ms). */
  bootstrapDurationMs: number;
  /** Total number of retries issued to the remote API since startup. */
  retryCount: number;
  /** Number of writes queued for replay after reconnect. */
  pendingWriteCount: number;
  /** When the last background sync completed successfully. */
  lastSyncAt: Date | null;
  /** Human-readable message of the last storage error, if any. */
  lastError: string | null;
}

// ─── Background sync interval ─────────────────────────────────────────────────

const SYNC_INTERVAL_MS = 30_000;
const MAX_PENDING_WRITES = 1_000;

/**
 * Remote storage adapter backed by the panindigan.com storage API.
 *
 * Reliability contract:
 * - Storage failures NEVER prevent Facebook login or client startup.
 * - When the remote is unavailable, all operations fall through to an in-process
 *   memory cache so the bot stays functional.
 * - Pending writes are queued and replayed (with exponential back-off) as soon
 *   as the remote comes back online.
 * - Background sync runs every 30 s to attempt reconnection and replay.
 * - `close()` does NOT wipe remote data — it flushes the pending queue and stops
 *   background timers cleanly.
 *
 * @example
 * ```ts
 * import { LibSqlStorageAdapter } from 'panindigan-fca';
 * const adapter = new LibSqlStorageAdapter();
 * await adapter.set('foo', { bar: 1 });
 * const val = await adapter.get<{ bar: number }>('foo');
 * ```
 */
export class LibSqlStorageAdapter implements StorageAdapter {
  private readonly client: StorageApiClient;
  /** In-memory fallback — also used as a write-through cache in connected mode. */
  private readonly fallback: MemoryStorageAdapter;

  /** True when the remote is unavailable and we're operating from memory. */
  private fallbackMode = false;
  private connectionState: 'connecting' | 'connected' | 'fallback' | 'closed' = 'connecting';

  /** Writes that could not reach remote storage and are waiting for replay. */
  private readonly pendingWrites: PendingWrite[] = [];

  /** Background timer that periodically reconnects and replays pending writes. */
  private syncTimer: ReturnType<typeof setInterval> | null = null;

  /** Prevents concurrent replay runs from interleaving and reordering writes. */
  private isSyncing = false;

  // ── Diagnostics fields ────────────────────────────────────────────────────────
  private bootstrapDurationMs = 0;
  private failoverUsed = false;
  private retryCount = 0;
  private lastSyncAt: Date | null = null;
  private lastError: string | null = null;
  private readonly activeEndpoint: string;

  private readonly logger?: Logger;

  /**
   * A promise that resolves once the bootstrap health-check completes (whether
   * the remote was reachable or not). Awaited by `ensureReady()` so that the
   * very first operation waits for the result of the health-check before deciding
   * which path (remote or fallback) to use.
   */
  private readonly ready: Promise<void>;

  constructor(
    baseUrl: string = STORAGE_API_URL,
    apiToken: string = STORAGE_API_TOKEN,
    logger?: Logger,
  ) {
    this.logger = logger;

    const endpoints = STORAGE_API_ENDPOINTS
      ? STORAGE_API_ENDPOINTS.split(',').map((e) => e.trim()).filter(Boolean)
      : undefined;

    this.client = new StorageApiClient({
      baseUrl,
      endpoints,
      authToken: apiToken,
      timeoutMs: STORAGE_API_TIMEOUT_MS,
      retries: STORAGE_API_RETRIES,
    });

    // Determine the display endpoint (first from list or default)
    const allEndpoints = endpoints?.length
      ? endpoints
      : baseUrl
        ? baseUrl.split(',').map((e) => e.trim()).filter(Boolean)
        : [];
    this.activeEndpoint = allEndpoints[0] ?? 'https://storage.panindigan.com';

    this.fallback = new MemoryStorageAdapter();

    // Bootstrap is fire-and-forget — it MUST NOT throw from the constructor.
    this.ready = this.bootstrap();
  }

  // ── Bootstrap & failover ──────────────────────────────────────────────────────

  private async bootstrap(): Promise<void> {
    const startMs = Date.now();
    try {
      await this.client.health();
      this.bootstrapDurationMs = Date.now() - startMs;
      this.connectionState = 'connected';

      this.logger?.success('Remote storage connected', {
        tag: 'STORAGE',
        provider: 'remote',
        endpoint: this.activeEndpoint,
        bootstrapDurationMs: this.bootstrapDurationMs,
        fallbackMode: false,
        failoverUsed: this.failoverUsed,
        connectionState: 'connected',
      });
    } catch (err) {
      this.bootstrapDurationMs = Date.now() - startMs;
      this.fallbackMode = true;
      this.failoverUsed = true;   // adapter entered degraded mode — track for diagnostics
      this.connectionState = 'fallback';
      this.lastError = err instanceof Error ? err.message : String(err);

      // IMPORTANT: do NOT throw — storage must never block Facebook login.
      this.logger?.warn(
        'Remote storage unavailable — operating in memory fallback mode. ' +
          'Writes are queued for sync when the remote comes back online.',
        {
          tag: 'STORAGE',
          provider: 'memory-fallback',
          endpoint: this.activeEndpoint,
          bootstrapDurationMs: this.bootstrapDurationMs,
          fallbackMode: true,
          failoverUsed: false,
          connectionState: 'fallback',
          error: this.lastError,
        },
      );
    } finally {
      // Always start the background sync so we can recover when the remote
      // comes back, or flush pending writes when reconnected.
      this.startBackgroundSync();
    }
  }

  // ── Background sync ───────────────────────────────────────────────────────────

  private startBackgroundSync(): void {
    // Do not start if close() already ran — guard against a race where bootstrap
    // finishes in its `finally` block after close() has already been called.
    if (this.connectionState === 'closed') return;
    if (this.syncTimer) return;

    this.syncTimer = setInterval(() => {
      this.backgroundSync().catch(() => {
        // Errors are logged inside backgroundSync — swallow to prevent
        // unhandled-rejection warnings from the interval callback.
      });
    }, SYNC_INTERVAL_MS);
    this.syncTimer.unref?.();
  }

  private async backgroundSync(): Promise<void> {
    if (this.connectionState === 'closed') return;
    // Single-flight guard: skip this tick if a replay is already in-flight.
    // This prevents concurrent replays from interleaving and reordering writes.
    if (this.isSyncing) return;

    this.isSyncing = true;
    try {
      if (this.fallbackMode) {
        // Attempt to reach the remote and switch back to connected mode.
        try {
          await this.client.health();
          this.fallbackMode = false;
          this.connectionState = 'connected';
          this.lastError = null;

          this.logger?.success('Remote storage reconnected after fallback period', {
            tag: 'STORAGE',
            endpoint: this.activeEndpoint,
            pendingWrites: this.pendingWrites.length,
            connectionState: 'connected',
          });

          await this.replayPendingWrites();
        } catch {
          // Still unreachable — stay in fallback, try again on the next cycle.
          return;
        }
      } else if (this.pendingWrites.length > 0) {
        // Online but there are queued writes from transient errors — flush them.
        await this.replayPendingWrites();
      }

      this.lastSyncAt = new Date();
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Replay the pending write queue in strict FIFO order.
   *
   * Ordering guarantee: we process the head of the queue one write at a time.
   * On the first failure we stop immediately so that a later `set` can never
   * land on the remote before an earlier `clear` that preceded it.
   * Failed writes stay at the head of the queue and are retried on the next
   * sync cycle.
   */
  private async replayPendingWrites(): Promise<void> {
    let replayed = 0;
    let stopped = false;

    while (this.pendingWrites.length > 0) {
      const write = this.pendingWrites[0]!;
      try {
        if (write.op === 'set' && write.key !== undefined && write.value !== undefined) {
          await this.client.set(write.key, write.value, write.expiresAt ?? null);
        } else if (write.op === 'delete' && write.key !== undefined) {
          await this.client.delete(write.key);
        } else if (write.op === 'clear') {
          await this.client.clear();
        }
        // Write succeeded — remove from queue head, preserving tail ordering.
        this.pendingWrites.shift();
        replayed++;
        this.retryCount++;
      } catch {
        // Write failed — stop here to avoid reordering subsequent operations.
        stopped = true;
        break;
      }
    }

    if (replayed > 0 || stopped) {
      this.logger?.info('Pending write queue sync', {
        tag: 'STORAGE',
        replayed,
        failedAtHead: stopped,
        remainingQueue: this.pendingWrites.length,
      });
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  private async ensureReady(): Promise<void> {
    // Wait for the bootstrap health-check to finish so the first operation
    // uses the correct path (remote or fallback). Subsequent calls are instant
    // because the promise has already resolved.
    await this.ready;
  }

  private enqueuePendingWrite(write: PendingWrite): void {
    if (this.pendingWrites.length < MAX_PENDING_WRITES) {
      this.pendingWrites.push(write);
      this.retryCount++;
    }
  }

  // ── StorageAdapter interface ──────────────────────────────────────────────────

  async get<T>(key: string): Promise<T | undefined> {
    await this.ensureReady();

    if (this.fallbackMode) {
      return this.fallback.get<T>(key);
    }

    try {
      const result = await this.client.get(key);
      if (!result.found || result.value === null) {
        return undefined;
      }

      if (result.expiresAt !== null && Date.now() > result.expiresAt) {
        // Best-effort expiry cleanup — don't wait.
        this.client.delete(key).catch(() => {});
        return undefined;
      }

      const parsed = JSON.parse(result.value) as T;
      // Keep the fallback in sync for immediate reads after a remote write.
      await this.fallback.set(key, parsed, undefined);
      return parsed;
    } catch (err) {
      this.lastError = err instanceof Error ? err.message : String(err);
      this.logger?.warn('Storage remote get failed — serving from fallback cache', {
        tag: 'STORAGE',
        key,
        error: this.lastError,
      });
      return this.fallback.get<T>(key);
    }
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    await this.ensureReady();

    const serialized = JSON.stringify(value);
    const expiresAt = ttlMs !== undefined ? Date.now() + ttlMs : null;

    // Always write through to the in-memory fallback first for read consistency.
    await this.fallback.set(key, value, ttlMs);

    if (this.fallbackMode) {
      this.enqueuePendingWrite({ op: 'set', key, value: serialized, expiresAt, enqueuedAt: Date.now() });
      return;
    }

    try {
      await this.client.set(key, serialized, expiresAt);
    } catch (err) {
      this.lastError = err instanceof Error ? err.message : String(err);
      this.logger?.warn('Storage remote set failed — write queued for sync', {
        tag: 'STORAGE',
        key,
        error: this.lastError,
      });
      this.enqueuePendingWrite({ op: 'set', key, value: serialized, expiresAt, enqueuedAt: Date.now() });
    }
  }

  async delete(key: string): Promise<void> {
    await this.ensureReady();

    await this.fallback.delete(key);

    if (this.fallbackMode) {
      this.enqueuePendingWrite({ op: 'delete', key, enqueuedAt: Date.now() });
      return;
    }

    try {
      await this.client.delete(key);
    } catch (err) {
      this.lastError = err instanceof Error ? err.message : String(err);
      this.enqueuePendingWrite({ op: 'delete', key, enqueuedAt: Date.now() });
    }
  }

  async clear(): Promise<void> {
    await this.ensureReady();

    await this.fallback.clear();

    if (this.fallbackMode) {
      this.enqueuePendingWrite({ op: 'clear', enqueuedAt: Date.now() });
      return;
    }

    try {
      await this.client.clear();
    } catch (err) {
      throw new StorageError('Storage API clear failed', {}, err);
    }
  }

  async has(key: string): Promise<boolean> {
    return (await this.get(key)) !== undefined;
  }

  async close(): Promise<void> {
    this.connectionState = 'closed';

    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }

    // Flush any outstanding pending writes before shutdown (best-effort).
    if (this.pendingWrites.length > 0 && !this.fallbackMode) {
      try {
        await this.replayPendingWrites();
      } catch {
        // Ignore — we are shutting down.
      }
    }

    // IMPORTANT: do NOT call this.client.clear() here. Calling clear() on
    // close would wipe ALL remote data, destroying persistence across restarts.
  }

  // ── Diagnostics ───────────────────────────────────────────────────────────────

  /** Return a structured diagnostics snapshot for observability tooling. */
  getDiagnostics(): StorageDiagnostics {
    return {
      provider: this.fallbackMode ? 'memory-fallback' : 'remote',
      endpoint: this.activeEndpoint,
      connectionState: this.connectionState,
      failoverUsed: this.failoverUsed,
      fallbackMode: this.fallbackMode,
      bootstrapDurationMs: this.bootstrapDurationMs,
      retryCount: this.retryCount,
      pendingWriteCount: this.pendingWrites.length,
      lastSyncAt: this.lastSyncAt,
      lastError: this.lastError,
    };
  }
}

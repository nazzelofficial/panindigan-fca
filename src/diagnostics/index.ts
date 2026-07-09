import { writeFile } from 'node:fs/promises';
import { Session } from 'node:inspector';
import { PerformanceObserver, type PerformanceEntry } from 'node:perf_hooks';
import type { CacheManager } from '../cache/index.js';
import type { Logger } from '../logger/index.js';
import type { SessionTokens } from '../auth/index.js';
import type { TypedEventEmitter } from '../events/index.js';

export interface DiagnosticsStats {
  session: {
    startedAt: Date;
    userId: string;
    isConnected: boolean;
  };
  http: {
    requestCount: number;
    errorCount: number;
    p50Ms: number;
    p90Ms: number;
    p99Ms: number;
  };
  mqtt: {
    isConnected: boolean;
    reconnectCount: number;
    lastReconnectMs: number | null;
  };
  cache: {
    hitCount: number;
    missCount: number;
    hitRate: number;
    entryCount: number;
  };
  memory: {
    heapUsedMb: number;
    heapTotalMb: number;
    rss: number;
  };
  gc: {
    majorCount: number;
    totalFreedMb: number;
  };
  uptime: number;
}

export interface HealthCheckResult {
  ok: boolean;
  latencyMs: number;
  checkedAt: Date;
  details: Record<string, unknown>;
}

const MEMORY_HIGH_THRESHOLD_MB = 400;
const MEMORY_POLL_INTERVAL_MS = 30_000;

function toMb(bytes: number): number {
  return Math.round((bytes / 1024 / 1024) * 10) / 10;
}

export class DiagnosticsModule {
  private readonly startedAt = new Date();
  private httpRequestCount = 0;
  private httpErrorCount = 0;
  private readonly httpLatencies: number[] = [];
  private mqttConnected = false;
  private mqttReconnectCount = 0;
  private mqttLastReconnectMs: number | null = null;

  // GC tracking via PerformanceObserver
  private gcMajorCount = 0;
  private gcTotalFreedBytes = 0;
  private gcObserver: PerformanceObserver | null = null;

  // Memory polling
  private memoryPollTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly cache: CacheManager,
    private readonly logger: Logger,
    private readonly getTokens: () => SessionTokens,
    private readonly getIsConnected: () => boolean,
    private readonly runHealthPing: () => Promise<number>,
    private readonly emitter?: TypedEventEmitter,
  ) {
    this.startGcMonitoring();
    this.startMemoryMonitoring();
  }

  private startGcMonitoring(): void {
    try {
      this.gcObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // GC major collections are kind === 2 (in Node.js perf_hooks)
          // kind is available on PerformanceEntry when entryType === 'gc'
          const gcEntry = entry as PerformanceEntry & { kind?: number; detail?: { kind?: number } };
          const kind = gcEntry.kind ?? gcEntry.detail?.['kind'] ?? 0;

          // kind 2 = major GC (mark-sweep), kind 4 = incremental marking
          const isMajor = kind === 2 || kind === 4;
          if (!isMajor) continue;

          const durationMs = Math.round(entry.duration);
          // Node.js does not expose exact freed bytes via perf_hooks; estimate from heap delta
          const mem = process.memoryUsage();
          const heapUsedMb = toMb(mem.heapUsed);
          const heapTotalMb = toMb(mem.heapTotal);
          // Approximate freed = difference between total and used (rough heuristic)
          const freedMb = Math.max(0, heapTotalMb - heapUsedMb);

          this.gcMajorCount++;
          this.gcTotalFreedBytes += freedMb * 1024 * 1024;

          this.logger.debug('Major GC event', { tag: 'DIAGNOSTICS', durationMs, freedMb });
          this.emitter?.emit('gc:major', { durationMs, freedMb });
        }
      });

      this.gcObserver.observe({ entryTypes: ['gc'], buffered: false });
    } catch {
      // perf_hooks GC observation may not be available in all environments — silently skip
    }
  }

  private startMemoryMonitoring(): void {
    this.memoryPollTimer = setInterval(() => {
      const mem = process.memoryUsage();
      const heapUsedMb = toMb(mem.heapUsed);
      const heapTotalMb = toMb(mem.heapTotal);

      if (heapUsedMb > MEMORY_HIGH_THRESHOLD_MB) {
        this.logger.warn('High memory usage detected', {
          tag: 'DIAGNOSTICS',
          heapUsedMb,
          heapTotalMb,
          threshold: MEMORY_HIGH_THRESHOLD_MB,
        });
        this.emitter?.emit('memory:high', {
          heapUsedMb,
          heapTotalMb,
          threshold: MEMORY_HIGH_THRESHOLD_MB,
        });
      }
    }, MEMORY_POLL_INTERVAL_MS);
    // Unref so the timer does not prevent the Node.js process from exiting
    this.memoryPollTimer.unref?.();
  }

  /** Called by the HTTP layer to track request metrics. */
  recordHttpRequest(latencyMs: number, isError: boolean): void {
    this.httpRequestCount++;
    this.httpLatencies.push(latencyMs);
    if (this.httpLatencies.length > 10000) {
      // Sliding window — keep the last 10 000 samples
      this.httpLatencies.splice(0, this.httpLatencies.length - 10000);
    }
    if (isError) this.httpErrorCount++;
  }

  /** Called by the MQTT layer to track connection state. */
  recordMqttState(isConnected: boolean, reconnectCount: number, lastReconnectMs: number | null): void {
    this.mqttConnected = isConnected;
    this.mqttReconnectCount = reconnectCount;
    if (lastReconnectMs !== null) this.mqttLastReconnectMs = lastReconnectMs;
  }

  getStats(): DiagnosticsStats {
    const tokens = this.getTokens();
    const cacheStats = this.cache.getStats();
    const mem = process.memoryUsage();

    const sorted = [...this.httpLatencies].sort((a, b) => a - b);
    const p = (pct: number): number => {
      if (sorted.length === 0) return 0;
      const idx = Math.floor((pct / 100) * sorted.length);
      return sorted[Math.min(idx, sorted.length - 1)] ?? 0;
    };

    return {
      session: {
        startedAt: this.startedAt,
        userId: tokens.userId,
        isConnected: this.getIsConnected(),
      },
      http: {
        requestCount: this.httpRequestCount,
        errorCount: this.httpErrorCount,
        p50Ms: Math.round(p(50)),
        p90Ms: Math.round(p(90)),
        p99Ms: Math.round(p(99)),
      },
      mqtt: {
        isConnected: this.mqttConnected,
        reconnectCount: this.mqttReconnectCount,
        lastReconnectMs: this.mqttLastReconnectMs,
      },
      cache: cacheStats,
      memory: {
        heapUsedMb: toMb(mem.heapUsed),
        heapTotalMb: toMb(mem.heapTotal),
        rss: toMb(mem.rss),
      },
      gc: {
        majorCount: this.gcMajorCount,
        totalFreedMb: Math.round(this.gcTotalFreedBytes / 1024 / 1024),
      },
      uptime: Math.round((Date.now() - this.startedAt.getTime()) / 1000),
    };
  }

  async heapSnapshot(outputPath: string): Promise<void> {
    this.logger.info('Writing heap snapshot', { tag: 'DIAGNOSTICS', outputPath });
    return new Promise<void>((resolve, reject) => {
      const session = new Session();
      session.connect();

      const chunks: string[] = [];

      session.on('HeapProfiler.addHeapSnapshotChunk', ({ params }) => {
        chunks.push(params.chunk);
      });

      session.post('HeapProfiler.takeHeapSnapshot', { reportProgress: false }, (err) => {
        session.disconnect();
        if (err) {
          reject(err);
          return;
        }
        writeFile(outputPath, chunks.join(''), 'utf8').then(resolve).catch(reject);
      });
    });
  }

  async healthCheck(): Promise<HealthCheckResult> {
    this.logger.debug('Running health check', { tag: 'DIAGNOSTICS' });
    const checkedAt = new Date();

    let latencyMs = 0;
    let ok = true;
    const details: Record<string, unknown> = {};

    try {
      const start = performance.now();
      latencyMs = await this.runHealthPing();
      if (latencyMs === 0) latencyMs = Math.round(performance.now() - start);
      details['http'] = 'ok';
      details['mqtt'] = this.mqttConnected ? 'connected' : 'disconnected';
    } catch (err) {
      ok = false;
      details['error'] = err instanceof Error ? err.message : String(err);
    }

    const stats = this.getStats();
    details['uptime'] = stats.uptime;
    details['heapUsedMb'] = stats.memory.heapUsedMb;

    // Only signal healthy when the check actually passed
    if (ok) {
      this.emitter?.emit('account:healthy', { checkedAt });
    }

    return { ok, latencyMs, checkedAt, details };
  }

  /** Stop background monitoring timers. Call on client disconnect. */
  destroy(): void {
    if (this.gcObserver) {
      try { this.gcObserver.disconnect(); } catch { /* ignore */ }
      this.gcObserver = null;
    }
    if (this.memoryPollTimer) {
      clearInterval(this.memoryPollTimer);
      this.memoryPollTimer = null;
    }
  }
}

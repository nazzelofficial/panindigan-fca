import { CookieJar } from 'tough-cookie';
import { hydrateJar, validateAppState, type AppStateCookie } from '../cookies/index.js';
import { StorageError } from '../errors/index.js';
import {
  STORAGE_API_URL,
  STORAGE_API_ENDPOINTS,
  STORAGE_API_TOKEN,
  STORAGE_API_TIMEOUT_MS,
  STORAGE_API_RETRIES,
} from '../storage/api-config.js';
import { StorageApiClient } from '../storage/api-client.js';

export interface SessionRow {
  id: string;
  userId: string | null;
  appState: AppStateCookie[];
  createdAt: number;
  updatedAt: number;
  expiresAt: number | null;
}

/**
 * Remote storage-backed session store.
 *
 * Manages session state through the remote Panindigan storage API.
 *
 * **Reliability contract:** a bootstrap failure (network unavailable, API down,
 * wrong credentials) never prevents client startup. All operations degrade
 * gracefully — saves are silently dropped and restores return `null` — so the
 * bot can still authenticate and run in memory-only mode until the remote
 * comes back online.
 *
 * @example
 * ```ts
 * const store = new LibSqlSessionStore();
 * await store.save('default', appState, { userId: '100012345' });
 * const result = await store.restore('default');
 * ```
 */
export class LibSqlSessionStore {
  private readonly client: StorageApiClient;
  /** True when the bootstrap health-check failed — all ops are no-ops. */
  private degradedMode = false;
  private readonly ready: Promise<void>;

  constructor(
    baseUrl: string = STORAGE_API_URL,
    apiToken: string = STORAGE_API_TOKEN,
  ) {
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

    // Bootstrap MUST NOT throw — see reliability contract above.
    this.ready = this.bootstrap();
  }

  private async bootstrap(): Promise<void> {
    try {
      await this.client.health();
    } catch {
      // Remote is unavailable — operate in degraded mode. Facebook login will
      // still succeed; sessions just won't be persisted until the remote returns.
      this.degradedMode = true;
    }
  }

  private async ensureReady(): Promise<void> {
    await this.ready;
    // degradedMode is checked per-operation — do not throw here.
  }

  /**
   * Save (insert or replace) a session.
   *
   * @param id        — arbitrary session key, e.g. `'default'` or a Facebook user ID
   * @param appState  — validated array of AppState cookies
   * @param opts.userId   — Facebook user ID to associate (optional)
   * @param opts.ttlMs    — time-to-live in milliseconds (optional)
   */
  async save(
    id: string,
    appState: AppStateCookie[],
    opts?: { userId?: string; ttlMs?: number },
  ): Promise<void> {
    await this.ensureReady();
    if (this.degradedMode) return; // silently skip in degraded mode

    try {
      await this.client.sessionSave(id, appState as unknown[], opts?.userId, opts?.ttlMs);
    } catch (err) {
      throw new StorageError(`Session store save failed for id "${id}"`, { id }, err);
    }
  }

  /**
   * Restore a session by id. Returns `null` if not found, expired, or when in
   * degraded mode.
   */
  async restore(
    id: string,
  ): Promise<{ jar: CookieJar; appState: AppStateCookie[]; row: SessionRow } | null> {
    await this.ensureReady();
    if (this.degradedMode) return null; // no remote to query

    try {
      const result = await this.client.sessionRestore(id);
      if (!result.found || !result.appState) return null;

      const appState = validateAppState(result.appState as unknown[]);
      const jar = hydrateJar(appState);

      return {
        jar,
        appState,
        row: {
          id: result.id ?? id,
          userId: result.userId ?? null,
          appState,
          createdAt: result.createdAt ?? Date.now(),
          updatedAt: result.updatedAt ?? Date.now(),
          expiresAt: result.expiresAt ?? null,
        },
      };
    } catch (err) {
      throw new StorageError(`Session store restore failed for id "${id}"`, { id }, err);
    }
  }

  /**
   * Fetch all non-expired sessions, optionally filtered by user_id.
   * Returns an empty array in degraded mode.
   */
  async list(userId?: string): Promise<SessionRow[]> {
    await this.ensureReady();
    if (this.degradedMode) return [];

    try {
      const result = await this.client.sessionList(userId);
      return result.sessions.map((s) => ({
        id: s.id,
        userId: s.userId,
        appState: validateAppState(s.appState as unknown[]),
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        expiresAt: s.expiresAt,
      }));
    } catch (err) {
      throw new StorageError('Session store list failed', { userId }, err);
    }
  }

  /**
   * Delete a session by id. No-op in degraded mode.
   */
  async delete(id: string): Promise<void> {
    await this.ensureReady();
    if (this.degradedMode) return;

    try {
      await this.client.sessionDelete(id);
    } catch (err) {
      throw new StorageError(`Session store delete failed for id "${id}"`, { id }, err);
    }
  }

  /**
   * Delete all expired sessions (housekeeping). Returns 0 in degraded mode.
   */
  async purgeExpired(): Promise<number> {
    await this.ensureReady();
    if (this.degradedMode) return 0;

    try {
      const result = await this.client.sessionPurgeExpired();
      return result.deletedCount;
    } catch (err) {
      throw new StorageError('Session store purgeExpired failed', {}, err);
    }
  }

  /**
   * Touch updated_at and optionally extend TTL for an existing session.
   * No-op in degraded mode.
   */
  async touch(id: string, ttlMs?: number): Promise<void> {
    await this.ensureReady();
    if (this.degradedMode) return;

    try {
      await this.client.sessionTouch(id, ttlMs);
    } catch (err) {
      throw new StorageError(`Session store touch failed for id "${id}"`, { id }, err);
    }
  }

  async close(): Promise<void> {
    if (this.degradedMode) return;
    try {
      await this.purgeExpired();
    } catch {
      // ignore close errors
    }
  }
}

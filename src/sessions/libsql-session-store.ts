import { CookieJar } from 'tough-cookie';
import { hydrateJar, validateAppState, type AppStateCookie } from '../cookies/index.js';
import { StorageError } from '../errors/index.js';
import { STORAGE_API_URL, STORAGE_API_ENDPOINTS, STORAGE_API_TOKEN, STORAGE_API_TIMEOUT_MS, STORAGE_API_RETRIES } from '../storage/api-config.js';
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
 * Manages session state through a remote HTTPS storage API.
 * The remote worker handles structured session operations including
 * user-id filtering, TTL management, and expiration cleanup.
 *
 * @example
 * ```ts
 * const store = new LibSqlSessionStore();
 * await store.save('default', appState, { userId: '100012345' });
 * const { jar, appState } = await store.restore('default') ?? {};
 * ```
 */
export class LibSqlSessionStore {
  private readonly client: StorageApiClient;
  private readonly ready: Promise<void>;

  constructor(
    baseUrl: string = STORAGE_API_URL,
    apiToken: string = STORAGE_API_TOKEN,
  ) {
    const endpoints = STORAGE_API_ENDPOINTS
      ? STORAGE_API_ENDPOINTS.split(',').map(e => e.trim()).filter(Boolean)
      : undefined;

    this.client = new StorageApiClient({
      baseUrl,
      endpoints,
      authToken: apiToken,
      timeoutMs: STORAGE_API_TIMEOUT_MS,
      retries: STORAGE_API_RETRIES,
    });
    this.ready = this.bootstrap();
  }

  private async bootstrap(): Promise<void> {
    try {
      await this.client.health();
    } catch (err) {
      throw new StorageError('Session store bootstrap failed', {}, err);
    }
  }

  private async ensureReady(): Promise<void> {
    await this.ready;
  }

  /**
   * Save (insert or replace) a session.
   *
   * @param id      — arbitrary session key, e.g. `'default'` or a Facebook user ID
   * @param appState — validated array of AppState cookies
   * @param opts.userId   — Facebook user ID to associate (optional)
   * @param opts.ttlMs    — time-to-live in milliseconds (optional)
   */
  async save(
    id: string,
    appState: AppStateCookie[],
    opts?: { userId?: string; ttlMs?: number },
  ): Promise<void> {
    await this.ensureReady();
    try {
      await this.client.sessionSave(id, appState as unknown[], opts?.userId, opts?.ttlMs);
    } catch (err) {
      throw new StorageError(`Session store save failed for id "${id}"`, { id }, err);
    }
  }

  /**
   * Restore a session by id. Returns null if not found or expired.
   */
  async restore(id: string): Promise<{ jar: CookieJar; appState: AppStateCookie[]; row: SessionRow } | null> {
    await this.ensureReady();
    try {
      const result = await this.client.sessionRestore(id);
      if (!result.found || !result.appState) {
        return null;
      }

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
   */
  async list(userId?: string): Promise<SessionRow[]> {
    await this.ensureReady();
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
   * Delete a session by id.
   */
  async delete(id: string): Promise<void> {
    await this.ensureReady();
    try {
      await this.client.sessionDelete(id);
    } catch (err) {
      throw new StorageError(`Session store delete failed for id "${id}"`, { id }, err);
    }
  }

  /**
   * Delete all expired sessions (housekeeping).
   */
  async purgeExpired(): Promise<number> {
    await this.ensureReady();
    try {
      const result = await this.client.sessionPurgeExpired();
      return result.deletedCount;
    } catch (err) {
      throw new StorageError('Session store purgeExpired failed', {}, err);
    }
  }

  /**
   * Touch updated_at and optionally extend TTL for an existing session.
   */
  async touch(id: string, ttlMs?: number): Promise<void> {
    await this.ensureReady();
    try {
      await this.client.sessionTouch(id, ttlMs);
    } catch (err) {
      throw new StorageError(`Session store touch failed for id "${id}"`, { id }, err);
    }
  }

  async close(): Promise<void> {
    try {
      await this.purgeExpired();
    } catch {
      // ignore
    }
  }
}

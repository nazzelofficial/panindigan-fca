import type { LibSqlSessionStore, SessionRow } from './libsql-session-store.js';

/**
 * High-level sessions API exposed on `client.sessions`.
 *
 * Wraps {@link LibSqlSessionStore} with a friendly interface for inspecting
 * and managing all bot sessions stored in the remote storage backend.
 *
 * @example
 * ```ts
 * // List every active session
 * const all = await client.sessions.list();
 *
 * // Sessions for one specific account
 * const mine = await client.sessions.list('100012345');
 *
 * // Delete a stale session
 * await client.sessions.delete('100099999');
 *
 * // Housekeeping — remove expired rows
 * const removed = await client.sessions.purgeExpired();
 * ```
 */
export class SessionsModule {
  constructor(private readonly store: LibSqlSessionStore) {}

  /**
   * List all active (non-expired) sessions.
   *
   * @param userId  — optional Facebook user ID filter; omit to return all sessions.
   * @returns       Sorted by `updatedAt` descending (most recently active first).
   */
  async list(userId?: string): Promise<SessionRow[]> {
    return this.store.list(userId);
  }

  /**
   * Retrieve a single session by its key (Facebook user ID or `'default'`).
   * Returns `null` if the session does not exist or has expired.
   */
  async get(id: string): Promise<SessionRow | null> {
    const result = await this.store.restore(id);
    return result ? result.row : null;
  }

  /**
   * Delete a session by id.
   * No-op if the session does not exist.
   */
  async delete(id: string): Promise<void> {
    return this.store.delete(id);
  }

  /**
   * Delete all sessions whose TTL has elapsed.
   * @returns the number of rows removed.
   */
  async purgeExpired(): Promise<number> {
    return this.store.purgeExpired();
  }

  /**
   * Touch a session to reset its `updatedAt` timestamp and optionally extend
   * its TTL. Useful for keeping long-running bots alive.
   *
   * @param id    — session key
   * @param ttlMs — new TTL in ms from now (omit to leave existing TTL unchanged)
   */
  async touch(id: string, ttlMs?: number): Promise<void> {
    return this.store.touch(id, ttlMs);
  }
}

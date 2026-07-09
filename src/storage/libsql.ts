import type { StorageAdapter } from './interface.js';
import { StorageError } from '../errors/index.js';
import { STORAGE_API_URL, STORAGE_API_ENDPOINTS, STORAGE_API_TOKEN, STORAGE_API_TIMEOUT_MS, STORAGE_API_RETRIES } from './api-config.js';
import { StorageApiClient } from './api-client.js';

/**
 * Remote storage adapter.
 *
 * Stores key-value pairs through a remote HTTPS storage API instead of
 * direct database connections. The remote worker handles all persistence,
 * encryption, and credential management. Supports per-entry TTL and
 * preserves the existing adapter interface for callers.
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
  private readonly apiUrl: string;
  private readonly ready: Promise<void>;

  constructor(
    baseUrl: string = STORAGE_API_URL,
    apiToken: string = STORAGE_API_TOKEN,
  ) {
    this.apiUrl = baseUrl;
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
      throw new StorageError('Storage API bootstrap failed', { apiUrl: this.apiUrl }, err);
    }
  }

  private async ensureReady(): Promise<void> {
    await this.ready;
  }

  async get<T>(key: string): Promise<T | undefined> {
    await this.ensureReady();
    try {
      const result = await this.client.get(key);
      if (!result.found || result.value === null) {
        return undefined;
      }

      if (result.expiresAt !== null && Date.now() > result.expiresAt) {
        await this.client.delete(key);
        return undefined;
      }

      return JSON.parse(result.value) as T;
    } catch (err) {
      throw new StorageError(`Storage API get failed for key "${key}"`, { key }, err);
    }
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    await this.ensureReady();
    try {
      const expiresAt = ttlMs !== undefined ? Date.now() + ttlMs : null;
      await this.client.set(key, JSON.stringify(value), expiresAt);
    } catch (err) {
      throw new StorageError(`Storage API set failed for key "${key}"`, { key }, err);
    }
  }

  async delete(key: string): Promise<void> {
    await this.ensureReady();
    try {
      await this.client.delete(key);
    } catch (err) {
      throw new StorageError(`Storage API delete failed for key "${key}"`, { key }, err);
    }
  }

  async clear(): Promise<void> {
    await this.ensureReady();
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
    try {
      await this.client.clear();
    } catch {
      // ignore close errors
    }
  }
}

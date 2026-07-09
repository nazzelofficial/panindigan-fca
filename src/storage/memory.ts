import type { StorageAdapter, StorageEntry } from './interface.js';
import { StorageError } from '../errors/index.js';

export class MemoryStorageAdapter implements StorageAdapter {
  private readonly store = new Map<string, StorageEntry<unknown>>();

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const entry = this.store.get(key);
      if (!entry) return undefined;
      if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
        this.store.delete(key);
        return undefined;
      }
      return entry.value as T;
    } catch (err) {
      throw new StorageError(`Memory get failed for key "${key}"`, { key }, err);
    }
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    try {
      const expiresAt = ttlMs !== undefined ? Date.now() + ttlMs : null;
      this.store.set(key, { value, expiresAt });
    } catch (err) {
      throw new StorageError(`Memory set failed for key "${key}"`, { key }, err);
    }
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  async has(key: string): Promise<boolean> {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }
}

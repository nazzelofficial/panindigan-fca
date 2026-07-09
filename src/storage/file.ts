import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname } from 'node:path';
import type { StorageAdapter, StorageEntry } from './interface.js';
import { StorageError } from '../errors/index.js';

export class FileStorageAdapter implements StorageAdapter {
  private data: Record<string, StorageEntry<unknown>> = {};
  private dirty = false;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly filePath: string) {}

  async init(): Promise<void> {
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    if (existsSync(this.filePath)) {
      try {
        const raw = await readFile(this.filePath, 'utf8');
        this.data = JSON.parse(raw) as Record<string, StorageEntry<unknown>>;
      } catch (err) {
        throw new StorageError(`Failed to load file storage from ${this.filePath}`, { filePath: this.filePath }, err);
      }
    }
  }

  private scheduleFlush(): void {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      this.flush().catch(() => {});
    }, 200);
  }

  private async flush(): Promise<void> {
    if (!this.dirty) return;
    const now = Date.now();
    for (const [key, entry] of Object.entries(this.data)) {
      if (entry.expiresAt !== null && now > entry.expiresAt) {
        delete this.data[key];
      }
    }
    try {
      await writeFile(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
      this.dirty = false;
    } catch (err) {
      throw new StorageError(`Failed to write file storage to ${this.filePath}`, { filePath: this.filePath }, err);
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    const entry = this.data[key];
    if (!entry) return undefined;
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      delete this.data[key];
      this.dirty = true;
      this.scheduleFlush();
      return undefined;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    const expiresAt = ttlMs !== undefined ? Date.now() + ttlMs : null;
    this.data[key] = { value, expiresAt };
    this.dirty = true;
    this.scheduleFlush();
  }

  async delete(key: string): Promise<void> {
    if (key in this.data) {
      delete this.data[key];
      this.dirty = true;
      this.scheduleFlush();
    }
  }

  async clear(): Promise<void> {
    this.data = {};
    this.dirty = true;
    await this.flush();
  }

  async has(key: string): Promise<boolean> {
    return (await this.get(key)) !== undefined;
  }

  async close(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();
  }
}

export type { StorageAdapter, StorageEntry } from './interface.js';
export { MemoryStorageAdapter } from './memory.js';
export { FileStorageAdapter } from './file.js';
export { LibSqlStorageAdapter } from './libsql.js';

import type { StorageAdapter } from './interface.js';
import { MemoryStorageAdapter } from './memory.js';
import { FileStorageAdapter } from './file.js';
import { LibSqlStorageAdapter } from './libsql.js';
import type { Config } from '../config/index.js';
import type { Logger } from '../logger/index.js';
import { ConfigurationError } from '../errors/index.js';

export async function createStorageAdapter(config: Config, logger?: Logger): Promise<StorageAdapter> {
  const adapter = config.storage.adapter;

  if (adapter === 'libsql') {
    return new LibSqlStorageAdapter(undefined, undefined, logger);
  }

  if (adapter === 'file') {
    const path = config.session.persistPath ?? './panindigan-storage.json';
    const instance = new FileStorageAdapter(path);
    await instance.init();
    return instance;
  }

  if (adapter === 'redis') {
    throw new ConfigurationError(
      'The "redis" storage adapter requires ioredis to be installed and a custom RedisStorageAdapter. ' +
        'Pass a custom StorageAdapter instance to createClient({ storage: ... }) instead.',
      { adapter },
    );
  }

  return new MemoryStorageAdapter();
}

import { CookieJar } from 'tough-cookie';
import type { StorageAdapter } from '../storage/index.js';
import type { TypedEventEmitter } from '../events/index.js';
import type { Logger } from '../logger/index.js';
import type { Config } from '../config/index.js';
import { hydrateJar, validateAppState, type AppStateCookie } from '../cookies/index.js';
import { LibSqlSessionStore } from './libsql-session-store.js';

export type { SessionRow } from './libsql-session-store.js';
export { LibSqlSessionStore } from './libsql-session-store.js';
export { SessionsModule } from './module.js';

const SESSION_KEY = 'session:appstate';

export async function persistSession(
  appState: AppStateCookie[],
  storage: StorageAdapter,
  persistPath: string,
  emitter: TypedEventEmitter,
  logger: Logger,
): Promise<void> {
  await storage.set(SESSION_KEY, appState);
  emitter.emit('session:saved', { persistPath });
  logger.debug('Session persisted', { tag: 'SESSION', persistPath });
}

export async function restoreSession(
  storage: StorageAdapter,
  persistPath: string,
  emitter: TypedEventEmitter,
  logger: Logger,
): Promise<{ jar: CookieJar; appState: AppStateCookie[] } | null> {
  const saved = await storage.get<AppStateCookie[]>(SESSION_KEY);
  if (!saved || !Array.isArray(saved) || saved.length === 0) return null;

  try {
    const validated = validateAppState(saved);
    const jar = hydrateJar(validated);
    emitter.emit('session:restored', { persistPath });
    logger.info('Session restored from storage', { tag: 'SESSION', persistPath });
    return { jar, appState: validated };
  } catch (err) {
    logger.warn('Failed to restore saved session — starting fresh', { tag: 'SESSION', err });
    await storage.delete(SESSION_KEY);
    return null;
  }
}

export function createFreshJar(): CookieJar {
  return new CookieJar();
}

export async function resolveJar(options: {
  appState?: AppStateCookie[];
  /**
   * Facebook user ID hint — when provided, the session is looked up by this
   * key first before falling back to `'default'`. Allows multiple bots to
   * share the same remote storage backend without session collisions.
   */
  userId?: string;
  config: Config;
  storage: StorageAdapter;
  emitter: TypedEventEmitter;
  logger: Logger;
  sessionStore?: LibSqlSessionStore;
}): Promise<{ jar: CookieJar; appState: AppStateCookie[] | null }> {
  const { appState, userId, config, storage, emitter, logger, sessionStore } = options;

  if (appState) {
    const validated = validateAppState(appState);
    const jar = hydrateJar(validated);
    // Pre-save under the hint userId if available, otherwise 'default'.
    // The factory will re-key to the real userId after auth completes.
    if (sessionStore) {
      const key = userId ?? 'default';
      await sessionStore.save(key, validated, { userId: userId ?? undefined }).catch(() => undefined);
    }
    return { jar, appState: validated };
  }

  if (config.session.restoreOnStart) {
    if (sessionStore) {
      // Try the specific userId key first, then fall back to 'default'.
      const keys = userId ? [userId, 'default'] : ['default'];
      for (const key of keys) {
        const result = await sessionStore.restore(key).catch(() => null);
        if (result) {
          emitter.emit('session:restored', { persistPath: `storage:sessions:${key}` });
          logger.info('Session restored from remote storage', { tag: 'SESSION', key });
          return { jar: result.jar, appState: result.appState };
        }
      }
    } else if (config.session.persistPath) {
      const restored = await restoreSession(storage, config.session.persistPath, emitter, logger);
      if (restored) return { jar: restored.jar, appState: restored.appState };
    }
  }

  return { jar: createFreshJar(), appState: null };
}

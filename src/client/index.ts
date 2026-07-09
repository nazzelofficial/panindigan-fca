import { CookieJar } from 'tough-cookie';
import { TypedEventEmitter } from '../events/index.js';
import { createLogger, type Logger } from '../logger/index.js';
import { loadConfig, type Config } from '../config/index.js';
import { createStorageAdapter } from '../storage/index.js';
import type { StorageAdapter } from '../storage/index.js';
import { ProxyManager, resolveProxyUrl, maskProxyUrl, type ProxyOptions } from '../proxy/index.js';
import { CacheManager } from '../cache/index.js';
import { StealthManager } from '../stealth/index.js';
import { MiddlewarePipeline, type Middleware } from '../middleware/index.js';
import { HttpClient } from '../http/index.js';
import { MqttClient } from '../mqtt/index.js';
import { createAuthManager, type AuthManager, type SessionTokens } from '../auth/index.js';
import { resolveJar, LibSqlSessionStore, SessionsModule } from '../sessions/index.js';
import { MessagesModule } from '../messages/index.js';
import { ThreadsModule } from '../threads/index.js';
import { UsersModule } from '../users/index.js';
import { PresenceModule } from '../presence/index.js';
import { SearchModule } from '../search/index.js';
import { FilesModule } from '../files/index.js';
import { PollsModule } from '../polls/index.js';
import { StickersModule } from '../stickers/index.js';
import { DiagnosticsModule } from '../diagnostics/index.js';
import type { ClientEventMap } from '../events/index.js';
import type { AppStateCookie } from '../cookies/index.js';
import { exportJar } from '../cookies/index.js';
import { FB_BASE_URL } from '../constants/index.js';
import { ConfigurationError } from '../errors/index.js';

export interface ClientOptions {
  /** AppState cookies from a browser export. */
  appState?: AppStateCookie[];
  /** Email/password credentials — AppState is strongly preferred. */
  credentials?: {
    email: string;
    password: string;
    twoFactorCode?: string;
  };
  session?: {
    persistPath?: string;
    restoreOnStart?: boolean;
  };
  refresh?: {
    checkInterval?: number;
    threshold?: number;
    retries?: number;
    failSilently?: boolean;
    autoPersist?: boolean;
  };
  keepalive?: {
    enabled?: boolean;
    interval?: number;
    onFailure?: 'warn' | 'throw' | 'reconnect';
  };
  stealth?: {
    level?: 'off' | 'low' | 'medium' | 'high' | 'paranoid';
    delays?: Config['stealth']['delays'];
    typingSimulation?: Config['stealth']['typingSimulation'];
    rateLimit?: Config['stealth']['rateLimit'];
    warmup?: Config['stealth']['warmup'];
  };
  /**
   * Proxy configuration.
   * - String shorthand: `proxy: "socks5://127.0.0.1:1080"`
   * - Object form:      `proxy: { url: "http://proxy:8080" }`
   * - Pool form:        `proxy: { pool: [...], rotateEvery: 100 }`
   *
   * Supported protocols: http, https, socks4, socks4a, socks5, socks5h.
   * Credentials in the URL (`user:pass@host`) are forwarded automatically.
   * Falls back to `PFCA_PROXY_URL` environment variable when omitted.
   */
  proxy?: ProxyOptions | {
    url?: string;
    rotateEvery?: number;
    pool?: string[];
    healthCheck?: boolean;
    failOnUnhealthy?: boolean;
  };
  http?: {
    maxConnections?: number;
    timeout?: { connect?: number; request?: number; body?: number };
    retries?: { max?: number; baseDelay?: number };
  };
  cache?: {
    ttl?: number;
    maxSize?: number;
  };
  /**
   * Facebook user ID hint — used to restore the correct session when multiple
   * bots share the same storage backend. If omitted, restoration falls back to
   * the `'default'` session key.
   */
  userId?: string;
  /** Custom storage adapter — overrides the default adapter selection. */
  storage?: StorageAdapter;
  logLevel?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  logPretty?: boolean;
  /** Custom logger — overrides the built-in pino logger. */
  logger?: Logger;
  /** Additional middleware to inject into the request/response pipeline. */
  middleware?: Middleware[];
}

export type { ClientEventMap } from '../events/index.js';

/**
 * The main PandindiganFCA client.
 *
 * Exposes typed event subscription via `on`, `off`, and `once`.
 * All subsystems share a single internal event bus so every emitted event
 * is visible to consumers through this client.
 *
 * Instantiate via {@link createClient}.
 */
export class PandindiganClient {
  readonly messages: MessagesModule;
  readonly threads: ThreadsModule;
  readonly users: UsersModule;
  readonly presence: PresenceModule;
  readonly search: SearchModule;
  readonly files: FilesModule;
  readonly polls: PollsModule;
  readonly stickers: StickersModule;
  readonly sessions: SessionsModule;
  readonly auth: AuthManager;
  readonly diagnostics: DiagnosticsModule;

  /** @internal */
  private readonly http: HttpClient;
  /** @internal */
  private readonly mqtt: MqttClient;
  /** @internal */
  private readonly jar: CookieJar;
  /** @internal */
  private readonly storage: StorageAdapter;
  /** @internal */
  private readonly sessionStore: LibSqlSessionStore;
  /** @internal */
  private readonly config: Config;
  /** @internal */
  private readonly logger: Logger;
  /** @internal */
  private readonly cache: CacheManager;
  /** @internal — the single shared emitter for all subsystems */
  private readonly emitter: TypedEventEmitter;

  // ─── Typed event delegation ───────────────────────────────────────────────

  on<K extends keyof ClientEventMap>(
    event: K,
    listener: (...args: ClientEventMap[K]) => void,
  ): this {
    this.emitter.on(event, listener as (...args: unknown[]) => void);
    return this;
  }

  off<K extends keyof ClientEventMap>(
    event: K,
    listener: (...args: ClientEventMap[K]) => void,
  ): this {
    this.emitter.off(event, listener as (...args: unknown[]) => void);
    return this;
  }

  once<K extends keyof ClientEventMap>(
    event: K,
    listener: (...args: ClientEventMap[K]) => void,
  ): this {
    this.emitter.once(event, listener as (...args: unknown[]) => void);
    return this;
  }

  /** @internal — ProxyManager for the MQTT WebSocket agent; closed on disconnect. */
  private readonly mqttProxyManager?: ProxyManager;

  /** @internal — use {@link createClient} */
  constructor(internal: {
    jar: CookieJar;
    config: Config;
    logger: Logger;
    storage: StorageAdapter;
    cache: CacheManager;
    http: HttpClient;
    mqtt: MqttClient;
    auth: AuthManager;
    emitter: TypedEventEmitter;
    sessionStore: LibSqlSessionStore;
    sessions: SessionsModule;
    getTokens: () => SessionTokens;
    mqttProxyManager?: ProxyManager;
  }) {
    this.jar = internal.jar;
    this.config = internal.config;
    this.logger = internal.logger;
    this.storage = internal.storage;
    this.sessionStore = internal.sessionStore;
    this.sessions = internal.sessions;
    this.cache = internal.cache;
    this.http = internal.http;
    this.mqtt = internal.mqtt;
    this.auth = internal.auth;
    this.emitter = internal.emitter;
    this.mqttProxyManager = internal.mqttProxyManager;

    const { getTokens } = internal;

    this.messages = new MessagesModule(this.http, this.cache, this.emitter, this.logger, getTokens);
    this.threads = new ThreadsModule(this.http, this.cache, this.emitter, this.logger, getTokens);
    this.users = new UsersModule(this.http, this.cache, this.logger, getTokens);
    this.presence = new PresenceModule(this.http, this.cache, this.emitter, this.logger, getTokens);
    this.search = new SearchModule(this.http, this.logger, getTokens);
    this.files = new FilesModule(this.http, this.emitter, this.logger, getTokens);
    this.polls = new PollsModule(this.http, this.logger, getTokens);
    this.stickers = new StickersModule(this.http, this.cache, this.logger, getTokens);

    this.diagnostics = new DiagnosticsModule(
      this.cache,
      this.logger,
      getTokens,
      () => this.mqtt.getStats().isConnected,
      async () => {
        const start = performance.now();
        await this.http.get(`${FB_BASE_URL}/`);
        return Math.round(performance.now() - start);
      },
      this.emitter,
    );
  }

  /**
   * Open the real-time MQTT/WebSocket connection to receive live events.
   * Must be called after {@link createClient} if you need real-time events.
   */
  async connect(): Promise<void> {
    await this.mqtt.connect();
  }

  /**
   * Gracefully disconnect — drains queued operations, sends MQTT DISCONNECT,
   * persists the updated AppState (when autoPersist is on), and closes all
   * connections.
   */
  async disconnect(): Promise<void> {
    this.logger.info('Disconnecting client', { tag: 'CLIENT' });

    // Stop auth background workers first
    this.auth.stopTimers();

    // Stop diagnostics monitoring
    this.diagnostics.destroy();

    if (this.config.refresh.autoPersist) {
      try {
        const appState = await exportJar(this.jar);
        const userId = this.auth.tokens.userId;
        await this.sessionStore.save(userId, appState, { userId });
        this.logger.debug('AppState persisted to the configured session store on disconnect', {
          tag: 'CLIENT',
          userId,
        });
      } catch (err) {
        this.logger.warn('Failed to persist AppState on disconnect', { tag: 'CLIENT', err });
      }
    }

    await this.mqtt.disconnect();
    await this.http.close();

    // Release MQTT proxy agent if one was created.
    if (this.mqttProxyManager) {
      try { await this.mqttProxyManager.close(); } catch { /* ignore */ }
    }

    await this.sessionStore.close();
    if (this.storage.close) await this.storage.close();

    this.logger.info('Client disconnected', { tag: 'CLIENT' });
  }
}

/**
 * Create and initialize a {@link PandindiganClient}.
 *
 * @example
 * ```ts
 * import { createClient } from 'panindigan-fca';
 * import { readFileSync } from 'node:fs';
 *
 * const appState = JSON.parse(readFileSync('./appstate.json', 'utf8'));
 * const client = await createClient({ appState });
 *
 * client.on('message', async (event) => {
 *   console.log(`${event.senderName}: ${event.body}`);
 * });
 *
 * await client.connect();
 * ```
 */
/**
 * Alias for {@link createClient}. Use as:
 * ```ts
 * import { login } from 'panindigan-fca';
 * const client = await login({ appState });
 * ```
 */
export const login = (options: ClientOptions = {}): Promise<PandindiganClient> =>
  createClient(options);

export async function createClient(options: ClientOptions = {}): Promise<PandindiganClient> {
  if (!options.appState && !options.credentials) {
    // Allow session restore without explicit appState/credentials
    if (!options.session?.persistPath && !process.env['PFCA_SESSION_PERSIST_PATH']) {
      throw new ConfigurationError(
        'createClient requires either appState, credentials, or a session.persistPath to restore from',
      );
    }
  }

  // ── Build config ─────────────────────────────────────────────────────────
  const rawOverrides: Record<string, unknown> = {};
  if (options.logLevel) rawOverrides['logLevel'] = options.logLevel;
  if (options.logPretty !== undefined) rawOverrides['logPretty'] = options.logPretty;
  if (options.session) rawOverrides['session'] = options.session;
  if (options.refresh) rawOverrides['refresh'] = options.refresh;
  if (options.keepalive) rawOverrides['keepalive'] = options.keepalive;
  if (options.stealth) rawOverrides['stealth'] = options.stealth;
  if (options.proxy) {
    // Accept string shorthand: proxy: "socks5://..." → { url: "socks5://..." }
    if (typeof options.proxy === 'string') {
      rawOverrides['proxy'] = { url: options.proxy };
    } else {
      rawOverrides['proxy'] = options.proxy;
    }
  }
  if (options.http) rawOverrides['http'] = options.http;
  if (options.cache) rawOverrides['cache'] = options.cache;

  const config = loadConfig(rawOverrides);

  // ── Logger ───────────────────────────────────────────────────────────────
  const logger = options.logger ?? createLogger({
    level: config.logLevel,
    pretty: config.logPretty,
    bindings: { tag: 'PFCA' },
  });

  logger.info('Initializing panindigan-fca client', { tag: 'CLIENT' });

  // ── Single shared emitter — all subsystems share this instance ────────────
  const emitter = new TypedEventEmitter();

  // ── Storage ──────────────────────────────────────────────────────────────
  const storage = options.storage ?? await createStorageAdapter(config);

  // ── Session store (Remote Storage API-backed) ─────────────────
  const sessionStore = new LibSqlSessionStore();

  // ── Session jar ──────────────────────────────────────────────────────────
  const { jar } = await resolveJar({
    appState: options.appState,
    userId: options.userId,
    config,
    storage,
    emitter,
    logger,
    sessionStore,
  });

  // ── Cache ─────────────────────────────────────────────────────────────────
  const cache = new CacheManager({ maxSize: config.cache.maxSize, ttlMs: config.cache.ttl });

  // ── Stealth ───────────────────────────────────────────────────────────────
  const stealth = new StealthManager(config.stealth, emitter, logger);

  // ── Middleware pipeline ───────────────────────────────────────────────────
  const pipeline = new MiddlewarePipeline();
  for (const mw of options.middleware ?? []) pipeline.use(mw);

  // ── HTTP client ───────────────────────────────────────────────────────────
  // Pass the shared emitter so HttpClient can emit slow:request and proxy:rotate events
  const http = new HttpClient(jar, config, stealth, pipeline, logger, emitter);

  // Initialize SOCKS proxies asynchronously (no-op when no SOCKS proxies configured)
  await http.init();

  // ── Auth ──────────────────────────────────────────────────────────────────
  const auth = await createAuthManager({
    appState: options.appState,
    credentials: options.credentials,
    jar,
    http,
    emitter,
    storage,
    config,
    logger: logger.child({ tag: 'AUTH' }),
  });

  // ── Key the session under the real Facebook user ID ───────────────────────
  // resolveJar may have restored under 'default'; now that we know the real
  // userId, re-save so subsequent restores use the correct per-user key.
  try {
    const latestAppState = await exportJar(jar);
    await sessionStore.save(auth.tokens.userId, latestAppState, { userId: auth.tokens.userId });
    logger.debug('Session keyed under userId', { tag: 'SESSION', userId: auth.tokens.userId });
  } catch (err) {
    logger.warn('Failed to key session under userId — will retry on disconnect', { tag: 'SESSION', err });
  }

  // ── Start auth background workers ─────────────────────────────────────────
  auth.startRefreshTimer();
  if (config.keepalive.enabled) {
    auth.startKeepaliveTimer();
  }

  const getTokens = (): SessionTokens => auth.tokens;

  // ── Proxy WebSocket agent (for MQTT) ──────────────────────────────────────
  // Build a WebSocket-compatible HTTPS agent from the primary proxy URL so
  // MQTT connections honour the same proxy as HTTP requests.
  // Resolve primary proxy URL for MQTT — prefer config.proxy.url, fall back to
  // the first pool entry so MQTT honours the same proxy as HTTP requests even
  // when the caller uses only the pool option.
  const mqttProxyUrl = config.proxy.url ?? config.proxy.pool[0] ?? null;
  let wsAgent: import('node:https').Agent | undefined;
  let mqttProxyManager: ProxyManager | undefined;
  if (mqttProxyUrl) {
    try {
      mqttProxyManager = new ProxyManager(mqttProxyUrl);
      wsAgent = await mqttProxyManager.getWebSocketAgent();
      logger.debug('WebSocket proxy agent ready', {
        tag: 'MQTT',
        proxy: mqttProxyManager.maskedUrl,
        protocol: mqttProxyManager.protocol,
      });
    } catch (err) {
      logger.warn('Failed to create WebSocket proxy agent — MQTT will connect directly', {
        tag: 'MQTT',
        proxy: maskProxyUrl(mqttProxyUrl),
        err,
      });
      mqttProxyManager = undefined;
    }
  }

  // ── MQTT ────────────────────────────────────────────────────────────────────
  // Presence-cache callback: invoked by MqttClient whenever a /t_p packet
  // arrives so that PresenceModule.get() returns up-to-date data without an
  // extra network round-trip.  Presence module is constructed below; use a
  // closure so the reference resolves after client construction.
  let presenceModuleRef: { updateCache: (u: string, o: boolean, l: Date | null) => void } | null = null;
  const mqtt = new MqttClient(
    jar,
    auth.tokens.userId,
    emitter,
    config,
    logger,
    (userId, isOnline, lastActiveAt) => presenceModuleRef?.updateCache(userId, isOnline, lastActiveAt),
    wsAgent,
  );

  logger.info('Client ready', { tag: 'CLIENT', userId: auth.tokens.userId });

  const sessions = new SessionsModule(sessionStore);

  const client = new PandindiganClient({
    jar,
    config,
    logger,
    storage,
    cache,
    http,
    mqtt,
    auth,
    emitter,
    sessionStore,
    sessions,
    getTokens,
    mqttProxyManager,
  });

  // Resolve the presence-module back-reference now that client is constructed.
  presenceModuleRef = client.presence;

  // ── Wire diagnostics ───────────────────────────────────────────────────────
  // HTTP: record every request's latency into diagnostics
  http.setRequestRecorder((latencyMs, isError) => {
    client.diagnostics.recordHttpRequest(latencyMs, isError);
  });

  // MQTT: mirror connection state into diagnostics via emitter events
  emitter.on('connected', () => {
    client.diagnostics.recordMqttState(true, mqtt.getStats().reconnectCount, null);
  });
  emitter.on('disconnected', () => {
    client.diagnostics.recordMqttState(false, mqtt.getStats().reconnectCount, null);
  });
  emitter.on('reconnected', (ev) => {
    client.diagnostics.recordMqttState(true, mqtt.getStats().reconnectCount, ev.durationMs);
  });
  emitter.on('reconnect:failed', () => {
    client.diagnostics.recordMqttState(false, mqtt.getStats().reconnectCount, null);
  });

  // Persist the rotated AppState whenever the background refresh timer fires.
  emitter.on('account:refresh', (ev) => {
    sessionStore
      .save(ev.userId, ev.appState, { userId: ev.userId })
      .then(() => logger.debug('Session updated after cookie refresh', {
        tag: 'SESSION',
        userId: ev.userId,
        cookieCount: ev.cookieCount,
      }))
      .catch((err: unknown) => logger.warn('Failed to persist refreshed session', {
        tag: 'SESSION',
        userId: ev.userId,
        err,
      }));
  });

  return client;
}

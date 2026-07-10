import { CookieJar } from 'tough-cookie';
import { EventEmitter } from 'eventemitter3';
import { z } from 'zod';
import { Agent, ProxyAgent } from 'undici';
import * as https from 'node:https';
import { Readable } from 'node:stream';

interface AppStateCookie {
    key: string;
    value: string;
    domain: string;
    path: string;
    hostOnly?: boolean;
    creation?: string;
    lastAccessed?: string;
    secure?: boolean;
    httpOnly?: boolean;
    expires?: string | number;
    sameSite?: string;
}
declare function validateAppState(appState: unknown): AppStateCookie[];
declare function hydrateJar(appState: AppStateCookie[]): CookieJar;
declare function exportJar(jar: CookieJar): Promise<AppStateCookie[]>;
declare function getUserIdFromJar(jar: CookieJar): string;

interface MessageEvent {
    messageId: string;
    threadId: string;
    senderId: string;
    senderName: string;
    body: string | null;
    attachments: MessageAttachment[];
    timestamp: Date;
    isGroup: boolean;
    /** ID of the message being replied to, if this is a reply. */
    replyTo?: string;
}
interface MessageAttachment {
    id: string;
    type: string;
    url?: string;
    name?: string;
    size?: number;
    /** Present when type === 'sticker' */
    stickerId?: string;
    /** Present when type === 'share' */
    shareTitle?: string;
    /** Present when type === 'share' */
    shareDescription?: string;
}
interface MessageReactionEvent {
    messageId: string;
    threadId: string;
    senderId: string;
    senderName: string;
    reaction: string;
    timestamp: Date;
}
interface MessageReactionRemovedEvent {
    messageId: string;
    threadId: string;
    senderId: string;
    timestamp: Date;
}
interface MessageUnsendEvent {
    messageId: string;
    threadId: string;
    senderId: string;
    timestamp: Date;
}
interface MessageDeliveredEvent {
    messageId: string;
    threadId: string;
    deliveredTo: string[];
    timestamp: Date;
}
interface MessageSeenEvent {
    messageId: string;
    threadId: string;
    seenBy: string[];
    timestamp: Date;
}
interface ThreadTypingEvent {
    threadId: string;
    senderId: string;
    senderName: string;
    isTyping: boolean;
}
interface ThreadReadEvent {
    threadId: string;
    readBy: string[];
    upToTimestamp: Date;
}
interface ThreadRenamedEvent {
    threadId: string;
    newName: string;
    changedBy: string;
}
interface ThreadParticipantAddedEvent {
    threadId: string;
    addedUserId: string;
    addedByUserId: string;
}
interface ThreadParticipantRemovedEvent {
    threadId: string;
    removedUserId: string;
    removedByUserId: string;
}
interface ThreadPhotoChangedEvent {
    threadId: string;
    newPhotoUrl: string;
    changedBy: string;
}
interface ThreadMutedEvent {
    threadId: string;
    mutedUntil: Date | null;
}
interface ThreadArchivedEvent {
    threadId: string;
    /** true = moved to archive, false = moved back to inbox */
    archived: boolean;
}
interface PresenceUpdateEvent {
    userId: string;
    isOnline: boolean;
    lastActiveAt: Date | null;
}
interface ConnectedEvent {
    timestamp: Date;
}
interface DisconnectedEvent {
    reason: string;
    willReconnect: boolean;
}
interface ReconnectingEvent {
    attempt: number;
    maxAttempts: number;
    delayMs: number;
}
interface ReconnectedEvent {
    attempt: number;
    durationMs: number;
}
interface ReconnectFailedEvent {
    attempts: number;
    lastError: Error;
}
interface AppStateRefreshFailedEvent {
    error: Error;
    attempts: number;
}
interface AccountRefreshFailedEvent {
    /** Facebook user ID of the affected account (null if session was never bootstrapped). */
    userId: string | null;
    /** The error that caused the failure. */
    error: Error;
    /** How many consecutive failures have occurred (resets to 0 on next success). */
    attempts: number;
    /** Max attempts before the refresh timer gives up (from config). */
    maxAttempts: number;
    /** Whether the timer will try again on the next interval. */
    willRetry: boolean;
    /** Approximate Date when the next retry will fire (based on checkInterval). */
    nextRetryAt: Date;
    /** When this failure occurred. */
    lastFailedAt: Date;
}
interface SessionRestoredEvent {
    persistPath: string;
}
interface SessionSavedEvent {
    persistPath: string;
}
interface AccountCheckpointEvent {
    checkpointUrl: string;
    reason: string;
}
interface AccountRestrictedEvent {
    feature: string;
    until: Date;
}
interface AccountWarningEvent {
    message: string;
    source: string;
}
interface AccountSuspendedEvent {
    reason: string;
}
interface AccountHealthyEvent {
    checkedAt: Date;
}
interface AccountStaleEvent {
    /** Facebook user ID of the affected account (null if session never bootstrapped). */
    userId: string | null;
    /** The last error that exhausted all retry attempts. */
    lastError: Error;
    /** Total consecutive failures that occurred before giving up. */
    attempts: number;
    /** When the session was declared stale. */
    staleSince: Date;
    /** A human-readable hint for the operator. */
    hint: string;
}
interface AccountRefreshEvent {
    /** Facebook user ID of the account whose cookies were rotated. */
    userId: string;
    /** The updated AppState cookie array — persist or hand off as needed. */
    appState: AppStateCookie[];
    /** Number of cookies in the new AppState. */
    cookieCount: number;
    /** Freshly extracted fb_dtsg token. */
    dtsg: string;
    /** Freshly extracted lsd token. */
    lsd: string;
    /** When the refresh completed. */
    refreshedAt: Date;
}
interface ProxyRotateEvent {
    from: string;
    to: string;
    requestCount: number;
}
interface ProxyFailedEvent {
    url: string;
    error: Error;
}
interface ProxyHealthyEvent {
    url: string;
    latencyMs: number;
}
interface UploadProgressEvent {
    uploadId: string;
    bytesTransferred: number;
    totalBytes: number;
    percent: number;
}
interface UploadCompleteEvent {
    uploadId: string;
    attachmentToken: string;
}
interface UploadFailedEvent {
    uploadId: string;
    error: Error;
}
interface DownloadProgressEvent {
    url: string;
    bytesTransferred: number;
    totalBytes: number;
    percent: number;
}
interface DownloadCompleteEvent {
    url: string;
    bytesWritten: number;
}
interface DownloadFailedEvent {
    url: string;
    error: Error;
}
interface SlowRequestEvent {
    url: string;
    durationMs: number;
    threshold: number;
}
interface MemoryHighEvent {
    heapUsedMb: number;
    heapTotalMb: number;
    threshold: number;
}
interface GcMajorEvent {
    durationMs: number;
    freedMb: number;
}
interface StealthWarmupStartEvent {
    targetRateLimitRpm: number;
}
interface StealthWarmupCompleteEvent {
    durationMs: number;
}
interface StealthRateLimitDetectedEvent {
    endpoint: string;
    retryAfterMs: number;
}
interface StealthRateLimitClearedEvent {
    endpoint: string;
}
interface StealthFingerprintAssignedEvent {
    userAgent: string;
    platform: string;
    locale: string;
}
interface ClientEventMap {
    'message': [MessageEvent];
    'message:reaction': [MessageReactionEvent];
    'message:reaction:removed': [MessageReactionRemovedEvent];
    'message:unsend': [MessageUnsendEvent];
    'message:delivered': [MessageDeliveredEvent];
    'message:seen': [MessageSeenEvent];
    'thread:typing': [ThreadTypingEvent];
    'thread:read': [ThreadReadEvent];
    'thread:renamed': [ThreadRenamedEvent];
    'thread:participant:added': [ThreadParticipantAddedEvent];
    'thread:participant:removed': [ThreadParticipantRemovedEvent];
    'thread:photo:changed': [ThreadPhotoChangedEvent];
    'thread:muted': [ThreadMutedEvent];
    'thread:archived': [ThreadArchivedEvent];
    'presence:update': [PresenceUpdateEvent];
    'presence:typing': [{
        userId: string;
        threadId: string;
        isTyping: boolean;
    }];
    'appstate:update': [AppStateCookie[]];
    'appstate:refresh:failed': [AppStateRefreshFailedEvent];
    'account:refresh:failed': [AccountRefreshFailedEvent];
    'session:expired': [];
    'session:restored': [SessionRestoredEvent];
    'session:saved': [SessionSavedEvent];
    'connected': [ConnectedEvent];
    'disconnected': [DisconnectedEvent];
    'reconnecting': [ReconnectingEvent];
    'reconnected': [ReconnectedEvent];
    'reconnect:failed': [ReconnectFailedEvent];
    'account:checkpoint': [AccountCheckpointEvent];
    'account:restricted': [AccountRestrictedEvent];
    'account:warning': [AccountWarningEvent];
    'account:suspended': [AccountSuspendedEvent];
    'account:healthy': [AccountHealthyEvent];
    'account:refresh': [AccountRefreshEvent];
    'account:stale': [AccountStaleEvent];
    'proxy:rotate': [ProxyRotateEvent];
    'proxy:failed': [ProxyFailedEvent];
    'proxy:healthy': [ProxyHealthyEvent];
    'upload:progress': [UploadProgressEvent];
    'upload:complete': [UploadCompleteEvent];
    'upload:failed': [UploadFailedEvent];
    'download:progress': [DownloadProgressEvent];
    'download:complete': [DownloadCompleteEvent];
    'download:failed': [DownloadFailedEvent];
    'slow:request': [SlowRequestEvent];
    'memory:high': [MemoryHighEvent];
    'gc:major': [GcMajorEvent];
    'stealth:warmup:start': [StealthWarmupStartEvent];
    'stealth:warmup:complete': [StealthWarmupCompleteEvent];
    'stealth:ratelimit:detected': [StealthRateLimitDetectedEvent];
    'stealth:ratelimit:cleared': [StealthRateLimitClearedEvent];
    'stealth:fingerprint:assigned': [StealthFingerprintAssignedEvent];
    'ratelimit:detected': [{
        retryAfterMs: number;
        endpoint: string;
    }];
    'ratelimit:cleared': [{
        endpoint: string;
    }];
}
declare class TypedEventEmitter extends EventEmitter<ClientEventMap> {
}

interface Logger {
    trace(msg: string, ctx?: Record<string, unknown>): void;
    debug(msg: string, ctx?: Record<string, unknown>): void;
    info(msg: string, ctx?: Record<string, unknown>): void;
    warn(msg: string, ctx?: Record<string, unknown>): void;
    error(msg: string, ctx?: Record<string, unknown>): void;
    fatal(msg: string, ctx?: Record<string, unknown>): void;
    child(bindings: Record<string, unknown>): Logger;
}
declare function createLogger(options: {
    level?: string;
    pretty?: boolean;
    bindings?: Record<string, unknown>;
}): Logger;

declare const configSchema: z.ZodObject<{
    logLevel: z.ZodDefault<z.ZodEnum<{
        info: "info";
        fatal: "fatal";
        error: "error";
        warn: "warn";
        debug: "debug";
        trace: "trace";
    }>>;
    logPretty: z.ZodDefault<z.ZodBoolean>;
    http: z.ZodDefault<z.ZodObject<{
        maxConnections: z.ZodDefault<z.ZodNumber>;
        timeout: z.ZodDefault<z.ZodObject<{
            connect: z.ZodDefault<z.ZodNumber>;
            request: z.ZodDefault<z.ZodNumber>;
            body: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strip>>;
        retries: z.ZodDefault<z.ZodObject<{
            max: z.ZodDefault<z.ZodNumber>;
            baseDelay: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    mqtt: z.ZodDefault<z.ZodObject<{
        reconnect: z.ZodDefault<z.ZodObject<{
            maxAttempts: z.ZodDefault<z.ZodNumber>;
            baseDelay: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strip>>;
        heartbeat: z.ZodDefault<z.ZodObject<{
            interval: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    cache: z.ZodDefault<z.ZodObject<{
        ttl: z.ZodDefault<z.ZodNumber>;
        maxSize: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>>;
    session: z.ZodDefault<z.ZodObject<{
        persistPath: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        restoreOnStart: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
    storage: z.ZodDefault<z.ZodObject<{
        adapter: z.ZodDefault<z.ZodEnum<{
            memory: "memory";
            file: "file";
            libsql: "libsql";
            redis: "redis";
        }>>;
    }, z.core.$strip>>;
    stealth: z.ZodDefault<z.ZodObject<{
        level: z.ZodDefault<z.ZodEnum<{
            off: "off";
            low: "low";
            medium: "medium";
            high: "high";
            paranoid: "paranoid";
        }>>;
        delays: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            actionDelay: z.ZodDefault<z.ZodObject<{
                min: z.ZodDefault<z.ZodNumber>;
                max: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strip>>;
            messageDelay: z.ZodDefault<z.ZodObject<{
                min: z.ZodDefault<z.ZodNumber>;
                max: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strip>>;
            paginationDelay: z.ZodDefault<z.ZodObject<{
                min: z.ZodDefault<z.ZodNumber>;
                max: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        typingSimulation: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            wpm: z.ZodDefault<z.ZodObject<{
                min: z.ZodDefault<z.ZodNumber>;
                max: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strip>>;
            naturalPauses: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strip>>;
        rateLimit: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            requestsPerMinute: z.ZodDefault<z.ZodNumber>;
            minInterval: z.ZodDefault<z.ZodNumber>;
            onOverload: z.ZodDefault<z.ZodEnum<{
                queue: "queue";
                drop: "drop";
                throw: "throw";
            }>>;
        }, z.core.$strip>>;
        userAgent: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            seed: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>;
        fingerprint: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            consistent: z.ZodDefault<z.ZodBoolean>;
            seed: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>;
        warmup: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            duration: z.ZodDefault<z.ZodNumber>;
            startFraction: z.ZodDefault<z.ZodNumber>;
            emitEvent: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    refresh: z.ZodDefault<z.ZodObject<{
        checkInterval: z.ZodDefault<z.ZodNumber>;
        threshold: z.ZodDefault<z.ZodNumber>;
        retries: z.ZodDefault<z.ZodNumber>;
        failSilently: z.ZodDefault<z.ZodBoolean>;
        autoPersist: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
    keepalive: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        interval: z.ZodDefault<z.ZodNumber>;
        onFailure: z.ZodDefault<z.ZodEnum<{
            warn: "warn";
            reconnect: "reconnect";
            throw: "throw";
        }>>;
    }, z.core.$strip>>;
    proxy: z.ZodDefault<z.ZodObject<{
        url: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        rotateEvery: z.ZodDefault<z.ZodNullable<z.ZodNumber>>;
        pool: z.ZodDefault<z.ZodArray<z.ZodString>>;
        healthCheck: z.ZodDefault<z.ZodBoolean>;
        failOnUnhealthy: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strip>;
type Config = z.infer<typeof configSchema>;
declare function loadConfig(overrides?: Partial<Record<string, unknown>>): Config;

interface StorageAdapter {
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    has(key: string): Promise<boolean>;
    close?(): Promise<void>;
}

declare class MemoryStorageAdapter implements StorageAdapter {
    private readonly store;
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    has(key: string): Promise<boolean>;
}

declare class FileStorageAdapter implements StorageAdapter {
    private readonly filePath;
    private data;
    private dirty;
    private flushTimer;
    constructor(filePath: string);
    init(): Promise<void>;
    private scheduleFlush;
    private flush;
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    has(key: string): Promise<boolean>;
    close(): Promise<void>;
}

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
declare class LibSqlStorageAdapter implements StorageAdapter {
    private readonly client;
    private readonly apiUrl;
    private readonly ready;
    constructor(baseUrl?: string, apiToken?: string);
    private bootstrap;
    private ensureReady;
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    has(key: string): Promise<boolean>;
    close(): Promise<void>;
}

/**
 * ProxyManager — central proxy layer for panindigan-fca.
 *
 * Owns URL parsing, validation, agent construction, and connection reuse for
 * every outbound network connection made by the library (HTTP, MQTT/WebSocket).
 * Proxy credentials are masked in all logs and error messages.
 */

/** Object form of proxy configuration. */
interface ProxyConfig {
    url: string;
}
/** Proxy option accepted by `createClient` — string shorthand or object. */
type ProxyOptions = string | ProxyConfig;
/**
 * Mask proxy URL credentials for safe logging.
 * `http://user:pass@host:8080` → `http://***:***@host:8080`
 */
declare function maskProxyUrl(url: string): string;
/**
 * Normalise a `ProxyOptions` value (string shorthand or object) to a URL string.
 * Returns `null` when proxy is not configured.
 */
declare function resolveProxyUrl(option?: ProxyOptions | null): string | null;
/**
 * Manages a single proxy connection — parses, validates, and caches the
 * undici dispatcher and WebSocket agent so they are never recreated per request.
 */
declare class ProxyManager {
    readonly proxyUrl: string;
    private readonly parsed;
    private readonly _masked;
    /** Cached undici dispatcher (Agent or ProxyAgent). */
    private _dispatcher;
    /** Cached WebSocket HTTPS agent. */
    private _wsAgent;
    constructor(proxyUrl: string);
    /** Proxy URL with credentials redacted — safe for logs and errors. */
    get maskedUrl(): string;
    /** Detected protocol, e.g. `"socks5:"`. */
    get protocol(): string;
    /** Proxy hostname. */
    get host(): string;
    /** Whether this proxy uses a SOCKS protocol. */
    isSocksProxy(): boolean;
    /**
     * Return the cached undici dispatcher for HTTP requests.
     * Builds and caches it on first call; subsequent calls are synchronous.
     */
    getUndiciDispatcher(maxConnections: number, connectTimeoutMs: number): Promise<Agent | ProxyAgent>;
    /**
     * Return the cached https.Agent for WebSocket (ws library) connections.
     * Builds and caches it on first call.
     */
    getWebSocketAgent(): Promise<https.Agent>;
    /** Release resources held by the undici dispatcher. */
    close(): Promise<void>;
}

declare class CacheManager {
    private readonly lru;
    private hitCount;
    private missCount;
    constructor(options: {
        maxSize: number;
        ttlMs: number;
    });
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    has(key: string): Promise<boolean>;
    getStats(): {
        hitCount: number;
        missCount: number;
        hitRate: number;
        entryCount: number;
    };
}
declare function nsKey(namespace: string, key: string): string;

interface RequestContext {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: string | Buffer;
    meta: Record<string, unknown>;
}
interface ResponseContext {
    url: string;
    method: string;
    status: number;
    headers: Record<string, string>;
    body?: unknown;
    meta: Record<string, unknown>;
}
interface ErrorContext {
    url: string;
    method: string;
    error: Error;
    meta: Record<string, unknown>;
}
interface Middleware {
    name: string;
    onRequest?: (ctx: RequestContext, next: () => Promise<void>) => Promise<void>;
    onResponse?: (ctx: ResponseContext, next: () => Promise<void>) => Promise<void>;
    onError?: (ctx: ErrorContext, next: () => Promise<void>) => Promise<void>;
}
declare class MiddlewarePipeline {
    private readonly middlewares;
    use(middleware: Middleware): void;
    runRequest(ctx: RequestContext): Promise<void>;
    runResponse(ctx: ResponseContext): Promise<void>;
    runError(ctx: ErrorContext): Promise<void>;
}

interface BrowserFingerprint {
    userAgent: string;
    platform: string;
    locale: string;
    timezone: string;
    screenWidth: number;
    screenHeight: number;
    colorDepth: number;
    secChUa: string;
    secChUaPlatform: string;
}
declare function generateFingerprint(seed?: string): BrowserFingerprint;
declare function buildStealthHeaders(fp: BrowserFingerprint, referer?: string): Record<string, string>;
declare function humanDelay(config: Config['stealth']['delays'], type: 'action' | 'message' | 'pagination'): Promise<void>;
declare class StealthManager {
    private readonly config;
    private readonly emitter;
    private readonly logger;
    readonly fingerprint: BrowserFingerprint;
    private requestCount;
    private warmupStartTime;
    constructor(config: Config['stealth'], emitter: TypedEventEmitter, logger: Logger);
    getHeaders(referer?: string): Record<string, string>;
    isWarmupComplete(): boolean;
    getCurrentRateLimit(): number;
    incrementRequestCount(): void;
}

interface HttpRequestOptions {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: string | Buffer | null;
    signal?: AbortSignal;
    priority?: 'high' | 'normal' | 'low';
    skipRetry?: boolean;
}
interface HttpResponse {
    status: number;
    headers: Record<string, string>;
    text: () => Promise<string>;
    json: () => Promise<unknown>;
    buffer: () => Promise<Buffer>;
}
declare class HttpClient {
    private readonly jar;
    private readonly config;
    private readonly stealth;
    private readonly pipeline;
    private readonly logger;
    private readonly emitter?;
    /** Default connection pool for direct (non-proxied) requests. */
    private readonly pool;
    /** Ordered list of proxy entries for rotation. */
    private readonly proxies;
    private currentProxyIndex;
    private requestCount;
    private readonly proxyRotateEvery;
    /** Optional callback invoked after every request for diagnostics/metrics. */
    private requestRecorder?;
    /** ProxyManager instances — one per configured proxy URL, in pool order. */
    private readonly managers;
    constructor(jar: CookieJar, config: Config, stealth: StealthManager, pipeline: MiddlewarePipeline, logger: Logger, emitter?: TypedEventEmitter | undefined);
    /**
     * Asynchronously initialise proxy dispatchers. Must be awaited before the
     * first request. Is a no-op when no proxies are configured.
     */
    init(): Promise<void>;
    /** Register a callback that is invoked after every HTTP request (for diagnostics). */
    setRequestRecorder(fn: (latencyMs: number, isError: boolean) => void): void;
    private getActiveDispatcher;
    request(options: HttpRequestOptions): Promise<HttpResponse>;
    get(url: string, opts?: Partial<HttpRequestOptions>): Promise<HttpResponse>;
    post(url: string, body: string, opts?: Partial<HttpRequestOptions>): Promise<HttpResponse>;
    /** POST with a raw Buffer body — use for binary/multipart uploads. */
    postBuffer(url: string, body: Buffer, opts?: Partial<HttpRequestOptions>): Promise<HttpResponse>;
    close(): Promise<void>;
}

declare class MqttClient {
    private readonly jar;
    private readonly userId;
    private readonly emitter;
    private readonly config;
    private readonly logger;
    /**
     * Optional callback invoked whenever a presence update arrives.
     * Used by the client to keep `PresenceModule`'s cache up to date without
     * re-emitting events from two places.
     */
    private readonly onPresenceUpdate?;
    /**
     * Optional HTTPS agent that routes the WebSocket connection through a proxy.
     * Provided by `ProxyManager.getWebSocketAgent()` when a proxy is configured.
     */
    private readonly wsAgent?;
    private ws;
    private pingTimer;
    private reconnectTimer;
    private isConnected;
    private isClosed;
    private _packetId;
    private nextPacketId;
    private reconnectAttempts;
    private activeBrokerIndex;
    private readonly reconnectStartTimes;
    /**
     * Session-stable identifiers — generated once at construction and reused
     * across every reconnect so the broker can resume the MQTT session.
     */
    private readonly clientId;
    private readonly sessionSeed;
    private mqttSid;
    /**
     * Dynamic topic registry — starts with CORE_TOPICS and can be extended at
     * runtime. The full set is (re)subscribed after every CONNACK.
     */
    private readonly subscribedTopics;
    constructor(jar: CookieJar, userId: string, emitter: TypedEventEmitter, config: Config, logger: Logger, 
    /**
     * Optional callback invoked whenever a presence update arrives.
     * Used by the client to keep `PresenceModule`'s cache up to date without
     * re-emitting events from two places.
     */
    onPresenceUpdate?: ((userId: string, isOnline: boolean, lastActiveAt: Date | null) => void) | undefined, 
    /**
     * Optional HTTPS agent that routes the WebSocket connection through a proxy.
     * Provided by `ProxyManager.getWebSocketAgent()` when a proxy is configured.
     */
    wsAgent?: https.Agent | undefined);
    connect(): Promise<void>;
    private openConnection;
    private openConnectionToBroker;
    /** Add and immediately subscribe to a topic. No-op if already subscribed. */
    subscribeTopic(topic: string): void;
    /** Unsubscribe from a topic and remove it from the registry. No-op if absent. */
    unsubscribeTopic(topic: string): void;
    /**
     * Send SUBSCRIBE for all tracked topics.
     * Invoked after CONNACK (initial connect and every reconnect) to restore
     * the full subscription state the broker may have lost.
     */
    private restoreSubscriptions;
    private handleMessage;
    private dispatchMessage;
    private handleMessengerEvent;
    private parseNewMessage;
    private parseAttachments;
    private parseDeliveryReceipt;
    private parseReadReceipt;
    private parseUnsendMessage;
    private parseClientPayload;
    private parseThreadNameSet;
    private parseParticipantsAdded;
    private parseParticipantRemoved;
    private parseFolderActionChange;
    private parseThreadImageSet;
    private handlePresenceEvent;
    private handleTypingEvent;
    private handleLegacyWebEvent;
    private startPing;
    private stopPing;
    private scheduleReconnect;
    publish(topic: string, payload: string): void;
    getStats(): {
        isConnected: boolean;
        reconnectCount: number;
        activeBroker: string;
        topicCount: number;
    };
    disconnect(): Promise<void>;
}

interface SessionTokens {
    dtsg: string;
    lsd: string;
    userId: string;
}
declare class AuthManager {
    private readonly jar;
    private readonly http;
    private readonly emitter;
    private readonly storage;
    private readonly config;
    private readonly logger;
    private _tokens;
    private refreshTimer;
    private keepaliveTimer;
    private _refreshFailCount;
    constructor(jar: CookieJar, http: HttpClient, emitter: TypedEventEmitter, storage: StorageAdapter, config: Config, logger: Logger);
    get tokens(): SessionTokens;
    bootstrap(): Promise<SessionTokens>;
    loginWithCredentials(email: string, password: string, twoFactorCode?: string): Promise<void>;
    private submitTwoFactor;
    private calcJazoest;
    private checkForCheckpoint;
    private checkForSuspension;
    refreshCookies(): Promise<void>;
    keepalive(): Promise<void>;
    getAppState(): Promise<AppStateCookie[]>;
    logout(): Promise<void>;
    startRefreshTimer(): void;
    startKeepaliveTimer(): void;
    stopTimers(): void;
}

interface SessionRow {
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
declare class LibSqlSessionStore {
    private readonly client;
    private readonly ready;
    constructor(baseUrl?: string, apiToken?: string);
    private bootstrap;
    private ensureReady;
    /**
     * Save (insert or replace) a session.
     *
     * @param id      — arbitrary session key, e.g. `'default'` or a Facebook user ID
     * @param appState — validated array of AppState cookies
     * @param opts.userId   — Facebook user ID to associate (optional)
     * @param opts.ttlMs    — time-to-live in milliseconds (optional)
     */
    save(id: string, appState: AppStateCookie[], opts?: {
        userId?: string;
        ttlMs?: number;
    }): Promise<void>;
    /**
     * Restore a session by id. Returns null if not found or expired.
     */
    restore(id: string): Promise<{
        jar: CookieJar;
        appState: AppStateCookie[];
        row: SessionRow;
    } | null>;
    /**
     * Fetch all non-expired sessions, optionally filtered by user_id.
     */
    list(userId?: string): Promise<SessionRow[]>;
    /**
     * Delete a session by id.
     */
    delete(id: string): Promise<void>;
    /**
     * Delete all expired sessions (housekeeping).
     */
    purgeExpired(): Promise<number>;
    /**
     * Touch updated_at and optionally extend TTL for an existing session.
     */
    touch(id: string, ttlMs?: number): Promise<void>;
    close(): Promise<void>;
}

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
declare class SessionsModule {
    private readonly store;
    constructor(store: LibSqlSessionStore);
    /**
     * List all active (non-expired) sessions.
     *
     * @param userId  — optional Facebook user ID filter; omit to return all sessions.
     * @returns       Sorted by `updatedAt` descending (most recently active first).
     */
    list(userId?: string): Promise<SessionRow[]>;
    /**
     * Retrieve a single session by its key (Facebook user ID or `'default'`).
     * Returns `null` if the session does not exist or has expired.
     */
    get(id: string): Promise<SessionRow | null>;
    /**
     * Delete a session by id.
     * No-op if the session does not exist.
     */
    delete(id: string): Promise<void>;
    /**
     * Delete all sessions whose TTL has elapsed.
     * @returns the number of rows removed.
     */
    purgeExpired(): Promise<number>;
    /**
     * Touch a session to reset its `updatedAt` timestamp and optionally extend
     * its TTL. Useful for keeping long-running bots alive.
     *
     * @param id    — session key
     * @param ttlMs — new TTL in ms from now (omit to leave existing TTL unchanged)
     */
    touch(id: string, ttlMs?: number): Promise<void>;
}

interface SendMessageOptions {
    threadId: string;
    body?: string;
    attachments?: Array<{
        name: string;
        type: string;
        stream: Readable;
        size?: number;
    }>;
    replyTo?: string;
    mentionedUsers?: Array<{
        userId: string;
        offset: number;
        length: number;
    }>;
    stickerId?: string;
    signal?: AbortSignal;
}
interface SendMessageResult {
    messageId: string;
    threadId: string;
    timestamp: Date;
}
interface Message {
    messageId: string;
    threadId: string;
    senderId: string;
    senderName: string;
    body: string | null;
    attachments: Array<{
        id: string;
        type: string;
        url?: string;
        name?: string;
        size?: number;
        stickerId?: string;
        shareTitle?: string;
        shareDescription?: string;
    }>;
    timestamp: Date;
    isGroup: boolean;
    replyTo?: string;
}
interface ReplyOptions {
    /** The message being replied to. */
    messageId: string;
    /** The thread that contains the message. Required because reply() does not fetch messages from the network. */
    threadId: string;
    body: string;
    attachments?: Array<{
        name: string;
        type: string;
        stream: Readable;
        size?: number;
    }>;
    signal?: AbortSignal;
}
interface PageResult$3<T> {
    items: T[];
    hasMore: boolean;
    cursor: string | null;
}
declare class MessagesModule {
    private readonly http;
    private readonly cache;
    private readonly emitter;
    private readonly logger;
    private readonly getTokens;
    constructor(http: HttpClient, cache: CacheManager, emitter: TypedEventEmitter, logger: Logger, getTokens: () => SessionTokens);
    /**
     * Upload a single attachment and return its attachment ID as reported by Facebook.
     * Emits upload:progress, upload:complete, and upload:failed events.
     */
    private uploadAttachment;
    send(options: SendMessageOptions): Promise<SendMessageResult>;
    /**
     * Reply to a specific message.
     * Both `messageId` (to reply to) and `threadId` are required.
     */
    reply(options: ReplyOptions): Promise<SendMessageResult>;
    /**
     * Permanently unsend (retract) a message you sent.
     * The message is removed for all participants.
     */
    unsend(messageId: string, signal?: AbortSignal): Promise<void>;
    /**
     * Delete a message from your view only (not for other participants).
     * Uses Facebook's delete_message endpoint.
     */
    delete(messageId: string, signal?: AbortSignal): Promise<void>;
    forward(options: {
        messageId: string;
        toThreadIds: string[];
        signal?: AbortSignal;
    }): Promise<Array<{
        threadId: string;
        ok: boolean;
        error?: string;
    }>>;
    react(options: {
        messageId: string;
        reaction: string;
        signal?: AbortSignal;
    }): Promise<void>;
    getReactions(messageId: string, signal?: AbortSignal): Promise<Array<{
        userId: string;
        userName: string;
        reaction: string;
        timestamp: Date;
    }>>;
    list(options: {
        threadId: string;
        limit?: number;
        before?: string;
        after?: string;
        signal?: AbortSignal;
    }): Promise<PageResult$3<Message>>;
    private extractNodeAttachments;
    private extractMessageNodes;
    get(messageId: string, signal?: AbortSignal): Promise<Message>;
    markRead(threadId: string, signal?: AbortSignal): Promise<void>;
    setTyping(options: {
        threadId: string;
        typing: boolean;
        signal?: AbortSignal;
    }): Promise<void>;
}

interface Thread {
    threadId: string;
    name: string | null;
    isGroup: boolean;
    participantIds: string[];
    unreadCount: number;
    lastMessageTimestamp: Date | null;
    photoUrl: string | null;
    muteUntil: Date | null;
    isArchived: boolean;
}
interface ThreadListOptions {
    limit?: number;
    cursor?: string | null;
    signal?: AbortSignal;
}
interface PageResult$2<T> {
    items: T[];
    hasMore: boolean;
    cursor: string | null;
}
interface CreateGroupOptions {
    participantIds: string[];
    name?: string;
    signal?: AbortSignal;
}
declare class ThreadsModule {
    private readonly http;
    private readonly cache;
    private readonly emitter;
    private readonly logger;
    private readonly getTokens;
    constructor(http: HttpClient, cache: CacheManager, emitter: TypedEventEmitter, logger: Logger, getTokens: () => SessionTokens);
    list(options?: ThreadListOptions): Promise<PageResult$2<Thread>>;
    get(threadId: string, signal?: AbortSignal): Promise<Thread>;
    create(options: CreateGroupOptions): Promise<Thread>;
    rename(threadId: string, name: string, signal?: AbortSignal): Promise<void>;
    setPhoto(threadId: string, stream: Readable, signal?: AbortSignal): Promise<void>;
    addParticipants(threadId: string, userIds: string[], signal?: AbortSignal): Promise<void>;
    removeParticipant(threadId: string, userId: string, signal?: AbortSignal): Promise<void>;
    leave(threadId: string, signal?: AbortSignal): Promise<void>;
    mute(threadId: string, durationMs?: number, signal?: AbortSignal): Promise<void>;
    unmute(threadId: string, signal?: AbortSignal): Promise<void>;
    archive(threadId: string, signal?: AbortSignal): Promise<void>;
    unarchive(threadId: string, signal?: AbortSignal): Promise<void>;
    private extractThreadEdges;
    private extractThreadNode;
    private extractPageInfo;
}

interface UserProfile {
    id: string;
    name: string;
    username: string | null;
    profilePictureUrl: string | null;
    isFriend: boolean;
    mutualFriendCount: number | null;
}
interface FriendListOptions {
    limit?: number;
    cursor?: string | null;
    signal?: AbortSignal;
}
interface PageResult$1<T> {
    items: T[];
    hasMore: boolean;
    cursor: string | null;
}
interface SearchUsersOptions {
    limit?: number;
    signal?: AbortSignal;
}
declare class UsersModule {
    private readonly http;
    private readonly cache;
    private readonly logger;
    private readonly getTokens;
    constructor(http: HttpClient, cache: CacheManager, logger: Logger, getTokens: () => SessionTokens);
    getProfile(userId: string, signal?: AbortSignal): Promise<UserProfile>;
    getSelf(signal?: AbortSignal): Promise<UserProfile>;
    getFriends(options?: FriendListOptions): Promise<PageResult$1<UserProfile>>;
    search(query: string, options?: SearchUsersOptions): Promise<UserProfile[]>;
    private extractUserNode;
    private extractConnection;
}

interface PresenceStatus {
    userId: string;
    isOnline: boolean;
    lastActiveAt: Date | null;
}
declare class PresenceModule {
    private readonly http;
    private readonly cache;
    private readonly emitter;
    private readonly logger;
    private readonly getTokens;
    private readonly subscribedUserIds;
    constructor(http: HttpClient, cache: CacheManager, emitter: TypedEventEmitter, logger: Logger, getTokens: () => SessionTokens);
    get(userId: string, signal?: AbortSignal): Promise<PresenceStatus>;
    setVisible(visible: boolean, signal?: AbortSignal): Promise<void>;
    subscribe(userIds: string[]): void;
    unsubscribe(userIds: string[]): void;
    /**
     * Update the in-memory presence cache for a user.
     * Called by the client whenever a presence update arrives from the MQTT layer,
     * so that `presence.get()` returns up-to-date data without a network round-trip.
     */
    updateCache(userId: string, isOnline: boolean, lastActiveAt: Date | null): void;
    /**
     * Called internally to emit presence events for explicitly subscribed users only.
     * For global presence events (all users) the MQTT layer emits `presence:update` directly.
     */
    handlePresenceUpdate(userId: string, isOnline: boolean, lastActiveAt: Date | null): void;
    private parsePresence;
}

interface MessageSearchResult {
    messageId: string;
    threadId: string;
    senderId: string;
    senderName: string;
    body: string | null;
    timestamp: Date;
    snippet: string | null;
}
interface ThreadSearchResult {
    threadId: string;
    name: string | null;
    participantNames: string[];
    lastMessageTimestamp: Date | null;
}
interface SearchOptions {
    limit?: number;
    cursor?: string | null;
    signal?: AbortSignal;
}
interface PageResult<T> {
    items: T[];
    hasMore: boolean;
    cursor: string | null;
}
declare class SearchModule {
    private readonly http;
    private readonly logger;
    private readonly getTokens;
    constructor(http: HttpClient, logger: Logger, getTokens: () => SessionTokens);
    messages(query: string, options?: SearchOptions): Promise<PageResult<MessageSearchResult>>;
    threads(query: string, options?: SearchOptions): Promise<PageResult<ThreadSearchResult>>;
    private parseMessageResults;
    private parseThreadResults;
}

interface UploadOptions {
    name: string;
    type: string;
    stream: Readable;
    size?: number;
    signal?: AbortSignal;
}
interface UploadResult {
    attachmentToken: string;
    uploadId: string;
    name: string;
    type: string;
    size: number;
}
interface DownloadOptions {
    destination: string;
    signal?: AbortSignal;
    onProgress?: (bytesTransferred: number, totalBytes: number) => void;
}
declare class FilesModule {
    private readonly http;
    private readonly emitter;
    private readonly logger;
    private readonly getTokens;
    constructor(http: HttpClient, emitter: TypedEventEmitter, logger: Logger, getTokens: () => SessionTokens);
    upload(options: UploadOptions): Promise<UploadResult>;
    download(url: string, options: DownloadOptions): Promise<void>;
}

interface CreatePollOptions {
    threadId: string;
    question: string;
    options: string[];
    signal?: AbortSignal;
}
interface PollOption {
    id: string;
    text: string;
    voterIds: string[];
    voteCount: number;
}
interface Poll {
    pollId: string;
    threadId: string;
    question: string;
    options: PollOption[];
    totalVotes: number;
    createdAt: Date;
}
interface VotePollOptions {
    pollId: string;
    optionId: string;
    signal?: AbortSignal;
}
declare class PollsModule {
    private readonly http;
    private readonly logger;
    private readonly getTokens;
    constructor(http: HttpClient, logger: Logger, getTokens: () => SessionTokens);
    create(options: CreatePollOptions): Promise<Poll>;
    vote(options: VotePollOptions): Promise<void>;
    getResults(pollId: string, signal?: AbortSignal): Promise<Poll>;
    private parsePoll;
    private parsePollResults;
}

interface StickerMeta {
    stickerId: string;
    label: string | null;
    stickerUrl: string | null;
    packId: string | null;
    width: number;
    height: number;
}
interface StickerPack {
    packId: string;
    name: string | null;
    stickers: StickerMeta[];
}
interface SendStickerOptions {
    threadId: string;
    stickerId: string;
    signal?: AbortSignal;
}
interface SendStickerResult {
    messageId: string;
    threadId: string;
    timestamp: Date;
}
declare class StickersModule {
    private readonly http;
    private readonly cache;
    private readonly logger;
    private readonly getTokens;
    constructor(http: HttpClient, cache: CacheManager, logger: Logger, getTokens: () => SessionTokens);
    send(options: SendStickerOptions): Promise<SendStickerResult>;
    getPack(packId: string, signal?: AbortSignal): Promise<StickerPack>;
    private parseStickerPack;
}

interface DiagnosticsStats {
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
interface HealthCheckResult {
    ok: boolean;
    latencyMs: number;
    checkedAt: Date;
    details: Record<string, unknown>;
}
declare class DiagnosticsModule {
    private readonly cache;
    private readonly logger;
    private readonly getTokens;
    private readonly getIsConnected;
    private readonly runHealthPing;
    private readonly emitter?;
    private readonly startedAt;
    private httpRequestCount;
    private httpErrorCount;
    private readonly httpLatencies;
    private mqttConnected;
    private mqttReconnectCount;
    private mqttLastReconnectMs;
    private gcMajorCount;
    private gcTotalFreedBytes;
    private gcObserver;
    private memoryPollTimer;
    constructor(cache: CacheManager, logger: Logger, getTokens: () => SessionTokens, getIsConnected: () => boolean, runHealthPing: () => Promise<number>, emitter?: TypedEventEmitter | undefined);
    private startGcMonitoring;
    private startMemoryMonitoring;
    /** Called by the HTTP layer to track request metrics. */
    recordHttpRequest(latencyMs: number, isError: boolean): void;
    /** Called by the MQTT layer to track connection state. */
    recordMqttState(isConnected: boolean, reconnectCount: number, lastReconnectMs: number | null): void;
    getStats(): DiagnosticsStats;
    heapSnapshot(outputPath: string): Promise<void>;
    healthCheck(): Promise<HealthCheckResult>;
    /** Stop background monitoring timers. Call on client disconnect. */
    destroy(): void;
}

interface ClientOptions {
    /**
     * AppState — accepts a cookie array from a browser export, a JSON string,
     * a Base64-encoded JSON string, a URL-encoded JSON string, a Buffer, or a
     * file path to a JSON file. Input type is auto-detected; see AppStateLoader.
     */
    appState?: AppStateCookie[] | string | Buffer;
    /** Explicit path to an AppState JSON file (alternative to `appState`). */
    appStatePath?: string;
    /** Logs a detailed diagnostic breakdown of AppState resolution when true. */
    debugAppState?: boolean;
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
        timeout?: {
            connect?: number;
            request?: number;
            body?: number;
        };
        retries?: {
            max?: number;
            baseDelay?: number;
        };
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

/**
 * The main PandindiganFCA client.
 *
 * Exposes typed event subscription via `on`, `off`, and `once`.
 * All subsystems share a single internal event bus so every emitted event
 * is visible to consumers through this client.
 *
 * Instantiate via {@link createClient}.
 */
declare class PandindiganClient {
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
    private readonly http;
    /** @internal */
    private readonly mqtt;
    /** @internal */
    private readonly jar;
    /** @internal */
    private readonly storage;
    /** @internal */
    private readonly sessionStore;
    /** @internal */
    private readonly config;
    /** @internal */
    private readonly logger;
    /** @internal */
    private readonly cache;
    /** @internal — the single shared emitter for all subsystems */
    private readonly emitter;
    on<K extends keyof ClientEventMap>(event: K, listener: (...args: ClientEventMap[K]) => void): this;
    off<K extends keyof ClientEventMap>(event: K, listener: (...args: ClientEventMap[K]) => void): this;
    once<K extends keyof ClientEventMap>(event: K, listener: (...args: ClientEventMap[K]) => void): this;
    /** @internal — ProxyManager for the MQTT WebSocket agent; closed on disconnect. */
    private readonly mqttProxyManager?;
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
    });
    /**
     * Open the real-time MQTT/WebSocket connection to receive live events.
     * Must be called after {@link createClient} if you need real-time events.
     */
    login(): Promise<void>;
    /**
     * @deprecated Use {@link PandindiganClient.login} instead. `connect()` is
     * kept as a backward-compatible alias and will be removed in a future
     * major version.
     */
    connect(): Promise<void>;
    /**
     * Gracefully disconnect — drains queued operations, sends MQTT DISCONNECT,
     * persists the updated AppState (when autoPersist is on), and closes all
     * connections.
     */
    disconnect(): Promise<void>;
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
 * await client.login();
 * ```
 */
/**
 * Alias for {@link createClient}. Use as:
 * ```ts
 * import { login } from 'panindigan-fca';
 * const client = await login({ appState });
 * ```
 */
declare const login: (options?: ClientOptions) => Promise<PandindiganClient>;
declare function createClient(options?: ClientOptions): Promise<PandindiganClient>;

/**
 * Single, centralized AppState loading pipeline.
 *
 * This is the ONLY module allowed to read files, parse JSON, decode Base64,
 * decode URL-encoded strings, or read AppState-related environment variables.
 * Every other module (client factory, auth manager, session restore, proxy
 * auth, etc.) must consume {@link AppStateResult} produced here — never parse
 * raw AppState input themselves.
 */
type AppStateInputType = 'array' | 'json' | 'base64' | 'urlencoded' | 'buffer' | 'file' | 'none';
interface AppStateResult {
    /** Human-readable origin of the loaded AppState, for logging/diagnostics. */
    source: string;
    inputType: AppStateInputType;
    cookies: AppStateCookie[];
    valid: boolean;
    diagnostics: string[];
}
interface AppStateLoadOptions {
    /**
     * Accepts a cookie array, a JSON string, a Base64-encoded JSON string, a
     * URL-encoded JSON string, a Buffer, or a file path — auto-detected.
     */
    appState?: AppStateCookie[] | string | Buffer;
    /** Explicit path to an AppState JSON file. */
    appStatePath?: string;
    /** When true, logs a detailed diagnostic breakdown of the resolution. */
    debugAppState?: boolean;
    logger?: Pick<Logger, 'info' | 'debug' | 'warn'>;
}
/**
 * Resolves the AppState to use for authentication using a single deterministic
 * pipeline. Uses the first successful source and stops immediately:
 *
 * 1. `options.appState` (array, JSON string, Base64 string, URL-encoded string, Buffer, or file path)
 * 2. `options.appStatePath`
 * 3. `APPSTATE` / `PFCA_APPSTATE` environment variable
 * 4. `APPSTATE_JSON` environment variable
 * 5. `APPSTATE_BASE64` environment variable
 * 6. `PFCA_APPSTATE_PATH` environment variable, or `./appstate.json` by default
 *
 * Never re-parses a source that already succeeded — each input is memoized by
 * content, so repeated calls (session restore, reconnect, background refresh)
 * reuse the same normalized cookies instead of re-reading disk or env vars.
 */
declare function loadAppState(options?: AppStateLoadOptions): AppStateResult;

declare class PandindiganError extends Error {
    readonly code: string;
    readonly context: Record<string, unknown>;
    readonly cause: unknown;
    constructor(message: string, code: string, context?: Record<string, unknown>, cause?: unknown);
}
declare class NetworkError extends PandindiganError {
}
declare class ConnectionError extends NetworkError {
    constructor(message: string, context?: Record<string, unknown>, cause?: unknown);
}
declare class TimeoutError extends NetworkError {
    constructor(message: string, context?: Record<string, unknown>, cause?: unknown);
}
declare class DNSError extends NetworkError {
    constructor(message: string, context?: Record<string, unknown>, cause?: unknown);
}
declare class ProxyError extends NetworkError {
    constructor(message: string, context?: Record<string, unknown>, cause?: unknown);
}
declare class AuthError extends PandindiganError {
}
declare class InvalidAppStateError extends AuthError {
    constructor(message: string, context?: Record<string, unknown>, cause?: unknown);
}
declare class SessionExpiredError extends AuthError {
    constructor(message: string, context?: Record<string, unknown>, cause?: unknown);
}
declare class LoginFailedError extends AuthError {
    constructor(message: string, context?: Record<string, unknown>, cause?: unknown);
}
declare class TwoFactorRequiredError extends AuthError {
    constructor(message: string, context?: Record<string, unknown>, cause?: unknown);
}
declare class CheckpointRequiredError extends AuthError {
    readonly checkpointUrl: string;
    constructor(message: string, checkpointUrl: string, context?: Record<string, unknown>, cause?: unknown);
}
declare class HttpError extends PandindiganError {
    readonly statusCode: number;
    constructor(message: string, code: string, statusCode: number, context?: Record<string, unknown>, cause?: unknown);
}
declare class RateLimitError extends HttpError {
    readonly retryAfterMs: number;
    constructor(message: string, retryAfterMs: number, context?: Record<string, unknown>);
}
declare class ForbiddenError extends HttpError {
    constructor(message: string, context?: Record<string, unknown>, cause?: unknown);
}
declare class NotFoundError extends HttpError {
    constructor(message: string, context?: Record<string, unknown>, cause?: unknown);
}
declare class ServerError extends HttpError {
    constructor(message: string, statusCode: number, context?: Record<string, unknown>, cause?: unknown);
}
declare class ParseError extends PandindiganError {
}
declare class ResponseValidationError extends ParseError {
    constructor(message: string, context?: Record<string, unknown>, cause?: unknown);
}
declare class DeserializationError extends ParseError {
    constructor(message: string, context?: Record<string, unknown>, cause?: unknown);
}
declare class StorageError extends PandindiganError {
    constructor(message: string, context?: Record<string, unknown>, cause?: unknown);
}
declare class CacheError extends PandindiganError {
    constructor(message: string, context?: Record<string, unknown>, cause?: unknown);
}
declare class ConfigurationError extends PandindiganError {
    constructor(message: string, context?: Record<string, unknown>, cause?: unknown);
}
declare class UploadError extends PandindiganError {
    readonly bytesTransferred: number;
    constructor(message: string, bytesTransferred?: number, context?: Record<string, unknown>, cause?: unknown);
}
declare class DownloadError extends PandindiganError {
    constructor(message: string, context?: Record<string, unknown>, cause?: unknown);
}

declare function encrypt(plaintext: string, passphrase: string): string;
declare function decrypt(ciphertext: string, passphrase: string): string;
declare function hmac(data: string, secret: string): string;
declare function randomHex(bytes?: number): string;
declare function cryptoRandomInt(min: number, max: number): number;
declare function cryptoRandomFloat(): number;

declare function resolveWithCache(hostname: string): Promise<string>;
declare function clearDnsCache(): void;

declare const GRAPHQL_FRIENDLY_NAMES: {
    readonly threadList: "LSPlatformThreadlistFeedQuery";
    readonly threadInfo: "LSPlatformGraphQLLightspeedRequestForIGLSPQuery";
    readonly messageList: "LSPlatformGraphQLLightspeedRequestForIGLSPQuery";
    readonly sendMessage: "useSendMessageMutation";
    readonly userInfo: "CometUserHoverCardContentQuery";
    readonly friendList: "FriendingCometFriendListCardPaginationQuery";
    readonly searchThreads: "SearchCometResultsPaginatedResultsQuery";
    readonly searchMessages: "MercurySearchPageSearchQuery";
    readonly reactMessage: "useCometUFISetMessageReactionMutation";
    readonly markRead: "MarkThreadReadMutation";
    readonly setTyping: "MercuryTypingMutation";
    readonly unsendMessage: "UnsendMessageMutation";
    readonly createGroup: "CreateGroupThreadMutation";
    readonly addParticipants: "AddParticipantsMutation";
    readonly removeParticipant: "RemoveParticipantMutation";
    readonly renameThread: "ChangeThreadNameMutation";
    readonly muteThread: "MuteThreadMutation";
    readonly archiveThread: "ArchiveThreadMutation";
    readonly createPoll: "CreatePollMutation";
    readonly votePoll: "VotePollMutation";
    readonly getPollResults: "GetPollResultsQuery";
    readonly stickerPack: "GetStickerPackQuery";
    readonly presenceGet: "FetchPresenceQuery";
    readonly presenceSet: "SetPresenceMutation";
};

/**
 * src/api/index.ts
 *
 * Typed registry of every Facebook private-API endpoint the library calls.
 * Each entry carries the HTTP method, canonical URL, required parameter names,
 * and a description of the expected response shape.
 *
 * Modules (messages, threads, users …) import from here rather than hard-coding
 * URLs, keeping endpoint definitions in one authoritative place.
 */

type HttpMethod = 'GET' | 'POST';
interface EndpointDefinition {
    /** Endpoint name — used in logging and tracing. */
    readonly name: string;
    readonly method: HttpMethod;
    readonly url: string;
    /** Human-readable description of what the endpoint does. */
    readonly description: string;
    /** Required top-level parameter names (informational — not enforced at runtime). */
    readonly requiredParams?: readonly string[];
}
declare const API_ENDPOINTS: {
    readonly login: {
        readonly name: "login";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/login/device-based/regular/login/";
        readonly description: "Email and password credential login. Returns session cookies.";
        readonly requiredParams: readonly ["email", "pass", "fb_dtsg_ag", "jazoest"];
    };
    readonly logout: {
        readonly name: "logout";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/logout/";
        readonly description: "Invalidates the current session and clears all session cookies.";
        readonly requiredParams: readonly ["fb_dtsg", "ref"];
    };
    readonly messageSend: {
        readonly name: "messageSend";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/messaging/send/";
        readonly description: "Send a text message, sticker, or file attachment to a thread.";
        readonly requiredParams: readonly ["thread_fbid", "fb_dtsg", "lsd"];
    };
    readonly messageDelete: {
        readonly name: "messageDelete";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/ajax/mercury/delete_messages.php";
        readonly description: "Remove a message from the authenticated user's own view (not unsend).";
        readonly requiredParams: readonly ["message_ids[]", "fb_dtsg", "lsd"];
    };
    readonly messageMarkRead: {
        readonly name: "messageMarkRead";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/api/graphql/";
        readonly description: "Mark all messages in a thread up to a watermark as read.";
        readonly requiredParams: readonly ["variables", "fb_dtsg", "lsd"];
    };
    readonly setTypingIndicator: {
        readonly name: "setTypingIndicator";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/ajax/messaging/typ.php";
        readonly description: "Emit or clear a typing indicator in a thread.";
        readonly requiredParams: readonly ["thread", "typ", "fb_dtsg", "lsd"];
    };
    readonly threadList: {
        readonly name: "threadList";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/api/graphql/";
        readonly description: "Paginated list of the authenticated user's conversation threads.";
        readonly requiredParams: readonly ["variables", "fb_dtsg", "lsd"];
    };
    readonly threadInfo: {
        readonly name: "threadInfo";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/api/graphql/";
        readonly description: "Full metadata for a single thread by its thread ID.";
        readonly requiredParams: readonly ["variables", "fb_dtsg", "lsd"];
    };
    readonly threadCreate: {
        readonly name: "threadCreate";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/api/graphql/";
        readonly description: "Create a new group chat with an initial list of participant IDs.";
        readonly requiredParams: readonly ["variables", "fb_dtsg", "lsd"];
    };
    readonly threadRename: {
        readonly name: "threadRename";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/api/graphql/";
        readonly description: "Rename a group conversation thread.";
        readonly requiredParams: readonly ["variables", "fb_dtsg", "lsd"];
    };
    readonly threadSetPhoto: {
        readonly name: "threadSetPhoto";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/ajax/messaging/set_thread_image.php";
        readonly description: "Set or update the group photo for a thread. Multipart upload.";
        readonly requiredParams: readonly ["thread_image", "thread_fbid", "fb_dtsg", "lsd"];
    };
    readonly threadAddParticipants: {
        readonly name: "threadAddParticipants";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/api/graphql/";
        readonly description: "Add one or more participants to an existing group thread.";
        readonly requiredParams: readonly ["variables", "fb_dtsg", "lsd"];
    };
    readonly threadRemoveParticipant: {
        readonly name: "threadRemoveParticipant";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/api/graphql/";
        readonly description: "Remove a single participant from a group thread.";
        readonly requiredParams: readonly ["variables", "fb_dtsg", "lsd"];
    };
    readonly threadLeave: {
        readonly name: "threadLeave";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/ajax/mercury/leave_thread.php";
        readonly description: "Remove the authenticated account from a group thread.";
        readonly requiredParams: readonly ["thread_fbid", "fb_dtsg", "lsd"];
    };
    readonly threadMute: {
        readonly name: "threadMute";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/api/graphql/";
        readonly description: "Mute notifications for a thread, optionally for a duration.";
        readonly requiredParams: readonly ["variables", "fb_dtsg", "lsd"];
    };
    readonly threadArchive: {
        readonly name: "threadArchive";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/api/graphql/";
        readonly description: "Move a thread to the archived folder or restore it.";
        readonly requiredParams: readonly ["variables", "fb_dtsg", "lsd"];
    };
    readonly fileUpload: {
        readonly name: "fileUpload";
        readonly method: "POST";
        readonly url: "https://upload.facebook.com/ajax/mercury/upload.php";
        readonly description: "Upload a binary file attachment. Responds with a server-assigned attachment ID.";
        readonly requiredParams: readonly ["upload_id", "fb_dtsg", "lsd"];
    };
    readonly userProfile: {
        readonly name: "userProfile";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/api/graphql/";
        readonly description: "Fetch public profile information for any Facebook user.";
        readonly requiredParams: readonly ["variables", "fb_dtsg", "lsd"];
    };
    readonly selfProfile: {
        readonly name: "selfProfile";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/api/graphql/";
        readonly description: "Fetch the profile of the currently authenticated account.";
        readonly requiredParams: readonly ["variables", "fb_dtsg", "lsd"];
    };
    readonly friendList: {
        readonly name: "friendList";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/api/graphql/";
        readonly description: "Paginated list of the authenticated user's friends.";
        readonly requiredParams: readonly ["variables", "fb_dtsg", "lsd"];
    };
    readonly userSearch: {
        readonly name: "userSearch";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/api/graphql/";
        readonly description: "Full-text search for Facebook users by name.";
        readonly requiredParams: readonly ["variables", "fb_dtsg", "lsd"];
    };
    readonly searchMessages: {
        readonly name: "searchMessages";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/api/graphql/";
        readonly description: "Full-text search across the authenticated user's messages.";
        readonly requiredParams: readonly ["variables", "fb_dtsg", "lsd"];
    };
    readonly searchThreads: {
        readonly name: "searchThreads";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/api/graphql/";
        readonly description: "Search conversation threads by name or participant.";
        readonly requiredParams: readonly ["variables", "fb_dtsg", "lsd"];
    };
    readonly messageReact: {
        readonly name: "messageReact";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/api/graphql/";
        readonly description: "Add or remove an emoji reaction on a specific message.";
        readonly requiredParams: readonly ["variables", "fb_dtsg", "lsd"];
    };
    readonly messageGetReactions: {
        readonly name: "messageGetReactions";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/api/graphql/";
        readonly description: "Retrieve all emoji reactions on a single message.";
        readonly requiredParams: readonly ["variables", "fb_dtsg", "lsd"];
    };
    readonly pollCreate: {
        readonly name: "pollCreate";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/api/graphql/";
        readonly description: "Create a poll with a question and answer options in a thread.";
        readonly requiredParams: readonly ["variables", "fb_dtsg", "lsd"];
    };
    readonly pollVote: {
        readonly name: "pollVote";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/api/graphql/";
        readonly description: "Cast a vote on a poll option.";
        readonly requiredParams: readonly ["variables", "fb_dtsg", "lsd"];
    };
    readonly pollResults: {
        readonly name: "pollResults";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/api/graphql/";
        readonly description: "Fetch current vote counts for all options in a poll.";
        readonly requiredParams: readonly ["variables", "fb_dtsg", "lsd"];
    };
    readonly stickerSend: {
        readonly name: "stickerSend";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/messaging/send/";
        readonly description: "Send a sticker to a thread using its sticker ID.";
        readonly requiredParams: readonly ["sticker_id", "thread_fbid", "fb_dtsg", "lsd"];
    };
    readonly stickerPack: {
        readonly name: "stickerPack";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/api/graphql/";
        readonly description: "Retrieve all sticker metadata for a sticker pack.";
        readonly requiredParams: readonly ["variables", "fb_dtsg", "lsd"];
    };
    readonly presenceGet: {
        readonly name: "presenceGet";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/api/graphql/";
        readonly description: "Fetch the current online/offline presence status of one or more users.";
        readonly requiredParams: readonly ["variables", "fb_dtsg", "lsd"];
    };
    readonly presenceSet: {
        readonly name: "presenceSet";
        readonly method: "POST";
        readonly url: "https://www.facebook.com/api/graphql/";
        readonly description: "Set whether the authenticated account appears online to other users.";
        readonly requiredParams: readonly ["variables", "fb_dtsg", "lsd"];
    };
};
type ApiEndpointName = keyof typeof API_ENDPOINTS;

/**
 * Look up the URL for a named API endpoint.
 * Prefer importing the constant directly — this helper is for dynamic dispatch.
 */
declare function getEndpointUrl(name: ApiEndpointName): string;
/**
 * Returns true if the given URL belongs to Facebook's GraphQL API surface.
 */
declare function isGraphQLEndpoint(url: string): boolean;
/**
 * Returns true if the given URL is a messaging send endpoint
 * (text messages and sticker sends use the same endpoint).
 */
declare function isMessageSendEndpoint(url: string): boolean;

/**
 * src/requests/index.ts
 *
 * Outgoing request builders and serializers.
 *
 * Provides a single, consistent set of utilities for constructing every kind
 * of HTTP request body the library sends to Facebook:
 *   - URL-encoded form bodies
 *   - Multipart/form-data bodies (for file uploads and group-photo changes)
 *   - JSON bodies
 *   - GraphQL request bodies (form-encoded, as Facebook's private API expects)
 *   - Lightspeed / Relay request bodies
 *
 * All builders are pure functions — they take plain objects and return strings
 * or Buffers. No I/O, no side effects.
 */

/**
 * URL-encode a flat key-value map into an `application/x-www-form-urlencoded`
 * string.
 *
 * Values may be:
 *   - `string` — encoded directly
 *   - `string[]` — each element becomes a separate `key[i]=value` pair
 *   - `number | boolean` — coerced to string then encoded
 */
declare function encodeFormBody(params: Record<string, string | string[] | number | boolean>): string;
interface MultipartField {
    name: string;
    value: string;
}
interface MultipartFile {
    fieldName: string;
    fileName: string;
    contentType: string;
    data: Buffer;
}
/**
 * Build a `multipart/form-data` body as a Buffer.
 *
 * @param fields  Plain-text form fields that precede the file part(s).
 * @param files   Binary file parts; typically one per call but multiple are supported.
 * @param boundary MIME boundary string — must not appear inside any field value or file data.
 * @returns       The complete multipart body as a raw Buffer.
 */
declare function buildMultipartBody(fields: MultipartField[], files: MultipartFile[], boundary: string): Buffer;
/**
 * Generate a unique MIME boundary string safe for use in multipart bodies.
 * Uses 16 random hex bytes — vanishingly unlikely to appear in any real payload.
 */
declare function generateBoundary(): string;
/**
 * Serialize a value as a JSON string for use as an `application/json` request body.
 */
declare function buildJsonBody(data: unknown): string;
interface GraphQLBodyOptions {
    /** Hardcoded document ID — used for stable Relay Modern queries. */
    docId?: string;
    /** Named query from the GRAPHQL_FRIENDLY_NAMES registry. */
    queryName?: keyof typeof GRAPHQL_FRIENDLY_NAMES;
    /** Override the friendly name (takes precedence over queryName). */
    friendlyName?: string;
    /** GraphQL variables object. Will be JSON-stringified. */
    variables: Record<string, unknown>;
    /** Facebook DTSG anti-CSRF token. */
    dtsg: string;
    /** Facebook LSD session token. */
    lsd: string;
    /** Additional ad-hoc form params to merge in. */
    extraParams?: Record<string, string>;
}
/**
 * Build a URL-encoded body for Facebook's private Relay Modern GraphQL endpoint.
 *
 * Facebook's `/api/graphql/` endpoint accepts GraphQL variables as a
 * form-encoded body (not JSON), which this function produces.
 */
declare function buildGraphQLBody(options: GraphQLBodyOptions): string;
/**
 * Convenience wrapper — builds the URL and body for a GraphQL request together.
 */
declare function buildGraphQLRequest(options: GraphQLBodyOptions): {
    url: string;
    body: string;
    friendlyName: string;
};
interface LightspeedRequestOptions {
    /** The `requestPayload` JSON for the Lightspeed action. */
    requestPayload: Record<string, unknown>;
    dtsg: string;
    lsd: string;
    appId?: string;
    queryId?: string;
}
/**
 * Build a URL-encoded body for Facebook's Lightspeed (Inbox v2) endpoints.
 * These use a special `request_payload` wrapper around the variables.
 */
declare function buildLightspeedBody(options: LightspeedRequestOptions): string;
interface FormRequestOptions {
    url: string;
    /** Plain key-value params (will be merged with dtsg and lsd). */
    params: Record<string, string | string[] | number | boolean>;
    dtsg?: string;
    lsd?: string;
}
/**
 * Build a URL-encoded form request body, optionally injecting `fb_dtsg` and `lsd`.
 * Returns both the final URL and the encoded body string.
 */
declare function buildFormRequest(options: FormRequestOptions): {
    url: string;
    body: string;
};
interface RequestSpec {
    url: string;
    method: 'GET' | 'POST';
    headers: Record<string, string>;
    body: string | Buffer | null;
    contentType: string;
}
/**
 * Compose a fully-specified `RequestSpec` from a form body.
 * Ready to be passed directly to `HttpClient.request()`.
 */
declare function makeFormRequestSpec(url: string, body: string): RequestSpec;
/**
 * Compose a fully-specified `RequestSpec` from a multipart body.
 * Ready to be passed directly to `HttpClient.postBuffer()`.
 */
declare function makeMultipartRequestSpec(url: string, body: Buffer, boundary: string): RequestSpec;

/**
 * src/responses/index.ts
 *
 * Incoming response parsers and Zod validators.
 *
 * Every response from Facebook's private API is validated here before the
 * parsed data is handed back to the calling module. This ensures:
 *   - Unknown response shapes surface as `ResponseValidationError` immediately
 *     (rather than as silent `undefined` deep inside a module)
 *   - TypeScript types are derived from the schema, not from hand-written
 *     interfaces that can drift from reality
 *
 * When Facebook changes a response shape, `ResponseValidationError` fires on
 * the first bad response, making the breakage visible and actionable rather
 * than producing subtly wrong data.
 *
 * Usage pattern in modules:
 *   const raw = await resp.json();
 *   const thread = parseThreadResponse(raw);   // throws ResponseValidationError on mismatch
 */

/**
 * Facebook prefixes many JSON responses with `for (;;);` to prevent direct
 * JSONP evaluation. Strip it before parsing.
 */
declare function stripFbPrefix(text: string): string;
/**
 * Parse and strip a raw Facebook HTTP response body into an unknown value.
 * Throws `DeserializationError` on JSON parse failure.
 */
declare function parseRawResponse(text: string): unknown;
/**
 * Run a Zod schema against `data`. On failure, throws `ResponseValidationError`
 * with full Zod issue details and a truncated raw-data preview.
 *
 * Uses `ZodTypeAny` so the function accepts schemas that have transforms or
 * `.default()` (where `_input !== _output`). The return type is inferred from
 * the schema's output type via `z.output<S>`.
 */
declare function validate<S extends z.ZodTypeAny>(schema: S, data: unknown, context?: string): z.output<S>;
declare const AttachmentSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>>;
    type: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    url: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    size: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
type ParsedAttachment = z.output<typeof AttachmentSchema>;
declare const MessageNodeSchema: z.ZodObject<{
    message_id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
    id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
    timestamp_precise: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<Date, string | number>>>;
    timestamp: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<Date, string | number>>>;
    message: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        text: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>>;
    message_sender: z.ZodOptional<z.ZodObject<{
        id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
        name: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    blob_attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>>;
        type: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        url: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        size: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>>;
    sticker: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
        label: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
type MessageNode = z.output<typeof MessageNodeSchema>;
declare const MessageListResponseSchema: z.ZodObject<{
    data: z.ZodOptional<z.ZodObject<{
        viewer: z.ZodOptional<z.ZodObject<{
            message_thread: z.ZodOptional<z.ZodObject<{
                thread_key: z.ZodOptional<z.ZodObject<{
                    thread_fbid: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                }, z.core.$strip>>;
                messages: z.ZodObject<{
                    edges: z.ZodArray<z.ZodObject<{
                        node: z.ZodObject<{
                            message_id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                            id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                            timestamp_precise: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<Date, string | number>>>;
                            timestamp: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<Date, string | number>>>;
                            message: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                                text: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                            }, z.core.$strip>>>;
                            message_sender: z.ZodOptional<z.ZodObject<{
                                id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                                name: z.ZodOptional<z.ZodString>;
                            }, z.core.$strip>>;
                            blob_attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                id: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>>;
                                type: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                                url: z.ZodOptional<z.ZodString>;
                                name: z.ZodOptional<z.ZodString>;
                                size: z.ZodOptional<z.ZodNumber>;
                            }, z.core.$strip>>>;
                            sticker: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                                id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                                label: z.ZodOptional<z.ZodString>;
                            }, z.core.$strip>>>;
                        }, z.core.$strip>;
                    }, z.core.$strip>>;
                    page_info: z.ZodObject<{
                        has_previous_page: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                        start_cursor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    }, z.core.$strip>;
                }, z.core.$strip>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$loose>;
type MessageListResponse = z.output<typeof MessageListResponseSchema>;
/**
 * Facebook returns the new message's ID and timestamp inside `payload`.
 * The schema is loose (`passthrough`) because field names vary between
 * API versions; we only extract what we need.
 */
declare const SendMessageResponseSchema: z.ZodObject<{
    payload: z.ZodOptional<z.ZodObject<{
        message_id: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<Date, string | number>>>;
    }, z.core.$loose>>;
    error: z.ZodOptional<z.ZodNumber>;
    errorSummary: z.ZodOptional<z.ZodString>;
}, z.core.$loose>;
type SendMessageResponse = z.output<typeof SendMessageResponseSchema>;
declare const ThreadNodeSchema: z.ZodObject<{
    thread_key: z.ZodOptional<z.ZodObject<{
        thread_fbid: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
        other_user_id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
    }, z.core.$strip>>;
    id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
    name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    image: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        uri: z.ZodString;
    }, z.core.$strip>>>;
    is_group_thread: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    all_participants: z.ZodOptional<z.ZodObject<{
        edges: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
            node: z.ZodObject<{
                id: z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>;
                name: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                profile_picture: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                    uri: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>>>;
            }, z.core.$strip>;
        }, z.core.$strip>>>>;
    }, z.core.$strip>>;
    unread_count: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    mute_until: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<Date, string | number>>>;
    folder: z.ZodOptional<z.ZodString>;
    updated_time_precise: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<Date, string | number>>>;
    last_message: z.ZodOptional<z.ZodObject<{
        nodes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            message_id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
            id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
            timestamp_precise: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<Date, string | number>>>;
            timestamp: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<Date, string | number>>>;
            message: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                text: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>>;
            message_sender: z.ZodOptional<z.ZodObject<{
                id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                name: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
            blob_attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>>;
                type: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                url: z.ZodOptional<z.ZodString>;
                name: z.ZodOptional<z.ZodString>;
                size: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>>;
            sticker: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                label: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
type ThreadNode = z.output<typeof ThreadNodeSchema>;
declare const ThreadListResponseSchema: z.ZodObject<{
    data: z.ZodOptional<z.ZodObject<{
        viewer: z.ZodOptional<z.ZodObject<{
            message_threads: z.ZodOptional<z.ZodObject<{
                edges: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                    node: z.ZodObject<{
                        thread_key: z.ZodOptional<z.ZodObject<{
                            thread_fbid: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                            other_user_id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                        }, z.core.$strip>>;
                        id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                        name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                        image: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                            uri: z.ZodString;
                        }, z.core.$strip>>>;
                        is_group_thread: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                        all_participants: z.ZodOptional<z.ZodObject<{
                            edges: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                                node: z.ZodObject<{
                                    id: z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>;
                                    name: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                                    profile_picture: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                                        uri: z.ZodOptional<z.ZodString>;
                                    }, z.core.$strip>>>;
                                }, z.core.$strip>;
                            }, z.core.$strip>>>>;
                        }, z.core.$strip>>;
                        unread_count: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
                        mute_until: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<Date, string | number>>>;
                        folder: z.ZodOptional<z.ZodString>;
                        updated_time_precise: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<Date, string | number>>>;
                        last_message: z.ZodOptional<z.ZodObject<{
                            nodes: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                message_id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                                id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                                timestamp_precise: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<Date, string | number>>>;
                                timestamp: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<Date, string | number>>>;
                                message: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                                    text: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                                }, z.core.$strip>>>;
                                message_sender: z.ZodOptional<z.ZodObject<{
                                    id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                                    name: z.ZodOptional<z.ZodString>;
                                }, z.core.$strip>>;
                                blob_attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                    id: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>>;
                                    type: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                                    url: z.ZodOptional<z.ZodString>;
                                    name: z.ZodOptional<z.ZodString>;
                                    size: z.ZodOptional<z.ZodNumber>;
                                }, z.core.$strip>>>;
                                sticker: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                                    id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                                    label: z.ZodOptional<z.ZodString>;
                                }, z.core.$strip>>>;
                            }, z.core.$strip>>>;
                        }, z.core.$strip>>;
                    }, z.core.$strip>;
                }, z.core.$strip>>>>;
                page_info: z.ZodOptional<z.ZodObject<{
                    has_next_page: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                    end_cursor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
            threads: z.ZodOptional<z.ZodObject<{
                edges: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                    node: z.ZodObject<{
                        thread_key: z.ZodOptional<z.ZodObject<{
                            thread_fbid: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                            other_user_id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                        }, z.core.$strip>>;
                        id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                        name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                        image: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                            uri: z.ZodString;
                        }, z.core.$strip>>>;
                        is_group_thread: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                        all_participants: z.ZodOptional<z.ZodObject<{
                            edges: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                                node: z.ZodObject<{
                                    id: z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>;
                                    name: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                                    profile_picture: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                                        uri: z.ZodOptional<z.ZodString>;
                                    }, z.core.$strip>>>;
                                }, z.core.$strip>;
                            }, z.core.$strip>>>>;
                        }, z.core.$strip>>;
                        unread_count: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
                        mute_until: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<Date, string | number>>>;
                        folder: z.ZodOptional<z.ZodString>;
                        updated_time_precise: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<Date, string | number>>>;
                        last_message: z.ZodOptional<z.ZodObject<{
                            nodes: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                message_id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                                id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                                timestamp_precise: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<Date, string | number>>>;
                                timestamp: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<Date, string | number>>>;
                                message: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                                    text: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                                }, z.core.$strip>>>;
                                message_sender: z.ZodOptional<z.ZodObject<{
                                    id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                                    name: z.ZodOptional<z.ZodString>;
                                }, z.core.$strip>>;
                                blob_attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                    id: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>>;
                                    type: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                                    url: z.ZodOptional<z.ZodString>;
                                    name: z.ZodOptional<z.ZodString>;
                                    size: z.ZodOptional<z.ZodNumber>;
                                }, z.core.$strip>>>;
                                sticker: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                                    id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                                    label: z.ZodOptional<z.ZodString>;
                                }, z.core.$strip>>>;
                            }, z.core.$strip>>>;
                        }, z.core.$strip>>;
                    }, z.core.$strip>;
                }, z.core.$strip>>>>;
                page_info: z.ZodOptional<z.ZodObject<{
                    has_next_page: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                    end_cursor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        user: z.ZodOptional<z.ZodObject<{
            message_threads: z.ZodOptional<z.ZodObject<{
                edges: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                    node: z.ZodObject<{
                        thread_key: z.ZodOptional<z.ZodObject<{
                            thread_fbid: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                            other_user_id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                        }, z.core.$strip>>;
                        id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                        name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                        image: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                            uri: z.ZodString;
                        }, z.core.$strip>>>;
                        is_group_thread: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                        all_participants: z.ZodOptional<z.ZodObject<{
                            edges: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                                node: z.ZodObject<{
                                    id: z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>;
                                    name: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                                    profile_picture: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                                        uri: z.ZodOptional<z.ZodString>;
                                    }, z.core.$strip>>>;
                                }, z.core.$strip>;
                            }, z.core.$strip>>>>;
                        }, z.core.$strip>>;
                        unread_count: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
                        mute_until: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<Date, string | number>>>;
                        folder: z.ZodOptional<z.ZodString>;
                        updated_time_precise: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<Date, string | number>>>;
                        last_message: z.ZodOptional<z.ZodObject<{
                            nodes: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                message_id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                                id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                                timestamp_precise: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<Date, string | number>>>;
                                timestamp: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<Date, string | number>>>;
                                message: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                                    text: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                                }, z.core.$strip>>>;
                                message_sender: z.ZodOptional<z.ZodObject<{
                                    id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                                    name: z.ZodOptional<z.ZodString>;
                                }, z.core.$strip>>;
                                blob_attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                    id: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>>;
                                    type: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                                    url: z.ZodOptional<z.ZodString>;
                                    name: z.ZodOptional<z.ZodString>;
                                    size: z.ZodOptional<z.ZodNumber>;
                                }, z.core.$strip>>>;
                                sticker: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                                    id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                                    label: z.ZodOptional<z.ZodString>;
                                }, z.core.$strip>>>;
                            }, z.core.$strip>>>;
                        }, z.core.$strip>>;
                    }, z.core.$strip>;
                }, z.core.$strip>>>>;
                page_info: z.ZodOptional<z.ZodObject<{
                    has_next_page: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                    end_cursor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        message_threads: z.ZodOptional<z.ZodObject<{
            edges: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                node: z.ZodObject<{
                    thread_key: z.ZodOptional<z.ZodObject<{
                        thread_fbid: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                        other_user_id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                    }, z.core.$strip>>;
                    id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                    name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    image: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                        uri: z.ZodString;
                    }, z.core.$strip>>>;
                    is_group_thread: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                    all_participants: z.ZodOptional<z.ZodObject<{
                        edges: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                            node: z.ZodObject<{
                                id: z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>;
                                name: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                                profile_picture: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                                    uri: z.ZodOptional<z.ZodString>;
                                }, z.core.$strip>>>;
                            }, z.core.$strip>;
                        }, z.core.$strip>>>>;
                    }, z.core.$strip>>;
                    unread_count: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
                    mute_until: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<Date, string | number>>>;
                    folder: z.ZodOptional<z.ZodString>;
                    updated_time_precise: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<Date, string | number>>>;
                    last_message: z.ZodOptional<z.ZodObject<{
                        nodes: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            message_id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                            id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                            timestamp_precise: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<Date, string | number>>>;
                            timestamp: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<Date, string | number>>>;
                            message: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                                text: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                            }, z.core.$strip>>>;
                            message_sender: z.ZodOptional<z.ZodObject<{
                                id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                                name: z.ZodOptional<z.ZodString>;
                            }, z.core.$strip>>;
                            blob_attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                id: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>>;
                                type: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                                url: z.ZodOptional<z.ZodString>;
                                name: z.ZodOptional<z.ZodString>;
                                size: z.ZodOptional<z.ZodNumber>;
                            }, z.core.$strip>>>;
                            sticker: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                                id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                                label: z.ZodOptional<z.ZodString>;
                            }, z.core.$strip>>>;
                        }, z.core.$strip>>>;
                    }, z.core.$strip>>;
                }, z.core.$strip>;
            }, z.core.$strip>>>>;
            page_info: z.ZodOptional<z.ZodObject<{
                has_next_page: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                end_cursor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$loose>;
type ThreadListResponse = z.output<typeof ThreadListResponseSchema>;
declare const UserProfileSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>;
    name: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    username: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    profile_picture: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        uri: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    friends_count: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    mutual_friends: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        count: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>>;
    is_friend: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
type ParsedUserProfile = z.output<typeof UserProfileSchema>;
declare const UserProfileResponseSchema: z.ZodObject<{
    data: z.ZodOptional<z.ZodObject<{
        user: z.ZodOptional<z.ZodObject<{
            id: z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>;
            name: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            username: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            profile_picture: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                uri: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>>;
            friends_count: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            mutual_friends: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                count: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>>;
            is_friend: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
        viewer: z.ZodOptional<z.ZodObject<{
            actor: z.ZodOptional<z.ZodObject<{
                id: z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>;
                name: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                username: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                profile_picture: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                    uri: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>>>;
                friends_count: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                mutual_friends: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                    count: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strip>>>;
                is_friend: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$loose>;
type UserProfileResponse = z.output<typeof UserProfileResponseSchema>;
declare const FriendListResponseSchema: z.ZodObject<{
    data: z.ZodOptional<z.ZodObject<{
        viewer: z.ZodOptional<z.ZodObject<{
            friends: z.ZodOptional<z.ZodObject<{
                edges: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                    node: z.ZodObject<{
                        id: z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>;
                        name: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                        username: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                        profile_picture: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                            uri: z.ZodOptional<z.ZodString>;
                        }, z.core.$strip>>>;
                        friends_count: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                        mutual_friends: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                            count: z.ZodOptional<z.ZodNumber>;
                        }, z.core.$strip>>>;
                        is_friend: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strip>;
                }, z.core.$strip>>>>;
                page_info: z.ZodOptional<z.ZodObject<{
                    has_next_page: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                    end_cursor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$loose>;
type FriendListResponse = z.output<typeof FriendListResponseSchema>;
declare const PresenceEntrySchema: z.ZodObject<{
    user_id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
    is_online: z.ZodOptional<z.ZodBoolean>;
    is_present: z.ZodOptional<z.ZodBoolean>;
    is_active: z.ZodOptional<z.ZodBoolean>;
    last_active_time: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    last_active: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
}, z.core.$strip>;
type ParsedPresenceEntry = z.output<typeof PresenceEntrySchema>;
declare const PresenceResponseSchema: z.ZodObject<{
    data: z.ZodOptional<z.ZodObject<{
        user: z.ZodOptional<z.ZodObject<{
            presence_data: z.ZodOptional<z.ZodObject<{
                user_id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                is_online: z.ZodOptional<z.ZodBoolean>;
                is_present: z.ZodOptional<z.ZodBoolean>;
                is_active: z.ZodOptional<z.ZodBoolean>;
                last_active_time: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                last_active: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
            }, z.core.$strip>>;
            is_online: z.ZodOptional<z.ZodBoolean>;
            is_present: z.ZodOptional<z.ZodBoolean>;
            last_active_time: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        }, z.core.$strip>>;
        presence: z.ZodOptional<z.ZodObject<{
            presence_data: z.ZodOptional<z.ZodObject<{
                user_id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                is_online: z.ZodOptional<z.ZodBoolean>;
                is_present: z.ZodOptional<z.ZodBoolean>;
                is_active: z.ZodOptional<z.ZodBoolean>;
                last_active_time: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                last_active: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$loose>;
type PresenceResponse = z.output<typeof PresenceResponseSchema>;
declare const PollOptionSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
    text: z.ZodString;
    vote_count: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    voters: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>>>;
}, z.core.$strip>;
type ParsedPollOption = z.output<typeof PollOptionSchema>;
declare const PollResponseSchema: z.ZodObject<{
    data: z.ZodOptional<z.ZodObject<{
        poll: z.ZodOptional<z.ZodObject<{
            id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
            title: z.ZodOptional<z.ZodString>;
            options: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                text: z.ZodString;
                vote_count: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
                voters: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>>>;
            }, z.core.$strip>>>>;
            total_vote_count: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
            expiration_time: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<Date, string | number>>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$loose>;
type PollResponse = z.output<typeof PollResponseSchema>;
declare const MessageSearchNodeSchema: z.ZodObject<{
    message_id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
    id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
    thread_key: z.ZodOptional<z.ZodObject<{
        thread_fbid: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
    }, z.core.$strip>>;
    sender: z.ZodOptional<z.ZodObject<{
        id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
        name: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    text: z.ZodOptional<z.ZodString>;
    snippet: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
}, z.core.$strip>;
type ParsedMessageSearchNode = z.output<typeof MessageSearchNodeSchema>;
declare const MessageSearchResponseSchema: z.ZodObject<{
    data: z.ZodOptional<z.ZodObject<{
        search_results: z.ZodOptional<z.ZodObject<{
            edges: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                node: z.ZodObject<{
                    message_id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                    id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                    thread_key: z.ZodOptional<z.ZodObject<{
                        thread_fbid: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                    }, z.core.$strip>>;
                    sender: z.ZodOptional<z.ZodObject<{
                        id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                        name: z.ZodOptional<z.ZodString>;
                    }, z.core.$strip>>;
                    text: z.ZodOptional<z.ZodString>;
                    snippet: z.ZodOptional<z.ZodString>;
                    timestamp: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                }, z.core.$strip>;
            }, z.core.$strip>>>>;
            page_info: z.ZodOptional<z.ZodObject<{
                has_next_page: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                end_cursor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$loose>;
type MessageSearchResponse = z.output<typeof MessageSearchResponseSchema>;
declare const ThreadSearchNodeSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
    thread_key: z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>, z.ZodObject<{
        thread_fbid: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
    }, z.core.$strip>]>>;
    name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    is_group_thread: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    all_participants: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
        node: z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
        }, z.core.$loose>;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>]>>>;
    last_message: z.ZodOptional<z.ZodObject<{
        timestamp: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
type ParsedThreadSearchNode = z.output<typeof ThreadSearchNodeSchema>;
declare const ThreadSearchResponseSchema: z.ZodObject<{
    data: z.ZodOptional<z.ZodObject<{
        search_results: z.ZodOptional<z.ZodObject<{
            edges: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                node: z.ZodObject<{
                    id: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                    thread_key: z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>, z.ZodObject<{
                        thread_fbid: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>>;
                    }, z.core.$strip>]>>;
                    name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    is_group_thread: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                    all_participants: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
                        node: z.ZodObject<{
                            name: z.ZodOptional<z.ZodString>;
                        }, z.core.$loose>;
                    }, z.core.$strip>, z.ZodObject<{
                        name: z.ZodOptional<z.ZodString>;
                    }, z.core.$loose>]>>>;
                    last_message: z.ZodOptional<z.ZodObject<{
                        timestamp: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                    }, z.core.$strip>>;
                }, z.core.$strip>;
            }, z.core.$strip>>>>;
            page_info: z.ZodOptional<z.ZodObject<{
                has_next_page: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                end_cursor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$loose>;
type ThreadSearchResponse = z.output<typeof ThreadSearchResponseSchema>;
declare const UploadResponseSchema: z.ZodObject<{
    payload: z.ZodOptional<z.ZodObject<{
        metadata: z.ZodOptional<z.ZodArray<z.ZodObject<{
            fbid: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
            filename: z.ZodOptional<z.ZodString>;
            filetype: z.ZodOptional<z.ZodString>;
            attachment_id: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        }, z.core.$strip>>>;
        fbid: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        attachment_id: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        attachment_token: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$loose>;
type UploadResponse = z.output<typeof UploadResponseSchema>;
/**
 * Extract the real server-assigned attachment ID from an upload response.
 * Returns `null` if no ID is present (caller should throw `UploadError`).
 */
declare function extractAttachmentId(raw: unknown): string | null;
declare const LoginResponseSchema: z.ZodObject<{
    jsmods: z.ZodOptional<z.ZodObject<{
        require: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
    }, z.core.$strip>>;
    error: z.ZodOptional<z.ZodNumber>;
    errorSummary: z.ZodOptional<z.ZodString>;
    errorDescription: z.ZodOptional<z.ZodString>;
}, z.core.$loose>;
type LoginResponse = z.output<typeof LoginResponseSchema>;
declare function parseThreadListResponse(text: string): ThreadListResponse;
declare function parseMessageListResponse(text: string): MessageListResponse;
declare function parseSendMessageResponse(text: string): SendMessageResponse;
declare function parseUserProfileResponse(text: string): UserProfileResponse;
declare function parseFriendListResponse(text: string): FriendListResponse;
declare function parsePresenceResponse(text: string): PresenceResponse;
declare function parsePollResponse(text: string): PollResponse;
declare function parseMessageSearchResponse(text: string): MessageSearchResponse;
declare function parseThreadSearchResponse(text: string): ThreadSearchResponse;
declare function parseUploadResponse(text: string): UploadResponse;
declare function parseLoginResponse(text: string): LoginResponse;

export { API_ENDPOINTS, type AccountCheckpointEvent, type AccountHealthyEvent, type AccountRefreshEvent, type AccountRefreshFailedEvent, type AccountRestrictedEvent, type AccountStaleEvent, type AccountSuspendedEvent, type AccountWarningEvent, type ApiEndpointName, type AppStateCookie, type AppStateInputType, type AppStateLoadOptions, type AppStateRefreshFailedEvent, type AppStateResult, AttachmentSchema, AuthError, AuthManager, type BrowserFingerprint, CacheError, CacheManager, CheckpointRequiredError, type ClientEventMap, type ClientOptions, type Config, ConfigurationError, type ConnectedEvent, ConnectionError, type CreateGroupOptions, type CreatePollOptions, DNSError, DeserializationError, DiagnosticsModule, type DiagnosticsStats, type DisconnectedEvent, DownloadError, type DownloadOptions, type EndpointDefinition, type ErrorContext, FileStorageAdapter, FilesModule, ForbiddenError, type FormRequestOptions, type FriendListOptions, type FriendListResponse, FriendListResponseSchema, GRAPHQL_FRIENDLY_NAMES, type GraphQLBodyOptions, type HealthCheckResult, HttpClient, HttpError, type HttpMethod, type HttpRequestOptions, type HttpResponse, InvalidAppStateError, LibSqlSessionStore, LibSqlStorageAdapter, type LightspeedRequestOptions, type Logger, LoginFailedError, type LoginResponse, LoginResponseSchema, MemoryStorageAdapter, type Message, type MessageAttachment, type MessageDeliveredEvent, type MessageEvent, type MessageListResponse, MessageListResponseSchema, type MessageNode, MessageNodeSchema, type MessageReactionEvent, type MessageReactionRemovedEvent, type MessageSearchResponse, MessageSearchResponseSchema, type MessageSearchResult, type MessageSeenEvent, type MessageUnsendEvent, MessagesModule, type Middleware, type MultipartField, type MultipartFile, NetworkError, NotFoundError, PandindiganClient, PandindiganError, ParseError, type ParsedAttachment, type ParsedMessageSearchNode, type ParsedPollOption, type ParsedPresenceEntry, type ParsedThreadSearchNode, type ParsedUserProfile, type Poll, type PollOption, PollOptionSchema, type PollResponse, PollResponseSchema, PollsModule, PresenceEntrySchema, PresenceModule, type PresenceResponse, PresenceResponseSchema, type PresenceStatus, type PresenceUpdateEvent, type ProxyConfig, ProxyError, ProxyManager, type ProxyOptions, RateLimitError, type ReconnectFailedEvent, type ReconnectedEvent, type ReconnectingEvent, type ReplyOptions, type RequestContext, type RequestSpec, type ResponseContext, ResponseValidationError, SearchModule, type SearchOptions, type SearchUsersOptions, type SendMessageOptions, type SendMessageResponse, SendMessageResponseSchema, type SendMessageResult, type SendStickerOptions, type SendStickerResult, ServerError, SessionExpiredError, type SessionRestoredEvent, type SessionRow, type SessionSavedEvent, type SessionTokens, SessionsModule, StealthManager, type StickerMeta, type StickerPack, StickersModule, type StorageAdapter, StorageError, type Thread, type ThreadListOptions, type ThreadListResponse, ThreadListResponseSchema, type ThreadMutedEvent, type ThreadNode, ThreadNodeSchema, type ThreadParticipantAddedEvent, type ThreadParticipantRemovedEvent, type ThreadPhotoChangedEvent, type ThreadReadEvent, type ThreadRenamedEvent, type ThreadSearchResponse, ThreadSearchResponseSchema, type ThreadSearchResult, type ThreadTypingEvent, ThreadsModule, TimeoutError, TwoFactorRequiredError, TypedEventEmitter, UploadError, type UploadOptions, type UploadResponse, UploadResponseSchema, type UploadResult, type UserProfile, type UserProfileResponse, UserProfileResponseSchema, UserProfileSchema, UsersModule, type VotePollOptions, buildFormRequest as buildFormRequestBody, buildGraphQLBody, buildGraphQLRequest as buildGraphQLRequestBody, buildJsonBody, buildLightspeedBody, buildMultipartBody, buildStealthHeaders, clearDnsCache, createClient, createLogger, cryptoRandomFloat, cryptoRandomInt, decrypt, encodeFormBody, encrypt, exportJar, extractAttachmentId, generateBoundary, generateFingerprint, getEndpointUrl, getUserIdFromJar, hmac, humanDelay, hydrateJar, isGraphQLEndpoint, isMessageSendEndpoint, loadAppState, loadConfig, login, makeFormRequestSpec, makeMultipartRequestSpec, maskProxyUrl, nsKey, parseFriendListResponse, parseLoginResponse, parseMessageListResponse, parseMessageSearchResponse, parsePollResponse, parsePresenceResponse, parseRawResponse, parseSendMessageResponse, parseThreadListResponse, parseThreadSearchResponse, parseUploadResponse, parseUserProfileResponse, randomHex, resolveProxyUrl, resolveWithCache, stripFbPrefix, validate, validateAppState };

import { z, type ZodIssue } from 'zod';
import { config as dotenvConfig } from 'dotenv';
import { expand } from 'dotenv-expand';
import { ConfigurationError } from '../errors/index.js';
import { maskProxyUrl } from '../proxy/index.js';

expand(dotenvConfig());

const stealthLevelSchema = z.enum(['off', 'low', 'medium', 'high', 'paranoid']);
const storageAdapterSchema = z.enum(['memory', 'file', 'libsql', 'redis']);
const logLevelSchema = z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']);

export const configSchema = z.object({
  logLevel: logLevelSchema.default('info'),
  logPretty: z.boolean().default(false),

  http: z.object({
    maxConnections: z.number().int().min(1).max(100).default(10),
    timeout: z.object({
      connect: z.number().int().min(100).default(5000),
      request: z.number().int().min(1000).default(30000),
      body: z.number().int().min(1000).default(60000),
    }).default(() => ({} as any)),
    retries: z.object({
      max: z.number().int().min(0).max(20).default(5),
      baseDelay: z.number().int().min(100).default(500),
    }).default(() => ({} as any)),
  }).default(() => ({} as any)),

  mqtt: z.object({
    reconnect: z.object({
      maxAttempts: z.number().int().min(0).default(10),
      baseDelay: z.number().int().min(100).default(1000),
    }).default(() => ({} as any)),
    heartbeat: z.object({
      interval: z.number().int().min(5000).default(60000),
    }).default(() => ({} as any)),
  }).default(() => ({} as any)),

  cache: z.object({
    ttl: z.number().int().min(0).default(300000),
    maxSize: z.number().int().min(1).default(500),
  }).default(() => ({ ttl: 300000, maxSize: 500 })),

  session: z.object({
    persistPath: z.string().nullable().default(null),
    restoreOnStart: z.boolean().default(true),
  }).default(() => ({} as any)),

  storage: z.object({
    adapter: storageAdapterSchema.default('libsql'),
  }).default(() => ({} as any)),

  stealth: z.object({
    level: stealthLevelSchema.default('medium'),
    delays: z.object({
      enabled: z.boolean().default(true),
      actionDelay: z.object({ min: z.number().default(300), max: z.number().default(1800) }).default(() => ({} as any)),
      messageDelay: z.object({ min: z.number().default(800), max: z.number().default(4000) }).default(() => ({} as any)),
      paginationDelay: z.object({ min: z.number().default(200), max: z.number().default(900) }).default(() => ({} as any)),
    }).default(() => ({} as any)),
    typingSimulation: z.object({
      enabled: z.boolean().default(true),
      wpm: z.object({ min: z.number().default(40), max: z.number().default(80) }).default(() => ({} as any)),
      naturalPauses: z.boolean().default(true),
    }).default(() => ({} as any)),
    rateLimit: z.object({
      enabled: z.boolean().default(true),
      requestsPerMinute: z.number().int().min(1).default(30),
      minInterval: z.number().int().min(0).default(500),
      onOverload: z.enum(['queue', 'drop', 'throw']).default('queue'),
    }).default(() => ({} as any)),
    userAgent: z.object({
      enabled: z.boolean().default(true),
      seed: z.string().nullable().default(null),
    }).default(() => ({} as any)),
    fingerprint: z.object({
      enabled: z.boolean().default(true),
      consistent: z.boolean().default(true),
      seed: z.string().nullable().default(null),
    }).default(() => ({} as any)),
    warmup: z.object({
      enabled: z.boolean().default(false),
      duration: z.number().int().min(1).default(30),
      startFraction: z.number().min(0.01).max(1).default(0.1),
      emitEvent: z.boolean().default(true),
    }).default(() => ({} as any)),
  }).default(() => ({} as any)),

  refresh: z.object({
    checkInterval: z.number().int().min(60000).default(300000),
    threshold: z.number().int().min(60000).default(1800000),
    retries: z.number().int().min(0).default(3),
    failSilently: z.boolean().default(true),
    autoPersist: z.boolean().default(true),
  }).default(() => ({} as any)),

  keepalive: z.object({
    enabled: z.boolean().default(true),
    interval: z.number().int().min(60000).default(600000),
    onFailure: z.enum(['warn', 'throw', 'reconnect']).default('warn'),
  }).default(() => ({} as any)),

  proxy: z.object({
    url: z.string().nullable().default(null),
    rotateEvery: z.number().int().min(1).nullable().default(null),
    pool: z.array(z.string()).default([]),
    healthCheck: z.boolean().default(false),
    failOnUnhealthy: z.boolean().default(false),
  }).default(() => ({
    url: null,
    rotateEvery: null,
    pool: [],
    healthCheck: false,
    failOnUnhealthy: false,
  })),
});

export type Config = z.infer<typeof configSchema>;

function fromEnv(): Partial<Record<string, unknown>> {
  const env: Partial<Record<string, unknown>> = {};

  if (process.env['PFCA_LOG_LEVEL']) env['logLevel'] = process.env['PFCA_LOG_LEVEL'];
  if (process.env['PFCA_LOG_PRETTY']) env['logPretty'] = process.env['PFCA_LOG_PRETTY'] === 'true';

  const http: Record<string, unknown> = {};
  if (process.env['PFCA_HTTP_MAX_CONNECTIONS']) http['maxConnections'] = Number(process.env['PFCA_HTTP_MAX_CONNECTIONS']);
  if (process.env['PFCA_HTTP_TIMEOUT_CONNECT'] || process.env['PFCA_HTTP_TIMEOUT_REQUEST']) {
    http['timeout'] = {
      connect: Number(process.env['PFCA_HTTP_TIMEOUT_CONNECT'] ?? 5000),
      request: Number(process.env['PFCA_HTTP_TIMEOUT_REQUEST'] ?? 30000),
    };
  }
  if (process.env['PFCA_HTTP_RETRIES_MAX']) {
    http['retries'] = { max: Number(process.env['PFCA_HTTP_RETRIES_MAX']) };
  }
  if (Object.keys(http).length > 0) env['http'] = http;

  const mqtt: Record<string, unknown> = {};
  if (process.env['PFCA_MQTT_RECONNECT_MAX']) mqtt['reconnect'] = { maxAttempts: Number(process.env['PFCA_MQTT_RECONNECT_MAX']) };
  if (process.env['PFCA_MQTT_HEARTBEAT_INTERVAL']) mqtt['heartbeat'] = { interval: Number(process.env['PFCA_MQTT_HEARTBEAT_INTERVAL']) };
  if (Object.keys(mqtt).length > 0) env['mqtt'] = mqtt;

  const cache: Record<string, unknown> = {};
  if (process.env['PFCA_CACHE_TTL']) cache['ttl'] = Number(process.env['PFCA_CACHE_TTL']);
  if (process.env['PFCA_CACHE_MAX_SIZE']) cache['maxSize'] = Number(process.env['PFCA_CACHE_MAX_SIZE']);
  if (Object.keys(cache).length > 0) env['cache'] = cache;

  const storage: Record<string, unknown> = {};
  if (process.env['PFCA_STORAGE_ADAPTER']) storage['adapter'] = process.env['PFCA_STORAGE_ADAPTER'];
  if (Object.keys(storage).length > 0) env['storage'] = storage;

  const session: Record<string, unknown> = {};
  if (process.env['PFCA_SESSION_PERSIST_PATH']) session['persistPath'] = process.env['PFCA_SESSION_PERSIST_PATH'];
  if (Object.keys(session).length > 0) env['session'] = session;

  if (process.env['PFCA_STEALTH_LEVEL']) env['stealth'] = { level: process.env['PFCA_STEALTH_LEVEL'] };
  if (process.env['PFCA_PROXY_URL']) env['proxy'] = { url: process.env['PFCA_PROXY_URL'] };

  return env;
}

const SUPPORTED_PROXY_PROTOCOLS = new Set([
  'http:', 'https:', 'socks4:', 'socks4a:', 'socks5:', 'socks5h:',
]);

function validateProxyUrls(config: Config): void {
  const urls = [
    ...(config.proxy.url ? [config.proxy.url] : []),
    ...(config.proxy.pool ?? []),
  ];

  for (const url of urls) {
    const masked = maskProxyUrl(url);
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new ConfigurationError(
        `Invalid proxy URL: "${masked}"`,
        { proxyUrl: masked },
      );
    }

    if (!SUPPORTED_PROXY_PROTOCOLS.has(parsed.protocol)) {
      throw new ConfigurationError(
        `Unsupported proxy protocol "${parsed.protocol}" in proxy URL. ` +
        `Supported protocols: ${[...SUPPORTED_PROXY_PROTOCOLS].join(', ')}`,
        { proxyUrl: masked, protocol: parsed.protocol },
      );
    }

    if (!parsed.hostname) {
      throw new ConfigurationError(
        `Proxy URL is missing a hostname: "${masked}"`,
        { proxyUrl: masked },
      );
    }
  }
}

export function loadConfig(overrides?: Partial<Record<string, unknown>>): Config {
  const merged = { ...fromEnv(), ...overrides };
  const result = configSchema.safeParse(merged);
  if (!result.success) {
    const messages = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    throw new ConfigurationError(`Invalid configuration: ${messages}`, { issues: result.error.issues });
  }

  const config = result.data;
  config.proxy = {
    url: config.proxy?.url ?? null,
    rotateEvery: config.proxy?.rotateEvery ?? null,
    pool: config.proxy?.pool ?? [],
    healthCheck: config.proxy?.healthCheck ?? false,
    failOnUnhealthy: config.proxy?.failOnUnhealthy ?? false,
  };

  validateProxyUrls(config);
  return config;
}

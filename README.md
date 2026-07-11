# panindigan-fca

**TypeScript Library for Facebook Messenger Bots — Personal Accounts**

[![npm version](https://img.shields.io/npm/v/panindigan-fca)](https://www.npmjs.com/package/panindigan-fca)
[![npm downloads](https://img.shields.io/npm/dm/panindigan-fca.svg)](https://www.npmjs.com/package/panindigan-fca)
[![npm total downloads](https://img.shields.io/npm/dt/panindigan-fca.svg)](https://www.npmjs.com/package/panindigan-fca)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8%2B-blue)](https://www.typescriptlang.org)

**panindigan-fca** ("stand for it" / "vouch for it" in Filipino) is a production-quality TypeScript SDK for building Facebook Messenger bots on personal accounts. It uses AppState-based authentication (browser cookie import), provides a resilient multi-layered storage system, typed events, and a full MQTT+polling transport — all designed to stay online in Docker and serverless environments.

> Created by **Nazzel**, a Filipino developer.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [AppState Authentication](#appstate-authentication)
  - [Cookie Normalization](#cookie-normalization)
  - [Supported Exporter Formats](#supported-exporter-formats)
  - [Pre-Login Validation](#pre-login-validation)
- [Configuration](#configuration)
- [Events](#events)
- [Storage](#storage)
  - [Circuit Breaker](#circuit-breaker)
  - [Storage Metrics](#storage-metrics)
  - [Pending Write Queue](#pending-write-queue)
  - [Storage Diagnostics](#storage-diagnostics)
- [Session Management](#session-management)
- [Logging](#logging)
- [MQTT & Real-Time Transport](#mqtt--real-time-transport)
- [HTTP Client](#http-client)
- [Error Handling](#error-handling)
- [Middleware](#middleware)
- [Multi-Account Usage](#multi-account-usage)
- [Proxy Support](#proxy-support)
- [Diagnostics Module](#diagnostics-module)
- [Best Practices](#best-practices)
- [Production Deployment](#production-deployment)
- [Environment Variables](#environment-variables)
- [Migration Guide](#migration-guide)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

---

## Installation

```bash
npm install panindigan-fca
# or
pnpm add panindigan-fca
# or
bun add panindigan-fca
```

**Requirements:** Node.js ≥ 22 (or Bun ≥ 1.3). The package ships both ESM (`dist/index.js`) and CJS (`dist/index.cjs`) builds so it works in any modern runtime.

---

## Quick Start

```typescript
import { createClient } from 'panindigan-fca';

const client = await createClient({
  appState: process.env.APPSTATE_JSON,   // JSON string exported from browser
  onMessage: (msg) => {
    console.log(`${msg.senderName}: ${msg.body}`);
    if (msg.body === 'ping') {
      client.messages.send(msg.threadId, { body: 'pong' });
    }
  },
});

console.log(`Logged in as UID ${client.uid}`);
```

---

## AppState Authentication

panindigan-fca authenticates using a browser AppState — a JSON array of Facebook session cookies exported from your browser after logging in manually. No password is ever required or stored.

### Getting Your AppState

Use the [Cookie Editor](https://chrome.google.com/webstore/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm) browser extension or the [c3c/fbstate](https://github.com/c3c/fbstate) exporter:

1. Log into `facebook.com` in your browser.
2. Export all cookies for the domain as JSON.
3. Pass the JSON string (or parsed array) to `createClient` or `loadAppState`.

### Accepted AppState Sources

```typescript
import { createClient } from 'panindigan-fca';

// JSON string
await createClient({ appState: '[{"key":"c_user","value":"..."}]' });

// Parsed array
await createClient({ appState: [{ key: 'c_user', value: '...' }] });

// Base64-encoded JSON
await createClient({ appState: 'W3sia2V5IjoiY191c2VyI...' });

// URL-encoded JSON string
await createClient({ appState: '%5B%7B%22key%22%3A%22c_user%22...' });

// File path
await createClient({ appStatePath: './appstate.json' });

// Environment variable (automatically checked)
// Set APPSTATE_JSON, APPSTATE_BASE64, or APPSTATE in your environment
await createClient({});
```

### Cookie Normalization

v0.1.9 introduces a **production-grade cookie normalization pipeline** that accepts all known AppState exporter formats with maximum compatibility:

```typescript
import { normalizeCookies, validateAppState } from 'panindigan-fca';

// Works with Chrome extension format (name + expirationDate)
const rawFromChrome = [
  { name: 'c_user', value: '100012345', domain: '.facebook.com', expirationDate: 9999999999 },
  { name: 'xs',     value: 'abc:def',   domain: '.facebook.com' },
  { name: 'datr',   value: 'xYz789',   domain: '.facebook.com' },
];

// Works with legacy FCA format (key)
const rawFromLegacy = [
  { key: 'c_user', value: '100012345', domain: '.facebook.com', expires: 'Infinity' },
  { key: 'xs',     value: 'abc:def',   domain: '.facebook.com' },
  { key: 'datr',   value: 'xYz789',   domain: '.facebook.com' },
];

// Works with mixed format (both key and name)
const rawFromMixed = [
  { key: 'c_user', name: 'c_user', value: '100012345', domain: '.facebook.com' },
  { key: 'xs', name: 'xs', value: 'abc:def', domain: '.facebook.com' },
  { key: 'datr', name: 'datr', value: 'xYz789', domain: '.facebook.com' },
];

const [cookies, diagnostics] = normalizeCookies(rawFromChrome);
// cookies: AppStateCookie[] (key/name normalized, both fields included)
// diagnostics: string[] (every action taken: aliasing, dedup, expiry warnings)

console.log(diagnostics);
// ['Cookie[0] "c_user": normalized "name" → "key"', ...]

// validateAppState calls normalizeCookies internally
const validated = validateAppState(rawFromChrome);
```

### Supported Exporter Formats

| Field | Description |
|---|---|
| `key` | Canonical cookie name (our format) |
| `name` | Chrome / Firefox extension alias for `key` |
| `value` | Cookie value (required) |
| `domain` | Cookie domain (defaults to `.facebook.com` if absent) |
| `path` | Cookie path (defaults to `/` if absent) |
| `expires` | Expiry as ISO string or Unix epoch seconds |
| `expirationDate` | Chrome DevTools epoch seconds (takes precedence over `expires`) |
| `secure` | HTTPS-only flag |
| `httpOnly` | HTTP-only flag |
| `hostOnly` | Host-only flag |
| `session` | `true` = session cookie, no persistent expiry |
| `sameSite` | SameSite attribute (`"Lax"`, `"Strict"`, `"None"`) |
| `priority` | Cookie priority (`"Low"` / `"Medium"` / `"High"`) |
| `sourceScheme` | `"Secure"` or `"NonSecure"` (Chrome DevTools Protocol) |
| `sourcePort` | Source port number |

### Pre-Login Validation

v0.1.9 adds **pre-flight checks** in `AuthManager.bootstrap()` that verify cookie integrity before contacting Facebook:

```typescript
import { validateAppState, InvalidAppStateError } from 'panindigan-fca';

try {
  const cookies = validateAppState(rawInput);
} catch (err) {
  if (err instanceof InvalidAppStateError) {
    // err.context.missingCookie     — which required cookie is absent
    // err.context.expiredCookies    — list of expired required cookies
    // err.context.normalizationDiagnostics — full normalization trace
    // err.context.diagnostics        — detailed cookie status (required/recommended)
    console.error(err.message, err.context);
  }
}
```

**Validation checks performed in order:**

1. **Required cookies present** — `c_user`, `xs`, and `datr` must all be present after normalization.
2. **Required cookies not expired** — if any required cookie carries an explicit `expires` / `expirationDate` that is already in the past, validation throws.
3. **Deduplication** — cookies with the same `key + domain` are deduplicated (last wins).
4. **Domain validation** — warns about invalid domains (supports `facebook.com`, `.facebook.com`, `m.facebook.com`, `www.facebook.com`).
5. **Duplicate detection** — logs warnings when duplicate cookies are found.

**Pre-flight checks in bootstrap():**

Before making any HTTP requests to Facebook, the library now:
- Verifies cookie count is non-zero
- Checks all required cookies are present
- Validates recommended cookies (`fr`, `sb`, `wd`, `presence`)
- Detects duplicate cookies and invalid domains
- Aborts authentication immediately if required cookies are missing

This prevents wasting HTTP requests on invalid AppState and provides actionable error messages.

---

## Configuration

```typescript
import { loadConfig, createClient } from 'panindigan-fca';

const config = loadConfig({
  // Auth
  appState: process.env.APPSTATE_JSON,

  // Logging
  log: {
    level: 'info',      // trace | debug | info | warn | error | fatal | success
    pretty: true,       // human-readable output in development
  },

  // Proxy (SOCKS5 / HTTP / HTTPS)
  proxy: {
    url: 'socks5://user:pass@proxy.example.com:1080',
  },

  // Storage
  storage: {
    adapter: 'libsql',  // 'memory' | 'file' | 'libsql'
  },

  // Cookie auto-refresh
  refresh: {
    autoPersist: true,
    retries: 3,
    checkInterval: 60_000,  // ms
    failSilently: true,
  },

  // Cache
  cache: {
    maxSize: 500,
    ttlMs: 60_000,
  },
});

const client = await createClient(config);
```

---

## Events

All events are typed. Use `client.on(event, handler)` to subscribe:

```typescript
client.on('message',            (e) => { /* MessageEvent */             });
client.on('messageReaction',    (e) => { /* MessageReactionEvent */     });
client.on('messageUnsend',      (e) => { /* MessageUnsendEvent */       });
client.on('messageDelivered',   (e) => { /* MessageDeliveredEvent */    });
client.on('messageSeen',        (e) => { /* MessageSeenEvent */         });
client.on('threadTyping',       (e) => { /* ThreadTypingEvent */        });
client.on('threadRead',         (e) => { /* ThreadReadEvent */          });
client.on('threadRenamed',      (e) => { /* ThreadRenamedEvent */       });
client.on('presenceUpdate',     (e) => { /* PresenceUpdateEvent */      });
client.on('connected',          (e) => { /* ConnectedEvent */           });
client.on('disconnected',       (e) => { /* DisconnectedEvent */        });
client.on('reconnecting',       (e) => { /* ReconnectingEvent */        });
client.on('reconnected',        (e) => { /* ReconnectedEvent */         });
client.on('reconnectFailed',    (e) => { /* ReconnectFailedEvent */     });
client.on('accountStale',       (e) => { /* AccountStaleEvent */        });
client.on('accountSuspended',   (e) => { /* AccountSuspendedEvent */    });
client.on('accountCheckpoint',  (e) => { /* AccountCheckpointEvent */   });
client.on('sessionSaved',       (e) => { /* SessionSavedEvent */        });
client.on('sessionRestored',    (e) => { /* SessionRestoredEvent */     });
```

---

## Storage

panindigan-fca includes three storage adapters. The library guarantees that **storage failures never prevent Facebook login or client startup** — the bot always stays functional.

### In-Memory (default)

```typescript
import { MemoryStorageAdapter } from 'panindigan-fca';
const storage = new MemoryStorageAdapter();
```

### File

Persists to a local JSON file. Suitable for single-instance deployments.

```typescript
import { FileStorageAdapter } from 'panindigan-fca';
const storage = new FileStorageAdapter('./storage.json');
```

### LibSql / Remote API (recommended for production)

Connects to the Panindigan remote storage API. Automatically falls back to in-memory mode when the API is unreachable and replays writes when it comes back online.

```typescript
import { LibSqlStorageAdapter } from 'panindigan-fca';
const storage = new LibSqlStorageAdapter(
  'https://storage.panindigan.com',  // or set PFCA_STORAGE_API_URL
  'your-api-token',                  // or set PFCA_STORAGE_API_TOKEN
);
await createClient({ storage });
```

### Circuit Breaker

v0.1.8 adds a per-endpoint circuit breaker to `StorageApiClient`. After `circuitBreakerThreshold` consecutive failures (default 3), the circuit opens and all requests to that endpoint are immediately rejected. After `circuitBreakerRecoveryMs` (default 30 s), one recovery probe is allowed:

- **Probe succeeds** → circuit closes, normal operation resumes.
- **Probe fails** → circuit stays open, recovery window resets.

```typescript
import { StorageApiClient } from 'panindigan-fca';

const client = new StorageApiClient({
  baseUrl: 'https://storage.panindigan.com',
  authToken: 'your-token',
  circuitBreakerThreshold: 3,      // failures to open circuit
  circuitBreakerRecoveryMs: 30_000, // wait before probe
  retries: 2,
  timeoutMs: 10_000,
});

console.log(client.getCircuitStates());
// { 'https://storage.panindigan.com': 'closed' }
```

### Storage Metrics

```typescript
const metrics = client.getMetrics();
// {
//   totalRequests: 42,
//   successRequests: 40,
//   errorRequests: 2,
//   circuitBreakerTrips: 0,
//   lastLatencyMs: 45,
//   avgLatencyMs: 38,
//   p95LatencyMs: 120,   // null until 10 samples collected
// }
```

### Pending Write Queue

When the remote is unreachable, writes are queued in memory (FIFO, capped at 1 000). They are replayed automatically when the remote reconnects. Ordering is guaranteed: the queue stops at the first failure so that a later `set` never arrives before an earlier `clear`.

```typescript
const diag = adapter.getDiagnostics();
console.log(diag.pendingWriteCount); // writes waiting for replay
```

### Storage Diagnostics

```typescript
const diag = storage.getDiagnostics();
// {
//   provider: 'remote' | 'memory-fallback',
//   endpoint: 'https://storage.panindigan.com',
//   connectionState: 'connected' | 'fallback' | 'connecting' | 'closed',
//   fallbackMode: false,
//   failoverUsed: false,
//   bootstrapDurationMs: 45,
//   retryCount: 0,
//   pendingWriteCount: 0,
//   lastSyncAt: Date,
//   lastError: null,
// }
```

---

## Session Management

```typescript
import { LibSqlSessionStore, SessionsModule } from 'panindigan-fca';

const sessions = new LibSqlSessionStore(storage, logger);
await sessions.bootstrap();

// Save a session
await sessions.saveSession('session-id', appState, userId, 86_400_000);

// Restore
const session = await sessions.restoreSession('session-id');
if (session.found) {
  await createClient({ appState: session.appState });
}
```

---

## Logging

```typescript
import { createLogger } from 'panindigan-fca';

const logger = createLogger({
  level: 'info',
  pretty: process.env.NODE_ENV !== 'production',
  bindings: { service: 'my-bot', env: 'prod' },
});

logger.info({ tag: 'STARTUP' }, 'Bot is starting');
logger.success({ tag: 'AUTH' }, 'Session loaded');   // custom level, severity 35
logger.warn({ tag: 'STORAGE' }, 'Remote unavailable — using memory fallback');
logger.error({ tag: 'MQTT' }, 'Connection dropped');

// Child logger with additional bindings (no duplicate keys — v0.1.7 fix)
const reqLogger = logger.child({ requestId: 'abc-123' });
reqLogger.info({ tag: 'REQUEST' }, 'Handling message');
```

Log levels: `trace` (10) · `debug` (20) · `info` (30) · `success` (35, custom) · `warn` (40) · `error` (50) · `fatal` (60).

---

## MQTT & Real-Time Transport

The library maintains a persistent MQTT connection to Facebook's Messenger gateway. Reconnection, ping/pong keepalive, and CONNACK diagnostics are handled internally.

```typescript
import { MqttClient } from 'panindigan-fca';

// Access via the client instance
const mqtt = client.mqtt;
const health = await mqtt.getDiagnostics();
// { connected: true, pingLatencyMs: 42, ... }
```

---

## HTTP Client

```typescript
import { HttpClient } from 'panindigan-fca';

const http = new HttpClient({ baseUrl: 'https://www.facebook.com' });
const response = await http.get('/me');
const text = await response.text();
```

---

## Error Handling

All errors extend `PandindiganError` and carry a `code` string and optional `context` object:

```typescript
import {
  PandindiganError,
  InvalidAppStateError,   // AppState validation failed
  SessionExpiredError,    // Session is no longer valid
  LoginFailedError,       // Wrong credentials or login blocked
  CheckpointRequiredError,// Account needs checkpoint verification
  TwoFactorRequiredError, // 2FA prompt detected
  NetworkError,           // General network failure
  TimeoutError,           // Request timed out
  RateLimitError,         // HTTP 429
  StorageError,           // Storage API or local adapter failure
  StorageCircuitOpenError,// Request blocked — circuit breaker is OPEN
  ConfigurationError,     // Invalid library configuration
} from 'panindigan-fca';

try {
  await createClient({ appState });
} catch (err) {
  if (err instanceof InvalidAppStateError) {
    console.error('Bad AppState:', err.message, err.context);
  } else if (err instanceof SessionExpiredError) {
    console.error('Session expired — please export a new AppState');
  } else if (err instanceof PandindiganError) {
    console.error(`[${err.code}]`, err.message);
  }
}
```

---

## Middleware

Middleware runs for every outgoing HTTP request and incoming response:

```typescript
import { createClient } from 'panindigan-fca';

const client = await createClient({
  appState,
  middleware: [
    {
      onRequest: async (ctx, next) => {
        console.log('->', ctx.method, ctx.url);
        return next(ctx);
      },
      onResponse: async (ctx, next) => {
        console.log('<-', ctx.statusCode);
        return next(ctx);
      },
    },
  ],
});
```

---

## Multi-Account Usage

Each `createClient` call is fully isolated — no global state:

```typescript
const [alice, bob] = await Promise.all([
  createClient({ appState: aliceAppState }),
  createClient({ appState: bobAppState }),
]);

alice.on('message', (msg) => alice.messages.send(msg.threadId, { body: 'Alice here' }));
bob.on('message',  (msg) => bob.messages.send(msg.threadId,  { body: 'Bob here' }));
```

---

## Proxy Support

```typescript
const client = await createClient({
  appState,
  proxy: {
    url: 'socks5://user:pass@proxy.example.com:1080',
    // Also supports http:// and https://
  },
});
```

---

## Diagnostics Module

```typescript
const health = await client.diagnostics.health();
// {
//   status: 'healthy' | 'degraded' | 'unhealthy',
//   latencyMs: 45,
//   mqttConnected: true,
//   storageFallback: false,
// }

const stats = await client.diagnostics.stats();
```

---

## Best Practices

**AppState hygiene:**
- Export a fresh AppState from a browser session that is actively logged in.
- Do not share AppState files between multiple bots simultaneously — Facebook may invalidate both sessions.
- Rotate AppState regularly (weekly or when the bot shows `accountStale` events).

**Storage reliability:**
- Use `LibSqlStorageAdapter` in production. It handles transient remote failures without losing writes.
- Monitor `getDiagnostics().pendingWriteCount` — a growing queue indicates a persistent remote failure.
- Watch for `circuitBreakerTrips > 0` in `StorageApiClient.getMetrics()` — indicates repeated endpoint failures.

**Session stability:**
- Enable `refresh.autoPersist: true` so refreshed cookies are automatically saved.
- Handle `accountStale` and `sessionExpired` events to detect and reload AppState promptly.

**Logging:**
- Use `pretty: false` in production and ship structured JSON logs to a log aggregator.
- Set `level: 'warn'` or `level: 'error'` in high-volume production bots to reduce noise.

---

## Production Deployment

### Docker

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY dist ./dist
ENV NODE_ENV=production
ENV APPSTATE_JSON=<your-appstate>
ENV PFCA_STORAGE_API_URL=https://storage.panindigan.com
ENV PFCA_STORAGE_API_TOKEN=<your-token>
CMD ["node", "dist/index.js"]
```

### Koyeb / Railway / Fly.io

Set these environment variables in your platform dashboard:

```
APPSTATE_JSON=<json-string>
PFCA_STORAGE_API_URL=https://storage.panindigan.com
PFCA_STORAGE_API_TOKEN=<token>
NODE_ENV=production
```

> **Note (v0.1.8):** The storage client now uses `undici` instead of `require('https')`, so it works correctly in the ESM build used in Docker/Koyeb/Bun environments. Previous versions fell back to memory-only mode in these runtimes due to a `ReferenceError` in the HTTP transport.

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `APPSTATE_JSON` | AppState as a JSON string | — |
| `APPSTATE_BASE64` | AppState as Base64-encoded JSON | — |
| `APPSTATE` | AppState as raw JSON or Base64 | — |
| `PFCA_STORAGE_API_URL` | Remote storage API base URL | `https://storage.panindigan.com` |
| `PFCA_STORAGE_API_TOKEN` | Remote storage API auth token | — |
| `PFCA_STORAGE_API_ENDPOINTS` | Comma-separated list of endpoints (overrides URL) | — |
| `PFCA_STORAGE_API_TIMEOUT_MS` | Request timeout in milliseconds | `10000` |
| `PFCA_STORAGE_API_RETRIES` | Number of retries per endpoint | `2` |
| `SESSION_SECRET` | Secret for session encryption | — |
| `LOG_LEVEL` | Default log level | `info` |

---

## Migration Guide

### 0.1.7 → 0.1.8

**No breaking changes.** All public APIs are backward-compatible.

**What to check:**

1. **Storage in Docker/Koyeb now works.** If you were seeing `fallbackMode: true` with `bootstrapDurationMs ≈ 599ms`, this is fixed. Ensure `PFCA_STORAGE_API_URL` and `PFCA_STORAGE_API_TOKEN` are set.

2. **`normalizeCookies` is now exported.** If you previously wrote your own cookie normalization for Chrome-format AppStates, you can replace it:
   ```typescript
   // Before
   const cookies = rawCookies.map(c => ({ ...c, key: c.key ?? c.name }));
   // After
   const [cookies, diag] = normalizeCookies(rawCookies);
   ```

3. **`validateAppState` now detects explicitly expired required cookies.** If your AppState's `xs` or `c_user` carries a past `expirationDate`, it will throw. Export a fresh AppState.

4. **`StorageCircuitOpenError` and `StorageClientMetrics` are new exports.** Add them to your error handling if you want to distinguish circuit-open failures.

### 0.1.6 → 0.1.7

- Logger duplicate-tag bug fixed — no code changes needed.
- `LibSqlStorageAdapter.clear()` no longer throws; it queues the operation. If you had a try/catch specifically for `clear()` throwing a `StorageError`, it is still safe but the catch block won't be reached for remote failures.

---

## Troubleshooting

### Bot enters fallback mode immediately at startup

**Symptom:** `getDiagnostics().fallbackMode === true` right after `createClient`.

**Causes and fixes:**

| Cause | Fix |
|---|---|
| `PFCA_STORAGE_API_URL` not set | Set the env var or pass `baseUrl` to `LibSqlStorageAdapter` |
| `PFCA_STORAGE_API_TOKEN` not set | Set the env var or pass `apiToken` |
| Running ESM build on Node < 17.3 | Upgrade to Node ≥ 22 |
| v0.1.7 or earlier in Docker/Koyeb | Upgrade to v0.1.8 (undici transport fix) |
| Network blocked in container | Check egress firewall rules for `storage.panindigan.com` |

### Session expires frequently

- Your AppState cookies are session-only (no expiry). Facebook invalidates them when the IP changes or the bot is idle too long.
- Enable `refresh.autoPersist: true` and handle `accountStale` events.
- Use a stable IP (dedicated proxy or static-IP host).

### `InvalidAppStateError: missing required cookie: datr`

Your AppState export is incomplete. The following cookies are required: `c_user`, `xs`, `datr`. Re-export from a logged-in browser session.

### `InvalidAppStateError: AppState has expired required cookies`

Your required cookies have an explicit past expiry timestamp. Export a fresh AppState.

### Circuit breaker trips repeatedly

Check `client.getCircuitStates()` and `client.getMetrics().circuitBreakerTrips`. If a specific endpoint keeps failing, check network connectivity and API token validity.

---

## FAQ

**Q: Can I use this with Facebook Pages or the Graph API?**  
A: No. This library targets personal accounts only. Use the official Facebook Graph API SDK for business / page use cases.

**Q: Is this against Facebook's Terms of Service?**  
A: Unofficial automation on personal accounts is not permitted by Facebook's ToS. Use at your own risk.

**Q: Does the library store my password?**  
A: Never. Authentication is cookie-based (AppState). No credentials are transmitted or stored.

**Q: Can I run multiple accounts in parallel?**  
A: Yes. Each `createClient()` call is isolated. See [Multi-Account Usage](#multi-account-usage).

**Q: Why does the first request take ~600 ms?**  
A: On v0.1.7 and earlier, the storage bootstrap retried 3 times via a broken `require()` transport in the ESM build. v0.1.8 fixes this — bootstrap should complete in < 100 ms when the remote is reachable.

**Q: Can I use a custom storage backend?**  
A: Yes. Implement the `StorageAdapter` interface (`get`, `set`, `delete`, `clear`, `has`) and pass it to `createClient`.

---

## Contributing

1. Fork the repository and create a feature branch.
2. Run `npm test` — all 220 tests must pass.
3. Follow the existing code style (TypeScript strict, no `any`, JSDoc on all public APIs).
4. Open a pull request with a description of the change and any relevant test coverage.

---

## License

MIT © Nazzel

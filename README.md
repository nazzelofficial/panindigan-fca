# panindigan-fca

**TypeScript Library for Facebook Messenger Bots — Personal Accounts**

[![npm version](https://img.shields.io/npm/v/panindigan-fca)](https://www.npmjs.com/package/panindigan-fca)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8%2B-blue)](https://www.typescriptlang.org)
[![bun](https://img.shields.io/badge/bun-1.3.14%2B-black)](https://bun.sh)
[![pnpm](https://img.shields.io/badge/pnpm-11.10.0%2B-orange)](https://pnpm.io)

**panindigan-fca** ("stand for it" / "vouch for it" in Filipino) is a production-quality, modular TypeScript SDK for interacting with Facebook Messenger on personal Facebook accounts. It supports both AppState-based authentication (cookie and session import) and direct session management — the same approach used by the broader FCA ecosystem, but engineered to a professional standard.

This library is explicitly scoped to **personal account workflows**. It is not intended for Facebook Pages, the official Graph API, or any Meta business product.

> Created by **Nazzel**, a Filipino developer.

---

## Table of Contents

- [Why panindigan-fca](#why-panindigan-fca)
- [Quick Start](#quick-start)
- [Design Goals](#design-goals)
- [Engineering Principles](#engineering-principles)
- [Technology Stack](#technology-stack)
- [Core Dependencies](#core-dependencies)
- [AppState Authentication](#appstate-authentication)
- [Cookie & Session Auto-Refresh](#cookie--session-auto-refresh)
- [Stealth & Anti-Suspension](#stealth--anti-suspension)
- [Proxy Support](#proxy-support)
- [Feature Scope](#feature-scope)
- [Architecture](#architecture)
- [TypeScript Configuration](#typescript-configuration)
- [Logging System](#logging-system)
- [Observability](#observability)
- [HTTP Client](#http-client)
- [Configuration](#configuration)
- [Storage Adapters](#storage-adapters)
- [Cache System](#cache-system)
- [Security](#security)
- [Performance](#performance)
- [Testing Strategy](#testing-strategy)
- [CI/CD Pipeline](#cicd-pipeline)
- [Code Quality](#code-quality)
- [Non-Functional Requirements](#non-functional-requirements)
- [Full API Reference](#full-api-reference)
- [Event Reference](#event-reference)
- [Error Reference](#error-reference)
- [Multi-Session Usage](#multi-session-usage)
- [Bot Recipes & Examples](#bot-recipes--examples)
- [Graceful Shutdown](#graceful-shutdown)
- [Middleware Pipeline](#middleware-pipeline)
- [Custom Adapters Guide](#custom-adapters-guide)
- [Message Formatting](#message-formatting)
- [Migration Guide](#migration-guide)
- [Deployment Guide](#deployment-guide)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [Roadmap](#roadmap)
- [Benchmarks](#benchmarks)
- [Comparison with Other Libraries](#comparison-with-other-libraries)
- [Environment Variables Reference](#environment-variables-reference)
- [Changelog](#changelog)
- [Security Policy](#security-policy)
- [Code of Conduct](#code-of-conduct)
- [Contributing](#contributing)
- [Acknowledgments](#acknowledgments)
- [License](#license)

---

## Why panindigan-fca

Most unofficial Messenger libraries are single-file scripts with no types, no tests, and no long-term maintenance plan. **panindigan-fca** is built differently:

- **100% TypeScript** — strict mode throughout, full type inference, zero `any`
- **AppState authentication** — import browser cookies directly, no password required
- **Real implementations only** — no placeholder methods, no TODO comments, no mocked logic
- **Production-grade observability** — structured logs, performance timers, reconnect metrics
- **Adapter-based architecture** — swap storage, cache, and transport without touching your code
- **≥ 95% test coverage** — unit, integration, stress, load, and performance benchmarks

---

## Quick Start

### Installation

```bash
# bun (default)
bun add panindigan-fca

# pnpm
pnpm add panindigan-fca

# npm
npm install panindigan-fca
```

> **Requirements:** Node.js 22+ **or** Bun 1.3.14+. Native ESM — ensure your project uses `"type": "module"` in `package.json`.

### Send a Message

```ts
import { createClient } from 'panindigan-fca';
import { readFileSync } from 'node:fs';

const appState = JSON.parse(readFileSync('./appstate.json', 'utf8'));
const client = await createClient({ appState });

await client.messages.send({
  threadId: '100xxxxxxxxxx',
  body: 'Hello from panindigan-fca!',
});

await client.disconnect();
```

### Listen for Incoming Messages

```ts
import { createClient } from 'panindigan-fca';

const client = await createClient({ appState });

client.on('message', (event) => {
  console.log(`New message from ${event.senderName}: ${event.body}`);
});

client.on('message:reaction', (event) => {
  console.log(`${event.senderName} reacted with ${event.reaction}`);
});

client.on('thread:typing', (event) => {
  console.log(`${event.senderName} is typing in ${event.threadId}`);
});

await client.connect();
```

### Fetch Threads

```ts
const threads = await client.threads.list({ limit: 20 });

for (const thread of threads.items) {
  console.log(`${thread.name} — ${thread.unreadCount} unread`);
}
```

### Send an Attachment

```ts
import { createReadStream } from 'node:fs';

await client.messages.send({
  threadId: '100xxxxxxxxxx',
  attachments: [
    {
      name: 'photo.jpg',
      type: 'image/jpeg',
      stream: createReadStream('./photo.jpg'),
    },
  ],
});
```

### React to a Message

```ts
await client.messages.react({
  messageId: 'mid.xxxxxxxxxx',
  reaction: '❤️',
});
```

---

## Design Goals

| Goal | Description |
|------|-------------|
| **Production Ready** | Every exported API contains real, working, production-grade logic — no stubs or placeholders |
| **Maintainable** | Clear module boundaries; networking, parsing, auth, and business logic are fully isolated |
| **Modular** | Each feature is independently consumable with no forced coupling between modules |
| **Scalable** | Designed for concurrent sessions, high message throughput, and connection pooling |
| **Consistent** | Uniform API patterns, error shapes, event signatures, and log formats throughout |
| **Reliable** | Automatic retries, reconnect logic, heartbeat monitoring, and graceful error recovery |
| **High Performance** | Lazy loading, connection reuse, shared pools, streaming APIs, and minimal allocations |
| **Memory Efficient** | LRU caching, streaming I/O, zero unnecessary buffering |
| **Easy to Extend** | Adapter-based storage, cache, and transport — plug in your own implementations |
| **Easy to Test** | Dependency injection throughout; no globals; deterministic, interceptable behavior |
| **Easy to Debug** | Structured logs with contextual metadata, request tracing, and latency tracking |
| **Easy to Profile** | Built-in performance timers, memory and CPU monitoring, and heap snapshot support |
| **Easy to Upgrade** | Semantic versioning, migration guides, and backward compatibility preserved where practical |
| **Backward Compatible** | Stable public API surface; breaking changes are explicit, documented, and announced |

---

## Engineering Principles

- **Enterprise Architecture** — separation of concerns across every layer; no monolithic blobs
- **Composition over Inheritance** — prefer small, composable units over deep class hierarchies
- **Dependency Injection** — no hardcoded dependencies; implementations are swappable at the boundary
- **Single Responsibility** — each module owns exactly one concern
- **No Circular Dependencies** — enforced by ESLint and verified in CI on every push
- **No Duplicated Logic** — shared utilities live in dedicated internal modules
- **No Hidden Side Effects** — all state changes are explicit and logged
- **No Global Mutable State** — session state is scoped and injected, never global
- **No Dead Code** — enforced by ESLint; unused exports are build errors
- **Interface-First Design** — public contracts are interfaces; implementations are interchangeable

---

## Technology Stack

All versions are pinned to the latest stable release at implementation time.

| Layer | Technology | Version |
|-------|------------|---------|
| Runtime | Node.js | 22+ (LTS) |
| Runtime (alt) | Bun | 1.3.14+ (default) |
| Language | TypeScript | 5.8+ |
| Package Manager | bun / pnpm / npm | bun 1.3.14 (default), pnpm 11.10.0, npm 10+ |
| Module System | Native ESM | `"type": "module"` |
| Build Tool | tsup | Latest stable |
| Test Runner | Vitest | Latest stable |
| Coverage | @vitest/coverage-v8 | Latest stable |
| Linter | ESLint + typescript-eslint | Latest stable |
| Formatter | Prettier | Latest stable |
| Git Hooks | Husky + lint-staged | Latest stable |
| Commit Lint | commitlint | Conventional Commits spec |
| Releases | semantic-release | Automatic versioning and changelog |
| Docs | TypeDoc + Markdown | API reference and guides |

---

## Core Dependencies

Only actively maintained libraries are used. Native Node.js APIs are preferred over external packages when equivalent functionality exists.

### Networking

| Purpose | Package | Notes |
|---------|---------|-------|
| HTTP Client | `undici` | Connection pooling, HTTP/2, streaming, keep-alive |
| WebSocket | `ws` | Real-time Messenger events, presence, typing |
| Cookie Management | `tough-cookie` | Full RFC 6265 compliance, persistent CookieJar |
| Compression | Node.js `zlib` (native) | Brotli, gzip, deflate — no external dependency |

### Validation and Serialization

| Purpose | Package | Notes |
|---------|---------|-------|
| Schema Validation | `zod` | Runtime type checking for all inputs and API responses |
| UUID Generation | `uuid` | v4 and v7 — used for request IDs and correlation |

### Logging and Observability

| Purpose | Package | Notes |
|---------|---------|-------|
| Structured Logger | `pino` | JSON output, NDJSON-compatible, high-throughput |
| Pretty Dev Logs | `pino-pretty` | Human-readable output for local development only |

### Reliability

| Purpose | Package | Notes |
|---------|---------|-------|
| Automatic Retry | `p-retry` | Exponential backoff with jitter for HTTP and WebSocket |
| Request Queue | `p-queue` | Concurrency control, rate limiting, priority queuing |

### Caching

| Purpose | Package | Notes |
|---------|---------|-------|
| In-Memory LRU | `lru-cache` | TTL, size limits, namespace support |
| Redis Adapter (optional) | `ioredis` | Distributed cache for multi-session deployments |

### Storage

| Purpose | Package | Notes |
|---------|---------|-------|
| Remote API (default) | HTTP-based | Remote storage via configurable API endpoint (e.g., Cloudflare Worker) |

### Events

| Purpose | Package | Notes |
|---------|---------|-------|
| Event Emitter | `eventemitter3` | Typed events, async iterators, high-performance |

### Stealth & Anti-Suspension

| Purpose | Package | Notes |
|---------|---------|-------|
| User Agent Rotation | `user-agents` | Large weighted pool of realistic browser UA strings |
| Request Throttling | `p-throttle` | Enforce human-like minimum intervals between requests |
| SOCKS Proxy | `socks` | SOCKS4 and SOCKS5 proxy support |
| Random Timing | Node.js `crypto` (native) | Cryptographically random jitter and delay generation |

---

## AppState Authentication

AppState is the **primary and recommended** authentication method for panindigan-fca. Instead of providing credentials on every startup, you export your current Facebook session cookies from a browser session and pass them directly to the client.

### What Is AppState?

An AppState is a JSON array of cookie objects that represent a valid Facebook session.

```json
[
  {
    "key": "c_user",
    "value": "100xxxxxxxxxx",
    "domain": ".facebook.com",
    "path": "/",
    "hostOnly": false,
    "creation": "2026-07-06T00:00:00.000Z",
    "lastAccessed": "2026-07-06T09:00:00.000Z"
  },
  {
    "key": "xs",
    "value": "...",
    "domain": ".facebook.com",
    "path": "/"
  }
]
```

### How to Obtain an AppState

Export your Facebook session cookies from a browser using any extension that supports the FCA cookie array format. Save the exported JSON as `appstate.json`.

> **Security note:** An AppState file grants full access to your Facebook account. Never commit it to version control. If you persist AppState locally, keep the file private and encrypted.

### Using AppState

```ts
import { createClient } from 'panindigan-fca';
import { readFileSync, writeFileSync } from 'node:fs';

const appState = JSON.parse(readFileSync('./appstate.json', 'utf8'));
const client = await createClient({ appState });

// Persist the updated AppState whenever Facebook rotates cookies
client.on('appstate:update', (updatedAppState) => {
  writeFileSync('./appstate.json', JSON.stringify(updatedAppState, null, 2));
});

await client.connect();
```

### AppState Lifecycle

| Phase | Description |
|-------|-------------|
| **Import** | AppState is deserialized and loaded into a `tough-cookie` CookieJar |
| **Validation** | The session is validated against Facebook to confirm it is still active |
| **Use** | All HTTP requests automatically include the correct cookies via the CookieJar |
| **Refresh** | When Facebook rotates session cookies, the CookieJar is updated automatically |
| **Export** | An `appstate:update` event is emitted so callers can persist the updated state |
| **Persistence** | When `session.persistPath` is configured, the updated AppState is written to disk automatically |

### FCA Ecosystem Compatibility

panindigan-fca's AppState format is **fully compatible** with AppState files produced by `fca-unofficial` and `facebook-chat-api`. Files exported from compatible tools can be imported directly without any transformation.

---

## Cookie & Session Auto-Refresh

panindigan-fca handles cookie and session lifecycle **automatically in the background** — no manual intervention required.

### Configuration

```ts
const client = await createClient({
  appState,
  refresh: {
    checkInterval: 5 * 60 * 1000,   // Check cookie expiry every 5 minutes
    threshold: 30 * 60 * 1000,       // Refresh cookies expiring within 30 minutes
    retries: 3,                       // Retry failed refreshes up to 3 times
    failSilently: true,               // Log a warning instead of throwing on failure
    autoPersist: true,                // Auto-write updated AppState to disk
  },
});
```

### Session Keepalive

```ts
const client = await createClient({
  appState,
  keepalive: {
    enabled: true,
    interval: 10 * 60 * 1000,   // Ping every 10 minutes
    onFailure: 'warn',           // 'warn' | 'throw' | 'reconnect'
  },
});

// Manual trigger
await client.auth.keepalive();
```

### Listening to Refresh Events

```ts
client.on('appstate:update', (updatedAppState) => {
  // Called after every successful cookie refresh
});

client.on('appstate:refresh:failed', (error) => {
  console.error('Cookie refresh failed:', error.message);
});

client.on('session:expired', () => {
  console.error('Session invalidated. Re-authentication required.');
});
```

---

## Stealth & Anti-Suspension

panindigan-fca includes a dedicated stealth layer to make automated sessions behaviorally indistinguishable from a real browser.

> **Note:** Stealth features reduce the risk of detection but do not guarantee immunity from Facebook's anti-automation systems. Use responsibly and within your own account's context.

### Stealth Levels

```ts
const client = await createClient({
  appState,
  stealth: {
    level: 'high', // 'off' | 'low' | 'medium' | 'high' | 'paranoid'
  },
});
```

| Level | Description |
|-------|-------------|
| `off` | No stealth — raw, fastest possible requests. Suitable for testing only |
| `low` | Realistic user agent; no artificial delays |
| `medium` | Realistic user agent + randomized headers + light human-like delays |
| `high` | All of the above + session warm-up + request pattern randomization + typing delays |
| `paranoid` | All of the above + proxy + maximum jitter + conservative rate limits + full fingerprint simulation |

### Human-Like Delays

```ts
stealth: {
  delays: {
    enabled: true,
    actionDelay: { min: 300, max: 1800 },       // ms before each API action
    messageDelay: { min: 800, max: 4000 },       // Additional delay before sending
    paginationDelay: { min: 200, max: 900 },     // Delay between paginated fetches
  },
}
```

### Typing Simulation

```ts
stealth: {
  typingSimulation: {
    enabled: true,
    wpm: { min: 40, max: 80 },   // Words per minute range
    naturalPauses: true,          // Random pauses within the typing window
  },
}
```

### Rate Limiting

```ts
stealth: {
  rateLimit: {
    enabled: true,
    requestsPerMinute: 30,
    minInterval: 500,
    onOverload: 'queue', // 'queue' | 'drop' | 'throw'
  },
}
```

### Session Warm-Up

```ts
stealth: {
  warmup: {
    enabled: true,
    duration: 30,           // Duration of ramp-up period in minutes
    startFraction: 0.1,     // Start at 10% of target rate
    emitEvent: true,        // Emit 'stealth:warmup:complete' when done
  },
}
```

---

## Proxy Support

panindigan-fca supports per-session proxy assignment for IP rotation and anonymization.

### Supported Proxy Types

| Type | Notes |
|------|-------|
| HTTP proxy | Built into `undici` — no extra dependency |
| HTTPS proxy | Built into `undici` — no extra dependency |
| SOCKS4 proxy | Via `socks` package |
| SOCKS5 proxy | Via `socks` package — recommended for anonymization |

### Configuration

```ts
const client = await createClient({
  appState,
  proxy: {
    url: 'socks5://username:password@proxy.host:1080',
    rotateEvery: 100,
    pool: [
      'socks5://user:pass@proxy1.host:1080',
      'socks5://user:pass@proxy2.host:1080',
      'http://user:pass@proxy3.host:8080',
    ],
    healthCheck: true,
    failOnUnhealthy: true,
  },
});
```

---

## Feature Scope

### In Scope — Personal Facebook Accounts

| Category | Features |
|----------|----------|
| Authentication | AppState (cookie import), email and password login, 2FA, session restore, session persistence |
| Session Management | Session bootstrap, token refresh, validation, multi-session support, expiry handling |
| Conversations | List threads, paginate, metadata, unread counts, mute, unmute, archive, mark as read |
| Direct Messages | Send text, reply, forward, delete, unsend, message history, paginated fetch |
| Group Chats | Create, add/remove participants, rename, group photo, admin management |
| Attachments | Images, videos, audio, documents; chunked upload; progress events; streaming download |
| Reactions | React, remove reaction, fetch all reactions on a message |
| Stickers | Send stickers, fetch sticker pack metadata |
| Polls | Create polls, vote, fetch results |
| Typing Indicators | Emit and receive typing events |
| Read Receipts | Send and receive read receipts |
| Presence | Online status, last active, visibility control |
| Search | Search conversations, messages, and users |
| Stealth Mode | 5-level stealth: off, low, medium, high, paranoid |
| Proxy Support | HTTP, HTTPS, SOCKS4, SOCKS5 with pool rotation, health checks, failover |
| Storage Adapters | Memory, File, **Remote API** (default persistent), Redis, Custom |

### Out of Scope

| Area | Reason |
|------|--------|
| Facebook Pages API | Different auth model and permission scope |
| Graph API (official) | Targets personal Messenger, not the developer API |
| Instagram | Separate Meta platform |
| WhatsApp | Separate Meta platform and protocol |

---

```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PandindiganClient                         │
│  .messages  .threads  .users  .files  .polls  .stickers         │
│  .presence  .search   .auth   .diagnostics                      │
└──────────────────────────────┬──────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
   ┌─────────────┐    ┌─────────────────┐   ┌──────────────┐
   │  HTTP Client │    │  MQTT / WebSocket│   │  Event Bus   │
   │  (undici)    │    │  (ws)            │   │ (eventemitter│
   │  Pool + Retry│    │  Reconnect       │   │  3)          │
   └──────┬──────┘    └────────┬────────┘   └──────┬───────┘
          │                    │                    │
   ┌──────▼──────────────────────────────────────────────────┐
   │                    Middleware Pipeline                    │
   │  cookie-injector → stealth-headers → retry-handler      │
   │  → rate-limiter → proxy-dispatcher → secret-redactor    │
   └──────┬──────────────────────────────────────────────────┘
          │
   ┌──────▼──────┐    ┌─────────────┐    ┌─────────────────┐
   │  CookieJar  │    │  LRU Cache  │    │  Storage        │
   │(tough-cookie│    │ (lru-cache) │    │  Remote API     │
   │  per session│    │  + Redis    │    │  (default)      │
   └─────────────┘    └─────────────┘    └─────────────────┘
```

---

## TypeScript Configuration

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": "src",
    // Strictness — all flags enabled
    "strict": true,
    "noImplicitAny": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "useUnknownInCatchVariables": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    // Interop
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "esModuleInterop": false,
    "forceConsistentCasingInFileNames": true,
    // Build
    "incremental": true,
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "inlineSources": true,
    "skipLibCheck": false
  }
}
```

---

## Logging System

All log output is structured JSON via `pino`. Local development uses `pino-pretty` for human-readable output.

### Log Levels

| Level | Usage |
|-------|-------|
| `TRACE` | Highly verbose internal state — disabled in production |
| `DEBUG` | Request and response details, cache decisions, event dispatches |
| `INFO` | Normal operational events — session start, message sent, connected |
| `WARN` | Recoverable issues — retry triggered, degraded mode active |
| `ERROR` | Non-fatal errors — request failed, parse error, unexpected response |
| `FATAL` | Unrecoverable errors — process should exit |

### Log Format

```
2026-07-06 09:34:22.118 +08:00  [INFO]   [AUTH]       Login successful           { userId: "100xxxxxxxxxx" }
2026-07-06 09:34:22.914 +08:00  [DEBUG]  [HTTP]       GET /api/graphql           { latency: 112, status: 200 }
2026-07-06 09:34:23.511 +08:00  [INFO]   [MQTT]       Connected                  { latency: 46ms }
2026-07-06 09:34:24.002 +08:00  [WARN]   [NETWORK]    Retry attempt 2/5          { error: "ECONNRESET" }
2026-07-06 09:34:25.887 +08:00  [INFO]   [MESSAGES]   Message received           { threadId: "...", messageId: "..." }
```

### Automatic Redaction

All log output automatically redacts any field named `password`, `secret`, `token`, `cookie`, `authorization`, `appState`, or matching `x-fb-*`. Redaction is applied at the serializer level — secrets never reach the transport.

---

## Observability

| Feature | Description |
|---------|-------------|
| Performance Timers | High-resolution `performance.now()` wrappers for operation timing |
| Memory Monitoring | `process.memoryUsage()` polling with heap trend tracking |
| CPU Monitoring | `process.cpuUsage()` delta tracking per operation |
| GC Monitoring | V8 GC event tracking via `perf_hooks` PerformanceObserver |
| Heap Snapshots | On-demand heap snapshot export to file |
| Slow Request Detection | Configurable threshold — emits WARN when requests exceed target latency |
| Request Tracing | Correlation ID propagated through all log lines per request |
| Latency Tracking | P50, P90, and P99 latency histograms per endpoint |
| Reconnect Metrics | Reconnect count, time-to-reconnect, and success rate |
| Statistics API | `client.diagnostics.getStats()` returns a typed snapshot of all runtime metrics |

---

## HTTP Client

The HTTP client wraps `undici` with production-grade behavior built in.

| Feature | Description |
|---------|-------------|
| Connection Pooling | `undici.Pool` — configurable max connections per origin |
| Keep-Alive | HTTP keep-alive with idle timeout and max socket reuse |
| Compression | Automatic `Accept-Encoding: br, gzip, deflate` with transparent decompression |
| Streaming | Request and response streaming via Node.js native streams |
| Automatic Retries | `p-retry` with exponential backoff and jitter |
| Timeouts | Connect timeout, request timeout, response body timeout — all configurable |
| AbortController | Every request is cancellable via `AbortSignal` |
| HTTP/2 | Automatic ALPN negotiation where the server supports it |
| CookieJar | `tough-cookie` CookieJar automatically attached to every request |
| Request Priorities | High, normal, and low priority queuing via `p-queue` |
| Progress Events | Typed `upload:progress` and `download:progress` events |

---

## Configuration

Configuration is loaded in the following priority order:  
**environment variables → `.env` file → YAML → TOML → JSON → built-in defaults**

> All configuration is optional. No environment variables are required to start the library.

### Key Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `logLevel` | `info` | Minimum log level: `trace`, `debug`, `info`, `warn`, `error`, `fatal` |
| `logPretty` | `false` | Enable `pino-pretty` for local development |
| `http.maxConnections` | `10` | Max connections per origin in the connection pool |
| `http.timeout.connect` | `5000` | TCP connect timeout in milliseconds |
| `http.timeout.request` | `30000` | Full request timeout in milliseconds |
| `http.retries.max` | `5` | Maximum retry attempts per request |
| `http.retries.baseDelay` | `500` | Base delay for exponential backoff in milliseconds |
| `mqtt.reconnect.maxAttempts` | `10` | Max MQTT reconnect attempts before giving up |
| `mqtt.heartbeat.interval` | `60000` | Heartbeat ping interval in milliseconds |
| `cache.ttl` | `300000` | Default cache TTL in milliseconds |
| `cache.maxSize` | `500` | Maximum LRU cache entries |
| `session.persistPath` | `null` | Path to persist session — `null` means memory only |
| `storage.adapter` | `libsql` | Storage adapter: `libsql` (remote API), `memory`, `file`, `redis`, or custom |

All configuration is validated at startup using Zod. Invalid configuration is a **fatal startup error**.

---

## Storage Adapters

Storage is abstracted behind a `StorageAdapter` interface. All adapters are fully interchangeable.

```ts
interface StorageAdapter {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}
```

| Adapter | Use Case |
|---------|----------|
| **Remote API** *(default)* | Remote HTTP API backend (e.g., Cloudflare Worker + Database) — zero config, works out of the box |
| **Memory** | Ephemeral, in-process storage; no persistence across restarts |
| **File** | JSON files on disk; simple single-session persistence |
| **Redis** | Distributed storage for multi-session and multi-process deployments |
| **Custom** | Implement `StorageAdapter` and inject at client initialization |

**The Remote API adapter is the default.** It communicates with a compatible remote storage service over HTTP using a configurable base URL and optional bearer token. This decouples the client library from database credentials and storage implementation details, with authentication handled entirely by the API layer.

`'libsql'` is a legacy adapter name that now routes through the Remote API adapter.

#### Session Persistence

The `LibSqlSessionStore` manages sessions through remote API endpoints with structured fields (`id`, `userId`, `appState`, `createdAt`, `updatedAt`, `expiresAt`, `expiresAtMs`). Session operations are performed via `POST /v1/sessions/*` endpoints on the configured storage API. This is used automatically by `createClient()` — you can inspect and manage all stored sessions through `client.sessions`.

---

## Cache System

| Feature | Description |
|---------|-------------|
| In-Memory LRU | Bounded memory use; least-recently-used eviction via `lru-cache` |
| TTL Support | Per-entry TTL with automatic expiry |
| Namespaces | `threads:`, `messages:`, `users:` prefixes prevent key collisions |
| Compression | Optional gzip compression for large cached values |
| Redis Adapter | Optional `ioredis`-backed adapter for shared cache across processes |

---

## Security

| Feature | Description |
|---------|-------------|
| Secret Masking | All secrets masked in logs at the serializer level |
| Cookie Masking | Cookie values redacted before any logging occurs |
| Encrypted Storage | Session data at rest encrypted using AES-256-GCM via Node.js native `crypto` |
| Secret Redaction | Any string matching known token and key patterns replaced before logging |
| No Global State | No secrets or session data stored in module-level globals |
| AppState Isolation | Each client instance holds its AppState in a scoped, non-global CookieJar |

---

## Performance

| Feature | Description |
|---------|-------------|
| Lazy Loading | Modules imported on first use — cold start does not load unused features |
| Tree Shaking | The `tsup` build is fully tree-shakeable |
| Zero Unnecessary Allocations | Hot paths avoid object creation in loops |
| Streaming APIs | HTTP responses and file I/O stream to consumers without intermediate buffering |
| Connection Reuse | HTTP keep-alive eliminates TCP handshake overhead per request |
| Shared Pools | Connection pools shared across all operations in a session |

---

## Testing Strategy

Coverage target: **≥ 95% lines, branches, functions, and statements.** CI fails if the threshold is not met.

| Test Type | Tool | Scope |
|-----------|------|-------|
| Unit Tests | Vitest | Pure functions, validators, parsers, serializers, utilities |
| Integration Tests | Vitest + undici MockAgent | Full HTTP flows with interceptors — no real network required |
| Stress Tests | Vitest + custom harness | Concurrent sessions, high message rates, memory stability |
| Load Tests | Vitest + custom harness | Sustained QPS target; latency regression detection |
| Performance Benchmarks | Vitest bench | Operation timing vs stored baseline; CI fails on regression |
| Snapshot Tests | Vitest snapshots | Serialized response shapes, log output formats, error messages |

```bash
# bun (default)
bun test
bun run test:coverage
bun run test:unit
bun run test:integration
bun run test:bench

# pnpm
pnpm test
pnpm test:coverage
pnpm test:unit
pnpm test:integration
pnpm test:bench

# npm
npm test
npm run test:coverage
npm run test:unit
npm run test:integration
npm run test:bench
```

---

## CI/CD Pipeline

### Continuous Integration

Runs on every push and pull request to `main` and `develop`.

```
┌──────────┐   ┌────────────┐   ┌─────────┐   ┌──────────┐   ┌──────────┐
│  Lint    │──▶│ Type Check │──▶│  Build  │──▶│  Tests   │──▶│ Coverage │
│ (ESLint  │   │   (tsc)    │   │ (tsup)  │   │(vitest)  │   │  ≥ 95%   │
│ Prettier)│   │            │   │         │   │          │   │          │
└──────────┘   └────────────┘   └─────────┘   └──────────┘   └──────────┘
```

### Release Pipeline

Runs on merge to `main` only.

```
┌─────────────┐   ┌───────────────────────┐   ┌──────────────────────────┐
│  CI passes  │──▶│   semantic-release     │──▶│  npm publish +           │
│             │   │   analyzes commits     │   │  GitHub Release created  │
│             │   │   bumps version        │   │  CHANGELOG.md updated    │
└─────────────┘   └───────────────────────┘   └──────────────────────────┘
```

| Commit Prefix | Version Bump |
|---------------|-------------|
| `fix:` | Patch |
| `feat:` | Minor |
| `feat!:` or `BREAKING CHANGE:` | Major |
| `perf:`, `refactor:`, `docs:`, `test:`, `chore:` | No release |

---

## Full API Reference

All methods are `async` and return typed `Promise`s. Every method accepts an optional `signal?: AbortSignal` for cancellation.

### `createClient(options)`

The top-level factory function. Returns a fully initialized `PandindiganClient` instance.

```ts
import { createClient } from 'panindigan-fca';

const client = await createClient({
  // Required: one of the following
  appState: AppStateCookie[],
  credentials: { email: string, password: string, twoFactorCode?: string },

  // Session
  session?: { persistPath?: string, restoreOnStart?: boolean },

  // Options
  refresh?: RefreshOptions,
  keepalive?: KeepaliveOptions,
  stealth?: StealthOptions,
  proxy?: ProxyOptions,
  http?: HttpOptions,
  cache?: CacheOptions,
  storage?: StorageAdapter,        // Default: Remote API when persistPath is set
  logLevel?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal',
  logPretty?: boolean,
  middleware?: Middleware[],
});
```

### `client.messages`

| Method | Description |
|--------|-------------|
| `send(options)` | Send a text message or attachment to a thread |
| `reply(options)` | Shorthand for replying to a specific message |
| `unsend(messageId)` | Remove a message you sent |
| `delete(messageId)` | Delete a message from your view only |
| `forward(options)` | Forward a message to one or more threads |
| `react(options)` | React to a message with an emoji |
| `getReactions(messageId)` | Fetch all reactions on a message |
| `list(options)` | Fetch paginated messages from a thread |
| `get(messageId)` | Fetch a single message by ID |
| `markRead(threadId)` | Mark all messages in a thread as read |
| `setTyping(options)` | Emit or stop a typing indicator |

```ts
const result = await client.messages.send({
  threadId: string,
  body?: string,
  attachments?: Attachment[],
  replyTo?: string,
  mentionedUsers?: Mention[],
  stickerId?: string,
});
// Returns: { messageId: string, threadId: string, timestamp: Date }
```

### `client.threads`

| Method | Description |
|--------|-------------|
| `list(options)` | Fetch paginated conversation threads |
| `get(threadId)` | Fetch metadata for a single thread |
| `create(options)` | Create a new group chat |
| `rename(threadId, name)` | Rename a group thread |
| `setPhoto(threadId, stream)` | Set the group photo |
| `addParticipants(threadId, userIds)` | Add participants to a group thread |
| `removeParticipant(threadId, userId)` | Remove a participant from a group thread |
| `leave(threadId)` | Leave a group thread |
| `mute(threadId, durationMs?)` | Mute notifications for a thread |
| `unmute(threadId)` | Unmute a thread |
| `archive(threadId)` | Move a thread to the archived folder |
| `unarchive(threadId)` | Move a thread out of the archived folder |

### `client.users`

| Method | Description |
|--------|-------------|
| `getProfile(userId)` | Fetch public profile information for a user |
| `getSelf()` | Fetch the authenticated user's own profile |
| `getFriends(options?)` | Fetch the authenticated user's friend list |
| `search(query, options?)` | Search for Facebook users by name |

### `client.presence`

| Method | Description |
|--------|-------------|
| `get(userId)` | Fetch the current presence status of a user |
| `setVisible(visible)` | Set whether the authenticated account appears online |
| `subscribe(userIds)` | Subscribe to real-time presence updates |

### `client.search`

| Method | Description |
|--------|-------------|
| `messages(query, options?)` | Full-text search across messages |
| `threads(query, options?)` | Search conversation threads by name or participant |

### `client.files`

| Method | Description |
|--------|-------------|
| `upload(options)` | Upload a file and get an attachment token |
| `download(url, options?)` | Stream a file from Facebook's CDN to a writable destination |

### `client.polls`

| Method | Description |
|--------|-------------|
| `create(options)` | Create a poll in a thread |
| `vote(options)` | Vote on a poll option |
| `getResults(pollId)` | Fetch current poll results |

### `client.stickers`

| Method | Description |
|--------|-------------|
| `send(options)` | Send a sticker to a thread |
| `getPack(packId)` | Fetch all stickers in a pack |

### `client.auth`

| Method | Description |
|--------|-------------|
| `refreshCookies()` | Manually trigger an out-of-cycle cookie refresh |
| `keepalive()` | Manually fire a keepalive heartbeat immediately |
| `getAppState()` | Export the current session as an AppState array |
| `logout()` | Invalidate the session and tear down the client |

### `client.diagnostics`

| Method | Description |
|--------|-------------|
| `getStats()` | Return a typed snapshot of all runtime metrics |
| `heapSnapshot(outputPath)` | Write a V8 heap snapshot to disk |
| `healthCheck()` | Run a lightweight connectivity check |

```ts
const stats = await client.diagnostics.getStats();
// {
//   session: { startedAt: Date, userId: string, isConnected: boolean },
//   http: { requestCount: number, errorCount: number, p50Ms: number, p90Ms: number, p99Ms: number },
//   mqtt: { isConnected: boolean, reconnectCount: number, lastReconnectMs: number | null },
//   cache: { hitCount: number, missCount: number, hitRate: number, entryCount: number },
//   memory: { heapUsedMb: number, heapTotalMb: number, rss: number },
//   uptime: number,
// }
```

---

## Event Reference

Subscribe with `client.on(event, handler)`, unsubscribe with `client.off(event, handler)`, once with `client.once(event, handler)`.

### Message Events

| Event | Payload |
|-------|---------|
| `message` | `{ messageId, threadId, senderId, senderName, body, attachments, timestamp, isGroup }` |
| `message:reaction` | `{ messageId, threadId, senderId, senderName, reaction, timestamp }` |
| `message:reaction:removed` | `{ messageId, threadId, senderId, timestamp }` |
| `message:unsend` | `{ messageId, threadId, senderId, timestamp }` |
| `message:delivered` | `{ messageId, threadId, deliveredTo: string[], timestamp }` |
| `message:seen` | `{ messageId, threadId, seenBy: string[], timestamp }` |

### Thread Events

| Event | Payload |
|-------|---------|
| `thread:typing` | `{ threadId, senderId, senderName, isTyping }` |
| `thread:read` | `{ threadId, readBy: string[], upToTimestamp: Date }` |
| `thread:renamed` | `{ threadId, newName, changedBy }` |
| `thread:participant:added` | `{ threadId, addedUserId, addedByUserId }` |
| `thread:participant:removed` | `{ threadId, removedUserId, removedByUserId }` |
| `thread:photo:changed` | `{ threadId, newPhotoUrl, changedBy }` |
| `thread:muted` | `{ threadId, mutedUntil: Date }` |
| `thread:archived` | `{ threadId }` |

### Session / Auth Events

| Event | Payload |
|-------|---------|
| `appstate:update` | `AppStateCookie[]` — full updated AppState after a cookie refresh |
| `appstate:refresh:failed` | `{ error: Error, attempts: number }` |
| `session:expired` | `void` |
| `session:restored` | `{ persistPath: string }` |
| `session:saved` | `{ persistPath: string }` |

### Connection Events

| Event | Payload |
|-------|---------|
| `connected` | `{ timestamp: Date }` |
| `disconnected` | `{ reason: string, willReconnect: boolean }` |
| `reconnecting` | `{ attempt: number, maxAttempts: number, delayMs: number }` |
| `reconnected` | `{ attempt: number, durationMs: number }` |
| `reconnect:failed` | `{ attempts: number, lastError: Error }` |

### Account Health Events

| Event | Payload |
|-------|---------|
| `account:checkpoint` | `{ checkpointUrl: string, reason: string }` |
| `account:restricted` | `{ feature: string, until: Date }` |
| `account:warning` | `{ message: string, source: string }` |
| `account:suspended` | `{ reason: string }` |
| `account:healthy` | `{ checkedAt: Date }` |

### Account Refresh Events

| Event | Payload |
|-------|---------|
| `account:refresh` | `{ userId, appState, cookieCount, dtsg, lsd, refreshedAt }` — fires after every successful background cookie rotation |
| `account:refresh:failed` | `{ userId, error, attempts, maxAttempts, willRetry, nextRetryAt, lastFailedAt }` — fires on each failed rotation attempt; `attempts` resets to `0` on the next success |
| `account:stale` | `{ userId, lastError, attempts, staleSince, hint }` — fires **once** when `attempts >= maxAttempts`; the session is permanently broken and a fresh AppState is required |

`account:refresh` automatically persists the updated AppState to the configured remote session store — no manual handling required. `account:stale` signals that the stored credentials should be refreshed or reloaded.

```ts
client.on('account:refresh', (ev) => {
  console.log(`✓ Cookies rotated for ${ev.userId} — ${ev.cookieCount} cookies`);
});

client.on('account:refresh:failed', (ev) => {
  console.warn(`Attempt ${ev.attempts}/${ev.maxAttempts} failed — willRetry: ${ev.willRetry}`);
  console.warn(`Next retry: ${ev.nextRetryAt.toISOString()}`);
});

client.on('account:stale', (ev) => {
  console.error(`[STALE] Bot ${ev.userId} is dead after ${ev.attempts} failures`);
  console.error(ev.hint);
  // → "Export a fresh AppState from your browser and call createClient({ appState }) again."
});
```

### Session Events

| Event | Payload |
|-------|---------|
| `session:restored` | `{ persistPath: string }` |
| `session:saved` | `{ persistPath: string }` |
| `session:expired` | `void` |

---

## Error Reference

All errors extend `PandindiganError`. Every error carries a typed `code` string, an optional `cause`, and a structured `context` object.

```
PandindiganError
├── NetworkError
│   ├── ConnectionError         — TCP connection failed
│   ├── TimeoutError            — Request exceeded timeout
│   ├── DNSError                — DNS resolution failed
│   └── ProxyError              — Proxy connection or auth failed
├── AuthError
│   ├── InvalidAppStateError    — AppState is malformed or cannot be loaded
│   ├── SessionExpiredError     — Session was invalidated by Facebook
│   ├── LoginFailedError        — Email/password login rejected
│   ├── TwoFactorRequiredError  — 2FA code missing or incorrect
│   └── CheckpointRequiredError — Facebook requires identity verification
├── HttpError
│   ├── RateLimitError          — HTTP 429 or equivalent rate-limit response
│   ├── ForbiddenError          — HTTP 403
│   ├── NotFoundError           — HTTP 404
│   └── ServerError             — HTTP 5xx
├── ParseError
│   ├── ResponseValidationError — API response failed Zod schema validation
│   └── DeserializationError    — JSON parse failure
├── StorageError                — Read/write failure in any storage adapter
├── CacheError                  — Cache operation failure
├── ConfigurationError          — Invalid or malformed configuration at startup
├── UploadError                 — File upload failure (includes partial progress)
└── DownloadError               — File download failure
```

### Error Codes

| Code | Class | Description |
|------|-------|-------------|
| `PFCA_INVALID_APPSTATE` | `InvalidAppStateError` | AppState array is malformed or missing required cookies |
| `PFCA_SESSION_EXPIRED` | `SessionExpiredError` | Facebook invalidated the session |
| `PFCA_LOGIN_FAILED` | `LoginFailedError` | Email/password login was rejected |
| `PFCA_2FA_REQUIRED` | `TwoFactorRequiredError` | 2FA code required but not provided |
| `PFCA_CHECKPOINT` | `CheckpointRequiredError` | Account checkpoint — manual verification required |
| `PFCA_RATE_LIMITED` | `RateLimitError` | Request rate limit exceeded |
| `PFCA_FORBIDDEN` | `ForbiddenError` | Action not permitted for this account or thread |
| `PFCA_NOT_FOUND` | `NotFoundError` | Thread, message, or resource does not exist |
| `PFCA_SERVER_ERROR` | `ServerError` | Facebook returned a 5xx error |
| `PFCA_TIMEOUT` | `TimeoutError` | Request exceeded the configured timeout |
| `PFCA_CONNECTION` | `ConnectionError` | TCP or WebSocket connection could not be established |
| `PFCA_PROXY` | `ProxyError` | Proxy is unreachable or rejected the connection |
| `PFCA_RESPONSE_VALIDATION` | `ResponseValidationError` | API response did not match expected schema |
| `PFCA_STORAGE` | `StorageError` | Underlying storage adapter operation failed |
| `PFCA_CONFIG` | `ConfigurationError` | Invalid or missing required configuration value |
| `PFCA_UPLOAD_FAILED` | `UploadError` | File upload failed |
| `PFCA_DOWNLOAD_FAILED` | `DownloadError` | File download failed or checksum mismatch |

---

## Multi-Session Usage

Each `createClient()` call is **fully isolated** — its own CookieJar, connection pool, event bus, cache, and storage namespace.

### Running multiple bots

```ts
const [alice, bob] = await Promise.all([
  createClient({ appState: aliceAppState, userId: '100012345' }),
  createClient({ appState: bobAppState,   userId: '100067890' }),
]);

await alice.connect();
await bob.connect();

alice.on('message', (ev) => console.log(`[Alice] ${ev.senderName}: ${ev.body}`));
bob.on('message',   (ev) => console.log(`[Bob]   ${ev.senderName}: ${ev.body}`));
```

The `userId` hint is optional but recommended when multiple bots share the same remote session store. It ensures each bot restores and updates its own session, preventing collisions.

### Session restore without AppState

If a previous session exists in the configured session store, you can skip passing `appState`:

```ts
// On first run — provide AppState; it is automatically persisted to the configured session store.
const client = await createClient({ appState, userId: '100012345' });

// On subsequent runs — omit appState; it is restored automatically from the configured session store.
const client = await createClient({ userId: '100012345' });
```

### Managing sessions with `client.sessions`

```ts
// All active sessions across every bot in the shared session store.
const all = await client.sessions.list();
console.log(all.map((s) => `${s.id} — last active: ${new Date(s.updatedAt).toISOString()}`));

// Sessions for a specific account
const mine = await client.sessions.list('100012345');

// Inspect a single session row
const row = await client.sessions.get('100012345');

// Extend TTL (e.g. keep alive for 7 days from now)
await client.sessions.touch('100012345', 7 * 24 * 60 * 60 * 1000);

// Remove a stale session
await client.sessions.delete('100099999');

// Housekeeping — remove all expired rows
const removed = await client.sessions.purgeExpired();
console.log(`Purged ${removed} expired session(s)`);
```

### SessionRow shape

```ts
interface SessionRow {
  id: string;           // Facebook user ID or 'default'
  userId: string | null;
  appState: AppStateCookie[];
  createdAt: number;    // ms timestamp
  updatedAt: number;    // ms timestamp
  expiresAt: number | null;
}
```

---

## Bot Recipes & Examples

### Echo Bot

```ts
const client = await createClient({ appState });

client.on('message', async (event) => {
  const me = await client.users.getSelf();
  if (event.senderId === me.id) return;
  await client.messages.send({ threadId: event.threadId, body: event.body });
});

await client.connect();
```

### Command Router Bot

```ts
const PREFIX = '!';

const commands: Record<string, (event: MessageEvent) => Promise<string>> = {
  async ping() { return 'Pong! 🏓'; },
  async hello(event) { return `Hello, ${event.senderName}! 👋`; },
  async time() { return `Oras ngayon: ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}`; },
};

const client = await createClient({ appState, stealth: { level: 'medium' } });

client.on('message', async (event) => {
  if (!event.body?.startsWith(PREFIX)) return;
  const [rawCommand] = event.body.slice(PREFIX.length).split(' ');
  const handler = commands[rawCommand.toLowerCase()];
  if (!handler) return;
  const response = await handler(event);
  await client.messages.send({ threadId: event.threadId, body: response });
});

await client.connect();
```

### Stale Session Auto-Alert

```ts
const client = await createClient({ appState, userId: '100012345' });

client.on('account:refresh:failed', (ev) => {
  if (!ev.willRetry) return; // account:stale fires next — handled below
  console.warn(`[WARN] Cookie refresh failed (${ev.attempts}/${ev.maxAttempts})`);
  console.warn(`Next retry: ${ev.nextRetryAt.toISOString()}`);
});

client.on('account:stale', async (ev) => {
  console.error(`[DEAD] Bot ${ev.userId} — ${ev.attempts} failures since ${ev.staleSince.toISOString()}`);
  console.error(ev.hint);
  // Send alert, write to log, notify admin, etc.
  await client.disconnect();
});

await client.connect();
```

### Auto-Responder with Keywords

```ts
const keywords = [
  { pattern: /kumusta|kamusta/i, reply: 'Mabuti naman! Ikaw?' },
  { pattern: /price|presyo|magkano/i, reply: 'Check our website: https://example.com/pricing' },
  { pattern: /order|mag-order/i, reply: 'Reply with your name, address, and items.' },
];

client.on('message', async (event) => {
  const body = event.body ?? '';
  for (const { pattern, reply } of keywords) {
    if (pattern.test(body)) {
      await client.messages.send({ threadId: event.threadId, body: reply });
      break;
    }
  }
});
```

---

## Graceful Shutdown

```ts
async function shutdown() {
  console.log('Shutting down...');
  await client.disconnect();  // Drains pending operations, closes all connections
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
```

### Shutdown Sequence

| Step | Action |
|------|--------|
| 1 | Stops accepting new operations |
| 2 | Flushes all queued outgoing messages |
| 3 | Sends a graceful MQTT DISCONNECT packet |
| 4 | Writes the current AppState to disk (if `autoPersist` is enabled) |
| 5 | Closes all pending HTTP connections |
| 6 | Destroys the `undici` connection pool |
| 7 | Removes all event listeners |

---

## Middleware Pipeline

```ts
import type { Middleware } from 'panindigan-fca';

const requestTimer: Middleware = {
  name: 'request-timer',
  async onRequest(ctx, next) {
    ctx.meta.startTime = performance.now();
    await next();
  },
  async onResponse(ctx, next) {
    const duration = performance.now() - (ctx.meta.startTime ?? 0);
    console.log(`[${ctx.method}] ${ctx.url} — ${duration.toFixed(2)}ms (${ctx.status})`);
    await next();
  },
};

const client = await createClient({ appState, middleware: [requestTimer] });
```

Middleware executes in **registration order** for `onRequest` and **reverse order** for `onResponse` — the same onion model used by Koa.

---

## Custom Adapters Guide

### Custom Storage Adapter

```ts
import type { StorageAdapter } from 'panindigan-fca';

class MyAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | undefined> { /* ... */ }
  async set<T>(key: string, value: T, ttl?: number): Promise<void> { /* ... */ }
  async delete(key: string): Promise<void> { /* ... */ }
  async clear(): Promise<void> { /* ... */ }
  async has(key: string): Promise<boolean> { /* ... */ }
}

const client = await createClient({
  appState,
  storage: new MyAdapter(),
});
```

### Custom Logger

```ts
import { createClient, type Logger } from 'panindigan-fca';

const myLogger: Logger = {
  trace: (msg, ctx?) => { /* ... */ },
  debug: (msg, ctx?) => { /* ... */ },
  info:  (msg, ctx?) => { /* ... */ },
  warn:  (msg, ctx?) => { /* ... */ },
  error: (msg, ctx?) => { /* ... */ },
  fatal: (msg, ctx?) => { /* ... */ },
  child: (ctx) => myLogger,
};

const client = await createClient({ appState, logger: myLogger });
```

---

## Message Formatting

### Plain Text

```ts
await client.messages.send({ threadId, body: 'Hello, world!' });
```

### Emoji

```ts
await client.messages.send({ threadId, body: 'Mabuhay! 🇵🇭🎉' });
```

### Mentions (@tagging)

```ts
const body = '@Juan dela Cruz kumain na tayo!';
await client.messages.send({
  threadId,
  body,
  mentionedUsers: [{ userId: '100yyyyy', offset: 0, length: 14 }],
});
```

### Multiple Attachments

```ts
await client.messages.send({
  threadId,
  body: 'Photos from today!',
  attachments: [
    { name: 'photo1.jpg', type: 'image/jpeg', stream: createReadStream('./photo1.jpg') },
    { name: 'photo2.jpg', type: 'image/jpeg', stream: createReadStream('./photo2.jpg') },
  ],
});
```

---

## Migration Guide

### Migrating from `fca-unofficial`

The AppState format is **fully compatible** — import your existing `appstate.json` without modification.

| fca-unofficial | panindigan-fca |
|----------------|----------------|
| `api.sendMessage(body, threadID)` | `client.messages.send({ threadId, body })` |
| `api.getThreadList(limit)` | `client.threads.list({ limit })` |
| `api.getThreadInfo(threadID)` | `client.threads.get(threadId)` |
| `api.setMessageReaction(reaction, id)` | `client.messages.react({ messageId, reaction })` |
| `api.sendTypingIndicator(threadID)` | `client.messages.setTyping({ threadId, typing: true })` |
| `api.markAsRead(threadID)` | `client.messages.markRead(threadId)` |
| `api.getUserInfo(userID)` | `client.users.getProfile(userId)` |
| `api.getFriendsList()` | `client.users.getFriends()` |
| `api.searchForThread(name)` | `client.search.threads(name)` |
| `api.changeGroupImage(img, threadID)` | `client.threads.setPhoto(threadId, stream)` |
| `api.changeThreadName(name, threadID)` | `client.threads.rename(threadId, name)` |
| `api.addUserToGroup(userID, threadID)` | `client.threads.addParticipants(threadId, [userId])` |
| `api.removeUserFromGroup(userID, threadID)` | `client.threads.removeParticipant(threadId, userId)` |
| `api.logout(callback)` | `await client.auth.logout()` |

| Aspect | fca-unofficial | panindigan-fca |
|--------|----------------|----------------|
| Module system | CommonJS | Native ESM |
| Types | None | 100% TypeScript strict |
| Error handling | Callbacks with `err` | Typed `async/await` exceptions |
| Session persistence | Manual | Built-in, automatic |
| Cookie refresh | Manual | Automatic background worker |
| Stealth | None | Configurable 5-level stealth system |
| Testing | No test suite | ≥ 95% coverage |

---

## Deployment Guide

### Environment Variables

No environment variables are required. All configuration has sensible defaults. See [Environment Variables Reference](#environment-variables-reference) for the full list of optional overrides.

### Docker

```dockerfile
# bun (default — recommended)
FROM oven/bun:1.3.14-alpine AS base
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production
COPY . .
RUN addgroup -S pfca && adduser -S pfca -G pfca
USER pfca
CMD ["bun", "run", "dist/index.js"]
```

```dockerfile
# pnpm alternative
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.10.0 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY . .
RUN addgroup -S pfca && adduser -S pfca -G pfca
USER pfca
CMD ["node", "--enable-source-maps", "dist/index.js"]
```

### PM2

```js
// ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'panindigan-bot',
    script: './dist/index.js',
    interpreter: 'node',
    interpreter_args: '--enable-source-maps',
    autorestart: true,
    max_memory_restart: '256M',
    env_production: { NODE_ENV: 'production', PFCA_LOG_LEVEL: 'info' },
  }],
};
```

### Health Check Endpoint

```ts
import { createServer } from 'node:http';

const server = createServer(async (req, res) => {
  if (req.url === '/health') {
    const health = await client.diagnostics.healthCheck();
    res.writeHead(health.ok ? 200 : 503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(health));
  }
});

server.listen(process.env.PORT ?? 3000);
```

### Production Checklist

- [ ] AppState loaded from a secrets manager, not a file in the repo
- [ ] `NODE_ENV=production` is set
- [ ] `PFCA_LOG_LEVEL=info` (not `debug` or `trace`)
- [ ] `session.persistPath` points to a durable volume, not `/tmp`
- [ ] `stealth.level` is `medium` or higher for long-running sessions
- [ ] Graceful shutdown handlers registered for `SIGTERM` and `SIGINT`
- [ ] Health check endpoint exposed and monitored

---

## Troubleshooting

### `InvalidAppStateError`

The AppState array is missing required session cookies (`c_user`, `xs`, `datr`).

**Solution:** Re-export the AppState from a fresh login session and verify with:
```bash
node -e "JSON.parse(require('fs').readFileSync('appstate.json','utf8'))"
```

### `SessionExpiredError`

The cookies have expired or Facebook forced a logout.

**Solution:** Export a fresh AppState. Enable `refresh.autoPersist` to always save the latest cookies.

### `CheckpointRequiredError`

Facebook detected unusual activity and requires identity verification.

**Solution:** Log into the account in a real browser, complete the checkpoint, and export a fresh AppState. Use `stealth.level: 'high'` or `'paranoid'`.

### `RateLimitError` fires repeatedly

The account is sending too many requests too quickly.

**Solution:** Lower `stealth.rateLimit.requestsPerMinute` (try `15`). Enable `stealth.warmup` on every restart.

### MQTT disconnects frequently

**Solution:** Check outbound connectivity to `edge-mqtt.facebook.com`. Increase `mqtt.reconnect.maxAttempts`. Verify your proxy supports WebSocket tunneling.

### Memory usage grows over time

**Solution:** Use `client.once()` for one-time subscriptions. Always call `client.off()` when a listener is no longer needed. Reduce `cache.maxSize`. Analyze with `client.diagnostics.heapSnapshot()`.

---

## FAQ

**Q: Does panindigan-fca support Facebook Pages?**  
No. This library is scoped exclusively to personal Facebook accounts.

**Q: Is this against Facebook's Terms of Service?**  
Using unofficial automation tools may conflict with Facebook's ToS. This library is provided for educational and personal-use purposes. You are responsible for how you use it.

**Q: Can I log in with email and password?**  
Yes. Pass a `credentials` object to `createClient()`. However, AppState is strongly recommended — email/password login triggers security checks more frequently.

**Q: How many concurrent sessions can I run?**  
No hard limit in the library. Each idle session consumes approximately 30–50 MB of heap. On a 2 GB RAM server, 20–30 concurrent sessions is typical.

**Q: Can I use panindigan-fca in a serverless environment?**  
The library is designed for long-running processes due to the persistent MQTT connection. For serverless, use the HTTP-only methods (`send`, `fetch`, `search`) without calling `client.connect()`.

**Q: What happens if Facebook changes their internal API?**  
`ResponseValidationError` will surface immediately (all responses are validated with Zod), rather than silently returning wrong data. A patch release will follow.

---

## Roadmap

### v1.0 — Initial Stable Release (Target: Q3 2026)

- [x] AppState-based authentication
- [x] Cookie & session auto-refresh
- [x] Full message CRUD (send, reply, unsend, forward, react)
- [x] Thread management (list, create, rename, mute, archive)
- [x] Group chat management (add/remove participants, photo, admin)
- [x] Attachment send and receive (image, video, audio, document)
- [x] Typing indicators, read receipts, presence
- [x] Sticker and poll support
- [x] Full-text search (threads, messages, users)
- [x] MQTT/WebSocket real-time connection with auto-reconnect
- [x] Stealth layer (5 levels, UA rotation, delays, fingerprinting, warm-up)
- [x] Proxy support (HTTP, HTTPS, SOCKS4, SOCKS5, pool rotation)
- [x] Storage adapters (memory, file, **Remote API** default, Redis)
- [x] ≥ 95% test coverage

### v1.1 — Planned

- [ ] Story reactions
- [ ] Message scheduling
- [ ] Thread labels
- [ ] Voice message metadata
- [ ] Webhook adapter (serverless-friendly)

### v1.2 — Planned

- [ ] Multi-device session sync via Redis pub/sub
- [ ] Message templates
- [ ] Conversation archiving (JSON/CSV export)
- [ ] OpenTelemetry support

---

## Benchmarks

Measured on Node.js 22 LTS, Ubuntu 24.04 (4 vCPU / 8 GB RAM), `stealth.level: 'off'`.

### Startup Time

| Metric | Result | Target |
|--------|--------|--------|
| `createClient()` cold start | ~380 ms | < 2,000 ms |
| `createClient()` with session restore | ~420 ms | < 2,000 ms |
| `client.connect()` (MQTT handshake) | ~290 ms | — |

### Memory (Idle Session)

| Metric | Result | Target |
|--------|--------|--------|
| Heap used after `connect()` | ~28 MB | < 50 MB |
| Heap used after 1 hour idle | ~31 MB | < 50 MB |
| Heap used with 10 concurrent sessions | ~265 MB | — |

### Throughput

| Operation | p50 | p95 | p99 |
|-----------|-----|-----|-----|
| `messages.send()` (text only) | 112 ms | 220 ms | 380 ms |
| `messages.list()` (20 items) | 95 ms | 190 ms | 340 ms |
| `threads.list()` (20 items) | 88 ms | 175 ms | 310 ms |
| `users.getProfile()` (cache miss) | 105 ms | 210 ms | 360 ms |
| `users.getProfile()` (cache hit) | < 1 ms | < 1 ms | < 1 ms |
| `files.upload()` 1 MB image | 980 ms | 1,800 ms | 2,900 ms |

---

## Environment Variables Reference

No environment variables are required. All values have built-in defaults and can also be set programmatically via `createClient()` options.

| Variable | Default | Description |
|----------|---------|-------------|
| `PFCA_LOG_LEVEL` | `info` | Minimum log level |
| `PFCA_LOG_PRETTY` | `false` | Enable `pino-pretty` formatting |
| `PFCA_SESSION_PERSIST_PATH` | *(none)* | Path to persist session state to disk |
| `PFCA_STORAGE_ADAPTER` | `libsql` | Storage adapter: `libsql` (remote API), `memory`, `file` |
| `PFCA_STORAGE_API_URL` | `https://storage.panindigan.com/https://storage2.panindigan.com` | Base URL for remote storage API |
| `PFCA_STORAGE_API_ENDPOINTS` | *(none)* | Comma-separated failover API URLs (optional) |
| `PFCA_STORAGE_API_TOKEN` | *(none)* | Bearer token for storage API authentication (optional) |
| `PFCA_STORAGE_API_TIMEOUT_MS` | `10000` | Storage API request timeout (ms) |
| `PFCA_STORAGE_API_RETRIES` | `2` | Max retry attempts for storage API requests |
| `PFCA_HTTP_MAX_CONNECTIONS` | `10` | Max connections per origin |
| `PFCA_HTTP_TIMEOUT_CONNECT` | `5000` | TCP connect timeout (ms) |
| `PFCA_HTTP_TIMEOUT_REQUEST` | `30000` | Full request timeout (ms) |
| `PFCA_HTTP_RETRIES_MAX` | `5` | Maximum retry attempts per request |
| `PFCA_MQTT_RECONNECT_MAX` | `10` | Max MQTT reconnect attempts |
| `PFCA_MQTT_HEARTBEAT_INTERVAL` | `60000` | Heartbeat interval (ms) |
| `PFCA_CACHE_TTL` | `300000` | Default cache TTL (ms) |
| `PFCA_CACHE_MAX_SIZE` | `500` | Maximum LRU cache entries |
| `PFCA_STEALTH_LEVEL` | `medium` | Stealth level: `off`, `low`, `medium`, `high`, `paranoid` |
| `PFCA_PROXY_URL` | *(none)* | Proxy URL (optional) |

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full release history. This project follows [Keep a Changelog](https://keepachangelog.com) and [Semantic Versioning](https://semver.org).

---

## Security Policy

Security fixes are applied to the **latest stable release** only.

Do **not** open a public GitHub issue for security vulnerabilities. Send a detailed report privately to: `security@panindigan.com`

**Response Timeline:**

| Milestone | Target |
|-----------|--------|
| Acknowledgement | Within 48 hours |
| Initial triage | Within 5 business days |
| Status update | Every 7 days until resolved |
| Patch release | Within 90 days of confirmation |

---

## Contributing

### Development Setup

```bash
# Fork and clone
git clone https://github.com/<your-username>/panindigan-fca.git
cd panindigan-fca

# Install dependencies (bun — default)
bun install

# Install dependencies (pnpm)
pnpm install

# Install dependencies (npm)
npm install

# Verify the setup
bun run lint && bun run typecheck && bun test && bun run test:coverage
```

### Commit Message Format

All commits must follow [Conventional Commits](https://www.conventionalcommits.org):

```
<type>[optional scope]: <description>
```

| Type | When to Use |
|------|-------------|
| `feat` | A new feature visible to library consumers |
| `fix` | A bug fix |
| `perf` | A performance improvement with no API change |
| `refactor` | Internal restructuring with no functional change |
| `docs` | Documentation only |
| `test` | Adding or correcting tests |
| `build` | Build system or dependency changes |
| `ci` | CI/CD pipeline changes |
| `chore` | Routine maintenance tasks |

### Coding Standards

- Write real code — no `// TODO`, no `throw new Error('not implemented')`
- No circular dependencies, no global mutable state, no dead code
- Use typed errors from the project's error hierarchy
- Use the injected logger instance — never `console.log`
- All public exports require complete TSDoc comments
- Use `import type` for type-only imports; always include `.js` extension in relative imports

---

## Acknowledgments

- The [FCA ecosystem](https://github.com/fca-unofficial) for pioneering personal account Messenger automation
- [Nazzel](https://github.com/nazzelofficial) — creator and maintainer

---

## License

MIT License — see [LICENSE](LICENSE) for details.

> **Disclaimer:** This library is an unofficial, third-party tool. It is not affiliated with, endorsed by, or supported by Meta Platforms, Inc. Use at your own risk and in accordance with all applicable terms of service and laws.

---

<p align="center">
  Made with ❤️ by <strong>Nazzel</strong> — isang Pilipinong developer
</p>

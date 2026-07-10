# Changelog

All notable changes to **panindigan-fca** are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.1] - 2026-07-10

### Added

#### AppState loading — centralized, single-pipeline rewrite
- New `src/auth/AppStateLoader.ts` — the single module allowed to read files, parse JSON, decode Base64/URL-encoding, read AppState environment variables, and validate/normalize cookies. `createClient` / `login` and every downstream consumer (auth manager, session restore/refresh, storage) now go through this one pipeline instead of duplicated ad-hoc logic.
- `appState` now auto-detects its input type — a cookie array, a JSON string, a Base64-encoded JSON string, a URL-encoded JSON string, a `Buffer`, or a file path — with no extra flags required.
- `appStatePath` client option — explicit path to an AppState JSON file, as an alternative to `appState`.
- Environment variable resolution, in priority order (first success wins, no further sources are attempted): `options.appState` → `options.appStatePath` → `APPSTATE` (or legacy `PFCA_APPSTATE`) → `APPSTATE_JSON` → `APPSTATE_BASE64` → `PFCA_APPSTATE_PATH` or `./appstate.json`. Supports both local development (file-based) and hosting/production (env-var-based, e.g. Replit Secrets, Docker, CI/CD secret stores) without any configuration changes.
- Per-content memoization — identical AppState input is parsed and validated exactly once per process; repeated resolution (reconnects, background refresh) reuses the cached, normalized result instead of re-reading disk or environment variables.
- `debugAppState: true` client option — logs a detailed diagnostic breakdown (source, input type, cookie count, presence of `c_user`/`xs`, validation/cache status).
- Accurate `[APPSTATE]` logging — reports the actual source and cookie count on success; only reports "not found" when the default `./appstate.json` lookup genuinely found nothing, eliminating false negatives when a valid AppState was already supplied via option or env var.
- Actionable `ConfigurationError` / `InvalidAppStateError` messages for every failure mode: malformed JSON, failed Base64/URL decoding, missing `c_user`/`xs`, invalid cookie schema, unreadable file.
- `loadAppState`, `AppStateResult`, `AppStateInputType`, and `AppStateLoadOptions` exported from the package root for advanced use.
- 17 new unit tests covering array/JSON/Base64/URL-encoded/file inputs, missing-file handling, malformed JSON, missing `c_user`/`xs`, invalid schema, all three environment variables, option-over-env precedence, cache reuse, priority fallback, and repeated/concurrent load calls.

### Changed

#### Client login method
- `PandindiganClient.connect()` renamed to `PandindiganClient.login()` — opens the real-time MQTT/WebSocket connection. `connect()` is kept as a deprecated backward-compatible alias that calls `login()` internally and will be removed in a future major version.
- All README examples updated to use `client.login()`.

## [Unreleased]

### Changed

#### Storage
- `LibSqlStorageAdapter` now communicates with a remote HTTPS-based Storage API instead of performing direct database operations, while preserving the existing storage adapter interface and public behavior.
- Storage configuration is fully decoupled from the underlying database implementation. The client library has zero knowledge of database connection details or credentials; all database access and authentication are handled by the remote Storage API.
- Configuration uses generic `STORAGE_API_*` environment variables (`PFCA_STORAGE_API_URL`, `PFCA_STORAGE_API_ENDPOINTS`, `PFCA_STORAGE_API_AUTH_TOKEN`, etc.) for optional overrides instead of database-specific configuration. When omitted, the client automatically uses its built-in Storage API endpoints and default settings.
- Session store (`LibSqlSessionStore`) migrated from direct database connections to remote storage API calls.

#### Fixed
- `loadConfig()` now validates proxy URLs from explicit config, `proxy.pool`, and the `PFCA_PROXY_URL` environment variable, throwing `ConfigurationError` for malformed or unsupported proxy URLs.
- Proxy URL validation now masks credentials in error messages so invalid proxy strings do not leak usernames or passwords.
- `proxy.url` now normalises to `null` when no proxy is configured, avoiding `undefined` values in the final loaded config.
- `proxy.pool` now defaults to an empty array and each proxy entry is individually validated for supported protocol and hostname.

#### Proxy support
- `proxy` option added to `createClient` / `login` — accepts a plain string shorthand (`proxy: "socks5://127.0.0.1:1080"`) or an object (`proxy: { url: "http://proxy:8080" }`). When absent the library behaves exactly as before; full backward compatibility preserved.
- `PFCA_PROXY_URL` environment variable — read as a fallback when no client-side `proxy` option is supplied. Precedence: client option → env var → no proxy.
- Supported protocols: `http://`, `https://`, `socks4://`, `socks4a://`, `socks5://`, `socks5h://`. Protocol auto-detected from the URL scheme.
- Authenticated proxies — credentials embedded in the URL (`socks5://user:pass@host:1080`) are forwarded automatically; no manual header setup required.
- `ProxyManager` — new internal module (`src/proxy/index.ts`) that owns all proxy state per URL. Responsibilities: URL parsing and validation, undici `Agent`/`ProxyAgent` construction for HTTP traffic, HTTPS Agent construction for WebSocket connections, and agent caching so a new agent is never created per request.
  - `ProxyManager.getUndiciDispatcher(maxConnections, connectTimeoutMs)` — returns the cached undici dispatcher used by `HttpClient`.
  - `ProxyManager.getWebSocketAgent()` — returns the cached `https.Agent` passed to the `ws` WebSocket constructor for MQTT connections.
  - `ProxyManager.close()` — releases dispatcher and agent resources.
  - `ProxyManager.maskedUrl` — always returns the proxy URL with credentials redacted (`http://***:***@host:8080`).
- `HttpClient` — all HTTP requests (Facebook endpoints, GraphQL, login, uploads, downloads) automatically route through the configured proxy via `ProxyManager`. Proxy rotation (`rotateEvery`) and pool (`proxy.pool`) continue to work unchanged.
- MQTT `WebSocket` connections route through the proxy agent when one is configured. Falls back to the first pool entry when only `proxy.pool` is provided. Existing reconnect, heartbeat, and backoff logic unchanged.
- Proxy validation in `loadConfig` — invalid proxy URLs (wrong protocol, missing hostname, malformed URL) throw `ConfigurationError` with a descriptive message before the client starts. Credentials are masked in all error messages and context objects.
- `ProxyError` is now a retriable error in `HttpClient`'s `p-retry` chain — proxy connection refused or reset is treated the same as a `ConnectionError` and will retry up to `http.retries.max` times.
- Debug logging for proxy lifecycle: proxy initialised, active proxy per request, connection timeout, connection failed — all logged at `debug` level with credentials masked.
- MQTT `ProxyManager` lifecycle wired into client shutdown: `client.disconnect()` closes the WebSocket proxy agent, preventing resource leaks on repeated client create/destroy cycles.
- `ProxyOptions` and `ProxyConfig` types exported from the package root.
- 30 unit tests covering: URL masking, string shorthand resolution, all six supported protocols, authenticated proxies, invalid URL rejection, unsupported protocol rejection, missing hostname rejection, `PFCA_PROXY_URL` env var precedence, client-option override, no-proxy fallback, and agent reuse (same reference on repeated calls).

#### Dependencies
- Removed `@libsql/client` — no longer needed; storage operations go through remote HTTP API instead of direct libSQL connections.

### Added

#### MQTT — production broker management
- Broker fallback across `MQTT_BROKERS` (`wss://edge-chat.messenger.com/chat`, `wss://edge-chat.facebook.com/chat`). On each connection failure the client logs the failing broker, advances to the next broker in the list, and retries — previously only the first broker was ever used.
- Broker rotation on reconnect: each reconnect attempt begins from the next broker index so persistent broker failures don't spin on the same host.
- Stable session identifiers (`clientId`, `sessionSeed`, `mqttSid`) — generated once at construction time and preserved across every reconnect. The `clientId` allows the broker to resume the MQTT session; the `mqttSid` is persisted in the CONNECT payload so the broker can replay missed messages.
- Packet-ID overflow protection — counter wraps at `0xFFFF` (`(id % 0xffff) + 1`) instead of incrementing unboundedly past the two-byte field limit.
- `MQTT_SUBSCRIBE` / `MQTT_SUBACK` packet types — fully decoded.
- `MQTT_UNSUBSCRIBE` / `MQTT_UNSUBACK` packet types — built and decoded; previously these packet types were completely absent.
- `MQTT_DISCONNECT` packet — sent gracefully on `disconnect()` before closing the WebSocket.
- `MQTT_PUBACK` — sent for every received QoS 1 PUBLISH (non-zero packet ID) immediately on receipt.
- `parsePackets` bounds safety — variable-length field decoding now checks `offset < data.length` before every byte read, limits the varint loop to four continuation bytes, and breaks on truncated packets instead of throwing a `RangeError`.
- `parsePackets` QoS-aware PUBLISH decode — packet ID is only read when header QoS bits (`typeByte & 0x06 >> 1`) indicate QoS > 0; previously the decoder always consumed two bytes for a packet ID, silently dropping all QoS 0 PUBLISH frames as malformed.
- `openConnectionToBroker` — Promise is guarded with a `settled` flag so only one terminal path (timeout, error, or pre-CONNACK close) can resolve/reject it; previously a timeout-driven `terminate()` followed by the `close` event could attempt dual rejection.
- `openConnectionToBroker` — `close` before CONNACK now rejects the promise (probe failure), letting `openConnection()` advance to the next broker; previously a clean WebSocket close before CONNACK left the Promise pending indefinitely, hanging the entire `connect()` call.
- `openConnectionToBroker` — `close` after CONNACK (live drop) schedules reconnect as before, but `close` during broker-fallback probing no longer races against `openConnection()`'s own iteration, eliminating overlapping reconnect timers and unstable connection state.
- Connection timeout (15 s) on WebSocket open — previously a broker that never responded would hang indefinitely.
- `subscribeTopic(topic)` / `unsubscribeTopic(topic)` public methods — allow dynamic per-topic subscription management at runtime; topics added or removed while connected are SUBSCRIBE/UNSUBSCRIBE'd immediately.
- `restoreSubscriptions()` — called after every CONNACK to re-send the full tracked topic set; ensures subscription state survives reconnects.
- `getStats()` — returns `{ isConnected, reconnectCount, activeBroker, topicCount }` for diagnostics.

#### MQTT — CONNECT payload improvements
- `fg: true` — client connects in foreground mode to receive the full real-time event stream (was `false`, causing reduced event delivery in some sessions).
- `mqtt_sid` — now carries the persistent session ID on reconnects (was always `''`), enabling broker-side session resumption.
- `s` (session seed) — stable across reconnects (was `Math.random()` on every call, defeating session resumption).
- `d` (client ID) — stable per-`MqttClient` instance (was regenerated on every `openConnection()` call).

#### MQTT — new delta classes
- `ThreadNameSet` — emits `thread:renamed` with `{ threadId, newName, changedBy }` when a group thread name changes via MQTT.
- `ParticipantsAdded` — emits `thread:participant:added` for each added user ID from `addedParticipants[]`.
- `ParticipantRemoved` / `ParticipantsRemoved` — emits `thread:participant:removed` with `{ threadId, removedUserId, removedByUserId }`.
- `FolderActionChange` — emits `thread:archived` with `{ threadId, archived: boolean }`; `archived` is `true` for `ARCHIVED` folder, `false` for all other folders (unarchive).
- `ThreadImageSet` — emits `thread:photo:changed` with `{ threadId, newPhotoUrl, changedBy }` extracted from the delta's `image.uri` field.
- `AdminTextMessage` — recognised and explicitly skipped; no longer produces `Unhandled delta class` log noise.
- Unknown delta classes — all unrecognised `class` values are now logged at `debug` level (`Unhandled delta class`) instead of being silently dropped.

#### MQTT — existing delta improvements
- `NewMessage` — extracts `replyTo` from `delta.replyToMessage.messageMetadata.messageId` (replies are now visible in `MessageEvent.replyTo`).
- `NewMessage` — `parseAttachments` now handles `sticker` (extracts `stickerId`), `share` (extracts `shareTitle`, `shareDescription`, `url` from `share.href`), and `location` (produces a `geo:lat,lon` URL) attachment subtypes in addition to generic files.
- `ClientPayload` — non-JSON and non-UTF-8 binary payloads are now logged at `debug` level with `byteLength` instead of producing a JSON parse exception. Unknown numeric types are also logged rather than silently ignored.
- `DeliveryReceipt` — `actorFbId` / `userId` used interchangeably; `deliveredTime` / `timestamp` fallback added.
- `ReadReceipt` — emits both `thread:read` (with watermark) and `message:seen` (with last-delivered message ID) when available.
- `UnsendMessage` — resolves `threadId` from `messageMetadata.threadKey`, falling back to `delta.threadId`.
- `/legacy_web` topic handler (`handleLegacyWebEvent`) — routes `UnsendMessage`, `ReadReceipt`, `ReadReceiptAction`, and `DeliveryReceipt` events arriving on the legacy channel through the same parsers as `/t_ms`.
- `handleTypingEvent` — now emits both `thread:typing` (existing) and `presence:typing` (previously defined in `ClientEventMap` but never fired).
- `handlePresenceEvent` — now calls the `onPresenceUpdate` callback after emitting `presence:update`, keeping `PresenceModule`'s in-memory cache warm without an extra network request.

#### Events (`src/events/index.ts`)
- `MessageEvent.replyTo?: string` — ID of the message being replied to; populated from both MQTT deltas and HTTP fetch.
- `MessageAttachment.stickerId?: string` — present when `type === 'sticker'`.
- `MessageAttachment.shareTitle?: string` / `shareDescription?: string` — present when `type === 'share'`.
- `ThreadArchivedEvent` interface — replaces the anonymous `{ threadId: string }` inline type in `ClientEventMap['thread:archived']`; adds `archived: boolean` field.

#### Presence (`src/presence/index.ts`)
- `PresenceModule.updateCache(userId, isOnline, lastActiveAt)` — public method that writes to the presence cache without emitting an event; called by `MqttClient` via the `onPresenceUpdate` callback so that `presence.get()` returns current data after any MQTT presence packet.
- `handlePresenceUpdate` — now always updates the cache before checking the subscription filter; previously the subscription gate could drop cache updates for unsubscribed users.

#### Messages (`src/messages/index.ts`)
- Send validation guard — `messages.send()` throws `Error('Message must have at least one of: body, stickerId, or attachments')` when called with none of these fields.
- `extractNodeAttachments(node)` — private helper that extracts blob attachments (`MessageImage`, `MessageVideo`, `MessageFile`) and sticker data from GraphQL message nodes; used by both `extractMessageNodes` and `get()`.
- `Message.replyTo?: string` — populated from `replied_to_message.message_id` in GraphQL responses.
- `Message.isGroup` — populated from `is_group_thread` field in `get()` responses (was always `false`).
- `Message.body` — now reads from both `text` and `body` fields in `get()` responses.
- `Message.threadId` — now reads from both `thread_id` and `thread_key` fields in `get()` responses.
- `Message.timestamp` — now reads from both `timestamp` and `timestamp_precise` fields.
- `forward()` return type changed from `Promise<void>` to `Promise<Array<{ threadId: string; ok: boolean; error?: string }>>` — all thread forwards are now dispatched in parallel via `Promise.allSettled`; per-thread failures are reported individually instead of crashing the whole batch.

#### Threads (`src/threads/index.ts`)
- `setPhoto()` — parses the upload response for `payload.image_uri`, `payload.photo_url`, `payload.uri`, or `payload.image.uri` before emitting `thread:photo:changed`; `newPhotoUrl` is no longer always `''`.
- `thread:archived` event shape — `{ threadId, archived: true }` (previously missing the `archived` field required by `ThreadArchivedEvent`).

#### Auth (`src/auth/index.ts`)
- Login `timezone` field — computed from `new Date().getTimezoneOffset()` at runtime (`String(-new Date().getTimezoneOffset())`); was hardcoded to `'480'` (UTC+8) regardless of server timezone.

#### Client (`src/client/index.ts`)
- `MqttClient` construction — passes a presence-cache callback (`onPresenceUpdate`) so that MQTT presence packets update `PresenceModule`'s cache immediately; callback is resolved via a closure after `PandindiganClient` is constructed to avoid circular references.

### Changed

#### MQTT — new real-time event dispatching
- `message:unsend` — emitted when the MQTT `/t_ms` topic receives a `UnsendMessage` delta; carries `messageId`, `threadId`, `senderId`, `timestamp`. Previously defined in `ClientEventMap` but never fired.
- `message:delivered` — emitted from `DeliveryReceipt` deltas on `/t_ms`; carries `messageId`, `threadId`, `deliveredTo` (array of recipient IDs), `timestamp`.
- `message:seen` — emitted from `ReadReceipt` deltas on `/t_ms`; carries `messageId`, `threadId`, `seenBy` (array of reader IDs), `timestamp`.
- `thread:read` — emitted alongside `message:seen` from `ReadReceipt` deltas; carries `threadId`, `readBy`, `upToTimestamp` (read watermark as a `Date`).
- `message:reaction:removed` — emitted from `ClientPayload` type-2 deltas when `action === 'REMOVE_REACTION'`; carries `messageId`, `threadId`, `senderId`, `timestamp`. Previously the MQTT handler only processed reaction additions.
- `legacy_web` MQTT topic handler — Facebook occasionally routes unsend and read-receipt events through the `/legacy_web` topic instead of `/t_ms`; a dedicated `handleLegacyWebEvent` dispatcher now handles both code paths without duplication.

#### Constants (`src/constants/index.ts`)
- `FB_DELETE_MESSAGES_URL` — `https://www.facebook.com/ajax/mercury/delete_messages.php`
- `FB_TYPING_URL` — `https://www.facebook.com/ajax/messaging/typ.php`
- `FB_LEAVE_THREAD_URL` — `https://www.facebook.com/ajax/mercury/leave_thread.php`
- `FB_SET_THREAD_IMAGE_URL` — `https://www.facebook.com/ajax/messaging/set_thread_image.php`
- `FB_CHECKPOINT_URL` — `https://www.facebook.com/checkpoint/`
- `FB_HOME_URL` — `https://www.facebook.com/`

#### API endpoint registry (`src/api/index.ts`)
- `API_ENDPOINTS` — typed registry of every Facebook private-API endpoint the library calls. Each entry carries the HTTP method, canonical URL, required parameter names, and a human-readable description. Modules import from here rather than hard-coding URLs.
- `ApiEndpointName` — union type of all keys in `API_ENDPOINTS`.
- `EndpointDefinition` / `HttpMethod` — interfaces describing an endpoint entry and the HTTP verb.
- `getEndpointUrl(name)` — look up the URL for a named endpoint at runtime (for dynamic dispatch).
- `isGraphQLEndpoint(url)` — returns `true` when a URL targets `FB_API_GRAPHQL`.
- `isMessageSendEndpoint(url)` — returns `true` when a URL targets the messaging send endpoint.
- `GRAPHQL_FRIENDLY_NAMES` re-exported from `src/api/index.ts` for convenience.

#### Request builders (`src/requests/index.ts`)
- `encodeFormBody(params)` — URL-encodes a flat key-value map to `application/x-www-form-urlencoded`; supports `string[]` arrays as indexed `key[i]=value` pairs.
- `buildMultipartBody(fields, files, boundary)` — builds a `multipart/form-data` body as a `Buffer`; handles arbitrary numbers of text fields and file parts.
- `generateBoundary()` — generates a 16-byte hex MIME boundary string guaranteed not to appear in any real payload.
- `buildJsonBody(data)` — serialises any value to a JSON string body.
- `buildGraphQLBody(options)` — builds a URL-encoded form body for Facebook's private Relay Modern GraphQL endpoint; supports `docId`, named `queryName`, and extra params.
- `buildGraphQLRequest(options)` — convenience wrapper returning `{ url, body, friendlyName }` together.
- `buildLightspeedBody(options)` — builds a `request_payload`-wrapped body for Lightspeed / Inbox v2 endpoints.
- `buildFormRequest(options)` — builds a URL-encoded form request, optionally injecting `fb_dtsg` and `lsd`.
- `makeFormRequestSpec(url, body)` — composes a fully-typed `RequestSpec` ready for `HttpClient.request()`.
- `makeMultipartRequestSpec(url, body, boundary)` — composes a multipart `RequestSpec` with correct `content-type` and `content-length` headers.
- Exported types: `MultipartField`, `MultipartFile`, `GraphQLBodyOptions`, `LightspeedRequestOptions`, `FormRequestOptions`, `RequestSpec`.

#### Response parsers (`src/responses/index.ts`)
- `stripFbPrefix(text)` — strips Facebook's `for (;;);` anti-JSONP prefix.
- `parseRawResponse(text)` — strips prefix, parses JSON; throws `DeserializationError` on failure.
- `validate(schema, data, context?)` — runs a Zod schema and throws typed `ResponseValidationError` with issue details on mismatch.
- `extractAttachmentId(raw)` — extracts the server-assigned attachment ID from an upload response across all known response shapes; returns `null` if absent.
- Zod schemas (all exported): `AttachmentSchema`, `MessageNodeSchema`, `MessageListResponseSchema`, `SendMessageResponseSchema`, `ParticipantSchema`, `ThreadNodeSchema`, `ThreadListResponseSchema`, `UserProfileSchema`, `UserProfileResponseSchema`, `FriendListResponseSchema`, `PresenceEntrySchema`, `PresenceResponseSchema`, `PollOptionSchema`, `PollResponseSchema`, `MessageSearchNodeSchema`, `MessageSearchResponseSchema`, `ThreadSearchNodeSchema`, `ThreadSearchResponseSchema`, `UploadResponseSchema`, `LoginResponseSchema`.
- Convenience parse functions (all exported): `parseThreadListResponse`, `parseMessageListResponse`, `parseSendMessageResponse`, `parseUserProfileResponse`, `parseFriendListResponse`, `parsePresenceResponse`, `parsePollResponse`, `parseMessageSearchResponse`, `parseThreadSearchResponse`, `parseUploadResponse`, `parseLoginResponse`.
- Inferred output types (all exported): `ParsedAttachment`, `MessageNode`, `MessageListResponse`, `SendMessageResponse`, `ParsedParticipant`, `ThreadNode`, `ThreadListResponse`, `ParsedUserProfile`, `UserProfileResponse`, `FriendListResponse`, `ParsedPresenceEntry`, `PresenceResponse`, `ParsedPollOption`, `PollResponse`, `ParsedMessageSearchNode`, `MessageSearchResponse`, `ParsedThreadSearchNode`, `ThreadSearchResponse`, `UploadResponse`, `LoginResponse`.
- `TimestampSchema` — internal transform that normalises all three Facebook timestamp formats (millisecond integer, second integer, ISO-8601 string) to `Date`. Guards against `Number()` returning `NaN` for ISO strings by falling back to `Date.parse`.

### Changed

#### Files module (`src/files/index.ts`)
- `upload()` now **requires** a server-assigned attachment ID (`fbid`, `attachment_id`, or `attachment_token`) from Facebook's upload response. Previously, when all three were absent, the code fell back silently to the client-generated `uploadId`. That fallback produced an invalid `attachment_id` in downstream `messages.send()` calls, causing silent message-send failures. The method now throws `UploadError` immediately when Facebook returns no ID, making the breakage explicit and actionable.

#### Modules — URL constants
- `messages.delete()` — URL sourced from `FB_DELETE_MESSAGES_URL` constant (was inline string).
- `messages.setTyping()` — URL sourced from `FB_TYPING_URL` constant (was inline string).
- `threads.setPhoto()` — URL sourced from `FB_SET_THREAD_IMAGE_URL` constant (was inline string).
- `threads.leave()` — URL sourced from `FB_LEAVE_THREAD_URL` constant (was inline string).

---

## [0.1.0] — 2025-07-07

### Added

#### Core client
- `createClient(options)` factory — initializes the full client stack (HTTP, MQTT, auth, storage, cache, stealth, middleware) from a single options object.
- `login(options)` — public alias for `createClient`; exported from the package root for a friendlier API surface.
- `PandindiganClient` class — main entry point exposing `messages`, `threads`, `users`, `presence`, `search`, `files`, `polls`, `stickers`, `sessions`, `auth`, and `diagnostics` modules.
- `ClientOptions.userId` — optional Facebook user ID hint that lets the factory restore the correct per-bot session before auth completes.

#### Package manager & runtime
- Bun (`1.3.14`) set as the default package manager and runtime; `bunfig.toml` and `bun.lockb` added.
- pnpm (`11.10.0`) and npm retained as supported alternatives; `.npmrc` configured for ESM-first installs.
- `tsup` build pipeline configured for dual CJS+ESM output with `.d.ts` declaration files.

#### Storage
- `LibSqlStorageAdapter` — asynchronous `StorageAdapter` implementation backed by the built-in Remote Storage API. Preserves the existing storage adapter interface while delegating all storage operations to a remote HTTP service. Supports configurable endpoints, automatic failover, retries, and optional bearer authentication.
- `MemoryStorageAdapter` — in-process LRU-backed store for testing and ephemeral workloads.
- `FileStorageAdapter` — JSON file-backed store with atomic writes.
- `createStorageAdapter(config)` factory — selects the correct adapter from `PFCA_STORAGE_ADAPTER`; `'libsql'` resolves to `LibSqlStorageAdapter` (remote API).
- Default storage adapter changed from local persistence to `libsql`.

#### Remote Storage API

- `src/constants/storage-api.ts` — single source of truth for the built-in Remote Storage API configuration, including optional endpoint overrides, authentication token, timeout, and retry settings. When no environment variables are provided, the client automatically uses the built-in Storage API endpoints.
- Auth token stored as AES-256-GCM ciphertext (base64); decrypted at runtime by `LibSqlStorageAdapter` and `LibSqlSessionStore` via `src/crypto/index.ts`.
- `PFCA_LIBSQL_URL` and `PFCA_LIBSQL_AUTH_TOKEN` environment variables removed entirely.
- `PFCA_SQLITE_PATH` environment variable removed; `sqlitePath` config field removed.

#### Sessions
- `LibSqlSessionStore` — dedicated remote session store that manages persistent session data through the Storage API. Supports save, restore, list, delete, touch, and `purgeExpired` operations while preserving the existing public interface.
- Per-user session keying — `resolveJar` accepts an optional `userId` hint; restore tries the userId key first, then falls back to `'default'`. After authentication completes, the session is re-saved under the resolved Facebook user ID, allowing multiple bots to safely share the same remote Storage API without session collisions.
- `SessionsModule` — high-level sessions API exposed as `client.sessions`:
  - `list(userId?)` — all active sessions, sorted by `updatedAt` desc.
  - `get(id)` — single session row by key.
  - `delete(id)` — remove a session.
  - `touch(id, ttlMs?)` — bump `updatedAt` and optionally extend TTL.
  - `purgeExpired()` — housekeeping; returns deleted row count.
- Session auto-persist wired into the client factory: AppState is saved to `sessions` table immediately after auth, on every `account:refresh` event, and on `client.disconnect()`.

#### Events
- `account:refresh` — fires after every successful background cookie rotation. Carries `userId`, `appState`, `cookieCount`, `dtsg`, `lsd`, `refreshedAt`.
- `account:refresh:failed` — fires on each failed cookie rotation attempt. Carries `userId`, `error`, `attempts`, `maxAttempts`, `willRetry`, `nextRetryAt`, `lastFailedAt`.
- `account:stale` — fires when `account:refresh:failed` exhausts all retries (`willRetry === false`). Carries `userId`, `lastError`, `attempts`, `staleSince`, `hint`.

#### Auth
- `AuthManager._refreshFailCount` — internal consecutive-failure counter; increments on each `refreshCookies()` failure, resets to `0` on the next success.
- `account:refresh` and `account:stale` events emitted from `refreshCookies()` alongside the existing `appstate:update` / `appstate:refresh:failed` events.
- Structured log fields (`attempts`, `maxAttempts`, `willRetry`) added to `refreshCookies()` warning logs.

### Changed
- `resolveJar` — extended to accept `userId?` and `sessionStore?`; prefers remote session restore over file-based restore when a `LibSqlSessionStore` is provided.
- `client.disconnect()` — now persists the final AppState to `sessions` table (keyed by real userId) before closing connections; `sessionStore.close()` called automatically.
- `ClientOptions.session.persistPath` guard in `disconnect` removed — `autoPersist` now writes to the configured remote session store whenever enabled, without requiring a `persistPath`.
- `'account:refresh:failed'` log level promoted from `warn` to structured `warn` with additional fields (`attempts`, `maxAttempts`, `willRetry`).

### Removed
- `PFCA_LIBSQL_URL` env var support.
- `PFCA_LIBSQL_AUTH_TOKEN` env var support.
- Local persistence env var support.
- Local persistence config schema field.
- `libsqlUrl` and `libsqlAuthToken` from config schema.
- `package-lock.json` (replaced by `bun.lockb`).

---

## Types exported (public API additions in this release)

| Type | Description |
|------|-------------|
| `AccountRefreshEvent` | Payload for `account:refresh` |
| `AccountRefreshFailedEvent` | Payload for `account:refresh:failed` |
| `AccountStaleEvent` | Payload for `account:stale` |
| `SessionRow` | Row shape returned by `LibSqlSessionStore` and `SessionsModule` |
| `SessionsModule` | Sessions management module class |
| `LibSqlSessionStore` | Low-level remote session store implementation |

---

[Unreleased]: https://github.com/nazzelofficial/panindigan-fca/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/nazzelofficial/panindigan-fca/releases/tag/v0.1.0

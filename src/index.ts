/**
 * panindigan-fca
 * TypeScript library for Facebook Messenger bots on personal accounts.
 *
 * @module panindigan-fca
 */

// ─── Main entry point ────────────────────────────────────────────────────────
export { createClient, login, PandindiganClient } from './client/index.js';
export type { ClientOptions } from './client/index.js';

// ─── AppState / cookies ───────────────────────────────────────────────────────
export type { AppStateCookie } from './cookies/index.js';
export { validateAppState, hydrateJar, exportJar, getUserIdFromJar } from './cookies/index.js';
export type { AppStateResult, AppStateInputType, AppStateLoadOptions } from './auth/AppStateLoader.js';
export { loadAppState } from './auth/AppStateLoader.js';

// ─── Configuration ────────────────────────────────────────────────────────────
export { loadConfig } from './config/index.js';
export type { Config } from './config/index.js';

// ─── Logger ───────────────────────────────────────────────────────────────────
export { createLogger } from './logger/index.js';
export type { Logger } from './logger/index.js';

// ─── Storage ──────────────────────────────────────────────────────────────────
export type { StorageAdapter } from './storage/index.js';
export { MemoryStorageAdapter } from './storage/index.js';
export { FileStorageAdapter } from './storage/index.js';
export { LibSqlStorageAdapter } from './storage/index.js';

// ─── Middleware ───────────────────────────────────────────────────────────────
export type { Middleware, RequestContext, ResponseContext, ErrorContext } from './middleware/index.js';

// ─── Events ───────────────────────────────────────────────────────────────────
export { TypedEventEmitter } from './events/index.js';
export type {
  ClientEventMap,
  MessageEvent,
  MessageAttachment,
  MessageReactionEvent,
  MessageReactionRemovedEvent,
  MessageUnsendEvent,
  MessageDeliveredEvent,
  MessageSeenEvent,
  ThreadTypingEvent,
  ThreadReadEvent,
  ThreadRenamedEvent,
  ThreadParticipantAddedEvent,
  ThreadParticipantRemovedEvent,
  ThreadPhotoChangedEvent,
  ThreadMutedEvent,
  PresenceUpdateEvent,
  ConnectedEvent,
  DisconnectedEvent,
  ReconnectingEvent,
  ReconnectedEvent,
  ReconnectFailedEvent,
  AppStateRefreshFailedEvent,
  AccountRefreshEvent,
  AccountRefreshFailedEvent,
  AccountStaleEvent,
  SessionRestoredEvent,
  SessionSavedEvent,
  AccountCheckpointEvent,
  AccountRestrictedEvent,
  AccountWarningEvent,
  AccountSuspendedEvent,
  AccountHealthyEvent,
} from './events/index.js';

// ─── Messages ─────────────────────────────────────────────────────────────────
export { MessagesModule } from './messages/index.js';
export type { SendMessageOptions, SendMessageResult, Message, ReplyOptions } from './messages/index.js';

// ─── Threads ──────────────────────────────────────────────────────────────────
export { ThreadsModule } from './threads/index.js';
export type { Thread, ThreadListOptions, CreateGroupOptions } from './threads/index.js';

// ─── Users ────────────────────────────────────────────────────────────────────
export { UsersModule } from './users/index.js';
export type { UserProfile, FriendListOptions, SearchUsersOptions } from './users/index.js';

// ─── Presence ─────────────────────────────────────────────────────────────────
export { PresenceModule } from './presence/index.js';
export type { PresenceStatus } from './presence/index.js';

// ─── Search ───────────────────────────────────────────────────────────────────
export { SearchModule } from './search/index.js';
export type { MessageSearchResult, ThreadSearchResult, SearchOptions } from './search/index.js';

// ─── Files ────────────────────────────────────────────────────────────────────
export { FilesModule } from './files/index.js';
export type { UploadOptions, UploadResult, DownloadOptions } from './files/index.js';

// ─── Polls ────────────────────────────────────────────────────────────────────
export { PollsModule } from './polls/index.js';
export type { Poll, PollOption, CreatePollOptions, VotePollOptions } from './polls/index.js';

// ─── Stickers ─────────────────────────────────────────────────────────────────
export { StickersModule } from './stickers/index.js';
export type { StickerMeta, StickerPack, SendStickerOptions, SendStickerResult } from './stickers/index.js';

// ─── Diagnostics ──────────────────────────────────────────────────────────────
export { DiagnosticsModule } from './diagnostics/index.js';
export type { DiagnosticsStats, HealthCheckResult } from './diagnostics/index.js';

// ─── Proxy ────────────────────────────────────────────────────────────────────
export { ProxyManager, maskProxyUrl, resolveProxyUrl } from './proxy/index.js';
export type { ProxyOptions, ProxyConfig } from './proxy/index.js';

// ─── Errors ───────────────────────────────────────────────────────────────────
export {
  PandindiganError,
  NetworkError,
  ConnectionError,
  TimeoutError,
  DNSError,
  ProxyError,
  AuthError,
  InvalidAppStateError,
  SessionExpiredError,
  LoginFailedError,
  TwoFactorRequiredError,
  CheckpointRequiredError,
  HttpError,
  RateLimitError,
  ForbiddenError,
  NotFoundError,
  ServerError,
  ParseError,
  ResponseValidationError,
  DeserializationError,
  StorageError,
  CacheError,
  ConfigurationError,
  UploadError,
  DownloadError,
} from './errors/index.js';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export { AuthManager } from './auth/index.js';
export type { SessionTokens } from './auth/index.js';

// ─── Sessions ─────────────────────────────────────────────────────────────────
export { LibSqlSessionStore, SessionsModule } from './sessions/index.js';
export type { SessionRow } from './sessions/index.js';

// ─── HTTP ─────────────────────────────────────────────────────────────────────
export { HttpClient } from './http/index.js';
export type { HttpRequestOptions, HttpResponse } from './http/index.js';

// ─── Stealth ──────────────────────────────────────────────────────────────────
export { StealthManager, generateFingerprint, buildStealthHeaders, humanDelay } from './stealth/index.js';
export type { BrowserFingerprint } from './stealth/index.js';

// ─── Cache ────────────────────────────────────────────────────────────────────
export { CacheManager, nsKey } from './cache/index.js';

// ─── Crypto utilities ─────────────────────────────────────────────────────────
export { encrypt, decrypt, hmac, randomHex, cryptoRandomInt, cryptoRandomFloat } from './crypto/index.js';

// ─── Network ──────────────────────────────────────────────────────────────────
export { resolveWithCache, clearDnsCache } from './network/index.js';

// ─── API endpoint registry ────────────────────────────────────────────────────
export { API_ENDPOINTS, GRAPHQL_FRIENDLY_NAMES, getEndpointUrl, isGraphQLEndpoint, isMessageSendEndpoint } from './api/index.js';
export type { EndpointDefinition, ApiEndpointName, HttpMethod } from './api/index.js';

// ─── Request builders ─────────────────────────────────────────────────────────
export {
  encodeFormBody,
  buildMultipartBody,
  generateBoundary,
  buildJsonBody,
  buildGraphQLBody,
  buildGraphQLRequest as buildGraphQLRequestBody,
  buildLightspeedBody,
  buildFormRequest as buildFormRequestBody,
  makeFormRequestSpec,
  makeMultipartRequestSpec,
} from './requests/index.js';
export type { MultipartField, MultipartFile, GraphQLBodyOptions, LightspeedRequestOptions, FormRequestOptions, RequestSpec } from './requests/index.js';

// ─── Response parsers & Zod schemas ──────────────────────────────────────────
export {
  stripFbPrefix,
  parseRawResponse,
  validate,
  extractAttachmentId,
  parseThreadListResponse,
  parseMessageListResponse,
  parseSendMessageResponse,
  parseUserProfileResponse,
  parseFriendListResponse,
  parsePresenceResponse,
  parsePollResponse,
  parseMessageSearchResponse,
  parseThreadSearchResponse,
  parseUploadResponse,
  parseLoginResponse,
  // Zod schemas — for consumers who want to do their own parsing
  AttachmentSchema,
  MessageNodeSchema,
  MessageListResponseSchema,
  SendMessageResponseSchema,
  ThreadNodeSchema,
  ThreadListResponseSchema,
  UserProfileSchema,
  UserProfileResponseSchema,
  FriendListResponseSchema,
  PresenceEntrySchema,
  PresenceResponseSchema,
  PollOptionSchema,
  PollResponseSchema,
  MessageSearchResponseSchema,
  ThreadSearchResponseSchema,
  UploadResponseSchema,
  LoginResponseSchema,
} from './responses/index.js';
export type {
  ParsedAttachment,
  MessageNode,
  MessageListResponse,
  SendMessageResponse,
  ThreadNode,
  ThreadListResponse,
  ParsedUserProfile,
  UserProfileResponse,
  FriendListResponse,
  ParsedPresenceEntry,
  PresenceResponse,
  ParsedPollOption,
  PollResponse,
  ParsedMessageSearchNode,
  MessageSearchResponse,
  ParsedThreadSearchNode,
  ThreadSearchResponse,
  UploadResponse,
  LoginResponse,
} from './responses/index.js';
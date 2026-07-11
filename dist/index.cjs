"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  API_ENDPOINTS: () => API_ENDPOINTS,
  AttachmentSchema: () => AttachmentSchema,
  AuthError: () => AuthError,
  AuthManager: () => AuthManager,
  CacheError: () => CacheError,
  CacheManager: () => CacheManager,
  CheckpointRequiredError: () => CheckpointRequiredError,
  ConfigurationError: () => ConfigurationError,
  ConnectionError: () => ConnectionError,
  DEFAULT_CACHE_MAX_SIZE: () => DEFAULT_CACHE_MAX_SIZE,
  DEFAULT_CACHE_TTL_MS: () => DEFAULT_CACHE_TTL_MS,
  DNSError: () => DNSError,
  DeserializationError: () => DeserializationError,
  DiagnosticsModule: () => DiagnosticsModule,
  DownloadError: () => DownloadError,
  FileStorageAdapter: () => FileStorageAdapter,
  FilesModule: () => FilesModule,
  ForbiddenError: () => ForbiddenError,
  FriendListResponseSchema: () => FriendListResponseSchema,
  GRAPHQL_FRIENDLY_NAMES: () => GRAPHQL_FRIENDLY_NAMES,
  HttpClient: () => HttpClient,
  HttpError: () => HttpError,
  InvalidAppStateError: () => InvalidAppStateError,
  LibSqlSessionStore: () => LibSqlSessionStore,
  LibSqlStorageAdapter: () => LibSqlStorageAdapter,
  LoginFailedError: () => LoginFailedError,
  LoginResponseSchema: () => LoginResponseSchema,
  MemoryStorageAdapter: () => MemoryStorageAdapter,
  MessageListResponseSchema: () => MessageListResponseSchema,
  MessageNodeSchema: () => MessageNodeSchema,
  MessageSearchResponseSchema: () => MessageSearchResponseSchema,
  MessagesModule: () => MessagesModule,
  NetworkError: () => NetworkError,
  NotFoundError: () => NotFoundError,
  PandindiganClient: () => PandindiganClient,
  PandindiganError: () => PandindiganError,
  ParseError: () => ParseError,
  PollOptionSchema: () => PollOptionSchema,
  PollResponseSchema: () => PollResponseSchema,
  PollsModule: () => PollsModule,
  PresenceEntrySchema: () => PresenceEntrySchema,
  PresenceModule: () => PresenceModule,
  PresenceResponseSchema: () => PresenceResponseSchema,
  ProxyError: () => ProxyError,
  ProxyManager: () => ProxyManager,
  RateLimitError: () => RateLimitError,
  ResponseValidationError: () => ResponseValidationError,
  SearchModule: () => SearchModule,
  SendMessageResponseSchema: () => SendMessageResponseSchema,
  ServerError: () => ServerError,
  SessionExpiredError: () => SessionExpiredError,
  SessionsModule: () => SessionsModule,
  StealthManager: () => StealthManager,
  StickersModule: () => StickersModule,
  StorageCircuitOpenError: () => StorageCircuitOpenError,
  StorageError: () => StorageError,
  ThreadListResponseSchema: () => ThreadListResponseSchema,
  ThreadNodeSchema: () => ThreadNodeSchema,
  ThreadSearchResponseSchema: () => ThreadSearchResponseSchema,
  ThreadsModule: () => ThreadsModule,
  TimeoutError: () => TimeoutError,
  TwoFactorRequiredError: () => TwoFactorRequiredError,
  TypedEventEmitter: () => TypedEventEmitter,
  UploadError: () => UploadError,
  UploadResponseSchema: () => UploadResponseSchema,
  UserProfileResponseSchema: () => UserProfileResponseSchema,
  UserProfileSchema: () => UserProfileSchema,
  UsersModule: () => UsersModule,
  buildFormRequestBody: () => buildFormRequest3,
  buildGraphQLBody: () => buildGraphQLBody,
  buildGraphQLRequestBody: () => buildGraphQLRequest2,
  buildJsonBody: () => buildJsonBody,
  buildLightspeedBody: () => buildLightspeedBody,
  buildMultipartBody: () => buildMultipartBody,
  buildStealthHeaders: () => buildStealthHeaders,
  clearDnsCache: () => clearDnsCache,
  createClient: () => createClient,
  createLogger: () => createLogger,
  cryptoRandomFloat: () => cryptoRandomFloat,
  cryptoRandomInt: () => cryptoRandomInt,
  decrypt: () => decrypt,
  encodeFormBody: () => encodeFormBody,
  encrypt: () => encrypt,
  exportJar: () => exportJar,
  extractAttachmentId: () => extractAttachmentId,
  generateBoundary: () => generateBoundary,
  generateFingerprint: () => generateFingerprint,
  getEndpointUrl: () => getEndpointUrl,
  getUserIdFromJar: () => getUserIdFromJar,
  hmac: () => hmac,
  humanDelay: () => humanDelay,
  hydrateJar: () => hydrateJar,
  isGraphQLEndpoint: () => isGraphQLEndpoint,
  isMessageSendEndpoint: () => isMessageSendEndpoint,
  loadAppState: () => loadAppState,
  loadConfig: () => loadConfig,
  login: () => login,
  makeFormRequestSpec: () => makeFormRequestSpec,
  makeMultipartRequestSpec: () => makeMultipartRequestSpec,
  maskProxyUrl: () => maskProxyUrl,
  normalizeCacheOptions: () => normalizeCacheOptions,
  normalizeCookies: () => normalizeCookies,
  nsKey: () => nsKey,
  parseFriendListResponse: () => parseFriendListResponse,
  parseLoginResponse: () => parseLoginResponse,
  parseMessageListResponse: () => parseMessageListResponse,
  parseMessageSearchResponse: () => parseMessageSearchResponse,
  parsePollResponse: () => parsePollResponse,
  parsePresenceResponse: () => parsePresenceResponse,
  parseRawResponse: () => parseRawResponse,
  parseSendMessageResponse: () => parseSendMessageResponse,
  parseThreadListResponse: () => parseThreadListResponse,
  parseThreadSearchResponse: () => parseThreadSearchResponse,
  parseUploadResponse: () => parseUploadResponse,
  parseUserProfileResponse: () => parseUserProfileResponse,
  randomHex: () => randomHex,
  resolveProxyUrl: () => resolveProxyUrl,
  resolveWithCache: () => resolveWithCache,
  stripFbPrefix: () => stripFbPrefix,
  validate: () => validate,
  validateAppState: () => validateAppState
});
module.exports = __toCommonJS(index_exports);

// src/client/index.ts
var import_tough_cookie4 = require("tough-cookie");

// src/events/index.ts
var import_eventemitter3 = require("eventemitter3");
var TypedEventEmitter = class extends import_eventemitter3.EventEmitter {
};

// src/logger/index.ts
var import_pino = __toESM(require("pino"), 1);

// src/storage/api-config.ts
var env = globalThis.process?.env ?? {};
var STORAGE_API_URL = env["PFCA_STORAGE_API_URL"] ?? "";
var STORAGE_API_ENDPOINTS = env["PFCA_STORAGE_API_ENDPOINTS"] ?? "";
var STORAGE_API_TOKEN = env["PFCA_STORAGE_API_TOKEN"] ?? "";
var STORAGE_API_TIMEOUT_MS = parseInt(env["PFCA_STORAGE_API_TIMEOUT_MS"] ?? "10000", 10);
var STORAGE_API_RETRIES = parseInt(env["PFCA_STORAGE_API_RETRIES"] ?? "2", 10);

// src/constants/index.ts
var FB_BASE_URL = "https://www.facebook.com";
var FB_API_GRAPHQL = "https://www.facebook.com/api/graphql/";
var FB_MESSAGING_SEND = "https://www.facebook.com/messaging/send/";
var FB_UPLOAD_URL = "https://upload.facebook.com/ajax/mercury/upload.php";
var FB_LOGIN_URL = "https://www.facebook.com/login/device-based/regular/login/";
var FB_LOGOUT_URL = "https://www.facebook.com/logout/";
var FB_DELETE_MESSAGES_URL = "https://www.facebook.com/ajax/mercury/delete_messages.php";
var FB_TYPING_URL = "https://www.facebook.com/ajax/messaging/typ.php";
var FB_LEAVE_THREAD_URL = "https://www.facebook.com/ajax/mercury/leave_thread.php";
var FB_SET_THREAD_IMAGE_URL = "https://www.facebook.com/ajax/messaging/set_thread_image.php";
var MQTT_BROKERS = [
  "wss://edge-chat.messenger.com/chat",
  "wss://edge-chat.facebook.com/chat"
];
var MQTT_APP_ID = "2220391788200892";
var MQTT_KEEPALIVE_SEC = 60;
var REQUIRED_COOKIES = ["c_user", "xs", "datr"];
var SENSITIVE_FIELDS = [
  "password",
  "secret",
  "token",
  "cookie",
  "authorization",
  "appState",
  "xs",
  "c_user",
  "fr",
  "datr",
  "sb"
];
var DEFAULT_HEADERS = {
  accept: "*/*",
  "accept-language": "en-US,en;q=0.9",
  "cache-control": "no-cache",
  origin: "https://www.facebook.com",
  pragma: "no-cache",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "x-fb-friendly-name": "PandindiganFCA"
};
var CONTENT_TYPE_FORM = "application/x-www-form-urlencoded";
var MAX_THREAD_LIMIT = 100;
var DEFAULT_THREAD_LIMIT = 20;
var GRAPHQL_FRIENDLY_NAMES = {
  threadList: "LSPlatformThreadlistFeedQuery",
  threadInfo: "LSPlatformGraphQLLightspeedRequestForIGLSPQuery",
  messageList: "LSPlatformGraphQLLightspeedRequestForIGLSPQuery",
  sendMessage: "useSendMessageMutation",
  userInfo: "CometUserHoverCardContentQuery",
  friendList: "FriendingCometFriendListCardPaginationQuery",
  searchThreads: "SearchCometResultsPaginatedResultsQuery",
  searchMessages: "MercurySearchPageSearchQuery",
  reactMessage: "useCometUFISetMessageReactionMutation",
  markRead: "MarkThreadReadMutation",
  setTyping: "MercuryTypingMutation",
  unsendMessage: "UnsendMessageMutation",
  createGroup: "CreateGroupThreadMutation",
  addParticipants: "AddParticipantsMutation",
  removeParticipant: "RemoveParticipantMutation",
  renameThread: "ChangeThreadNameMutation",
  muteThread: "MuteThreadMutation",
  archiveThread: "ArchiveThreadMutation",
  createPoll: "CreatePollMutation",
  votePoll: "VotePollMutation",
  getPollResults: "GetPollResultsQuery",
  stickerPack: "GetStickerPackQuery",
  presenceGet: "FetchPresenceQuery",
  presenceSet: "SetPresenceMutation"
};
var RETRY_STATUS_CODES = /* @__PURE__ */ new Set([408, 429, 500, 502, 503, 504]);
var CHECKPOINT_PATHS = [
  "/checkpoint/",
  "/checkpoint/block/",
  "/login/checkpoint/"
];
var SUSPENSION_INDICATORS = [
  "your account has been disabled",
  "account has been suspended",
  "account was disabled"
];
var RATE_LIMIT_INDICATORS = [
  "too many requests",
  "rate limit exceeded",
  "please try again later",
  "you are temporarily blocked from performing this action"
];
var LOGIN_APPROVAL_INDICATORS = [
  "login approval needed",
  "approve this login",
  "review recent login",
  "was this you",
  "unusual login attempt"
];
var EXPIRED_SESSION_INDICATORS = [
  "session expired",
  "please log in again",
  "your session has expired",
  "you need to log in to continue"
];

// src/logger/index.ts
var SUCCESS_LEVEL_NUM = 35;
function buildRedactPaths() {
  const paths = [];
  for (const field of SENSITIVE_FIELDS) {
    paths.push(field);
    paths.push(`*.${field}`);
    paths.push(`*.*.${field}`);
    paths.push(`[*].${field}`);
  }
  return paths;
}
function detectColorSupport() {
  const env2 = globalThis.process?.env ?? {};
  const stdout = globalThis.process?.stdout;
  if (env2["NO_COLOR"]) return false;
  if (env2["FORCE_COLOR"] === "0") return false;
  if (env2["FORCE_COLOR"]) return true;
  if (env2["CI"]) return false;
  return !!stdout?.isTTY;
}
function createLogger(options) {
  const level = options.level ?? "info";
  const pretty = options.pretty ?? false;
  const colorize = detectColorSupport();
  const transport = pretty ? {
    target: "pino-pretty",
    options: {
      colorize,
      translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l o",
      ignore: "pid,hostname",
      messageFormat: "[{tag}] {msg}",
      customLevels: `success:${SUCCESS_LEVEL_NUM}`,
      customColors: "success:green",
      useOnlyCustomProps: false
    }
  } : void 0;
  const base = (0, import_pino.default)(
    {
      level,
      customLevels: { success: SUCCESS_LEVEL_NUM },
      useOnlyCustomLevels: false,
      redact: {
        paths: buildRedactPaths(),
        censor: "[REDACTED]"
      },
      serializers: {
        err: import_pino.default.stdSerializers.err
      },
      ...transport ? { transport } : {}
    }
  );
  function wrap(bound) {
    const p = Object.keys(bound).length > 0 ? base.child(bound) : base;
    function resolve(ctx) {
      if (!ctx) return [p, {}];
      const hasConflict = Object.keys(ctx).some((k) => Object.prototype.hasOwnProperty.call(bound, k));
      if (hasConflict) {
        return [base.child({ ...bound, ...ctx }), {}];
      }
      return [p, ctx];
    }
    return {
      trace: (msg, ctx) => {
        const [l, c] = resolve(ctx);
        l.trace(c, msg);
      },
      debug: (msg, ctx) => {
        const [l, c] = resolve(ctx);
        l.debug(c, msg);
      },
      info: (msg, ctx) => {
        const [l, c] = resolve(ctx);
        l.info(c, msg);
      },
      success: (msg, ctx) => {
        const [l, c] = resolve(ctx);
        l.success(c, msg);
      },
      warn: (msg, ctx) => {
        const [l, c] = resolve(ctx);
        l.warn(c, msg);
      },
      error: (msg, ctx) => {
        const [l, c] = resolve(ctx);
        l.error(c, msg);
      },
      fatal: (msg, ctx) => {
        const [l, c] = resolve(ctx);
        l.fatal(c, msg);
      },
      // Merge new bindings over the accumulated set so later values win.
      child: (bindings) => wrap({ ...bound, ...bindings })
    };
  }
  const logger = wrap(options.bindings ?? {});
  return logger;
}
var defaultLogger = createLogger({ level: "info" });

// src/config/index.ts
var import_zod = require("zod");
var import_dotenv = require("dotenv");
var import_dotenv_expand = require("dotenv-expand");

// src/errors/index.ts
var PandindiganError = class extends Error {
  code;
  context;
  cause;
  constructor(message, code, context = {}, cause) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
    this.cause = cause;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var NetworkError = class extends PandindiganError {
};
var ConnectionError = class extends NetworkError {
  constructor(message, context, cause) {
    super(message, "PFCA_CONNECTION", context, cause);
  }
};
var TimeoutError = class extends NetworkError {
  constructor(message, context, cause) {
    super(message, "PFCA_TIMEOUT", context, cause);
  }
};
var DNSError = class extends NetworkError {
  constructor(message, context, cause) {
    super(message, "PFCA_DNS", context, cause);
  }
};
var ProxyError = class extends NetworkError {
  constructor(message, context, cause) {
    super(message, "PFCA_PROXY", context, cause);
  }
};
var AuthError = class extends PandindiganError {
};
var InvalidAppStateError = class extends AuthError {
  constructor(message, context, cause) {
    super(message, "PFCA_INVALID_APPSTATE", context, cause);
  }
};
var SessionExpiredError = class extends AuthError {
  constructor(message, context, cause) {
    super(message, "PFCA_SESSION_EXPIRED", context, cause);
  }
};
var LoginFailedError = class extends AuthError {
  constructor(message, context, cause) {
    super(message, "PFCA_LOGIN_FAILED", context, cause);
  }
};
var TwoFactorRequiredError = class extends AuthError {
  constructor(message, context, cause) {
    super(message, "PFCA_2FA_REQUIRED", context, cause);
  }
};
var CheckpointRequiredError = class extends AuthError {
  constructor(message, checkpointUrl, context, cause) {
    super(message, "PFCA_CHECKPOINT", { checkpointUrl, ...context }, cause);
    this.checkpointUrl = checkpointUrl;
  }
  checkpointUrl;
};
var LoginApprovalRequiredError = class extends AuthError {
  constructor(message, context, cause) {
    super(message, "PFCA_APPROVAL_REQUIRED", context, cause);
  }
};
var FacebookRateLimitError = class extends AuthError {
  constructor(message, context, cause) {
    super(message, "PFCA_FACEBOOK_RATE_LIMIT", context, cause);
  }
};
var HttpError = class extends PandindiganError {
  constructor(message, code, statusCode, context, cause) {
    super(message, code, { statusCode, ...context }, cause);
    this.statusCode = statusCode;
  }
  statusCode;
};
var RateLimitError = class extends HttpError {
  constructor(message, retryAfterMs, context) {
    super(message, "PFCA_RATE_LIMITED", 429, { retryAfterMs, ...context });
    this.retryAfterMs = retryAfterMs;
  }
  retryAfterMs;
};
var ForbiddenError = class extends HttpError {
  constructor(message, context, cause) {
    super(message, "PFCA_FORBIDDEN", 403, context, cause);
  }
};
var NotFoundError = class extends HttpError {
  constructor(message, context, cause) {
    super(message, "PFCA_NOT_FOUND", 404, context, cause);
  }
};
var ServerError = class extends HttpError {
  constructor(message, statusCode, context, cause) {
    super(message, "PFCA_SERVER_ERROR", statusCode, context, cause);
  }
};
var ParseError = class extends PandindiganError {
};
var ResponseValidationError = class extends ParseError {
  constructor(message, context, cause) {
    super(message, "PFCA_RESPONSE_VALIDATION", context, cause);
  }
};
var DeserializationError = class extends ParseError {
  constructor(message, context, cause) {
    super(message, "PFCA_DESERIALIZATION", context, cause);
  }
};
var StorageError = class extends PandindiganError {
  constructor(message, context, cause) {
    super(message, "PFCA_STORAGE", context, cause);
  }
};
var StorageCircuitOpenError = class extends PandindiganError {
  constructor(message, context, cause) {
    super(message, "PFCA_STORAGE_CIRCUIT_OPEN", context, cause);
  }
};
var CacheError = class extends PandindiganError {
  constructor(message, context, cause) {
    super(message, "PFCA_CACHE", context, cause);
  }
};
var ConfigurationError = class extends PandindiganError {
  constructor(message, context, cause) {
    super(message, "PFCA_CONFIG", context, cause);
  }
};
var UploadError = class extends PandindiganError {
  constructor(message, bytesTransferred = 0, context, cause) {
    super(message, "PFCA_UPLOAD_FAILED", { bytesTransferred, ...context }, cause);
    this.bytesTransferred = bytesTransferred;
  }
  bytesTransferred;
};
var DownloadError = class extends PandindiganError {
  constructor(message, context, cause) {
    super(message, "PFCA_DOWNLOAD_FAILED", context, cause);
  }
};

// src/proxy/index.ts
var import_undici = require("undici");
var import_node_tls = require("tls");
var https = __toESM(require("https"), 1);
var net = __toESM(require("net"), 1);
var tls = require("tls");
var SUPPORTED_PROTOCOLS = /* @__PURE__ */ new Set([
  "http:",
  "https:",
  "socks4:",
  "socks4a:",
  "socks5:",
  "socks5h:"
]);
function maskProxyUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.username || parsed.password) {
      parsed.username = "***";
      parsed.password = "***";
    }
    return parsed.toString();
  } catch {
    return "<invalid-proxy-url>";
  }
}
function resolveProxyUrl(option) {
  if (!option) return null;
  if (typeof option === "string") return option || null;
  return option.url || null;
}
function validateProxyUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new ConfigurationError(
      `Invalid proxy URL: "${maskProxyUrl(url)}"`,
      { proxyUrl: maskProxyUrl(url) }
    );
  }
  if (!SUPPORTED_PROTOCOLS.has(parsed.protocol)) {
    throw new ConfigurationError(
      `Unsupported proxy protocol "${parsed.protocol}". Supported protocols: ${[...SUPPORTED_PROTOCOLS].join(", ")}`,
      { proxyUrl: maskProxyUrl(url), protocol: parsed.protocol }
    );
  }
  if (!parsed.hostname) {
    throw new ConfigurationError(
      `Proxy URL is missing a hostname: "${maskProxyUrl(url)}"`,
      { proxyUrl: maskProxyUrl(url) }
    );
  }
  return parsed;
}
function isSocks(protocol) {
  return /^socks/i.test(protocol);
}
function parseSocks(parsed) {
  const type = parsed.protocol.startsWith("socks4") ? 4 : 5;
  return {
    type,
    host: parsed.hostname,
    port: Number(parsed.port) || 1080,
    userId: parsed.username ? decodeURIComponent(parsed.username) : void 0,
    password: parsed.password ? decodeURIComponent(parsed.password) : void 0
  };
}
async function buildSocksWsAgent(config) {
  const { SocksClient } = await import("socks");
  const agent = new https.Agent({ keepAlive: true });
  agent.createConnection = (options, callback) => {
    SocksClient.createConnection({
      proxy: {
        host: config.host,
        port: config.port,
        type: config.type,
        userId: config.userId,
        password: config.password
      },
      command: "connect",
      destination: { host: options.host, port: options.port }
    }).then(({ socket }) => {
      const tlsSock = (0, import_node_tls.connect)({
        socket,
        servername: options.servername ?? options.host,
        rejectUnauthorized: true
      });
      tlsSock.once("secureConnect", () => callback(null, tlsSock));
      tlsSock.once("error", (err) => callback(err, null));
    }).catch((err) => callback(err, null));
  };
  return agent;
}
function buildHttpConnectWsAgent(parsed) {
  const proxyHost = parsed.hostname;
  const proxyPort = Number(parsed.port) || (parsed.protocol === "https:" ? 443 : 8080);
  const auth = parsed.username && parsed.password ? Buffer.from(`${decodeURIComponent(parsed.username)}:${decodeURIComponent(parsed.password)}`).toString("base64") : null;
  const agent = new https.Agent({ keepAlive: true });
  agent.createConnection = (options, callback) => {
    const rawSocket = net.connect(proxyPort, proxyHost);
    rawSocket.once("error", (err) => callback(err, null));
    rawSocket.once("connect", () => {
      const connectRequest = [
        `CONNECT ${options.host}:${options.port} HTTP/1.1`,
        `Host: ${options.host}:${options.port}`,
        ...auth ? [`Proxy-Authorization: Basic ${auth}`] : [],
        "",
        ""
      ].join("\r\n");
      rawSocket.write(connectRequest);
      let buf = Buffer.allocUnsafe(0);
      const CRLF2 = Buffer.from("\r\n\r\n");
      rawSocket.on("data", (chunk) => {
        buf = Buffer.concat([buf, chunk]);
        const idx = buf.indexOf(CRLF2);
        if (idx === -1) return;
        rawSocket.removeAllListeners("data");
        const statusLine = buf.subarray(0, idx).toString("utf8").split("\r\n")[0] ?? "";
        const ok = / 200[^\d]/.test(statusLine) || statusLine.endsWith(" 200");
        if (!ok) {
          rawSocket.destroy();
          callback(new Error(`HTTP CONNECT failed: ${statusLine}`), null);
          return;
        }
        const remaining = buf.subarray(idx + 4);
        if (remaining.length > 0) {
          rawSocket.unshift(remaining);
        }
        const tlsSock = (0, import_node_tls.connect)({
          socket: rawSocket,
          servername: options.servername ?? options.host,
          rejectUnauthorized: true
        });
        tlsSock.once("secureConnect", () => callback(null, tlsSock));
        tlsSock.once("error", (err) => callback(err, null));
      });
    });
  };
  return agent;
}
async function buildSocksUndiciAgent(config, maxConnections, connectTimeoutMs) {
  const { SocksClient } = await import("socks");
  return new import_undici.Agent({
    connections: maxConnections,
    keepAliveTimeout: 3e4,
    keepAliveMaxTimeout: 3e5,
    headersTimeout: 6e4,
    bodyTimeout: 12e4,
    // @ts-expect-error — undici v7 connect option typings differ slightly from runtime
    connect: (opts, cb) => {
      const isHttps = opts.protocol === "https:";
      const destPort = Number(opts.port) || (isHttps ? 443 : 80);
      const destHost = opts.hostname;
      SocksClient.createConnection({
        proxy: {
          host: config.host,
          port: config.port,
          type: config.type,
          userId: config.userId,
          password: config.password
        },
        command: "connect",
        destination: { host: destHost, port: destPort },
        timeout: connectTimeoutMs
      }).then(({ socket }) => {
        if (isHttps) {
          const servername = (opts.servername ?? opts.hostname) || destHost;
          const tlsSock = (0, import_node_tls.connect)({ socket, servername, rejectUnauthorized: true });
          tlsSock.once("secureConnect", () => cb(null, tlsSock));
          tlsSock.once("error", (err) => cb(err, null));
        } else {
          cb(null, socket);
        }
      }).catch((err) => cb(err, null));
    }
  });
}
var ProxyManager = class {
  constructor(proxyUrl) {
    this.proxyUrl = proxyUrl;
    this.parsed = validateProxyUrl(proxyUrl);
    this._masked = maskProxyUrl(proxyUrl);
  }
  proxyUrl;
  parsed;
  _masked;
  /** Cached undici dispatcher (Agent or ProxyAgent). */
  _dispatcher = null;
  /** Cached WebSocket HTTPS agent. */
  _wsAgent = null;
  /** Proxy URL with credentials redacted — safe for logs and errors. */
  get maskedUrl() {
    return this._masked;
  }
  /** Detected protocol, e.g. `"socks5:"`. */
  get protocol() {
    return this.parsed.protocol;
  }
  /** Proxy hostname. */
  get host() {
    return this.parsed.hostname;
  }
  /** Whether this proxy uses a SOCKS protocol. */
  isSocksProxy() {
    return isSocks(this.parsed.protocol);
  }
  /**
   * Return the cached undici dispatcher for HTTP requests.
   * Builds and caches it on first call; subsequent calls are synchronous.
   */
  async getUndiciDispatcher(maxConnections, connectTimeoutMs) {
    if (this._dispatcher) return this._dispatcher;
    if (isSocks(this.parsed.protocol)) {
      this._dispatcher = await buildSocksUndiciAgent(
        parseSocks(this.parsed),
        maxConnections,
        connectTimeoutMs
      );
    } else {
      this._dispatcher = new import_undici.ProxyAgent({ uri: this.proxyUrl });
    }
    return this._dispatcher;
  }
  /**
   * Return the cached https.Agent for WebSocket (ws library) connections.
   * Builds and caches it on first call.
   */
  async getWebSocketAgent() {
    if (this._wsAgent) return this._wsAgent;
    if (isSocks(this.parsed.protocol)) {
      this._wsAgent = await buildSocksWsAgent(parseSocks(this.parsed));
    } else {
      this._wsAgent = buildHttpConnectWsAgent(this.parsed);
    }
    return this._wsAgent;
  }
  /** Release resources held by the undici dispatcher. */
  async close() {
    if (this._dispatcher) {
      try {
        await this._dispatcher.close();
      } catch {
      }
      this._dispatcher = null;
    }
    if (this._wsAgent) {
      this._wsAgent.destroy();
      this._wsAgent = null;
    }
  }
};

// src/config/index.ts
(0, import_dotenv_expand.expand)((0, import_dotenv.config)());
var stealthLevelSchema = import_zod.z.enum(["off", "low", "medium", "high", "paranoid"]);
var storageAdapterSchema = import_zod.z.enum(["memory", "file", "libsql", "redis"]);
var logLevelSchema = import_zod.z.enum(["trace", "debug", "info", "warn", "error", "fatal"]);
var configSchema = import_zod.z.object({
  logLevel: logLevelSchema.default("info"),
  logPretty: import_zod.z.boolean().default(false),
  http: import_zod.z.object({
    maxConnections: import_zod.z.number().int().min(1).max(100).default(10),
    timeout: import_zod.z.object({
      connect: import_zod.z.number().int().min(100).default(5e3),
      request: import_zod.z.number().int().min(1e3).default(3e4),
      body: import_zod.z.number().int().min(1e3).default(6e4)
    }).default({ connect: 5e3, request: 3e4, body: 6e4 }),
    retries: import_zod.z.object({
      max: import_zod.z.number().int().min(0).max(20).default(5),
      baseDelay: import_zod.z.number().int().min(100).default(500)
    }).default({ max: 5, baseDelay: 500 })
  }).default({ maxConnections: 10, timeout: { connect: 5e3, request: 3e4, body: 6e4 }, retries: { max: 5, baseDelay: 500 } }),
  mqtt: import_zod.z.object({
    reconnect: import_zod.z.object({
      maxAttempts: import_zod.z.number().int().min(0).default(10),
      baseDelay: import_zod.z.number().int().min(100).default(1e3)
    }).default({ maxAttempts: 10, baseDelay: 1e3 }),
    heartbeat: import_zod.z.object({
      interval: import_zod.z.number().int().min(5e3).default(6e4)
    }).default({ interval: 6e4 })
  }).default({ reconnect: { maxAttempts: 10, baseDelay: 1e3 }, heartbeat: { interval: 6e4 } }),
  cache: import_zod.z.object({
    ttl: import_zod.z.number().int().min(0).default(3e5),
    maxSize: import_zod.z.number().int().min(1).default(500)
  }).default({ ttl: 3e5, maxSize: 500 }),
  session: import_zod.z.object({
    persistPath: import_zod.z.string().nullable().default(null),
    restoreOnStart: import_zod.z.boolean().default(true)
  }).default({ persistPath: null, restoreOnStart: true }),
  storage: import_zod.z.object({
    adapter: storageAdapterSchema.default("libsql")
  }).default({ adapter: "libsql" }),
  stealth: import_zod.z.object({
    level: stealthLevelSchema.default("medium"),
    delays: import_zod.z.object({
      enabled: import_zod.z.boolean().default(true),
      actionDelay: import_zod.z.object({ min: import_zod.z.number().default(300), max: import_zod.z.number().default(1800) }).default({ min: 300, max: 1800 }),
      messageDelay: import_zod.z.object({ min: import_zod.z.number().default(800), max: import_zod.z.number().default(4e3) }).default({ min: 800, max: 4e3 }),
      paginationDelay: import_zod.z.object({ min: import_zod.z.number().default(200), max: import_zod.z.number().default(900) }).default({ min: 200, max: 900 })
    }).default({ enabled: true, actionDelay: { min: 300, max: 1800 }, messageDelay: { min: 800, max: 4e3 }, paginationDelay: { min: 200, max: 900 } }),
    typingSimulation: import_zod.z.object({
      enabled: import_zod.z.boolean().default(true),
      wpm: import_zod.z.object({ min: import_zod.z.number().default(40), max: import_zod.z.number().default(80) }).default({ min: 40, max: 80 }),
      naturalPauses: import_zod.z.boolean().default(true)
    }).default({ enabled: true, wpm: { min: 40, max: 80 }, naturalPauses: true }),
    rateLimit: import_zod.z.object({
      enabled: import_zod.z.boolean().default(true),
      requestsPerMinute: import_zod.z.number().int().min(1).default(30),
      minInterval: import_zod.z.number().int().min(0).default(500),
      onOverload: import_zod.z.enum(["queue", "drop", "throw"]).default("queue")
    }).default({ enabled: true, requestsPerMinute: 30, minInterval: 500, onOverload: "queue" }),
    userAgent: import_zod.z.object({
      enabled: import_zod.z.boolean().default(true),
      seed: import_zod.z.string().nullable().default(null)
    }).default({ enabled: true, seed: null }),
    fingerprint: import_zod.z.object({
      enabled: import_zod.z.boolean().default(true),
      consistent: import_zod.z.boolean().default(true),
      seed: import_zod.z.string().nullable().default(null)
    }).default({ enabled: true, consistent: true, seed: null }),
    warmup: import_zod.z.object({
      enabled: import_zod.z.boolean().default(false),
      duration: import_zod.z.number().int().min(1).default(30),
      startFraction: import_zod.z.number().min(0.01).max(1).default(0.1),
      emitEvent: import_zod.z.boolean().default(true)
    }).default({ enabled: false, duration: 30, startFraction: 0.1, emitEvent: true })
  }).default({ level: "medium", delays: { enabled: true, actionDelay: { min: 300, max: 1800 }, messageDelay: { min: 800, max: 4e3 }, paginationDelay: { min: 200, max: 900 } }, typingSimulation: { enabled: true, wpm: { min: 40, max: 80 }, naturalPauses: true }, rateLimit: { enabled: true, requestsPerMinute: 30, minInterval: 500, onOverload: "queue" }, userAgent: { enabled: true, seed: null }, fingerprint: { enabled: true, consistent: true, seed: null }, warmup: { enabled: false, duration: 30, startFraction: 0.1, emitEvent: true } }),
  refresh: import_zod.z.object({
    checkInterval: import_zod.z.number().int().min(6e4).default(3e5),
    threshold: import_zod.z.number().int().min(6e4).default(18e5),
    retries: import_zod.z.number().int().min(0).default(3),
    failSilently: import_zod.z.boolean().default(true),
    autoPersist: import_zod.z.boolean().default(true)
  }).default({ checkInterval: 3e5, threshold: 18e5, retries: 3, failSilently: true, autoPersist: true }),
  keepalive: import_zod.z.object({
    enabled: import_zod.z.boolean().default(true),
    interval: import_zod.z.number().int().min(6e4).default(6e5),
    onFailure: import_zod.z.enum(["warn", "throw", "reconnect"]).default("warn")
  }).default({ enabled: true, interval: 6e5, onFailure: "warn" }),
  proxy: import_zod.z.object({
    url: import_zod.z.string().nullable().default(null),
    rotateEvery: import_zod.z.number().int().min(1).nullable().default(null),
    pool: import_zod.z.array(import_zod.z.string()).default([]),
    healthCheck: import_zod.z.boolean().default(false),
    failOnUnhealthy: import_zod.z.boolean().default(false)
  }).default(() => ({
    url: null,
    rotateEvery: null,
    pool: [],
    healthCheck: false,
    failOnUnhealthy: false
  }))
});
function fromEnv() {
  const env2 = {};
  if (process.env["PFCA_LOG_LEVEL"]) env2["logLevel"] = process.env["PFCA_LOG_LEVEL"];
  if (process.env["PFCA_LOG_PRETTY"]) env2["logPretty"] = process.env["PFCA_LOG_PRETTY"] === "true";
  const http = {};
  if (process.env["PFCA_HTTP_MAX_CONNECTIONS"]) http["maxConnections"] = Number(process.env["PFCA_HTTP_MAX_CONNECTIONS"]);
  if (process.env["PFCA_HTTP_TIMEOUT_CONNECT"] || process.env["PFCA_HTTP_TIMEOUT_REQUEST"]) {
    http["timeout"] = {
      connect: Number(process.env["PFCA_HTTP_TIMEOUT_CONNECT"] ?? 5e3),
      request: Number(process.env["PFCA_HTTP_TIMEOUT_REQUEST"] ?? 3e4)
    };
  }
  if (process.env["PFCA_HTTP_RETRIES_MAX"]) {
    http["retries"] = { max: Number(process.env["PFCA_HTTP_RETRIES_MAX"]) };
  }
  if (Object.keys(http).length > 0) env2["http"] = http;
  const mqtt = {};
  if (process.env["PFCA_MQTT_RECONNECT_MAX"]) mqtt["reconnect"] = { maxAttempts: Number(process.env["PFCA_MQTT_RECONNECT_MAX"]) };
  if (process.env["PFCA_MQTT_HEARTBEAT_INTERVAL"]) mqtt["heartbeat"] = { interval: Number(process.env["PFCA_MQTT_HEARTBEAT_INTERVAL"]) };
  if (Object.keys(mqtt).length > 0) env2["mqtt"] = mqtt;
  const cache = {};
  if (process.env["PFCA_CACHE_TTL"]) cache["ttl"] = Number(process.env["PFCA_CACHE_TTL"]);
  if (process.env["PFCA_CACHE_MAX_SIZE"]) cache["maxSize"] = Number(process.env["PFCA_CACHE_MAX_SIZE"]);
  if (Object.keys(cache).length > 0) env2["cache"] = cache;
  const storage = {};
  if (process.env["PFCA_STORAGE_ADAPTER"]) storage["adapter"] = process.env["PFCA_STORAGE_ADAPTER"];
  if (Object.keys(storage).length > 0) env2["storage"] = storage;
  const session = {};
  if (process.env["PFCA_SESSION_PERSIST_PATH"]) session["persistPath"] = process.env["PFCA_SESSION_PERSIST_PATH"];
  if (Object.keys(session).length > 0) env2["session"] = session;
  if (process.env["PFCA_STEALTH_LEVEL"]) env2["stealth"] = { level: process.env["PFCA_STEALTH_LEVEL"] };
  if (process.env["PFCA_PROXY_URL"]) env2["proxy"] = { url: process.env["PFCA_PROXY_URL"] };
  return env2;
}
var SUPPORTED_PROXY_PROTOCOLS = /* @__PURE__ */ new Set([
  "http:",
  "https:",
  "socks4:",
  "socks4a:",
  "socks5:",
  "socks5h:"
]);
function validateProxyUrls(config) {
  const urls = [
    ...config.proxy.url ? [config.proxy.url] : [],
    ...config.proxy.pool ?? []
  ];
  for (const url of urls) {
    const masked = maskProxyUrl(url);
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      throw new ConfigurationError(
        `Invalid proxy URL: "${masked}"`,
        { proxyUrl: masked }
      );
    }
    if (!SUPPORTED_PROXY_PROTOCOLS.has(parsed.protocol)) {
      throw new ConfigurationError(
        `Unsupported proxy protocol "${parsed.protocol}" in proxy URL. Supported protocols: ${[...SUPPORTED_PROXY_PROTOCOLS].join(", ")}`,
        { proxyUrl: masked, protocol: parsed.protocol }
      );
    }
    if (!parsed.hostname) {
      throw new ConfigurationError(
        `Proxy URL is missing a hostname: "${masked}"`,
        { proxyUrl: masked }
      );
    }
  }
}
function loadConfig(overrides) {
  const merged = { ...fromEnv(), ...overrides };
  const result = configSchema.safeParse(merged);
  if (!result.success) {
    const messages = result.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
    throw new ConfigurationError(`Invalid configuration: ${messages}`, { issues: result.error.issues });
  }
  const config = result.data;
  config.proxy = {
    url: config.proxy?.url ?? null,
    rotateEvery: config.proxy?.rotateEvery ?? null,
    pool: config.proxy?.pool ?? [],
    healthCheck: config.proxy?.healthCheck ?? false,
    failOnUnhealthy: config.proxy?.failOnUnhealthy ?? false
  };
  validateProxyUrls(config);
  return config;
}

// src/storage/memory.ts
var MemoryStorageAdapter = class {
  store = /* @__PURE__ */ new Map();
  async get(key) {
    try {
      const entry = this.store.get(key);
      if (!entry) return void 0;
      if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
        this.store.delete(key);
        return void 0;
      }
      return entry.value;
    } catch (err) {
      throw new StorageError(`Memory get failed for key "${key}"`, { key }, err);
    }
  }
  async set(key, value, ttlMs) {
    try {
      const expiresAt = ttlMs !== void 0 ? Date.now() + ttlMs : null;
      this.store.set(key, { value, expiresAt });
    } catch (err) {
      throw new StorageError(`Memory set failed for key "${key}"`, { key }, err);
    }
  }
  async delete(key) {
    this.store.delete(key);
  }
  async clear() {
    this.store.clear();
  }
  async has(key) {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }
};

// src/storage/file.ts
var import_promises = require("fs/promises");
var import_node_fs = require("fs");
var import_node_path = require("path");
var FileStorageAdapter = class {
  constructor(filePath) {
    this.filePath = filePath;
  }
  filePath;
  data = {};
  dirty = false;
  flushTimer = null;
  async init() {
    const dir = (0, import_node_path.dirname)(this.filePath);
    if (!(0, import_node_fs.existsSync)(dir)) {
      await (0, import_promises.mkdir)(dir, { recursive: true });
    }
    if ((0, import_node_fs.existsSync)(this.filePath)) {
      try {
        const raw = await (0, import_promises.readFile)(this.filePath, "utf8");
        this.data = JSON.parse(raw);
      } catch (err) {
        throw new StorageError(`Failed to load file storage from ${this.filePath}`, { filePath: this.filePath }, err);
      }
    }
  }
  scheduleFlush() {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      this.flush().catch(() => {
      });
    }, 200);
  }
  async flush() {
    if (!this.dirty) return;
    const now = Date.now();
    for (const [key, entry] of Object.entries(this.data)) {
      if (entry.expiresAt !== null && now > entry.expiresAt) {
        delete this.data[key];
      }
    }
    try {
      await (0, import_promises.writeFile)(this.filePath, JSON.stringify(this.data, null, 2), "utf8");
      this.dirty = false;
    } catch (err) {
      throw new StorageError(`Failed to write file storage to ${this.filePath}`, { filePath: this.filePath }, err);
    }
  }
  async get(key) {
    const entry = this.data[key];
    if (!entry) return void 0;
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      delete this.data[key];
      this.dirty = true;
      this.scheduleFlush();
      return void 0;
    }
    return entry.value;
  }
  async set(key, value, ttlMs) {
    const expiresAt = ttlMs !== void 0 ? Date.now() + ttlMs : null;
    this.data[key] = { value, expiresAt };
    this.dirty = true;
    this.scheduleFlush();
  }
  async delete(key) {
    if (key in this.data) {
      delete this.data[key];
      this.dirty = true;
      this.scheduleFlush();
    }
  }
  async clear() {
    this.data = {};
    this.dirty = true;
    await this.flush();
  }
  async has(key) {
    return await this.get(key) !== void 0;
  }
  async close() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();
  }
};

// src/storage/api-client.ts
var import_undici2 = require("undici");
function backoffDelayMs(attempt, baseMs = 200, maxMs = 8e3) {
  const cap = Math.min(maxMs, baseMs * Math.pow(2, attempt));
  return Math.random() * cap;
}
function sleep(ms) {
  return new Promise((resolve) => {
    const t = setTimeout(resolve, ms);
    t.unref?.();
  });
}
var StorageApiClient = class {
  endpoints;
  authToken;
  timeoutMs;
  retries;
  circuitThreshold;
  circuitRecoveryMs;
  // ── Circuit-breaker state ────────────────────────────────────────────────────
  circuits = /* @__PURE__ */ new Map();
  // ── Metrics ───────────────────────────────────────────────────────────────────
  _metrics = {
    totalRequests: 0,
    successRequests: 0,
    errorRequests: 0,
    circuitBreakerTrips: 0,
    lastLatencyMs: 0,
    avgLatencyMs: 0,
    p95LatencyMs: null
  };
  latencySamples = [];
  constructor(options = {}) {
    this.endpoints = this.normalizeEndpoints(options.baseUrl, options.endpoints);
    this.authToken = options.authToken?.trim() ? options.authToken : void 0;
    this.timeoutMs = options.timeoutMs ?? 1e4;
    this.retries = options.retries ?? 2;
    this.circuitThreshold = options.circuitBreakerThreshold ?? 3;
    this.circuitRecoveryMs = options.circuitBreakerRecoveryMs ?? 3e4;
  }
  // ── Public API (unchanged from v0.1.7) ────────────────────────────────────────
  async health() {
    return this.request("GET", "/v1/health");
  }
  async get(key) {
    return this.request("POST", "/v1/storage/get", { key });
  }
  async set(key, value, expiresAt) {
    return this.request("POST", "/v1/storage/set", { key, value, expiresAt });
  }
  async delete(key) {
    return this.request("POST", "/v1/storage/delete", { key });
  }
  async clear() {
    return this.request("POST", "/v1/storage/clear");
  }
  async sessionSave(id, appState, userId, ttlMs) {
    return this.request(
      "POST",
      "/v1/sessions/save",
      { id, appState, userId, ttlMs }
    );
  }
  async sessionRestore(id) {
    return this.request(
      "POST",
      "/v1/sessions/restore",
      { id }
    );
  }
  async sessionList(userId) {
    return this.request(
      "POST",
      "/v1/sessions/list",
      { userId }
    );
  }
  async sessionDelete(id) {
    return this.request(
      "POST",
      "/v1/sessions/delete",
      { id }
    );
  }
  async sessionPurgeExpired() {
    return this.request("POST", "/v1/sessions/purge");
  }
  async sessionTouch(id, ttlMs) {
    return this.request(
      "POST",
      "/v1/sessions/touch",
      { id, ttlMs }
    );
  }
  // ── Observability ─────────────────────────────────────────────────────────────
  /** Return a snapshot of accumulated request metrics. */
  getMetrics() {
    return { ...this._metrics };
  }
  /** Return the current circuit-breaker state for each known endpoint. */
  getCircuitStates() {
    const out = {};
    for (const ep of this.endpoints) {
      out[ep] = this.getCircuit(ep).state;
    }
    return out;
  }
  // ── Circuit-breaker internals ─────────────────────────────────────────────────
  getCircuit(endpoint) {
    let c = this.circuits.get(endpoint);
    if (!c) {
      c = { state: "closed", consecutiveFailures: 0, openedAt: 0, probeInFlight: false };
      this.circuits.set(endpoint, c);
    }
    return c;
  }
  /**
   * Returns true when a request to this endpoint is permitted.
   * CLOSED → always true.
   * OPEN → true only when the recovery window has elapsed AND no probe is
   * already in-flight (prevents concurrent half-open probes).
   */
  canAttempt(endpoint) {
    const c = this.getCircuit(endpoint);
    if (c.state === "closed") return true;
    if (Date.now() - c.openedAt >= this.circuitRecoveryMs && !c.probeInFlight) {
      c.probeInFlight = true;
      return true;
    }
    return false;
  }
  onSuccess(endpoint) {
    const c = this.getCircuit(endpoint);
    c.state = "closed";
    c.consecutiveFailures = 0;
    c.probeInFlight = false;
  }
  onFailure(endpoint) {
    const c = this.getCircuit(endpoint);
    c.consecutiveFailures += 1;
    c.probeInFlight = false;
    if (c.consecutiveFailures >= this.circuitThreshold || c.state === "open") {
      if (c.state !== "open") this._metrics.circuitBreakerTrips += 1;
      c.state = "open";
      c.openedAt = Date.now();
    }
  }
  // ── Metrics helpers ───────────────────────────────────────────────────────────
  recordLatency(latencyMs, success) {
    this._metrics.totalRequests += 1;
    if (success) this._metrics.successRequests += 1;
    else this._metrics.errorRequests += 1;
    this._metrics.lastLatencyMs = latencyMs;
    this.latencySamples.push(latencyMs);
    if (this.latencySamples.length > 200) this.latencySamples.shift();
    const n = this.latencySamples.length;
    this._metrics.avgLatencyMs = this.latencySamples.reduce((a, b) => a + b, 0) / n;
    if (n >= 10) {
      const sorted = [...this.latencySamples].sort((a, b) => a - b);
      this._metrics.p95LatencyMs = sorted[Math.floor(n * 0.95)] ?? null;
    }
  }
  // ── Core request logic ────────────────────────────────────────────────────────
  async request(method, path, body) {
    const errors = [];
    for (const endpoint of this.endpoints) {
      if (!this.canAttempt(endpoint)) {
        errors.push(
          new StorageError(`Circuit breaker OPEN for ${endpoint} \u2014 request blocked`, { endpoint, path })
        );
        continue;
      }
      for (let attempt = 0; attempt <= this.retries; attempt++) {
        try {
          const result = await this.fetchJson(endpoint, method, path, body);
          this.onSuccess(endpoint);
          return result;
        } catch (error) {
          this.onFailure(endpoint);
          errors.push(error instanceof Error ? error : new Error(String(error)));
          const isLastAttempt = attempt >= this.retries;
          if (!isLastAttempt) {
            await sleep(backoffDelayMs(attempt));
          }
        }
      }
    }
    throw new StorageError(
      `Storage API request failed for ${path} after exhausting all endpoints and retries`,
      { path, endpoints: [...this.endpoints], retries: this.retries },
      errors.at(-1)
    );
  }
  async fetchJson(endpoint, method, path, body) {
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Connection: "keep-alive"
    };
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }
    const payload = body !== void 0 && method === "POST" ? JSON.stringify(body) : void 0;
    try {
      const response = await this.sendRequest(endpoint, path, method, headers, payload);
      let parsedPayload = void 0;
      if (response.body) {
        try {
          parsedPayload = JSON.parse(response.body);
        } catch {
          parsedPayload = response.body;
        }
      }
      if (response.statusCode >= 400) {
        throw new StorageError(`Storage API returned HTTP ${response.statusCode}`, {
          endpoint,
          path,
          statusCode: response.statusCode,
          latencyMs: Math.round(response.latencyMs),
          payload: parsedPayload
        });
      }
      return parsedPayload;
    } catch (error) {
      if (error instanceof StorageError) throw error;
      throw new StorageError("Storage API request failed", { endpoint, path }, error);
    }
  }
  /**
   * Low-level HTTP transport using undici.
   *
   * ESM-safe: no `require()` calls. Undici is imported as a regular ESM
   * dependency and works identically in both the CJS and ESM builds.
   *
   * Connection keep-alive, TLS, DNS, IPv4/IPv6 preference, and connection
   * pooling are all handled transparently by undici's global dispatcher.
   */
  async sendRequest(endpoint, path, method, headers, payload) {
    const url = this.buildUrl(endpoint, path);
    const startMs = Date.now();
    try {
      const response = await (0, import_undici2.request)(url, {
        method,
        headers,
        body: payload,
        // AbortSignal.timeout() requires Node.js >= 17.3 (we require >= 22)
        signal: AbortSignal.timeout(this.timeoutMs)
      });
      const body = await response.body.text();
      const latencyMs = Date.now() - startMs;
      const success = response.statusCode < 400;
      this.recordLatency(latencyMs, success);
      return { statusCode: response.statusCode, body, latencyMs };
    } catch (err) {
      const latencyMs = Date.now() - startMs;
      this.recordLatency(latencyMs, false);
      if (err instanceof StorageError) throw err;
      throw new StorageError("Storage API transport error", { endpoint, path }, err);
    }
  }
  // ── URL helpers ───────────────────────────────────────────────────────────────
  buildUrl(endpoint, path) {
    const normalizedEndpoint = endpoint.endsWith("/") ? endpoint.slice(0, -1) : endpoint;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${normalizedEndpoint}${normalizedPath}`;
  }
  normalizeEndpoints(baseUrl, endpoints) {
    const values = /* @__PURE__ */ new Set();
    if (endpoints) {
      for (const ep of endpoints) {
        const n = ep.trim();
        if (n) values.add(n);
      }
    }
    if (baseUrl) {
      for (const entry of baseUrl.split(",")) {
        const n = entry.trim();
        if (n) values.add(n);
      }
    }
    if (values.size === 0) {
      values.add("https://storage.panindigan.com");
      values.add("https://storage2.panindigan.com");
    }
    return Array.from(values);
  }
};

// src/storage/libsql.ts
var SYNC_INTERVAL_MS = 3e4;
var MAX_PENDING_WRITES = 1e3;
var LibSqlStorageAdapter = class {
  client;
  /** In-memory fallback — also used as a write-through cache in connected mode. */
  fallback;
  /** True when the remote is unavailable and we're operating from memory. */
  fallbackMode = false;
  connectionState = "connecting";
  /** Writes that could not reach remote storage and are waiting for replay. */
  pendingWrites = [];
  /** Background timer that periodically reconnects and replays pending writes. */
  syncTimer = null;
  /** Prevents concurrent replay runs from interleaving and reordering writes. */
  isSyncing = false;
  // ── Diagnostics fields ────────────────────────────────────────────────────────
  bootstrapDurationMs = 0;
  failoverUsed = false;
  retryCount = 0;
  lastSyncAt = null;
  lastError = null;
  activeEndpoint;
  logger;
  /**
   * A promise that resolves once the bootstrap health-check completes (whether
   * the remote was reachable or not). Awaited by `ensureReady()` so that the
   * very first operation waits for the result of the health-check before deciding
   * which path (remote or fallback) to use.
   */
  ready;
  constructor(baseUrl = STORAGE_API_URL, apiToken = STORAGE_API_TOKEN, logger) {
    this.logger = logger;
    const endpoints = STORAGE_API_ENDPOINTS ? STORAGE_API_ENDPOINTS.split(",").map((e) => e.trim()).filter(Boolean) : void 0;
    this.client = new StorageApiClient({
      baseUrl,
      endpoints,
      authToken: apiToken,
      timeoutMs: STORAGE_API_TIMEOUT_MS,
      retries: STORAGE_API_RETRIES
    });
    const allEndpoints = endpoints?.length ? endpoints : baseUrl ? baseUrl.split(",").map((e) => e.trim()).filter(Boolean) : [];
    this.activeEndpoint = allEndpoints[0] ?? "https://storage.panindigan.com";
    this.fallback = new MemoryStorageAdapter();
    this.ready = this.bootstrap();
  }
  // ── Bootstrap & failover ──────────────────────────────────────────────────────
  async bootstrap() {
    const startMs = Date.now();
    try {
      await this.client.health();
      this.bootstrapDurationMs = Date.now() - startMs;
      this.connectionState = "connected";
      this.logger?.success("Remote storage connected", {
        tag: "STORAGE",
        provider: "remote",
        endpoint: this.activeEndpoint,
        bootstrapDurationMs: this.bootstrapDurationMs,
        fallbackMode: false,
        failoverUsed: this.failoverUsed,
        connectionState: "connected"
      });
    } catch (err) {
      this.bootstrapDurationMs = Date.now() - startMs;
      this.fallbackMode = true;
      this.failoverUsed = true;
      this.connectionState = "fallback";
      this.lastError = err instanceof Error ? err.message : String(err);
      this.logger?.warn(
        "Remote storage unavailable \u2014 operating in memory fallback mode. Writes are queued for sync when the remote comes back online.",
        {
          tag: "STORAGE",
          provider: "memory-fallback",
          endpoint: this.activeEndpoint,
          bootstrapDurationMs: this.bootstrapDurationMs,
          fallbackMode: true,
          failoverUsed: this.failoverUsed,
          connectionState: "fallback",
          error: this.lastError
        }
      );
    } finally {
      this.startBackgroundSync();
    }
  }
  // ── Background sync ───────────────────────────────────────────────────────────
  startBackgroundSync() {
    if (this.connectionState === "closed") return;
    if (this.syncTimer) return;
    this.syncTimer = setInterval(() => {
      this.backgroundSync().catch(() => {
      });
    }, SYNC_INTERVAL_MS);
    this.syncTimer.unref?.();
  }
  async backgroundSync() {
    if (this.connectionState === "closed") return;
    if (this.isSyncing) return;
    this.isSyncing = true;
    try {
      if (this.fallbackMode) {
        try {
          await this.client.health();
          this.fallbackMode = false;
          this.connectionState = "connected";
          this.lastError = null;
          this.logger?.success("Remote storage reconnected after fallback period", {
            tag: "STORAGE",
            endpoint: this.activeEndpoint,
            pendingWrites: this.pendingWrites.length,
            connectionState: "connected"
          });
          await this.replayPendingWrites();
        } catch {
          return;
        }
      } else if (this.pendingWrites.length > 0) {
        await this.replayPendingWrites();
      }
      this.lastSyncAt = /* @__PURE__ */ new Date();
    } finally {
      this.isSyncing = false;
    }
  }
  /**
   * Replay the pending write queue in strict FIFO order.
   *
   * Ordering guarantee: we process the head of the queue one write at a time.
   * On the first failure we stop immediately so that a later `set` can never
   * land on the remote before an earlier `clear` that preceded it.
   * Failed writes stay at the head of the queue and are retried on the next
   * sync cycle.
   */
  async replayPendingWrites() {
    let replayed = 0;
    let stopped = false;
    while (this.pendingWrites.length > 0) {
      const write = this.pendingWrites[0];
      try {
        if (write.op === "set" && write.key !== void 0 && write.value !== void 0) {
          await this.client.set(write.key, write.value, write.expiresAt ?? null);
        } else if (write.op === "delete" && write.key !== void 0) {
          await this.client.delete(write.key);
        } else if (write.op === "clear") {
          await this.client.clear();
        }
        this.pendingWrites.shift();
        replayed++;
      } catch {
        stopped = true;
        break;
      }
    }
    if (replayed > 0 || stopped) {
      this.logger?.info("Pending write queue sync", {
        tag: "STORAGE",
        replayed,
        failedAtHead: stopped,
        remainingQueue: this.pendingWrites.length
      });
    }
  }
  // ── Helpers ───────────────────────────────────────────────────────────────────
  async ensureReady() {
    await this.ready;
  }
  enqueuePendingWrite(write) {
    if (this.pendingWrites.length < MAX_PENDING_WRITES) {
      this.pendingWrites.push(write);
      this.retryCount++;
    }
  }
  // ── StorageAdapter interface ──────────────────────────────────────────────────
  async get(key) {
    await this.ensureReady();
    if (this.fallbackMode) {
      return this.fallback.get(key);
    }
    try {
      const result = await this.client.get(key);
      if (!result.found || result.value === null) {
        return void 0;
      }
      if (result.expiresAt !== null && Date.now() > result.expiresAt) {
        this.client.delete(key).catch(() => {
        });
        return void 0;
      }
      const parsed = JSON.parse(result.value);
      await this.fallback.set(key, parsed, void 0);
      return parsed;
    } catch (err) {
      this.lastError = err instanceof Error ? err.message : String(err);
      this.logger?.warn("Storage remote get failed \u2014 serving from fallback cache", {
        tag: "STORAGE",
        key,
        error: this.lastError
      });
      return this.fallback.get(key);
    }
  }
  async set(key, value, ttlMs) {
    await this.ensureReady();
    const serialized = JSON.stringify(value);
    const expiresAt = ttlMs !== void 0 ? Date.now() + ttlMs : null;
    await this.fallback.set(key, value, ttlMs);
    if (this.fallbackMode) {
      this.enqueuePendingWrite({ op: "set", key, value: serialized, expiresAt, enqueuedAt: Date.now() });
      return;
    }
    try {
      await this.client.set(key, serialized, expiresAt);
    } catch (err) {
      this.lastError = err instanceof Error ? err.message : String(err);
      this.logger?.warn("Storage remote set failed \u2014 write queued for sync", {
        tag: "STORAGE",
        key,
        error: this.lastError
      });
      this.enqueuePendingWrite({ op: "set", key, value: serialized, expiresAt, enqueuedAt: Date.now() });
    }
  }
  async delete(key) {
    await this.ensureReady();
    await this.fallback.delete(key);
    if (this.fallbackMode) {
      this.enqueuePendingWrite({ op: "delete", key, enqueuedAt: Date.now() });
      return;
    }
    try {
      await this.client.delete(key);
    } catch (err) {
      this.lastError = err instanceof Error ? err.message : String(err);
      this.enqueuePendingWrite({ op: "delete", key, enqueuedAt: Date.now() });
    }
  }
  async clear() {
    await this.ensureReady();
    await this.fallback.clear();
    if (this.fallbackMode) {
      this.enqueuePendingWrite({ op: "clear", enqueuedAt: Date.now() });
      return;
    }
    try {
      await this.client.clear();
    } catch (err) {
      this.lastError = err instanceof Error ? err.message : String(err);
      this.logger?.warn("Storage remote clear failed \u2014 queued for sync", {
        tag: "STORAGE",
        error: this.lastError
      });
      this.enqueuePendingWrite({ op: "clear", enqueuedAt: Date.now() });
    }
  }
  async has(key) {
    return await this.get(key) !== void 0;
  }
  async close() {
    this.connectionState = "closed";
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    if (this.pendingWrites.length > 0 && !this.fallbackMode) {
      try {
        await this.replayPendingWrites();
      } catch {
      }
    }
  }
  // ── Diagnostics ───────────────────────────────────────────────────────────────
  /** Return a structured diagnostics snapshot for observability tooling. */
  getDiagnostics() {
    return {
      provider: this.fallbackMode ? "memory-fallback" : "remote",
      endpoint: this.activeEndpoint,
      connectionState: this.connectionState,
      failoverUsed: this.failoverUsed,
      fallbackMode: this.fallbackMode,
      bootstrapDurationMs: this.bootstrapDurationMs,
      retryCount: this.retryCount,
      pendingWriteCount: this.pendingWrites.length,
      lastSyncAt: this.lastSyncAt,
      lastError: this.lastError
    };
  }
};

// src/storage/index.ts
async function createStorageAdapter(config, logger) {
  const adapter = config.storage.adapter;
  if (adapter === "libsql") {
    return new LibSqlStorageAdapter(void 0, void 0, logger);
  }
  if (adapter === "file") {
    const path = config.session.persistPath ?? "./panindigan-storage.json";
    const instance = new FileStorageAdapter(path);
    await instance.init();
    return instance;
  }
  if (adapter === "redis") {
    throw new ConfigurationError(
      'The "redis" storage adapter requires ioredis to be installed and a custom RedisStorageAdapter. Pass a custom StorageAdapter instance to createClient({ storage: ... }) instead.',
      { adapter }
    );
  }
  return new MemoryStorageAdapter();
}

// src/cache/index.ts
var import_lru_cache = require("lru-cache");
var DEFAULT_CACHE_MAX_SIZE = 1e3;
var DEFAULT_CACHE_TTL_MS = 1e3 * 60 * 30;
function normalizeCacheOptions(options) {
  const rawMax = options?.maxSize;
  const max = typeof rawMax === "number" && Number.isFinite(rawMax) && rawMax > 0 ? Math.floor(rawMax) : DEFAULT_CACHE_MAX_SIZE;
  const rawTtl = options?.ttlMs;
  const ttl = typeof rawTtl === "number" && Number.isFinite(rawTtl) && rawTtl >= 0 ? Math.floor(rawTtl) : DEFAULT_CACHE_TTL_MS;
  return {
    max,
    ttl,
    updateAgeOnGet: options?.updateAgeOnGet ?? false
  };
}
var CacheManager = class {
  lru;
  hitCount = 0;
  missCount = 0;
  constructor(options = {}) {
    const normalized = normalizeCacheOptions(options);
    this.lru = new import_lru_cache.LRUCache({
      max: normalized.max,
      ttl: normalized.ttl,
      updateAgeOnGet: normalized.updateAgeOnGet,
      updateAgeOnHas: false
    });
  }
  async get(key) {
    try {
      const entry = this.lru.get(key);
      if (entry === void 0) {
        this.missCount++;
        return void 0;
      }
      this.hitCount++;
      return entry.value;
    } catch (err) {
      throw new CacheError(`Cache get failed for key "${key}"`, { key }, err);
    }
  }
  async set(key, value, ttlMs) {
    try {
      const options = ttlMs !== void 0 ? { ttl: ttlMs } : void 0;
      this.lru.set(key, { value }, options);
    } catch (err) {
      throw new CacheError(`Cache set failed for key "${key}"`, { key }, err);
    }
  }
  async delete(key) {
    this.lru.delete(key);
  }
  async clear() {
    this.lru.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }
  async has(key) {
    return this.lru.has(key);
  }
  getStats() {
    const total = this.hitCount + this.missCount;
    return {
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: total > 0 ? this.hitCount / total : 0,
      entryCount: this.lru.size
    };
  }
};
function nsKey(namespace, key) {
  return `${namespace}:${key}`;
}

// src/stealth/index.ts
var import_user_agents = __toESM(require("user-agents"), 1);

// src/crypto/index.ts
var import_node_crypto = require("crypto");
var ALGORITHM = "aes-256-gcm";
var KEY_LEN = 32;
var SALT_LEN = 32;
var IV_LEN = 16;
var TAG_LEN = 16;
var SCRYPT_N = 16384;
var SCRYPT_R = 8;
var SCRYPT_P = 1;
function deriveKey(passphrase, salt) {
  return (0, import_node_crypto.scryptSync)(passphrase, salt, KEY_LEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P });
}
function encrypt(plaintext, passphrase) {
  const salt = (0, import_node_crypto.randomBytes)(SALT_LEN);
  const iv = (0, import_node_crypto.randomBytes)(IV_LEN);
  const key = deriveKey(passphrase, salt);
  const cipher = (0, import_node_crypto.createCipheriv)(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const result = Buffer.concat([salt, iv, tag, encrypted]);
  return result.toString("base64");
}
function decrypt(ciphertext, passphrase) {
  const data = Buffer.from(ciphertext, "base64");
  const salt = data.subarray(0, SALT_LEN);
  const iv = data.subarray(SALT_LEN, SALT_LEN + IV_LEN);
  const tag = data.subarray(SALT_LEN + IV_LEN, SALT_LEN + IV_LEN + TAG_LEN);
  const encrypted = data.subarray(SALT_LEN + IV_LEN + TAG_LEN);
  const key = deriveKey(passphrase, salt);
  const decipher = (0, import_node_crypto.createDecipheriv)(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted) + decipher.final("utf8");
}
function hmac(data, secret) {
  return (0, import_node_crypto.createHmac)("sha256", secret).update(data).digest("hex");
}
function randomHex(bytes = 16) {
  return (0, import_node_crypto.randomBytes)(bytes).toString("hex");
}
function cryptoRandomInt(min, max) {
  const range = max - min;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const maxValid = Math.floor(256 ** bytesNeeded / range) * range;
  let value;
  do {
    const buf = (0, import_node_crypto.randomBytes)(bytesNeeded);
    value = [...buf].reduce((acc, byte, i) => acc + byte * 256 ** (bytesNeeded - 1 - i), 0);
  } while (value >= maxValid);
  return min + value % range;
}
function cryptoRandomFloat() {
  const buf = (0, import_node_crypto.randomBytes)(4);
  const int = buf.readUInt32BE(0);
  return int / 4294967295;
}

// src/stealth/index.ts
var LOCALES = ["en-US", "en-GB", "en-PH", "en-CA", "en-AU", "fil-PH"];
var TIMEZONES = ["Asia/Manila", "America/New_York", "America/Los_Angeles", "Europe/London", "Asia/Singapore"];
var SCREEN_SIZES = [[1920, 1080], [1366, 768], [1440, 900], [1280, 800], [2560, 1440]];
function seedHash(seed) {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) + h + seed.charCodeAt(i) & 4294967295;
  }
  return Math.abs(h);
}
function seededPick(items, seed, offset = 0) {
  return items[(seed + offset) % items.length];
}
function generateFingerprint(seed) {
  const effectiveSeed = seed ?? randomHex(8);
  const h = seedHash(effectiveSeed);
  const ua = new import_user_agents.default({
    deviceCategory: "desktop",
    vendor: "Google Inc."
  });
  const locale = seededPick(LOCALES, h, 0);
  const timezone = seededPick(TIMEZONES, h, 1);
  const screenSize = seededPick(SCREEN_SIZES, h, 2);
  const platform = "Win32";
  const chromeVersion = 120 + h % 10;
  const secChUa = `"Google Chrome";v="${chromeVersion}", "Chromium";v="${chromeVersion}", "Not-A.Brand";v="99"`;
  return {
    userAgent: ua.toString(),
    platform,
    locale,
    timezone,
    screenWidth: screenSize[0],
    screenHeight: screenSize[1],
    colorDepth: 24,
    secChUa,
    secChUaPlatform: '"Windows"'
  };
}
function buildStealthHeaders(fp, referer) {
  return {
    "user-agent": fp.userAgent,
    "accept-language": `${fp.locale},en;q=0.9`,
    "accept-encoding": "gzip, deflate, br",
    "sec-ch-ua": fp.secChUa,
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": fp.secChUaPlatform,
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty",
    ...referer ? { referer } : {}
  };
}
async function humanDelay(config, type) {
  if (!config.enabled) return;
  const range = type === "message" ? config.messageDelay : type === "pagination" ? config.paginationDelay : config.actionDelay;
  const ms = cryptoRandomInt(range.min, range.max);
  await new Promise((resolve) => setTimeout(resolve, ms));
}
var StealthManager = class {
  constructor(config, emitter, logger) {
    this.emitter = emitter;
    this.logger = logger;
    this.normalizedConfig = {
      level: config.level ?? "medium",
      delays: config.delays ?? { enabled: true, actionDelay: { min: 300, max: 1800 }, messageDelay: { min: 800, max: 4e3 }, paginationDelay: { min: 200, max: 900 } },
      typingSimulation: config.typingSimulation ?? { enabled: true, wpm: { min: 40, max: 80 }, naturalPauses: true },
      rateLimit: config.rateLimit ?? { enabled: true, requestsPerMinute: 30, minInterval: 500, onOverload: "queue" },
      userAgent: config.userAgent ?? { enabled: true, seed: null },
      fingerprint: config.fingerprint ?? { enabled: true, consistent: true, seed: null },
      warmup: config.warmup ?? { enabled: false, duration: 30, startFraction: 0.1, emitEvent: true }
    };
    const seed = this.normalizedConfig.fingerprint.seed || this.normalizedConfig.userAgent.seed || randomHex(8);
    this.fingerprint = this.normalizedConfig.fingerprint.enabled ? generateFingerprint(seed) : generateFingerprint();
    if (this.normalizedConfig.fingerprint.enabled) {
      emitter.emit("stealth:fingerprint:assigned", {
        userAgent: this.fingerprint.userAgent,
        platform: this.fingerprint.platform,
        locale: this.fingerprint.locale
      });
    }
    if (this.normalizedConfig.warmup.enabled) {
      this.warmupStartTime = Date.now();
      emitter.emit("stealth:warmup:start", { targetRateLimitRpm: this.normalizedConfig.rateLimit.requestsPerMinute });
      logger.info("Stealth warm-up started", { tag: "STEALTH", duration: this.normalizedConfig.warmup.duration });
    }
  }
  emitter;
  logger;
  fingerprint;
  requestCount = 0;
  warmupStartTime = null;
  normalizedConfig;
  getHeaders(referer) {
    const level = this.normalizedConfig.level;
    if (level === "off") return {};
    return buildStealthHeaders(this.fingerprint, referer);
  }
  isWarmupComplete() {
    if (!this.normalizedConfig.warmup.enabled || this.warmupStartTime === null) return true;
    const elapsed = Date.now() - this.warmupStartTime;
    const durationMs = this.normalizedConfig.warmup.duration * 60 * 1e3;
    if (elapsed >= durationMs) {
      this.emitter.emit("stealth:warmup:complete", { durationMs: elapsed });
      this.warmupStartTime = null;
      return true;
    }
    return false;
  }
  getCurrentRateLimit() {
    if (!this.normalizedConfig.warmup.enabled || this.isWarmupComplete()) {
      return this.normalizedConfig.rateLimit.requestsPerMinute;
    }
    const elapsed = Date.now() - (this.warmupStartTime ?? Date.now());
    const durationMs = this.normalizedConfig.warmup.duration * 60 * 1e3;
    const progress = Math.min(elapsed / durationMs, 1);
    const fraction = this.normalizedConfig.warmup.startFraction + (1 - this.normalizedConfig.warmup.startFraction) * progress;
    return Math.max(1, Math.round(this.normalizedConfig.rateLimit.requestsPerMinute * fraction));
  }
  incrementRequestCount() {
    this.requestCount++;
  }
};

// src/middleware/index.ts
var MiddlewarePipeline = class {
  middlewares = [];
  use(middleware) {
    this.middlewares.push(middleware);
  }
  async runRequest(ctx) {
    let index = 0;
    const next = async () => {
      if (index >= this.middlewares.length) return;
      const mw = this.middlewares[index++];
      if (mw?.onRequest) await mw.onRequest(ctx, next);
      else await next();
    };
    await next();
  }
  async runResponse(ctx) {
    const reversed = [...this.middlewares].reverse();
    let index = 0;
    const next = async () => {
      if (index >= reversed.length) return;
      const mw = reversed[index++];
      if (mw?.onResponse) await mw.onResponse(ctx, next);
      else await next();
    };
    await next();
  }
  async runError(ctx) {
    let index = 0;
    const next = async () => {
      if (index >= this.middlewares.length) return;
      const mw = this.middlewares[index++];
      if (mw?.onError) await mw.onError(ctx, next);
      else await next();
    };
    await next();
  }
};

// src/http/index.ts
var import_undici3 = require("undici");
var import_p_retry = __toESM(require("p-retry"), 1);

// src/cookies/index.ts
var import_tough_cookie = require("tough-cookie");
function normalizeCookies(raw) {
  const diagnostics = [];
  const seen = /* @__PURE__ */ new Map();
  for (let i = 0; i < raw.length; i++) {
    const entry = raw[i];
    if (!entry || typeof entry !== "object") {
      diagnostics.push(`Cookie[${i}]: skipped \u2014 not an object`);
      continue;
    }
    const c = entry;
    const rawKey = (c.key ?? c.name ?? "").trim();
    if (!rawKey) {
      diagnostics.push(`Cookie[${i}]: skipped \u2014 no "key" or "name" field`);
      continue;
    }
    if (c.name && !c.key) {
      diagnostics.push(`Cookie[${i}] "${rawKey}": normalized "name" \u2192 "key"`);
    }
    if (c.value === void 0 || c.value === null) {
      diagnostics.push(`Cookie[${i}] "${rawKey}": skipped \u2014 no "value" field`);
      continue;
    }
    const value = String(c.value);
    const domain = (c.domain ?? ".facebook.com").trim() || ".facebook.com";
    const path = (c.path ?? "/").trim() || "/";
    let expires;
    if (typeof c.expirationDate === "number") {
      expires = Math.floor(c.expirationDate);
      if (c.expires !== void 0) {
        diagnostics.push(`Cookie "${rawKey}": "expirationDate" took precedence over "expires"`);
      }
    } else if (c.expires !== void 0) {
      expires = c.expires;
    }
    if (typeof expires === "number" && expires > 0 && expires * 1e3 < Date.now()) {
      diagnostics.push(
        `Cookie "${rawKey}": expires is in the past (${new Date(expires * 1e3).toISOString()})`
      );
    }
    const normalized = {
      key: rawKey,
      value,
      domain,
      path,
      secure: typeof c.secure === "boolean" ? c.secure : false,
      httpOnly: typeof c.httpOnly === "boolean" ? c.httpOnly : false,
      hostOnly: typeof c.hostOnly === "boolean" ? c.hostOnly : false,
      ...expires !== void 0 ? { expires } : {},
      ...c.sameSite ? { sameSite: c.sameSite } : {},
      ...typeof c.session === "boolean" ? { session: c.session } : {},
      ...c.priority ? { priority: c.priority } : {},
      ...c.sourceScheme ? { sourceScheme: c.sourceScheme } : {},
      ...c.sourcePort !== void 0 ? { sourcePort: c.sourcePort } : {},
      ...c.creation ? { creation: c.creation } : {},
      ...c.lastAccessed ? { lastAccessed: c.lastAccessed } : {}
    };
    const dedupKey = `${rawKey}:${domain}`;
    if (seen.has(dedupKey)) {
      diagnostics.push(`Cookie "${rawKey}" (${domain}): duplicate removed \u2014 keeping last entry`);
    }
    seen.set(dedupKey, normalized);
  }
  return [Array.from(seen.values()), diagnostics];
}
function validateAppState(appState) {
  if (!Array.isArray(appState) || appState.length === 0) {
    throw new InvalidAppStateError("AppState must be a non-empty array of cookie objects");
  }
  const [cookies, normDiagnostics] = normalizeCookies(appState);
  if (cookies.length === 0) {
    throw new InvalidAppStateError(
      "AppState contains no valid cookies after normalization \u2014 all entries were malformed or had no value",
      { normalizationDiagnostics: normDiagnostics }
    );
  }
  const keySet = new Set(cookies.map((c) => c.key));
  for (const required of REQUIRED_COOKIES) {
    if (!keySet.has(required)) {
      throw new InvalidAppStateError(
        `AppState is missing required cookie: ${required}`,
        { missingCookie: required, presentCookies: [...keySet], normalizationDiagnostics: normDiagnostics }
      );
    }
  }
  const expiredRequired = [];
  for (const cookie of cookies) {
    if (!REQUIRED_COOKIES.includes(cookie.key)) continue;
    if (typeof cookie.expires === "number" && cookie.expires > 0 && cookie.expires * 1e3 < Date.now()) {
      expiredRequired.push(cookie.key);
    }
  }
  if (expiredRequired.length > 0) {
    throw new InvalidAppStateError(
      `AppState has expired required cookies: ${expiredRequired.join(", ")} \u2014 export a fresh AppState from your browser`,
      { expiredCookies: expiredRequired, normalizationDiagnostics: normDiagnostics }
    );
  }
  return cookies;
}
function hydrateJar(appState) {
  const jar = new import_tough_cookie.CookieJar();
  for (const entry of appState) {
    const domain = entry.domain.startsWith(".") ? entry.domain.slice(1) : entry.domain;
    const url = `https://${domain}${entry.path ?? "/"}`;
    let expires;
    if (entry.session) {
      expires = void 0;
    } else if (entry.expires === "Infinity" || entry.expires === void 0) {
      expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3);
    } else if (typeof entry.expires === "number") {
      expires = new Date(entry.expires * 1e3);
    } else if (typeof entry.expires === "string") {
      expires = new Date(entry.expires);
    }
    if (expires instanceof Date && isNaN(expires.getTime())) {
      expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3);
    }
    const cookie = new import_tough_cookie.Cookie({
      key: entry.key,
      value: entry.value,
      domain: entry.domain.startsWith(".") ? entry.domain.slice(1) : entry.domain,
      path: entry.path ?? "/",
      secure: entry.secure ?? false,
      httpOnly: entry.httpOnly ?? false,
      hostOnly: entry.hostOnly ?? false,
      sameSite: entry.sameSite ?? "no_restriction",
      expires: expires ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3),
      creation: entry.creation ? new Date(entry.creation) : /* @__PURE__ */ new Date(),
      lastAccessed: entry.lastAccessed ? new Date(entry.lastAccessed) : /* @__PURE__ */ new Date()
    });
    try {
      jar.setCookieSync(cookie, url);
    } catch {
    }
  }
  return jar;
}
async function exportJar(jar) {
  const store = jar.toJSON();
  const cookies = store?.["cookies"] ?? [];
  return cookies.map((c) => ({
    key: String(c["key"] ?? ""),
    value: String(c["value"] ?? ""),
    domain: String(c["domain"] ?? ".facebook.com"),
    path: String(c["path"] ?? "/"),
    hostOnly: Boolean(c["hostOnly"]),
    secure: Boolean(c["secure"]),
    httpOnly: Boolean(c["httpOnly"]),
    creation: c["creation"] ? String(c["creation"]) : (/* @__PURE__ */ new Date()).toISOString(),
    lastAccessed: c["lastAccessed"] ? String(c["lastAccessed"]) : (/* @__PURE__ */ new Date()).toISOString(),
    expires: c["expires"] ? String(c["expires"]) : "Infinity"
  }));
}
function getUserIdFromJar(jar) {
  const jarJson = jar.toJSON();
  const cookies = jarJson?.["cookies"] ?? [];
  const cUser = cookies.find((c) => c["key"] === "c_user");
  if (!cUser || !cUser["value"]) {
    throw new InvalidAppStateError("Cannot find c_user cookie in AppState \u2014 user ID not available");
  }
  return String(cUser["value"]);
}
function getCookieString(jar, url) {
  return jar.getCookieStringSync(url);
}

// src/http/index.ts
var import_uuid = require("uuid");
var SLOW_REQUEST_THRESHOLD_MS = 5e3;
var HttpClient = class {
  constructor(jar, config, stealth, pipeline2, logger, emitter) {
    this.jar = jar;
    this.config = config;
    this.stealth = stealth;
    this.pipeline = pipeline2;
    this.logger = logger;
    this.emitter = emitter;
    this.proxyRotateEvery = config.proxy.rotateEvery ?? null;
    this.pool = new import_undici3.Pool(FB_BASE_URL, {
      connections: config.http.maxConnections,
      keepAliveTimeout: 3e4,
      keepAliveMaxTimeout: 3e5,
      connectTimeout: config.http.timeout.connect,
      headersTimeout: config.http.timeout.request,
      bodyTimeout: config.http.timeout.body
    });
    const allProxyUrls = [
      ...config.proxy.url ? [config.proxy.url] : [],
      ...config.proxy.pool ?? []
    ];
    for (const url of allProxyUrls) {
      this.managers.push(new ProxyManager(url));
    }
    if (this.managers.length > 0) {
      this.logger.debug("Proxy configured", {
        tag: "HTTP",
        count: this.managers.length,
        proxies: this.managers.map((m) => m.maskedUrl)
      });
    }
  }
  jar;
  config;
  stealth;
  pipeline;
  logger;
  emitter;
  /** Default connection pool for direct (non-proxied) requests. */
  pool;
  /** Ordered list of proxy entries for rotation. */
  proxies = [];
  currentProxyIndex = 0;
  requestCount = 0;
  proxyRotateEvery;
  /** Optional callback invoked after every request for diagnostics/metrics. */
  requestRecorder;
  /** ProxyManager instances — one per configured proxy URL, in pool order. */
  managers = [];
  /**
   * Asynchronously initialise proxy dispatchers. Must be awaited before the
   * first request. Is a no-op when no proxies are configured.
   */
  async init() {
    for (const manager of this.managers) {
      try {
        const dispatcher = await manager.getUndiciDispatcher(
          this.config.http.maxConnections,
          this.config.http.timeout.connect
        );
        this.proxies.push({ maskedUrl: manager.maskedUrl, dispatcher, manager });
        this.logger.info("Proxy initialised", {
          tag: "HTTP",
          proxy: manager.maskedUrl,
          protocol: manager.protocol
        });
      } catch (err) {
        throw new ProxyError(
          `Failed to initialise proxy "${manager.maskedUrl}"`,
          { proxyUrl: manager.maskedUrl },
          err
        );
      }
    }
  }
  /** Register a callback that is invoked after every HTTP request (for diagnostics). */
  setRequestRecorder(fn) {
    this.requestRecorder = fn;
  }
  getActiveDispatcher() {
    if (this.proxies.length === 0) return this.pool;
    if (this.proxyRotateEvery !== null && this.requestCount > 0 && this.requestCount % this.proxyRotateEvery === 0 && this.proxies.length > 1) {
      const prevEntry = this.proxies[this.currentProxyIndex];
      this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
      const nextEntry = this.proxies[this.currentProxyIndex];
      this.logger.debug("Rotating proxy", {
        tag: "HTTP",
        from: prevEntry?.maskedUrl,
        to: nextEntry?.maskedUrl,
        requestCount: this.requestCount
      });
      if (prevEntry && nextEntry) {
        this.emitter?.emit("proxy:rotate", {
          from: prevEntry.maskedUrl,
          to: nextEntry.maskedUrl,
          requestCount: this.requestCount
        });
      }
    }
    return this.proxies[this.currentProxyIndex]?.dispatcher ?? this.pool;
  }
  async request(options) {
    const correlationId = (0, import_uuid.v4)();
    const method = options.method ?? "GET";
    const cookieHeader = getCookieString(this.jar, options.url);
    const stealthHeaders = this.stealth.getHeaders(`https://www.facebook.com/`);
    const headers = {
      ...DEFAULT_HEADERS,
      ...stealthHeaders,
      ...cookieHeader ? { cookie: cookieHeader } : {},
      ...options.body && !options.headers?.["content-type"] ? { "content-type": CONTENT_TYPE_FORM } : {},
      ...options.headers,
      "x-correlation-id": correlationId
    };
    const reqCtx = {
      url: options.url,
      method,
      headers,
      body: options.body ?? void 0,
      meta: { correlationId, startTime: performance.now() }
    };
    await this.pipeline.runRequest(reqCtx);
    const attempt = async () => {
      const startMs = performance.now();
      this.requestCount++;
      const dispatcher = this.getActiveDispatcher();
      const activeEntry = this.proxies[this.currentProxyIndex];
      if (activeEntry) {
        this.logger.debug("Sending request via proxy", {
          tag: "HTTP",
          proxy: activeEntry.maskedUrl,
          url: options.url,
          correlationId
        });
      }
      let resp;
      try {
        resp = await (0, import_undici3.fetch)(reqCtx.url, {
          method: reqCtx.method,
          headers: reqCtx.headers,
          body: options.body ?? void 0,
          signal: options.signal,
          dispatcher
        });
      } catch (err) {
        const latencyMs2 = performance.now() - startMs;
        this.requestRecorder?.(latencyMs2, true);
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("timeout") || msg.includes("ETIMEDOUT")) {
          if (activeEntry) {
            this.logger.debug("Proxy connection timed out", {
              tag: "HTTP",
              proxy: activeEntry.maskedUrl,
              url: options.url,
              correlationId
            });
          }
          throw new TimeoutError(
            `Request to ${options.url} timed out`,
            { url: options.url, correlationId },
            err
          );
        }
        if (activeEntry && (msg.includes("ECONNREFUSED") || msg.includes("proxy") || msg.includes("SOCKS"))) {
          this.logger.debug("Proxy connection failed", {
            tag: "HTTP",
            proxy: activeEntry.maskedUrl,
            url: options.url,
            correlationId
          });
          throw new ProxyError(
            `Proxy connection failed for ${options.url}: ${msg}`,
            { proxyUrl: activeEntry.maskedUrl, url: options.url, correlationId },
            err
          );
        }
        throw new ConnectionError(
          `Connection failed to ${options.url}: ${msg}`,
          { url: options.url, correlationId },
          err
        );
      }
      const latencyMs = performance.now() - startMs;
      this.requestRecorder?.(latencyMs, false);
      this.logger.debug("HTTP response", {
        tag: "HTTP",
        url: options.url,
        status: resp.status,
        latencyMs: Math.round(latencyMs),
        correlationId
      });
      if (latencyMs > SLOW_REQUEST_THRESHOLD_MS) {
        this.logger.warn("Slow HTTP request detected", {
          tag: "HTTP",
          url: options.url,
          durationMs: Math.round(latencyMs),
          threshold: SLOW_REQUEST_THRESHOLD_MS
        });
        this.emitter?.emit("slow:request", {
          url: options.url,
          durationMs: Math.round(latencyMs),
          threshold: SLOW_REQUEST_THRESHOLD_MS
        });
      }
      if (resp.status === 429) {
        const retryAfter = resp.headers.get("retry-after");
        const retryAfterMs = retryAfter ? Number(retryAfter) * 1e3 : 6e4;
        throw new RateLimitError(`Rate limited by Facebook`, retryAfterMs, { url: options.url });
      }
      if (resp.status === 403) {
        throw new ForbiddenError(`Forbidden: ${options.url}`, { url: options.url });
      }
      if (resp.status === 404) {
        throw new NotFoundError(`Not found: ${options.url}`, { url: options.url });
      }
      if (resp.status >= 500) {
        throw new ServerError(
          `Server error ${resp.status} from ${options.url}`,
          resp.status,
          { url: options.url }
        );
      }
      const responseHeaders = {};
      resp.headers.forEach((v, k) => {
        responseHeaders[k] = v;
      });
      const respCtx = {
        url: options.url,
        method,
        status: resp.status,
        headers: responseHeaders,
        meta: reqCtx.meta
      };
      await this.pipeline.runResponse(respCtx);
      const bodyBuffer = Buffer.from(await resp.arrayBuffer());
      return {
        status: resp.status,
        headers: responseHeaders,
        text: async () => bodyBuffer.toString("utf8"),
        json: async () => JSON.parse(bodyBuffer.toString("utf8")),
        buffer: async () => bodyBuffer
      };
    };
    if (options.skipRetry) return attempt();
    return (0, import_p_retry.default)(attempt, {
      retries: this.config.http.retries.max,
      factor: 2,
      minTimeout: this.config.http.retries.baseDelay,
      maxTimeout: 3e4,
      randomize: true,
      shouldRetry: (err) => {
        if (err instanceof RateLimitError) return false;
        if (err instanceof ForbiddenError) return false;
        if (err instanceof NotFoundError) return false;
        if (err instanceof ServerError && RETRY_STATUS_CODES.has(err.statusCode)) return true;
        if (err instanceof ConnectionError || err instanceof TimeoutError) return true;
        if (err instanceof ProxyError) return true;
        return false;
      }
    });
  }
  async get(url, opts) {
    return this.request({ ...opts, url, method: "GET" });
  }
  async post(url, body, opts) {
    return this.request({ ...opts, url, method: "POST", body });
  }
  /** POST with a raw Buffer body — use for binary/multipart uploads. */
  async postBuffer(url, body, opts) {
    return this.request({ ...opts, url, method: "POST", body });
  }
  async close() {
    await this.pool.close();
    for (const entry of this.proxies) {
      try {
        await entry.manager.close();
      } catch {
      }
    }
  }
};

// src/mqtt/index.ts
var import_ws = __toESM(require("ws"), 1);
var import_node_zlib = require("zlib");
var import_node_crypto2 = require("crypto");
var MQTT_CONNECT = 16;
var MQTT_CONNACK = 32;
var MQTT_PUBLISH = 48;
var MQTT_PUBACK = 64;
var MQTT_SUBSCRIBE = 130;
var MQTT_SUBACK = 144;
var MQTT_UNSUBSCRIBE = 162;
var MQTT_UNSUBACK = 176;
var MQTT_PINGREQ = 192;
var MQTT_PINGRESP = 208;
var MQTT_DISCONNECT = 224;
var CORE_TOPICS = [
  "/t_ms",
  // Messenger delta events (messages, thread updates, reactions, …)
  "/t_p",
  // Presence updates
  "/t_rtc",
  // Typing indicators / WebRTC signalling
  "/webrtc",
  // WebRTC media signalling
  "/sr_res",
  // Send-receipt responses
  "/ls_resp",
  // Lightspeed / Inbox v2 responses
  "/legacy_web",
  // Legacy web channel — fallback for unsend and read-receipts
  "/br_sr"
  // Browser send-receipt
];
function encodeString(str) {
  const bytes = Buffer.from(str, "utf8");
  const len = Buffer.allocUnsafe(2);
  len.writeUInt16BE(bytes.length, 0);
  return Buffer.concat([len, bytes]);
}
function encodeVarint(n) {
  const bytes = [];
  do {
    let byte = n % 128;
    n = Math.floor(n / 128);
    if (n > 0) byte |= 128;
    bytes.push(byte);
  } while (n > 0);
  return Buffer.from(bytes);
}
function buildConnectPacket(meta) {
  const username = JSON.stringify({
    u: meta.userId,
    // authenticated Facebook user ID
    s: meta.sessionSeed,
    // stable per-session seed (unchanged on reconnect)
    cp: 3,
    // client protocol version (Messenger MQTT v3)
    ecp: 10,
    // extended client protocol
    chat_on: true,
    fg: true,
    // foreground — receive full event stream
    d: meta.clientId,
    // stable device/client identifier
    ct: "websocket",
    // connection type
    mqtt_sid: meta.mqttSid,
    // session ID for broker-side session resumption
    aid: Number(MQTT_APP_ID),
    st: [],
    // subscriptions (managed via SUBSCRIBE packets)
    pm: [],
    // pending messages to flush on reconnect
    dc: "",
    // device context — server populates this
    no_auto_fg: true,
    gas: null,
    pack: []
  });
  const protocolName = encodeString("MQIsdp");
  const protocolLevel = Buffer.from([3]);
  const connectFlags = Buffer.from([198]);
  const keepAlive = Buffer.allocUnsafe(2);
  keepAlive.writeUInt16BE(MQTT_KEEPALIVE_SEC, 0);
  const variableHeader = Buffer.concat([protocolName, protocolLevel, connectFlags, keepAlive]);
  const payload = Buffer.concat([
    encodeString(meta.clientId),
    encodeString(username),
    encodeString(meta.cookieStr)
  ]);
  const remaining = Buffer.concat([variableHeader, payload]);
  return Buffer.concat([Buffer.from([MQTT_CONNECT]), encodeVarint(remaining.length), remaining]);
}
function buildSubscribePacket(topics, packetId) {
  const pid = Buffer.allocUnsafe(2);
  pid.writeUInt16BE(packetId, 0);
  const topicBufs = topics.map((t) => Buffer.concat([encodeString(t), Buffer.from([0])]));
  const payload = Buffer.concat([pid, ...topicBufs]);
  return Buffer.concat([Buffer.from([MQTT_SUBSCRIBE]), encodeVarint(payload.length), payload]);
}
function buildUnsubscribePacket(topics, packetId) {
  const pid = Buffer.allocUnsafe(2);
  pid.writeUInt16BE(packetId, 0);
  const topicBufs = topics.map((t) => encodeString(t));
  const payload = Buffer.concat([pid, ...topicBufs]);
  return Buffer.concat([Buffer.from([MQTT_UNSUBSCRIBE]), encodeVarint(payload.length), payload]);
}
function buildPingPacket() {
  return Buffer.from([MQTT_PINGREQ, 0]);
}
function buildDisconnectPacket() {
  return Buffer.from([MQTT_DISCONNECT, 0]);
}
function buildPublishPacket(topic, payload, packetId) {
  const topicBuf = encodeString(topic);
  const pid = Buffer.allocUnsafe(2);
  pid.writeUInt16BE(packetId, 0);
  const payloadBuf = (0, import_node_zlib.deflateSync)(Buffer.from(payload, "utf8"));
  const msg = Buffer.concat([topicBuf, pid, payloadBuf]);
  return Buffer.concat([Buffer.from([50]), encodeVarint(msg.length), msg]);
}
function buildPubackPacket(packetId) {
  const pid = Buffer.allocUnsafe(2);
  pid.writeUInt16BE(packetId, 0);
  return Buffer.concat([Buffer.from([MQTT_PUBACK, 2]), pid]);
}
function parsePackets(data) {
  const results = [];
  let offset = 0;
  while (offset < data.length) {
    const typeByte = data[offset] ?? 0;
    offset++;
    let multiplier = 1;
    let remaining = 0;
    let varintBytes = 0;
    let byte;
    do {
      if (offset >= data.length) return results;
      byte = data[offset] ?? 0;
      offset++;
      remaining += (byte & 127) * multiplier;
      multiplier *= 128;
      varintBytes++;
    } while ((byte & 128) !== 0 && varintBytes < 4);
    if (offset + remaining > data.length) break;
    const packetData = data.subarray(offset, offset + remaining);
    offset += remaining;
    const packetType = typeByte & 240;
    if (packetType === MQTT_PUBLISH) {
      if (packetData.length < 2) continue;
      const topicLen = packetData.readUInt16BE(0);
      const topicEnd = 2 + topicLen;
      if (topicEnd > packetData.length) continue;
      const topic = packetData.subarray(2, topicEnd).toString("utf8");
      const qos = (typeByte & 6) >> 1;
      const hasPacketId = qos > 0;
      let pid = 0;
      let payloadStart = topicEnd;
      if (hasPacketId) {
        if (topicEnd + 2 > packetData.length) continue;
        pid = packetData.readUInt16BE(topicEnd);
        payloadStart = topicEnd + 2;
      }
      const payload = packetData.subarray(payloadStart);
      results.push({ type: packetType, topic, payload, packetId: pid });
    } else {
      results.push({ type: packetType });
    }
  }
  return results;
}
function extractThreadId(key) {
  if (!key) return "";
  return String(key["threadFbId"] ?? key["otherUserFbId"] ?? "");
}
function isGroupThread(key) {
  return key != null && "threadFbId" in key;
}
var MqttClient = class {
  constructor(jar, userId, emitter, config, logger, onPresenceUpdate, wsAgent) {
    this.jar = jar;
    this.userId = userId;
    this.emitter = emitter;
    this.config = config;
    this.logger = logger;
    this.onPresenceUpdate = onPresenceUpdate;
    this.wsAgent = wsAgent;
    this.clientId = `mqttwsclient_${userId}_${(0, import_node_crypto2.randomBytes)(4).toString("hex")}`;
    this.sessionSeed = Math.floor(Math.random() * 1e9);
  }
  jar;
  userId;
  emitter;
  config;
  logger;
  onPresenceUpdate;
  wsAgent;
  ws = null;
  pingTimer = null;
  reconnectTimer = null;
  isConnected = false;
  isClosed = false;
  // Packet ID counter — wraps at 0xFFFF to remain within the two-byte field.
  _packetId = 1;
  nextPacketId() {
    const id = this._packetId;
    this._packetId = this._packetId % 65535 + 1;
    return id;
  }
  // Ping latency tracking — set when PINGREQ is sent, cleared on PINGRESP.
  lastPingAt = 0;
  lastPingLatencyMs = null;
  // Reconnect state
  reconnectAttempts = 0;
  activeBrokerIndex = 0;
  reconnectStartTimes = /* @__PURE__ */ new Map();
  /**
   * Session-stable identifiers — generated once at construction and reused
   * across every reconnect so the broker can resume the MQTT session.
   */
  clientId;
  sessionSeed;
  mqttSid = "";
  /**
   * Dynamic topic registry — starts with CORE_TOPICS and can be extended at
   * runtime. The full set is (re)subscribed after every CONNACK.
   */
  subscribedTopics = new Set(CORE_TOPICS);
  async connect() {
    await this.openConnection();
  }
  // ── Broker fallback ──────────────────────────────────────────────────────────
  async openConnection() {
    let lastError = new Error("No MQTT brokers configured");
    for (let i = 0; i < MQTT_BROKERS.length; i++) {
      const idx = (this.activeBrokerIndex + i) % MQTT_BROKERS.length;
      const brokerUrl = MQTT_BROKERS[idx];
      try {
        await this.openConnectionToBroker(brokerUrl);
        this.activeBrokerIndex = idx;
        return;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const next = MQTT_BROKERS[(idx + 1) % MQTT_BROKERS.length];
        this.logger.warn("MQTT broker unavailable, trying next", {
          tag: "MQTT",
          broker: brokerUrl,
          next,
          err: lastError.message
        });
      }
    }
    throw lastError;
  }
  openConnectionToBroker(brokerUrl) {
    return new Promise((resolve, reject) => {
      let settled = false;
      let connackReceived = false;
      const settle = (fn) => {
        if (settled) return;
        settled = true;
        fn();
      };
      const cookieStr = getCookieString(this.jar, "https://www.facebook.com/");
      const ws = new import_ws.default(brokerUrl, "MQIsdp", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Origin": "https://www.facebook.com",
          "Cookie": cookieStr
        },
        perMessageDeflate: false,
        ...this.wsAgent ? { agent: this.wsAgent } : {}
      });
      const connectTimeout = setTimeout(() => {
        settle(() => {
          ws.terminate();
          reject(new Error(`MQTT connection timeout on ${brokerUrl}`));
        });
      }, 15e3);
      ws.once("open", () => {
        clearTimeout(connectTimeout);
        ws.send(buildConnectPacket({
          userId: this.userId,
          clientId: this.clientId,
          sessionSeed: this.sessionSeed,
          mqttSid: this.mqttSid,
          cookieStr
        }));
      });
      ws.once("error", (err) => {
        clearTimeout(connectTimeout);
        settle(() => reject(err));
      });
      ws.on("message", (data) => {
        const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
        const packets = parsePackets(buf);
        for (const pkt of packets) {
          switch (pkt.type) {
            case MQTT_CONNACK: {
              clearTimeout(connectTimeout);
              connackReceived = true;
              this.ws = ws;
              this.isConnected = true;
              this.reconnectAttempts = 0;
              if (!this.mqttSid) this.mqttSid = (0, import_node_crypto2.randomBytes)(8).toString("hex");
              this.startPing();
              this.restoreSubscriptions();
              this.emitter.emit("connected", { timestamp: /* @__PURE__ */ new Date() });
              const brokerHostname = (() => {
                try {
                  return new URL(brokerUrl).hostname;
                } catch {
                  return brokerUrl;
                }
              })();
              this.logger.info("MQTT connected", {
                tag: "MQTT",
                broker: brokerUrl,
                hostname: brokerHostname,
                protocol: "MQIsdp/v3",
                transport: "WebSocket",
                keepAliveSec: MQTT_KEEPALIVE_SEC,
                subscriptions: this.subscribedTopics.size,
                reconnectAttempt: this.reconnectAttempts,
                // The following cannot be determined from the WebSocket API:
                tlsVersion: "Not Exposed",
                region: "Unknown"
              });
              settle(() => resolve());
              break;
            }
            case MQTT_PUBLISH:
              if (pkt.topic && pkt.payload) {
                this.handleMessage(pkt.topic, pkt.payload, pkt.packetId ?? 0);
              }
              break;
            case MQTT_PINGRESP: {
              const latencyMs = this.lastPingAt > 0 ? Date.now() - this.lastPingAt : null;
              this.lastPingAt = 0;
              if (latencyMs !== null) this.lastPingLatencyMs = latencyMs;
              this.logger.debug("MQTT pong", {
                tag: "PING",
                latencyMs: latencyMs !== null ? Math.round(latencyMs) : "Unknown"
              });
              break;
            }
            case MQTT_SUBACK:
              this.logger.debug("MQTT SUBACK", { tag: "MQTT" });
              break;
            case MQTT_UNSUBACK:
              this.logger.debug("MQTT UNSUBACK", { tag: "MQTT" });
              break;
          }
        }
      });
      ws.once("close", (code, reason) => {
        clearTimeout(connectTimeout);
        if (!connackReceived) {
          settle(
            () => reject(new Error(`MQTT closed before CONNACK on ${brokerUrl} (code ${code})`))
          );
          return;
        }
        this.isConnected = false;
        this.ws = null;
        this.stopPing();
        if (!this.isClosed) {
          const willReconnect = this.reconnectAttempts < this.config.mqtt.reconnect.maxAttempts;
          this.emitter.emit("disconnected", { reason: reason.toString(), willReconnect });
          this.logger.warn("MQTT disconnected", {
            tag: "MQTT",
            code,
            reason: reason.toString(),
            broker: brokerUrl
          });
          if (willReconnect) this.scheduleReconnect();
          else this.emitter.emit("reconnect:failed", {
            attempts: this.reconnectAttempts,
            lastError: new Error("Max reconnect attempts reached")
          });
        }
      });
      this.ws = ws;
    });
  }
  // ── Topic management ─────────────────────────────────────────────────────────
  /** Add and immediately subscribe to a topic. No-op if already subscribed. */
  subscribeTopic(topic) {
    if (this.subscribedTopics.has(topic)) return;
    this.subscribedTopics.add(topic);
    if (this.ws && this.isConnected) {
      this.ws.send(buildSubscribePacket([topic], this.nextPacketId()));
    }
  }
  /** Unsubscribe from a topic and remove it from the registry. No-op if absent. */
  unsubscribeTopic(topic) {
    if (!this.subscribedTopics.has(topic)) return;
    this.subscribedTopics.delete(topic);
    if (this.ws && this.isConnected) {
      this.ws.send(buildUnsubscribePacket([topic], this.nextPacketId()));
    }
  }
  /**
   * Send SUBSCRIBE for all tracked topics.
   * Invoked after CONNACK (initial connect and every reconnect) to restore
   * the full subscription state the broker may have lost.
   */
  restoreSubscriptions() {
    if (!this.ws) return;
    const topics = [...this.subscribedTopics];
    if (topics.length === 0) return;
    this.ws.send(buildSubscribePacket(topics, this.nextPacketId()));
    this.logger.debug("MQTT subscriptions sent", { tag: "MQTT", count: topics.length });
  }
  // ── Message decoding ──────────────────────────────────────────────────────────
  handleMessage(topic, payload, packetId) {
    if (packetId > 0 && this.ws) {
      this.ws.send(buildPubackPacket(packetId));
    }
    let text;
    try {
      text = (0, import_node_zlib.inflateSync)(payload).toString("utf8");
    } catch {
      text = payload.toString("utf8");
    }
    if (!text.trim()) return;
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      this.logger.debug("Non-JSON MQTT message", { tag: "MQTT", topic, byteLength: payload.length });
      return;
    }
    this.dispatchMessage(topic, data);
  }
  dispatchMessage(topic, data) {
    switch (topic) {
      case "/t_ms":
        return this.handleMessengerEvent(data);
      case "/t_p":
        return this.handlePresenceEvent(data);
      case "/t_rtc":
        return this.handleTypingEvent(data);
      case "/legacy_web":
        return this.handleLegacyWebEvent(data);
      default:
        this.logger.debug("Unhandled MQTT topic", { tag: "MQTT", topic });
    }
  }
  // ── Delta dispatcher ──────────────────────────────────────────────────────────
  handleMessengerEvent(data) {
    const deltas = data["deltas"] ?? [];
    for (const delta of deltas) {
      if (!delta || typeof delta !== "object") continue;
      const d = delta;
      const type = d["class"];
      switch (type) {
        case "NewMessage":
          this.parseNewMessage(d);
          break;
        case "ClientPayload":
          this.parseClientPayload(d);
          break;
        case "DeliveryReceipt":
          this.parseDeliveryReceipt(d);
          break;
        case "ReadReceipt":
          this.parseReadReceipt(d);
          break;
        case "UnsendMessage":
          this.parseUnsendMessage(d);
          break;
        case "ThreadNameSet":
          this.parseThreadNameSet(d);
          break;
        case "ParticipantsAdded":
          this.parseParticipantsAdded(d);
          break;
        case "ParticipantRemoved":
        case "ParticipantsRemoved":
          this.parseParticipantRemoved(d);
          break;
        case "FolderActionChange":
          this.parseFolderActionChange(d);
          break;
        case "ThreadImageSet":
          this.parseThreadImageSet(d);
          break;
        case "AdminTextMessage":
          break;
        default:
          if (type) {
            this.logger.debug("Unhandled delta class", { tag: "DELTA", class: type });
          }
      }
    }
  }
  // ── Delta parsers ─────────────────────────────────────────────────────────────
  parseNewMessage(d) {
    const msgMeta = d["messageMetadata"];
    if (!msgMeta) return;
    const threadKey = msgMeta["threadKey"];
    const threadId = extractThreadId(threadKey);
    const senderId = String(msgMeta["actorFbId"] ?? "");
    const messageId = String(msgMeta["messageId"] ?? "");
    const timestamp = new Date(Number(msgMeta["timestamp"] ?? Date.now()));
    const body = d["body"] ?? null;
    const isGroup = isGroupThread(threadKey);
    const replyMeta = d["replyToMessage"];
    const replyMsgMeta = replyMeta?.["messageMetadata"];
    const replyTo = replyMeta ? String(replyMsgMeta?.["messageId"] ?? replyMeta["messageId"] ?? "") || void 0 : void 0;
    this.emitter.emit("message", {
      messageId,
      threadId,
      senderId,
      senderName: String(d["senderName"] ?? msgMeta["senderName"] ?? ""),
      body,
      attachments: this.parseAttachments(d["attachments"]),
      timestamp,
      isGroup,
      replyTo
    });
  }
  parseAttachments(raw) {
    if (!Array.isArray(raw)) return [];
    return raw.map((a) => {
      if (!a || typeof a !== "object") return { id: "", type: "unknown" };
      const att = a;
      const type = String(att["attach_type"] ?? att["type"] ?? "unknown");
      const id = String(att["id"] ?? att["fbid"] ?? "");
      if (type === "sticker") {
        return {
          id,
          type: "sticker",
          url: att["url"] ? String(att["url"]) : void 0,
          stickerId: String(att["sticker_id"] ?? id)
        };
      }
      if (type === "share") {
        const share = att["share"];
        return {
          id,
          type: "share",
          url: share?.["href"] ? String(share["href"]) : att["url"] ? String(att["url"]) : void 0,
          shareTitle: share?.["title"] ? String(share["title"]) : void 0,
          shareDescription: share?.["description"] ? String(share["description"]) : void 0
        };
      }
      if (type === "location") {
        const coord = att["coordinate"];
        return {
          id,
          type: "location",
          url: coord ? `geo:${String(coord["latitude"] ?? "")},${String(coord["longitude"] ?? "")}` : void 0,
          name: att["name"] ? String(att["name"]) : void 0
        };
      }
      return {
        id,
        type,
        url: att["url"] ? String(att["url"]) : void 0,
        name: att["name"] ? String(att["name"]) : void 0,
        size: att["fileSize"] ? Number(att["fileSize"]) : void 0
      };
    });
  }
  parseDeliveryReceipt(d) {
    const threadKey = d["threadKey"];
    const threadId = extractThreadId(threadKey);
    const messageId = String(d["messageId"] ?? "");
    const deliveredToId = String(d["actorFbId"] ?? d["userId"] ?? "");
    const timestamp = new Date(Number(d["deliveredTime"] ?? d["timestamp"] ?? Date.now()));
    if (!messageId && !threadId) return;
    this.emitter.emit("message:delivered", {
      messageId,
      threadId,
      deliveredTo: deliveredToId ? [deliveredToId] : [],
      timestamp
    });
  }
  parseReadReceipt(d) {
    const threadKey = d["threadKey"];
    const threadId = extractThreadId(threadKey);
    const actorId = String(d["actorFbId"] ?? d["userId"] ?? "");
    const readByIds = actorId ? [actorId] : [];
    const watermarkRaw = d["watermarkTimestamp"] ?? d["actionTimestampMs"] ?? Date.now();
    const upToTimestamp = new Date(Number(watermarkRaw));
    if (!threadId) return;
    this.emitter.emit("thread:read", { threadId, readBy: readByIds, upToTimestamp });
    const lastReadMsgId = String(
      d["lastDeliveredActionTimestampHasLateDelivery"] ?? d["messageId"] ?? ""
    );
    if (lastReadMsgId) {
      this.emitter.emit("message:seen", {
        messageId: lastReadMsgId,
        threadId,
        seenBy: readByIds,
        timestamp: upToTimestamp
      });
    }
  }
  parseUnsendMessage(d) {
    const msgMeta = d["messageMetadata"];
    const threadKey = msgMeta?.["threadKey"] ?? d["threadKey"];
    const threadId = extractThreadId(threadKey) || String(d["threadId"] ?? "");
    const messageId = String(msgMeta?.["messageId"] ?? d["messageId"] ?? "");
    const senderId = String(msgMeta?.["actorFbId"] ?? d["actorFbId"] ?? "");
    const timestamp = new Date(Number(msgMeta?.["timestamp"] ?? d["timestamp"] ?? Date.now()));
    if (!messageId) return;
    this.emitter.emit("message:unsend", { messageId, threadId, senderId, timestamp });
  }
  parseClientPayload(d) {
    const raw = d["payload"];
    if (!raw) return;
    let text;
    try {
      text = Buffer.from(raw).toString("utf8");
    } catch {
      this.logger.debug("ClientPayload: cannot decode bytes", { tag: "DELTA" });
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      this.logger.debug("ClientPayload: non-JSON payload", {
        tag: "DELTA",
        byteLength: raw.byteLength
      });
      return;
    }
    const payloadType = Number(parsed["type"] ?? -1);
    if (payloadType === 2) {
      const reaction = parsed["userReactionMutation"];
      if (!reaction) return;
      const action = String(reaction["action"] ?? "ADD_REACTION");
      const messageId = String(reaction["messageId"] ?? "");
      const threadId = String(reaction["threadId"] ?? "");
      const senderId = String(reaction["userId"] ?? "");
      const timestamp = /* @__PURE__ */ new Date();
      if (action === "REMOVE_REACTION") {
        this.emitter.emit("message:reaction:removed", { messageId, threadId, senderId, timestamp });
      } else {
        this.emitter.emit("message:reaction", {
          messageId,
          threadId,
          senderId,
          senderName: String(reaction["senderName"] ?? ""),
          reaction: String(reaction["reaction"] ?? ""),
          timestamp
        });
      }
      return;
    }
    this.logger.debug("ClientPayload: unhandled type", { tag: "DELTA", payloadType });
  }
  // ── Thread delta parsers ──────────────────────────────────────────────────────
  parseThreadNameSet(d) {
    const msgMeta = d["messageMetadata"];
    const threadKey = msgMeta?.["threadKey"];
    const threadId = extractThreadId(threadKey);
    const changedBy = String(msgMeta?.["actorFbId"] ?? "");
    const newName = String(d["name"] ?? "");
    if (!threadId) return;
    this.emitter.emit("thread:renamed", { threadId, newName, changedBy });
  }
  parseParticipantsAdded(d) {
    const msgMeta = d["messageMetadata"];
    const threadKey = msgMeta?.["threadKey"];
    const threadId = extractThreadId(threadKey);
    const addedByUserId = String(msgMeta?.["actorFbId"] ?? "");
    const participants = d["addedParticipants"] ?? [];
    if (!threadId) return;
    for (const p of participants) {
      if (!p || typeof p !== "object") continue;
      const addedUserId = String(
        p["userFbId"] ?? p["userId"] ?? ""
      );
      if (addedUserId) {
        this.emitter.emit("thread:participant:added", { threadId, addedUserId, addedByUserId });
      }
    }
  }
  parseParticipantRemoved(d) {
    const msgMeta = d["messageMetadata"];
    const threadKey = msgMeta?.["threadKey"] ?? d["threadKey"];
    const threadId = extractThreadId(threadKey);
    const removedByUserId = String(msgMeta?.["actorFbId"] ?? d["actorFbId"] ?? "");
    const removedUserId = String(
      d["leftParticipantFbId"] ?? d["removedParticipantFbId"] ?? ""
    );
    if (!threadId || !removedUserId) return;
    this.emitter.emit("thread:participant:removed", { threadId, removedUserId, removedByUserId });
  }
  parseFolderActionChange(d) {
    const threadKey = d["threadKey"];
    const threadId = extractThreadId(threadKey);
    const folder = String(d["folder"] ?? "");
    if (!threadId) return;
    this.emitter.emit("thread:archived", { threadId, archived: folder === "ARCHIVED" });
  }
  parseThreadImageSet(d) {
    const msgMeta = d["messageMetadata"];
    const threadKey = msgMeta?.["threadKey"];
    const threadId = extractThreadId(threadKey);
    const changedBy = String(msgMeta?.["actorFbId"] ?? "");
    const image = d["image"];
    const newPhotoUrl = image ? String(image["uri"] ?? image["url"] ?? "") : "";
    if (!threadId) return;
    this.emitter.emit("thread:photo:changed", { threadId, newPhotoUrl, changedBy });
  }
  // ── Presence & typing ─────────────────────────────────────────────────────────
  handlePresenceEvent(data) {
    const list = data["list"] ?? [];
    for (const item of list) {
      if (!item || typeof item !== "object") continue;
      const p = item;
      const userId = String(p["u"] ?? "");
      if (!userId) continue;
      const isOnline = Number(p["p"] ?? 0) === 2;
      const lastActiveAt = p["lat"] ? new Date(Number(p["lat"]) * 1e3) : null;
      this.emitter.emit("presence:update", { userId, isOnline, lastActiveAt });
      this.onPresenceUpdate?.(userId, isOnline, lastActiveAt);
    }
  }
  handleTypingEvent(data) {
    const threadId = String(data["thread_fbid"] ?? data["to"] ?? "");
    const senderId = String(data["from"] ?? "");
    const isTyping = Boolean(data["st"]);
    this.emitter.emit("thread:typing", { threadId, senderId, senderName: "", isTyping });
    if (senderId) {
      this.emitter.emit("presence:typing", { userId: senderId, threadId, isTyping });
    }
  }
  handleLegacyWebEvent(data) {
    const type = String(data["type"] ?? data["class"] ?? "");
    if (type === "UnsendMessage") {
      this.parseUnsendMessage(data);
    } else if (type === "ReadReceipt" || type === "ReadReceiptAction") {
      this.parseReadReceipt(data);
    } else if (type === "DeliveryReceipt") {
      this.parseDeliveryReceipt(data);
    }
  }
  // ── Ping / keepalive ──────────────────────────────────────────────────────────
  startPing() {
    this.lastPingAt = 0;
    this.pingTimer = setInterval(() => {
      if (this.ws && this.isConnected) {
        if (this.lastPingAt === 0) this.lastPingAt = Date.now();
        this.ws.send(buildPingPacket());
        this.logger.debug("MQTT ping sent", { tag: "PING" });
      }
    }, this.config.mqtt.heartbeat.interval);
    this.pingTimer.unref?.();
  }
  stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }
  // ── Reconnect ─────────────────────────────────────────────────────────────────
  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = Math.min(
      this.config.mqtt.reconnect.baseDelay * 2 ** (this.reconnectAttempts - 1),
      3e4
    );
    this.emitter.emit("reconnecting", {
      attempt: this.reconnectAttempts,
      maxAttempts: this.config.mqtt.reconnect.maxAttempts,
      delayMs: delay
    });
    this.logger.info("Scheduling MQTT reconnect", {
      tag: "RECONNECT",
      attempt: this.reconnectAttempts,
      delayMs: delay
    });
    const start = Date.now();
    this.reconnectStartTimes.set(this.reconnectAttempts, start);
    this.reconnectTimer = setTimeout(async () => {
      this.activeBrokerIndex = (this.activeBrokerIndex + 1) % MQTT_BROKERS.length;
      try {
        await this.openConnection();
        const durationMs = Date.now() - (this.reconnectStartTimes.get(this.reconnectAttempts) ?? start);
        this.emitter.emit("reconnected", { attempt: this.reconnectAttempts, durationMs });
        this.reconnectAttempts = 0;
        this.reconnectStartTimes.clear();
      } catch (err) {
        this.logger.warn("MQTT reconnect attempt failed", { tag: "RECONNECT", err });
        if (this.reconnectAttempts < this.config.mqtt.reconnect.maxAttempts) {
          this.scheduleReconnect();
        } else {
          this.emitter.emit("reconnect:failed", {
            attempts: this.reconnectAttempts,
            lastError: err instanceof Error ? err : new Error(String(err))
          });
        }
      }
    }, delay);
  }
  // ── Public API ────────────────────────────────────────────────────────────────
  publish(topic, payload) {
    if (!this.ws || !this.isConnected) return;
    this.ws.send(buildPublishPacket(topic, payload, this.nextPacketId()));
  }
  getStats() {
    return {
      isConnected: this.isConnected,
      reconnectCount: this.reconnectAttempts,
      activeBroker: MQTT_BROKERS[this.activeBrokerIndex] ?? "",
      topicCount: this.subscribedTopics.size,
      pingLatencyMs: this.lastPingLatencyMs
    };
  }
  async disconnect() {
    this.isClosed = true;
    this.stopPing();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      try {
        this.ws.send(buildDisconnectPacket());
      } catch {
      }
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
};

// src/graphql/index.ts
function encodeForm(params) {
  return Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
}
function buildGraphQLRequest(options) {
  const name = options.friendlyName ?? (options.queryName ? GRAPHQL_FRIENDLY_NAMES[options.queryName] : "PandindiganQuery");
  const params = {
    variables: JSON.stringify(options.variables),
    server_timestamps: "true",
    fb_api_req_friendly_name: name,
    fb_dtsg: options.dtsg,
    fb_api_caller_class: "RelayModern",
    __a: "1",
    __comet_req: "15",
    lsd: options.lsd,
    __req: Math.random().toString(36).slice(2, 6)
  };
  if (options.docId) params["doc_id"] = options.docId;
  return {
    url: FB_API_GRAPHQL,
    body: encodeForm(params),
    friendlyName: name
  };
}
function buildFormRequest(options) {
  const params = { ...options.params };
  if (options.dtsg) params["fb_dtsg"] = options.dtsg;
  if (options.lsd) params["lsd"] = options.lsd;
  return { url: options.url, body: encodeForm(params) };
}
function parseJsonResponse(text) {
  const stripped = text.startsWith("for (;;);") ? text.slice(9) : text;
  return JSON.parse(stripped);
}
function extractDtsgFromHtml(html) {
  const match = html.match(/"DTSGInitialData"\s*,\s*\[\s*\]\s*,\s*\{"token"\s*:\s*"([^"]+)"/);
  if (match) return match[1] ?? null;
  const match2 = html.match(/fb_dtsg[^"]*value="([^"]+)"/);
  if (match2) return match2[1] ?? null;
  const match3 = html.match(/"dtsg"\s*:\s*\{"token"\s*:\s*"([^"]+)"/);
  if (match3) return match3[1] ?? null;
  const match4 = html.match(/DTSGInit\.init\(\{"token"\s*:\s*"([^"]+)"\}\)/);
  if (match4) return match4[1] ?? null;
  const match5 = html.match(/"token"\s*:\s*"([^"]+)"\s*}\s*,\s*"DTSGInitialData"/);
  if (match5) return match5[1] ?? null;
  return null;
}
function extractLsdFromHtml(html) {
  const match = html.match(/"LSD"\s*,\s*\[\s*\]\s*,\s*\{"token"\s*:\s*"([^"]+)"/);
  if (match) return match[1] ?? null;
  const match2 = html.match(/name="lsd"\s+value="([^"]+)"/);
  if (match2) return match2[1] ?? null;
  return null;
}

// src/auth/index.ts
var AuthManager = class {
  constructor(jar, http, emitter, storage, config, logger) {
    this.jar = jar;
    this.http = http;
    this.emitter = emitter;
    this.storage = storage;
    this.config = config;
    this.logger = logger;
  }
  jar;
  http;
  emitter;
  storage;
  config;
  logger;
  _tokens = null;
  refreshTimer = null;
  keepaliveTimer = null;
  _refreshFailCount = 0;
  get tokens() {
    if (!this._tokens) throw new InvalidAppStateError("Session has not been bootstrapped");
    return this._tokens;
  }
  async bootstrap() {
    this.logger.info("Bootstrapping Facebook session", { tag: "AUTH" });
    const resp = await this.http.get(`${FB_BASE_URL}/`, { skipRetry: false });
    const html = await resp.text();
    this.checkForCheckpoint(html);
    this.checkForSuspension(html);
    this.checkForRateLimit(html);
    this.checkForLoginApproval(html);
    this.checkForExpiredSession(html);
    const dtsg = extractDtsgFromHtml(html);
    const lsd = extractLsdFromHtml(html);
    if (!dtsg || !lsd) {
      const failureReason = this.determineTokenExtractionFailure(html, dtsg, lsd);
      throw new InvalidAppStateError(
        `Failed to extract session tokens from Facebook \u2014 ${failureReason}`,
        { hasDtsg: !!dtsg, hasLsd: !!lsd, failureReason }
      );
    }
    const userId = getUserIdFromJar(this.jar);
    this._tokens = { dtsg, lsd, userId };
    this.logger.info("Session bootstrapped", { tag: "AUTH", userId });
    return this._tokens;
  }
  async loginWithCredentials(email, password, twoFactorCode) {
    this.logger.info("Logging in with credentials", { tag: "AUTH" });
    const initResp = await this.http.get(`${FB_BASE_URL}/login/`);
    const initHtml = await initResp.text();
    const lsd = extractLsdFromHtml(initHtml) ?? "";
    const jazoest = this.calcJazoest(email);
    const params = new URLSearchParams({
      email,
      pass: password,
      login: "1",
      lsd,
      jazoest,
      timezone: String(-(/* @__PURE__ */ new Date()).getTimezoneOffset()),
      lgndim: "eyJ3IjoxOTIwLCJoIjoxMDgwLCJhdyI6MTkyMCwiYWgiOjEwODAsImMiOjI0fQ==",
      lgnrnd: Math.random().toString(36).slice(2, 14),
      lgnjs: Math.floor(Date.now() / 1e3).toString()
    });
    const resp = await this.http.post(FB_LOGIN_URL, params.toString());
    const html = await resp.text();
    if (html.includes("two_factor_authentication") || html.includes("approvals_code")) {
      if (!twoFactorCode) {
        throw new TwoFactorRequiredError("Two-factor authentication code required");
      }
      await this.submitTwoFactor(twoFactorCode, html);
      return;
    }
    if (html.includes("login_error") || html.includes("error_box")) {
      throw new LoginFailedError("Email or password is incorrect", { email });
    }
    this.checkForCheckpoint(html);
    await this.bootstrap();
  }
  async submitTwoFactor(code, previousHtml) {
    const dtsg = extractDtsgFromHtml(previousHtml) ?? "";
    const lsd = extractLsdFromHtml(previousHtml) ?? "";
    const params = new URLSearchParams({
      approvals_code: code,
      fb_dtsg: dtsg,
      lsd,
      submit: "Continue"
    });
    const resp = await this.http.post(
      `${FB_BASE_URL}/checkpoint/`,
      params.toString()
    );
    const html = await resp.text();
    this.checkForCheckpoint(html);
    await this.bootstrap();
  }
  calcJazoest(value) {
    let sum = 0;
    for (const char of value) sum += char.charCodeAt(0);
    return `2${sum}`;
  }
  checkForCheckpoint(html) {
    for (const path of CHECKPOINT_PATHS) {
      if (html.includes(path)) {
        this.emitter.emit("account:checkpoint", { checkpointUrl: `${FB_BASE_URL}${path}`, reason: path });
        throw new CheckpointRequiredError(
          "Facebook requires identity verification",
          `${FB_BASE_URL}${path}`
        );
      }
    }
  }
  checkForSuspension(html) {
    const lower = html.toLowerCase();
    for (const indicator of SUSPENSION_INDICATORS) {
      if (lower.includes(indicator)) {
        this.emitter.emit("account:suspended", { reason: indicator });
        throw new SessionExpiredError("Facebook account has been suspended");
      }
    }
  }
  checkForRateLimit(html) {
    const lower = html.toLowerCase();
    for (const indicator of RATE_LIMIT_INDICATORS) {
      if (lower.includes(indicator)) {
        this.emitter.emit("account:rate_limited", { reason: indicator });
        throw new FacebookRateLimitError("Facebook rate limit exceeded \u2014 please wait before retrying");
      }
    }
  }
  checkForLoginApproval(html) {
    const lower = html.toLowerCase();
    for (const indicator of LOGIN_APPROVAL_INDICATORS) {
      if (lower.includes(indicator)) {
        this.emitter.emit("account:approval_required", { reason: indicator });
        throw new LoginApprovalRequiredError("Facebook requires login approval \u2014 check your email or Facebook app");
      }
    }
  }
  checkForExpiredSession(html) {
    const lower = html.toLowerCase();
    for (const indicator of EXPIRED_SESSION_INDICATORS) {
      if (lower.includes(indicator)) {
        this.emitter.emit("account:session_expired", { reason: indicator });
        throw new SessionExpiredError("Facebook session has expired \u2014 export a fresh AppState from your browser");
      }
    }
  }
  determineTokenExtractionFailure(html, dtsg, lsd) {
    if (!html.includes("facebook") && !html.includes("meta")) {
      return "HTML structure changed significantly or response is not a Facebook page";
    }
    if (html.includes("login") && html.includes("email") && html.includes("password")) {
      return "AppState is expired \u2014 redirected to login page";
    }
    if (dtsg && !lsd) {
      return "LSD token missing \u2014 Facebook may have changed HTML structure";
    }
    if (!dtsg && lsd) {
      return "DTSG token missing \u2014 Facebook may have changed HTML structure";
    }
    if (html.includes("DTSGInitialData") || html.includes("fb_dtsg")) {
      return "Token extraction regex patterns may need updating";
    }
    if (html.includes("facebook") || html.includes("meta")) {
      return "AppState may be expired or Facebook HTML structure has changed";
    }
    return "AppState may be expired or Facebook HTML structure has changed";
  }
  async refreshCookies() {
    this.logger.info("Refreshing cookies", { tag: "AUTH" });
    try {
      const resp = await this.http.get(`${FB_BASE_URL}/`);
      const html = await resp.text();
      this.checkForCheckpoint(html);
      const dtsg = extractDtsgFromHtml(html);
      const lsd = extractLsdFromHtml(html);
      if (dtsg && lsd && this._tokens) {
        this._tokens.dtsg = dtsg;
        this._tokens.lsd = lsd;
      }
      this._refreshFailCount = 0;
      const updated = await exportJar(this.jar);
      this.emitter.emit("appstate:update", updated);
      if (this._tokens) {
        this.emitter.emit("account:refresh", {
          userId: this._tokens.userId,
          appState: updated,
          cookieCount: updated.length,
          dtsg: this._tokens.dtsg,
          lsd: this._tokens.lsd,
          refreshedAt: /* @__PURE__ */ new Date()
        });
      }
      if (this.config.refresh.autoPersist && this.config.session.persistPath) {
        await this.storage.set("session:appstate", updated);
        this.emitter.emit("session:saved", { persistPath: this.config.session.persistPath });
      }
      this.logger.info("Cookies refreshed", { tag: "AUTH" });
    } catch (err) {
      this._refreshFailCount += 1;
      const error = err instanceof Error ? err : new Error(String(err));
      const maxAttempts = this.config.refresh.retries;
      const willRetry = this._refreshFailCount < maxAttempts;
      const nextRetryAt = new Date(Date.now() + this.config.refresh.checkInterval);
      const lastFailedAt = /* @__PURE__ */ new Date();
      this.logger.warn("Cookie refresh failed", {
        tag: "AUTH",
        err,
        attempts: this._refreshFailCount,
        maxAttempts,
        willRetry
      });
      this.emitter.emit("appstate:refresh:failed", {
        error,
        attempts: this._refreshFailCount
      });
      this.emitter.emit("account:refresh:failed", {
        userId: this._tokens?.userId ?? null,
        error,
        attempts: this._refreshFailCount,
        maxAttempts,
        willRetry,
        nextRetryAt,
        lastFailedAt
      });
      if (!willRetry) {
        this.logger.error("Session is stale \u2014 max refresh attempts exhausted", {
          tag: "AUTH",
          userId: this._tokens?.userId ?? null,
          attempts: this._refreshFailCount
        });
        this.emitter.emit("account:stale", {
          userId: this._tokens?.userId ?? null,
          lastError: error,
          attempts: this._refreshFailCount,
          staleSince: lastFailedAt,
          hint: "Export a fresh AppState from your browser and call createClient({ appState }) again."
        });
      }
      if (!this.config.refresh.failSilently) throw err;
    }
  }
  async keepalive() {
    try {
      await this.http.get(`${FB_BASE_URL}/`, { skipRetry: true });
      this.logger.debug("Keepalive ping sent", { tag: "HEARTBEAT" });
    } catch (err) {
      this.logger.warn("Keepalive failed", { tag: "HEARTBEAT", err });
      if (this.config.keepalive.onFailure === "throw") throw err;
    }
  }
  async getAppState() {
    return exportJar(this.jar);
  }
  async logout() {
    this.logger.info("Logging out", { tag: "AUTH" });
    this.stopTimers();
    try {
      if (this._tokens) {
        const params = new URLSearchParams({
          fb_dtsg: this._tokens.dtsg,
          lsd: this._tokens.lsd
        });
        await this.http.post(FB_LOGOUT_URL, params.toString(), { skipRetry: true });
      }
    } catch {
    }
    this._tokens = null;
  }
  startRefreshTimer() {
    if (this.refreshTimer) return;
    this.refreshTimer = setInterval(async () => {
      await this.refreshCookies();
    }, this.config.refresh.checkInterval);
    this.refreshTimer.unref?.();
  }
  startKeepaliveTimer() {
    if (!this.config.keepalive.enabled) return;
    if (this.keepaliveTimer) return;
    this.keepaliveTimer = setInterval(async () => {
      await this.keepalive();
    }, this.config.keepalive.interval);
    this.keepaliveTimer.unref?.();
  }
  stopTimers() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    if (this.keepaliveTimer) {
      clearInterval(this.keepaliveTimer);
      this.keepaliveTimer = null;
    }
  }
};
async function createAuthManager(options) {
  const { appState, credentials, jar, http, emitter, storage, config, logger } = options;
  if (appState) {
    const validated = validateAppState(appState);
    const freshJar = hydrateJar(validated);
    const entries = freshJar.toJSON();
    jar.removeAllCookiesSync();
    const cookies = entries?.["cookies"] ?? [];
    for (const c of cookies) {
      try {
        const domain = String(c["domain"] ?? ".facebook.com");
        const path = String(c["path"] ?? "/");
        const domainClean = domain.startsWith(".") ? domain.slice(1) : domain;
        jar.setCookieSync(
          `${String(c["key"])}=${String(c["value"])}`,
          `https://${domainClean}${path}`
        );
      } catch {
      }
    }
    if (config.session.persistPath && config.refresh.autoPersist) {
      await storage.set("session:appstate", validated);
    }
  }
  const manager = new AuthManager(jar, http, emitter, storage, config, logger);
  if (credentials) {
    await manager.loginWithCredentials(credentials.email, credentials.password, credentials.twoFactorCode);
  } else {
    await manager.bootstrap();
  }
  return manager;
}

// src/auth/AppStateLoader.ts
var import_node_fs2 = require("fs");
var NO_APPSTATE = {
  source: "none",
  inputType: "none",
  cookies: [],
  valid: false,
  diagnostics: ["No AppState source produced a value"]
};
var resultCache = /* @__PURE__ */ new Map();
function cacheKeyFor(rawSource, raw) {
  if (typeof raw === "string") return `${rawSource}:str:${raw}`;
  if (Buffer.isBuffer(raw)) return `${rawSource}:buf:${raw.toString("base64")}`;
  if (Array.isArray(raw)) return `${rawSource}:arr:${JSON.stringify(raw)}`;
  return `${rawSource}:${String(raw)}`;
}
function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return void 0;
  }
}
function looksLikeBase64(text) {
  return /^[A-Za-z0-9+/]+={0,2}$/.test(text) && text.length % 4 === 0 && text.length > 16;
}
function normalizeInput(source, raw, diagnostics) {
  if (raw === void 0 || raw === null) return void 0;
  if (typeof raw === "string" && raw.trim().length === 0) return void 0;
  if (Array.isArray(raw) && raw.length === 0) return void 0;
  const cacheKey = cacheKeyFor(source, raw);
  const hit = resultCache.get(cacheKey);
  if (hit) {
    diagnostics.push(`${source}: served from cache (parsed once, reused)`);
    return { ...hit, diagnostics: [...diagnostics] };
  }
  let inputType;
  let cookies;
  if (Array.isArray(raw)) {
    inputType = "array";
    cookies = raw;
  } else if (Buffer.isBuffer(raw)) {
    inputType = "buffer";
    const text = raw.toString("utf8");
    cookies = tryParseJson(text);
    if (cookies === void 0) {
      throw new ConfigurationError(`${source}: Buffer did not contain valid AppState JSON`);
    }
  } else {
    const text = raw.trim();
    const looksLikeAPath = !text.includes("[") && !text.includes("{") && !text.startsWith("%");
    if (looksLikeAPath && (0, import_node_fs2.existsSync)(text)) {
      inputType = "file";
      let fileContents;
      try {
        fileContents = (0, import_node_fs2.readFileSync)(text, "utf8");
      } catch (err) {
        throw new ConfigurationError(
          `${source}: File does not exist or is not readable: ${text} (${err instanceof Error ? err.message : String(err)})`
        );
      }
      cookies = tryParseJson(fileContents);
      if (cookies === void 0) {
        throw new ConfigurationError(`${source}: JSON parsing failed for file "${text}"`);
      }
    } else if (looksLikeAPath && !looksLikeBase64(text)) {
      diagnostics.push(`${source}: File does not exist: ${text}`);
      return void 0;
    } else if (text.startsWith("[") || text.startsWith("{")) {
      inputType = "json";
      cookies = tryParseJson(text);
      if (cookies === void 0) {
        throw new ConfigurationError(`${source}: JSON parsing failed`);
      }
    } else if (text.startsWith("%")) {
      inputType = "urlencoded";
      let decoded;
      try {
        decoded = decodeURIComponent(text);
      } catch (err) {
        throw new ConfigurationError(
          `${source}: URL decoding failed: ${err instanceof Error ? err.message : String(err)}`
        );
      }
      cookies = tryParseJson(decoded);
      if (cookies === void 0) {
        throw new ConfigurationError(`${source}: JSON parsing failed after URL decoding`);
      }
    } else if (looksLikeBase64(text)) {
      inputType = "base64";
      let decoded;
      try {
        decoded = Buffer.from(text, "base64").toString("utf8");
      } catch (err) {
        throw new ConfigurationError(
          `${source}: Base64 decoding failed: ${err instanceof Error ? err.message : String(err)}`
        );
      }
      cookies = tryParseJson(decoded);
      if (cookies === void 0) {
        throw new ConfigurationError(`${source}: JSON parsing failed after Base64 decoding`);
      }
    } else {
      throw new ConfigurationError(
        `${source}: File does not exist: ${text}. AppState must be a cookie array, JSON string, Base64-encoded JSON, URL-encoded JSON, or a valid file path.`
      );
    }
  }
  let validated;
  try {
    validated = validateAppState(cookies);
  } catch (err) {
    if (err instanceof InvalidAppStateError) throw err;
    throw new ConfigurationError(
      `${source}: Invalid AppState format \u2014 ${err instanceof Error ? err.message : String(err)}`
    );
  }
  const result = {
    source,
    inputType,
    cookies: validated,
    valid: true,
    diagnostics: [
      ...diagnostics,
      `${source}: loaded ${validated.length} cookie(s) as ${inputType}`
    ]
  };
  resultCache.set(cacheKey, result);
  return result;
}
function loadAppState(options = {}) {
  const diagnostics = [];
  const logger = options.logger;
  const attempts = [
    { label: "appState option", get: () => options.appState },
    { label: "appStatePath option", get: () => options.appStatePath },
    { label: "APPSTATE env var", get: () => process.env["APPSTATE"] ?? process.env["PFCA_APPSTATE"] },
    { label: "APPSTATE_JSON env var", get: () => process.env["APPSTATE_JSON"] },
    { label: "APPSTATE_BASE64 env var", get: () => process.env["APPSTATE_BASE64"] },
    {
      label: "appstate.json",
      get: () => process.env["PFCA_APPSTATE_PATH"] ?? "./appstate.json"
    }
  ];
  for (const attempt of attempts) {
    const raw = attempt.get();
    if (raw === void 0) continue;
    if (attempt.label === "appstate.json") {
      const path = raw;
      if (!(0, import_node_fs2.existsSync)(path)) {
        diagnostics.push(`${attempt.label}: not found at "${path}"`);
        continue;
      }
    }
    const result = normalizeInput(attempt.label, raw, diagnostics);
    if (!result) continue;
    if (options.debugAppState) {
      const lines = [
        "[APPSTATE]",
        `Source ............ ${result.source}`,
        `Input Type ........ ${result.inputType}`,
        `Cookies ........... ${result.cookies.length}`,
        `Contains c_user ... ${result.cookies.some((c) => c.key === "c_user") ? "yes" : "no"}`,
        `Contains xs ....... ${result.cookies.some((c) => c.key === "xs") ? "yes" : "no"}`,
        "Validation ........ passed",
        "Normalized ........ yes",
        "Cache ............. created",
        "Status ............ READY"
      ];
      (logger?.debug ?? console.debug)(lines.join("\n"));
    } else {
      logger?.info?.(
        `[APPSTATE] Source: ${result.source} | Status: Loaded | Cookies: ${result.cookies.length}`,
        { tag: "APPSTATE" }
      );
    }
    return result;
  }
  logger?.warn?.("[APPSTATE] No valid AppState found from any configured source", {
    tag: "APPSTATE",
    diagnostics
  });
  return { ...NO_APPSTATE, diagnostics };
}

// src/sessions/index.ts
var import_tough_cookie3 = require("tough-cookie");

// src/sessions/libsql-session-store.ts
var import_tough_cookie2 = require("tough-cookie");
var LibSqlSessionStore = class {
  client;
  /** True when the bootstrap health-check failed — all ops are no-ops. */
  degradedMode = false;
  ready;
  constructor(baseUrl = STORAGE_API_URL, apiToken = STORAGE_API_TOKEN) {
    const endpoints = STORAGE_API_ENDPOINTS ? STORAGE_API_ENDPOINTS.split(",").map((e) => e.trim()).filter(Boolean) : void 0;
    this.client = new StorageApiClient({
      baseUrl,
      endpoints,
      authToken: apiToken,
      timeoutMs: STORAGE_API_TIMEOUT_MS,
      retries: STORAGE_API_RETRIES
    });
    this.ready = this.bootstrap();
  }
  async bootstrap() {
    try {
      await this.client.health();
    } catch {
      this.degradedMode = true;
    }
  }
  async ensureReady() {
    await this.ready;
  }
  /**
   * Save (insert or replace) a session.
   *
   * @param id        — arbitrary session key, e.g. `'default'` or a Facebook user ID
   * @param appState  — validated array of AppState cookies
   * @param opts.userId   — Facebook user ID to associate (optional)
   * @param opts.ttlMs    — time-to-live in milliseconds (optional)
   */
  async save(id, appState, opts) {
    await this.ensureReady();
    if (this.degradedMode) return;
    try {
      await this.client.sessionSave(id, appState, opts?.userId, opts?.ttlMs);
    } catch (err) {
      throw new StorageError(`Session store save failed for id "${id}"`, { id }, err);
    }
  }
  /**
   * Restore a session by id. Returns `null` if not found, expired, or when in
   * degraded mode.
   */
  async restore(id) {
    await this.ensureReady();
    if (this.degradedMode) return null;
    try {
      const result = await this.client.sessionRestore(id);
      if (!result.found || !result.appState) return null;
      const appState = validateAppState(result.appState);
      const jar = hydrateJar(appState);
      return {
        jar,
        appState,
        row: {
          id: result.id ?? id,
          userId: result.userId ?? null,
          appState,
          createdAt: result.createdAt ?? Date.now(),
          updatedAt: result.updatedAt ?? Date.now(),
          expiresAt: result.expiresAt ?? null
        }
      };
    } catch (err) {
      throw new StorageError(`Session store restore failed for id "${id}"`, { id }, err);
    }
  }
  /**
   * Fetch all non-expired sessions, optionally filtered by user_id.
   * Returns an empty array in degraded mode.
   */
  async list(userId) {
    await this.ensureReady();
    if (this.degradedMode) return [];
    try {
      const result = await this.client.sessionList(userId);
      return result.sessions.map((s) => ({
        id: s.id,
        userId: s.userId,
        appState: validateAppState(s.appState),
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        expiresAt: s.expiresAt
      }));
    } catch (err) {
      throw new StorageError("Session store list failed", { userId }, err);
    }
  }
  /**
   * Delete a session by id. No-op in degraded mode.
   */
  async delete(id) {
    await this.ensureReady();
    if (this.degradedMode) return;
    try {
      await this.client.sessionDelete(id);
    } catch (err) {
      throw new StorageError(`Session store delete failed for id "${id}"`, { id }, err);
    }
  }
  /**
   * Delete all expired sessions (housekeeping). Returns 0 in degraded mode.
   */
  async purgeExpired() {
    await this.ensureReady();
    if (this.degradedMode) return 0;
    try {
      const result = await this.client.sessionPurgeExpired();
      return result.deletedCount;
    } catch (err) {
      throw new StorageError("Session store purgeExpired failed", {}, err);
    }
  }
  /**
   * Touch updated_at and optionally extend TTL for an existing session.
   * No-op in degraded mode.
   */
  async touch(id, ttlMs) {
    await this.ensureReady();
    if (this.degradedMode) return;
    try {
      await this.client.sessionTouch(id, ttlMs);
    } catch (err) {
      throw new StorageError(`Session store touch failed for id "${id}"`, { id }, err);
    }
  }
  async close() {
    if (this.degradedMode) return;
    try {
      await this.purgeExpired();
    } catch {
    }
  }
};

// src/sessions/module.ts
var SessionsModule = class {
  constructor(store) {
    this.store = store;
  }
  store;
  /**
   * List all active (non-expired) sessions.
   *
   * @param userId  — optional Facebook user ID filter; omit to return all sessions.
   * @returns       Sorted by `updatedAt` descending (most recently active first).
   */
  async list(userId) {
    return this.store.list(userId);
  }
  /**
   * Retrieve a single session by its key (Facebook user ID or `'default'`).
   * Returns `null` if the session does not exist or has expired.
   */
  async get(id) {
    const result = await this.store.restore(id);
    return result ? result.row : null;
  }
  /**
   * Delete a session by id.
   * No-op if the session does not exist.
   */
  async delete(id) {
    return this.store.delete(id);
  }
  /**
   * Delete all sessions whose TTL has elapsed.
   * @returns the number of rows removed.
   */
  async purgeExpired() {
    return this.store.purgeExpired();
  }
  /**
   * Touch a session to reset its `updatedAt` timestamp and optionally extend
   * its TTL. Useful for keeping long-running bots alive.
   *
   * @param id    — session key
   * @param ttlMs — new TTL in ms from now (omit to leave existing TTL unchanged)
   */
  async touch(id, ttlMs) {
    return this.store.touch(id, ttlMs);
  }
};

// src/sessions/index.ts
var SESSION_KEY = "session:appstate";
async function restoreSession(storage, persistPath, emitter, logger) {
  const saved = await storage.get(SESSION_KEY);
  if (!saved || !Array.isArray(saved) || saved.length === 0) return null;
  try {
    const validated = validateAppState(saved);
    const jar = hydrateJar(validated);
    emitter.emit("session:restored", { persistPath });
    logger.info("Session restored from storage", { tag: "SESSION", persistPath });
    return { jar, appState: validated };
  } catch (err) {
    logger.warn("Failed to restore saved session \u2014 starting fresh", { tag: "SESSION", err });
    await storage.delete(SESSION_KEY);
    return null;
  }
}
function createFreshJar() {
  return new import_tough_cookie3.CookieJar();
}
async function resolveJar(options) {
  const { appState, userId, config, storage, emitter, logger, sessionStore } = options;
  if (appState) {
    const validated = validateAppState(appState);
    const jar = hydrateJar(validated);
    if (sessionStore) {
      const key = userId ?? "default";
      await sessionStore.save(key, validated, { userId: userId ?? void 0 }).catch(() => void 0);
    }
    return { jar, appState: validated };
  }
  if (config.session.restoreOnStart) {
    if (sessionStore) {
      const keys = userId ? [userId, "default"] : ["default"];
      for (const key of keys) {
        const result = await sessionStore.restore(key).catch(() => null);
        if (result) {
          emitter.emit("session:restored", { persistPath: `storage:sessions:${key}` });
          logger.info("Session restored from remote storage", { tag: "SESSION", key });
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

// src/messages/index.ts
var import_uuid2 = require("uuid");
function buildUploadMultipart(fields, file, boundary) {
  const CRLF = Buffer.from("\r\n");
  const parts = [];
  for (const field of fields) {
    parts.push(
      Buffer.from(
        `--${boundary}\r
Content-Disposition: form-data; name="${field.name}"\r
\r
${field.value}\r
`
      )
    );
  }
  parts.push(
    Buffer.from(
      `--${boundary}\r
Content-Disposition: form-data; name="file"; filename="${file.fileName}"\r
Content-Type: ${file.contentType}\r
\r
`
    )
  );
  parts.push(file.data);
  parts.push(CRLF);
  parts.push(Buffer.from(`--${boundary}--\r
`));
  return Buffer.concat(parts);
}
var MessagesModule = class {
  constructor(http, cache, emitter, logger, getTokens) {
    this.http = http;
    this.cache = cache;
    this.emitter = emitter;
    this.logger = logger;
    this.getTokens = getTokens;
  }
  http;
  cache;
  emitter;
  logger;
  getTokens;
  /**
   * Upload a single attachment and return its attachment ID as reported by Facebook.
   * Emits upload:progress, upload:complete, and upload:failed events.
   */
  async uploadAttachment(file, tokens, signal) {
    const uploadId = (0, import_uuid2.v4)();
    this.emitter.emit("upload:progress", {
      uploadId,
      bytesTransferred: 0,
      totalBytes: file.size ?? 0,
      percent: 0
    });
    const chunks = [];
    let bytesRead = 0;
    try {
      for await (const chunk of file.stream) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        chunks.push(buf);
        bytesRead += buf.byteLength;
        if (file.size) {
          const percent = Math.min(Math.round(bytesRead / file.size * 100), 99);
          this.emitter.emit("upload:progress", {
            uploadId,
            bytesTransferred: bytesRead,
            totalBytes: file.size,
            percent
          });
        }
      }
    } catch (err) {
      this.emitter.emit("upload:failed", { uploadId, error: err instanceof Error ? err : new Error(String(err)) });
      throw new UploadError(`Failed to read stream for attachment "${file.name}"`, bytesRead, { name: file.name }, err);
    }
    const fileBuffer = Buffer.concat(chunks);
    const totalBytes = fileBuffer.byteLength;
    const boundary = `----PFCABound${uploadId.replace(/-/g, "").slice(0, 16)}`;
    const body = buildUploadMultipart(
      [
        { name: "upload_id", value: uploadId },
        { name: "fb_dtsg", value: tokens.dtsg },
        { name: "lsd", value: tokens.lsd }
      ],
      { fileName: file.name, contentType: file.type, data: fileBuffer },
      boundary
    );
    let parsed;
    try {
      const resp = await this.http.postBuffer(FB_UPLOAD_URL, body, {
        headers: {
          "content-type": `multipart/form-data; boundary=${boundary}`,
          "content-length": String(body.byteLength)
        },
        signal
      });
      const text = await resp.text();
      parsed = parseJsonResponse(text);
    } catch (err) {
      this.emitter.emit("upload:failed", { uploadId, error: err instanceof Error ? err : new Error(String(err)) });
      throw new UploadError(`Upload failed for attachment "${file.name}"`, bytesRead, { name: file.name }, err);
    }
    const payload = parsed["payload"] ?? parsed;
    const metadataArr = payload["metadata"] ?? [];
    const firstMeta = metadataArr[0];
    const rawId = firstMeta?.["fbid"] ?? payload["fbid"] ?? payload["attachment_id"] ?? payload["attachment_token"];
    if (!rawId) {
      const errMsg = `Upload succeeded but Facebook returned no attachment ID for "${file.name}". Response: ${JSON.stringify(parsed).slice(0, 400)}`;
      const uploadErr = new UploadError(errMsg, totalBytes, { name: file.name });
      this.emitter.emit("upload:failed", { uploadId, error: uploadErr });
      throw uploadErr;
    }
    const attachmentId = String(rawId);
    this.emitter.emit("upload:progress", { uploadId, bytesTransferred: totalBytes, totalBytes, percent: 100 });
    this.emitter.emit("upload:complete", { uploadId, attachmentToken: attachmentId });
    return attachmentId;
  }
  async send(options) {
    if (!options.body && !options.stickerId && (!options.attachments || options.attachments.length === 0)) {
      throw new Error("Message must have at least one of: body, stickerId, or attachments");
    }
    const tokens = this.getTokens();
    this.logger.info("Sending message", { tag: "MESSAGES", threadId: options.threadId });
    const params = {
      action_type: "ma-type:user-generated-message",
      timestamp: Date.now().toString(),
      message_id: `client:${Date.now()}:${Math.random().toString(36).slice(2)}`,
      thread_fbid: options.threadId,
      fb_dtsg: tokens.dtsg,
      lsd: tokens.lsd
    };
    if (options.body) params["body"] = options.body;
    if (options.stickerId) params["sticker_id"] = options.stickerId;
    if (options.replyTo) params["replied_to_message_id"] = options.replyTo;
    if (options.mentionedUsers?.length) {
      const mentions = options.mentionedUsers.map((m) => ({
        entity_id: m.userId,
        offset: m.offset,
        length: m.length,
        type: "p"
      }));
      params["profile_tags_data"] = JSON.stringify(mentions);
    }
    if (options.attachments?.length) {
      const imageIds = [];
      const videoIds = [];
      const fileIds = [];
      for (const att of options.attachments) {
        this.logger.debug("Uploading attachment", { tag: "MESSAGES", name: att.name, type: att.type });
        const attachmentId = await this.uploadAttachment(att, tokens, options.signal);
        const mimeBase = att.type.split("/")[0];
        if (mimeBase === "image") {
          imageIds.push(attachmentId);
        } else if (mimeBase === "video") {
          videoIds.push(attachmentId);
        } else {
          fileIds.push(attachmentId);
        }
      }
      imageIds.forEach((id, i) => {
        params[`image_ids[${i}]`] = id;
      });
      videoIds.forEach((id, i) => {
        params[`video_ids[${i}]`] = id;
      });
      fileIds.forEach((id, i) => {
        params[`file_ids[${i}]`] = id;
      });
    }
    const { url, body } = buildFormRequest({ url: FB_MESSAGING_SEND, params, dtsg: tokens.dtsg, lsd: tokens.lsd });
    const resp = await this.http.post(url, body, { signal: options.signal });
    const text = await resp.text();
    let parsed;
    try {
      parsed = parseJsonResponse(text);
    } catch {
      parsed = {};
    }
    const payload = parsed["payload"] ?? {};
    const messageId = String(payload["message_id"] ?? params["message_id"] ?? "");
    const timestamp = new Date(Number(payload["timestamp"] ?? Date.now()));
    await this.cache.delete(nsKey("threads", options.threadId));
    this.logger.info("Message sent", { tag: "MESSAGES", messageId, threadId: options.threadId });
    return { messageId, threadId: options.threadId, timestamp };
  }
  /**
   * Reply to a specific message.
   * Both `messageId` (to reply to) and `threadId` are required.
   */
  async reply(options) {
    return this.send({
      threadId: options.threadId,
      body: options.body,
      replyTo: options.messageId,
      attachments: options.attachments,
      signal: options.signal
    });
  }
  /**
   * Permanently unsend (retract) a message you sent.
   * The message is removed for all participants.
   */
  async unsend(messageId, signal) {
    const tokens = this.getTokens();
    this.logger.info("Unsending message", { tag: "MESSAGES", messageId });
    const { url, body } = buildGraphQLRequest({
      queryName: "sendMessage",
      variables: { messageId },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
      friendlyName: "UnsendMessageMutation"
    });
    await this.http.post(url, body, { signal });
    await this.cache.delete(nsKey("messages", messageId));
  }
  /**
   * Delete a message from your view only (not for other participants).
   * Uses Facebook's delete_message endpoint.
   */
  async delete(messageId, signal) {
    const tokens = this.getTokens();
    this.logger.info("Deleting message (own view)", { tag: "MESSAGES", messageId });
    const { url, body } = buildFormRequest({
      url: FB_DELETE_MESSAGES_URL,
      params: {
        "message_ids[]": messageId
      },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd
    });
    await this.http.post(url, body, { signal });
    await this.cache.delete(nsKey("messages", messageId));
  }
  async forward(options) {
    const tokens = this.getTokens();
    const results = await Promise.allSettled(
      options.toThreadIds.map(async (threadId) => {
        const params = {
          action_type: "ma-type:forward-message",
          forwarded_message_id: options.messageId,
          thread_fbid: threadId,
          fb_dtsg: tokens.dtsg,
          lsd: tokens.lsd
        };
        const { url, body } = buildFormRequest({ url: FB_MESSAGING_SEND, params });
        await this.http.post(url, body, { signal: options.signal });
        return threadId;
      })
    );
    return results.map(
      (r, i) => r.status === "fulfilled" ? { threadId: options.toThreadIds[i], ok: true } : {
        threadId: options.toThreadIds[i],
        ok: false,
        error: r.reason instanceof Error ? r.reason.message : String(r.reason)
      }
    );
  }
  async react(options) {
    const tokens = this.getTokens();
    this.logger.debug("Reacting to message", {
      tag: "MESSAGES",
      messageId: options.messageId,
      reaction: options.reaction
    });
    const { url, body } = buildGraphQLRequest({
      queryName: "reactMessage",
      variables: {
        data: {
          action: options.reaction ? "ADD_REACTION" : "REMOVE_REACTION",
          reaction: options.reaction,
          message_id: options.messageId
        }
      },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd
    });
    await this.http.post(url, body, { signal: options.signal });
  }
  async getReactions(messageId, signal) {
    const tokens = this.getTokens();
    const { url, body } = buildGraphQLRequest({
      variables: { messageId },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
      friendlyName: "GetMessageReactionsQuery"
    });
    const resp = await this.http.post(url, body, { signal });
    const text = await resp.text();
    try {
      const data = parseJsonResponse(text);
      const reactions = data["data"]?.["messageReactions"];
      if (!Array.isArray(reactions)) return [];
      return reactions.map((r) => {
        const rr = r;
        return {
          userId: String(rr["userId"] ?? rr["user_id"] ?? ""),
          userName: String(rr["userName"] ?? rr["user_name"] ?? ""),
          reaction: String(rr["reaction"] ?? ""),
          timestamp: new Date(Number(rr["timestamp"] ?? Date.now()))
        };
      });
    } catch {
      return [];
    }
  }
  async list(options) {
    const tokens = this.getTokens();
    const limit = Math.min(options.limit ?? 20, 100);
    const cacheKey = nsKey(
      "messages-list",
      `${options.threadId}:${limit}:${options.before ?? ""}:${options.after ?? ""}`
    );
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    const { url, body } = buildGraphQLRequest({
      variables: {
        threadID: options.threadId,
        first: limit,
        before: options.before ?? null,
        after: options.after ?? null
      },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
      friendlyName: "ThreadMessagesQuery"
    });
    const resp = await this.http.post(url, body, { signal: options.signal });
    const text = await resp.text();
    let result = { items: [], hasMore: false, cursor: null };
    try {
      const data = parseJsonResponse(text);
      const nodes = this.extractMessageNodes(data);
      result = { items: nodes.messages, hasMore: nodes.hasMore, cursor: nodes.cursor };
    } catch {
      result = { items: [], hasMore: false, cursor: null };
    }
    await this.cache.set(cacheKey, result, 3e4);
    return result;
  }
  extractNodeAttachments(node) {
    const results = [];
    const sticker = node["sticker"];
    if (sticker) {
      const stickerUri = sticker["image128px"]?.["uri"] ?? sticker["image64px"]?.["uri"];
      results.push({
        id: String(sticker["id"] ?? ""),
        type: "sticker",
        url: stickerUri ? String(stickerUri) : void 0,
        stickerId: String(sticker["id"] ?? "")
      });
      return results;
    }
    const blobs = node["blob_attachments"];
    if (Array.isArray(blobs)) {
      for (const b of blobs) {
        if (!b || typeof b !== "object") continue;
        const att = b;
        const typename = String(att["__typename"] ?? att["type"] ?? "unknown");
        const id = String(att["attachment_fbid"] ?? att["legacy_attachment_id"] ?? att["id"] ?? "");
        const url = att["large_preview"]?.["uri"] ?? att["full_screen_image"]?.["uri"] ?? att["url"] ?? att["uri"];
        const name = att["filename"] ?? att["name"];
        const size = att["file_size"] ?? att["fileSize"];
        if (typename.includes("Share")) {
          const shareUrl = att["share"]?.["url"];
          const shareTitle = att["share"]?.["title"];
          const shareDesc = att["share"]?.["description"];
          results.push({
            id,
            type: "share",
            url: shareUrl ? String(shareUrl) : void 0,
            shareTitle: shareTitle ? String(shareTitle) : void 0,
            shareDescription: shareDesc ? String(shareDesc) : void 0
          });
        } else {
          results.push({
            id,
            type: typename.toLowerCase().replace("message", ""),
            url: url ? String(url) : void 0,
            name: name ? String(name) : void 0,
            size: size ? Number(size) : void 0
          });
        }
      }
    }
    return results;
  }
  extractMessageNodes(data) {
    const dataField = data["data"] ?? {};
    const viewer = dataField["viewer"] ?? {};
    const messages = viewer["message_thread"] ?? {};
    const edges = messages["messages"]?.["edges"];
    if (!Array.isArray(edges)) return { messages: [], hasMore: false, cursor: null };
    const items = edges.map((e) => {
      const node = e["node"];
      const repliedTo = node["replied_to_message"];
      return {
        messageId: String(node["message_id"] ?? node["id"] ?? ""),
        threadId: String(messages["thread_key"] ?? ""),
        senderId: String(node["message_sender"]?.["id"] ?? ""),
        senderName: String(node["message_sender"]?.["name"] ?? ""),
        body: node["message"] ? String(node["message"]["text"] ?? "") : null,
        attachments: this.extractNodeAttachments(node),
        timestamp: new Date(Number(node["timestamp_precise"] ?? Date.now())),
        isGroup: false,
        replyTo: repliedTo ? String(repliedTo["message_id"] ?? repliedTo["id"] ?? "") || void 0 : void 0
      };
    });
    const pageInfo = messages["messages"]?.["page_info"] ?? {};
    return {
      messages: items,
      hasMore: Boolean(pageInfo["has_previous_page"]),
      cursor: pageInfo["start_cursor"] ? String(pageInfo["start_cursor"]) : null
    };
  }
  async get(messageId, signal) {
    const cached = await this.cache.get(nsKey("messages", messageId));
    if (cached) return cached;
    const tokens = this.getTokens();
    const { url, body } = buildGraphQLRequest({
      variables: { messageId },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
      friendlyName: "FetchMessageByIdQuery"
    });
    const resp = await this.http.post(url, body, { signal });
    const text = await resp.text();
    const data = parseJsonResponse(text);
    const node = data["data"]?.["message"] ?? {};
    const repliedTo = node["replied_to_message"];
    const msg = {
      messageId,
      threadId: String(node["thread_id"] ?? node["thread_key"] ?? ""),
      senderId: String(node["sender"]?.["id"] ?? ""),
      senderName: String(node["sender"]?.["name"] ?? ""),
      body: node["text"] ?? node["body"] ? String(node["text"] ?? node["body"]) : null,
      attachments: this.extractNodeAttachments(node),
      timestamp: new Date(Number(node["timestamp"] ?? node["timestamp_precise"] ?? Date.now())),
      isGroup: Boolean(node["is_group_thread"]),
      replyTo: repliedTo ? String(repliedTo["message_id"] ?? repliedTo["id"] ?? "") || void 0 : void 0
    };
    await this.cache.set(nsKey("messages", messageId), msg, 3e5);
    return msg;
  }
  async markRead(threadId, signal) {
    const tokens = this.getTokens();
    const { url, body } = buildGraphQLRequest({
      queryName: "markRead",
      variables: { threadId, watermark: Date.now() },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd
    });
    await this.http.post(url, body, { signal });
    await this.cache.delete(nsKey("threads", threadId));
  }
  async setTyping(options) {
    const tokens = this.getTokens();
    const params = {
      thread: options.threadId,
      typ: options.typing ? "1" : "0",
      fb_dtsg: tokens.dtsg,
      lsd: tokens.lsd
    };
    const { url, body } = buildFormRequest({
      url: FB_TYPING_URL,
      params
    });
    await this.http.post(url, body, { signal: options.signal });
  }
};

// src/threads/index.ts
function parseThread(node) {
  const participants = Array.isArray(node["all_participants"]) ? node["all_participants"].map(
    (p) => String(p["node"]?.["id"] ?? p["id"] ?? "")
  ) : [];
  const muteRaw = node["mute_until"];
  const muteUntil = typeof muteRaw === "number" && muteRaw > 0 ? new Date(muteRaw * 1e3) : null;
  const tsRaw = node["last_message"]?.["timestamp"];
  const lastMessageTimestamp = typeof tsRaw === "number" || typeof tsRaw === "string" ? new Date(Number(tsRaw)) : null;
  return {
    threadId: String(node["thread_key"] ?? node["id"] ?? ""),
    name: node["name"] ? String(node["name"]) : null,
    isGroup: Boolean(node["is_group_thread"] ?? node["thread_type"] === "GROUP"),
    participantIds: participants,
    unreadCount: Number(node["unread_count"] ?? 0),
    lastMessageTimestamp,
    photoUrl: node["image"] ? String(node["image"]["uri"] ?? "") : null,
    muteUntil,
    isArchived: Boolean(node["folder"] === "ARCHIVED")
  };
}
var ThreadsModule = class {
  constructor(http, cache, emitter, logger, getTokens) {
    this.http = http;
    this.cache = cache;
    this.emitter = emitter;
    this.logger = logger;
    this.getTokens = getTokens;
  }
  http;
  cache;
  emitter;
  logger;
  getTokens;
  async list(options = {}) {
    const tokens = this.getTokens();
    const limit = Math.min(options.limit ?? DEFAULT_THREAD_LIMIT, MAX_THREAD_LIMIT);
    const cacheKey = nsKey("threads", `list:${limit}:${options.cursor ?? "start"}`);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    this.logger.debug("Fetching thread list", { tag: "THREADS", limit });
    const { url, body } = buildGraphQLRequest({
      queryName: "threadList",
      variables: {
        limit,
        before: options.cursor ?? null,
        tags: ["INBOX"],
        includeDeliveryReceipts: true,
        includeSeqID: false
      },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd
    });
    const resp = await this.http.post(url, body, { signal: options.signal });
    const text = await resp.text();
    const data = parseJsonResponse(text);
    const edges = this.extractThreadEdges(data);
    const items = edges.map((e) => parseThread(e));
    const pageInfo = this.extractPageInfo(data);
    const result = {
      items,
      hasMore: pageInfo.hasNextPage,
      cursor: pageInfo.endCursor
    };
    await this.cache.set(cacheKey, result, 3e4);
    return result;
  }
  async get(threadId, signal) {
    const tokens = this.getTokens();
    const cacheKey = nsKey("threads", threadId);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    this.logger.debug("Fetching thread info", { tag: "THREADS", threadId });
    const { url, body } = buildGraphQLRequest({
      queryName: "threadInfo",
      variables: { threadID: threadId },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd
    });
    const resp = await this.http.post(url, body, { signal });
    const text = await resp.text();
    const data = parseJsonResponse(text);
    const node = this.extractThreadNode(data);
    if (!node) throw new NotFoundError(`Thread ${threadId} not found`, { threadId });
    const thread = parseThread(node);
    await this.cache.set(cacheKey, thread, 6e4);
    return thread;
  }
  async create(options) {
    const tokens = this.getTokens();
    this.logger.info("Creating group thread", { tag: "THREADS", count: options.participantIds.length });
    const { url, body } = buildGraphQLRequest({
      queryName: "createGroup",
      variables: {
        to: options.participantIds,
        name: options.name ?? "",
        message: { text: "" }
      },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd
    });
    const resp = await this.http.post(url, body, { signal: options.signal });
    const text = await resp.text();
    const data = parseJsonResponse(text);
    const node = this.extractThreadNode(data) ?? {};
    const thread = parseThread(node);
    this.logger.info("Group thread created", { tag: "THREADS", threadId: thread.threadId });
    return thread;
  }
  async rename(threadId, name, signal) {
    const tokens = this.getTokens();
    this.logger.info("Renaming thread", { tag: "THREADS", threadId, name });
    const { url, body } = buildGraphQLRequest({
      queryName: "renameThread",
      variables: { threadID: threadId, name },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd
    });
    await this.http.post(url, body, { signal });
    await this.cache.delete(nsKey("threads", threadId));
    this.emitter.emit("thread:renamed", { threadId, newName: name, changedBy: tokens.userId });
  }
  async setPhoto(threadId, stream, signal) {
    const tokens = this.getTokens();
    this.logger.info("Setting thread photo", { tag: "THREADS", threadId });
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const imageBuffer = Buffer.concat(chunks);
    const boundary = `----WebKitFormBoundary${Math.random().toString(36).slice(2)}`;
    const CRLF = Buffer.from("\r\n");
    const bodyBuffer = Buffer.concat([
      Buffer.from(`--${boundary}\r
Content-Disposition: form-data; name="thread_image"; filename="photo.jpg"\r
Content-Type: image/jpeg\r
\r
`),
      imageBuffer,
      CRLF,
      Buffer.from(`--${boundary}\r
Content-Disposition: form-data; name="thread_id"\r
\r
${threadId}\r
`),
      Buffer.from(`--${boundary}\r
Content-Disposition: form-data; name="fb_dtsg"\r
\r
${tokens.dtsg}\r
`),
      Buffer.from(`--${boundary}--\r
`)
    ]);
    const setPhotoResp = await this.http.postBuffer(FB_SET_THREAD_IMAGE_URL, bodyBuffer, {
      headers: {
        "content-type": `multipart/form-data; boundary=${boundary}`,
        "content-length": String(bodyBuffer.byteLength)
      },
      signal
    });
    let newPhotoUrl = "";
    try {
      const respText = await setPhotoResp.text();
      const respData = parseJsonResponse(respText);
      const respPayload = respData["payload"] ?? respData;
      newPhotoUrl = String(
        respPayload["image_uri"] ?? respPayload["photo_url"] ?? respPayload["uri"] ?? respPayload["image"]?.["uri"] ?? ""
      );
    } catch {
    }
    await this.cache.delete(nsKey("threads", threadId));
    this.emitter.emit("thread:photo:changed", { threadId, newPhotoUrl, changedBy: tokens.userId });
  }
  async addParticipants(threadId, userIds, signal) {
    const tokens = this.getTokens();
    this.logger.info("Adding participants", { tag: "THREADS", threadId, count: userIds.length });
    const { url, body } = buildGraphQLRequest({
      queryName: "addParticipants",
      variables: { threadID: threadId, to: userIds },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd
    });
    await this.http.post(url, body, { signal });
    await this.cache.delete(nsKey("threads", threadId));
    for (const userId of userIds) {
      this.emitter.emit("thread:participant:added", { threadId, addedUserId: userId, addedByUserId: tokens.userId });
    }
  }
  async removeParticipant(threadId, userId, signal) {
    const tokens = this.getTokens();
    this.logger.info("Removing participant", { tag: "THREADS", threadId, userId });
    const { url, body } = buildGraphQLRequest({
      queryName: "removeParticipant",
      variables: { threadID: threadId, userId },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd
    });
    await this.http.post(url, body, { signal });
    await this.cache.delete(nsKey("threads", threadId));
    this.emitter.emit("thread:participant:removed", { threadId, removedUserId: userId, removedByUserId: tokens.userId });
  }
  async leave(threadId, signal) {
    const tokens = this.getTokens();
    this.logger.info("Leaving thread", { tag: "THREADS", threadId });
    const { url, body } = buildFormRequest({
      url: FB_LEAVE_THREAD_URL,
      params: { thread_fbid: threadId },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd
    });
    await this.http.post(url, body, { signal });
    await this.cache.delete(nsKey("threads", threadId));
  }
  async mute(threadId, durationMs, signal) {
    const tokens = this.getTokens();
    const muteUntilTimestamp = durationMs !== void 0 ? Math.floor((Date.now() + durationMs) / 1e3) : -1;
    this.logger.info("Muting thread", { tag: "THREADS", threadId, muteUntilTimestamp });
    const { url, body } = buildGraphQLRequest({
      queryName: "muteThread",
      variables: { threadID: threadId, muteUntilTimestamp },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd
    });
    await this.http.post(url, body, { signal });
    await this.cache.delete(nsKey("threads", threadId));
    this.emitter.emit("thread:muted", {
      threadId,
      mutedUntil: muteUntilTimestamp > 0 ? new Date(muteUntilTimestamp * 1e3) : null
    });
  }
  async unmute(threadId, signal) {
    return this.mute(threadId, 0, signal);
  }
  async archive(threadId, signal) {
    const tokens = this.getTokens();
    this.logger.info("Archiving thread", { tag: "THREADS", threadId });
    const { url, body } = buildGraphQLRequest({
      queryName: "archiveThread",
      variables: { threadID: threadId, folder: "ARCHIVED" },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd
    });
    await this.http.post(url, body, { signal });
    await this.cache.delete(nsKey("threads", threadId));
    this.emitter.emit("thread:archived", { threadId, archived: true });
  }
  async unarchive(threadId, signal) {
    const tokens = this.getTokens();
    this.logger.info("Unarchiving thread", { tag: "THREADS", threadId });
    const { url, body } = buildGraphQLRequest({
      queryName: "archiveThread",
      variables: { threadID: threadId, folder: "INBOX" },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd
    });
    await this.http.post(url, body, { signal });
    await this.cache.delete(nsKey("threads", threadId));
  }
  extractThreadEdges(data) {
    try {
      const d = data["data"];
      const viewer = d?.["viewer"] ?? d?.["user"] ?? d;
      const inbox = viewer?.["message_threads"] ?? viewer?.["threads"];
      const edges = inbox?.["edges"];
      if (Array.isArray(edges)) {
        return edges.map((e) => e["node"]);
      }
    } catch {
    }
    return [];
  }
  extractThreadNode(data) {
    try {
      const d = data["data"];
      const thread = d?.["message_thread"] ?? d?.["thread"];
      if (thread && typeof thread === "object") return thread;
    } catch {
    }
    return null;
  }
  extractPageInfo(data) {
    try {
      const d = data["data"];
      const viewer = d?.["viewer"] ?? d?.["user"] ?? d;
      const inbox = viewer?.["message_threads"] ?? viewer?.["threads"];
      const pageInfo = inbox?.["page_info"];
      if (pageInfo) {
        return {
          hasNextPage: Boolean(pageInfo["has_next_page"]),
          endCursor: pageInfo["end_cursor"] ? String(pageInfo["end_cursor"]) : null
        };
      }
    } catch {
    }
    return { hasNextPage: false, endCursor: null };
  }
};

// src/users/index.ts
function parseUserProfile(node) {
  return {
    id: String(node["id"] ?? ""),
    name: String(node["name"] ?? ""),
    username: node["username"] ? String(node["username"]) : null,
    profilePictureUrl: node["profile_picture"] ? String(node["profile_picture"]["uri"] ?? "") : null,
    isFriend: Boolean(
      node["friendship_status"]?.["are_friends"] ?? node["is_friend"] ?? false
    ),
    mutualFriendCount: node["mutual_friends"] ? Number(node["mutual_friends"]["count"] ?? 0) : null
  };
}
var UsersModule = class {
  constructor(http, cache, logger, getTokens) {
    this.http = http;
    this.cache = cache;
    this.logger = logger;
    this.getTokens = getTokens;
  }
  http;
  cache;
  logger;
  getTokens;
  async getProfile(userId, signal) {
    const tokens = this.getTokens();
    const cacheKey = nsKey("users", userId);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    this.logger.debug("Fetching user profile", { tag: "USERS", userId });
    const { url, body } = buildGraphQLRequest({
      queryName: "userInfo",
      variables: { userID: userId, scale: 1, includeFriendshipStatus: true },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd
    });
    const resp = await this.http.post(url, body, { signal });
    const text = await resp.text();
    const data = parseJsonResponse(text);
    const node = this.extractUserNode(data);
    if (!node) throw new NotFoundError(`User ${userId} not found`, { userId });
    const profile = parseUserProfile(node);
    await this.cache.set(cacheKey, profile, 3e5);
    return profile;
  }
  async getSelf(signal) {
    const tokens = this.getTokens();
    const cacheKey = nsKey("users", `self:${tokens.userId}`);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    this.logger.debug("Fetching own profile", { tag: "USERS", userId: tokens.userId });
    const { url, body } = buildGraphQLRequest({
      variables: { userID: tokens.userId, scale: 1, includeFriendshipStatus: false },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
      friendlyName: "ProfileCometRootQuery"
    });
    const resp = await this.http.post(url, body, { signal });
    const text = await resp.text();
    const data = parseJsonResponse(text);
    const node = this.extractUserNode(data) ?? { id: tokens.userId, name: "Me" };
    const profile = parseUserProfile(node);
    await this.cache.set(cacheKey, profile, 3e5);
    return profile;
  }
  async getFriends(options = {}) {
    const tokens = this.getTokens();
    const limit = options.limit ?? 20;
    const cacheKey = nsKey("users", `friends:${limit}:${options.cursor ?? "start"}`);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    this.logger.debug("Fetching friend list", { tag: "USERS", limit });
    const { url, body } = buildGraphQLRequest({
      queryName: "friendList",
      variables: {
        count: limit,
        cursor: options.cursor ?? null,
        scale: 1
      },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd
    });
    const resp = await this.http.post(url, body, { signal: options.signal });
    const text = await resp.text();
    const data = parseJsonResponse(text);
    const { edges, pageInfo } = this.extractConnection(data, "friends");
    const items = edges.map(parseUserProfile);
    const result = { items, hasMore: pageInfo.hasNextPage, cursor: pageInfo.endCursor };
    await this.cache.set(cacheKey, result, 6e4);
    return result;
  }
  async search(query, options = {}) {
    const tokens = this.getTokens();
    this.logger.debug("Searching users", { tag: "USERS", query });
    const { url, body } = buildGraphQLRequest({
      queryName: "searchThreads",
      variables: { query, count: options.limit ?? 10, entityTypes: ["USER"] },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd
    });
    const resp = await this.http.post(url, body, { signal: options.signal });
    const text = await resp.text();
    const data = parseJsonResponse(text);
    const { edges } = this.extractConnection(data, "search_results");
    return edges.map(parseUserProfile);
  }
  extractUserNode(data) {
    try {
      const d = data["data"];
      const user = d?.["user"] ?? d?.["userOrMe"];
      if (user && typeof user === "object") return user;
    } catch {
    }
    return null;
  }
  extractConnection(data, key) {
    try {
      const d = data["data"];
      const viewer = d?.["viewer"] ?? d?.["user"] ?? d;
      const conn = viewer?.[key] ?? d?.[key];
      const rawEdges = conn?.["edges"];
      const pageInfo = conn?.["page_info"];
      if (Array.isArray(rawEdges)) {
        const edges = rawEdges.map((e) => {
          const item = e;
          return item["node"] ?? item;
        });
        return {
          edges,
          pageInfo: {
            hasNextPage: Boolean(pageInfo?.["has_next_page"]),
            endCursor: pageInfo?.["end_cursor"] ? String(pageInfo["end_cursor"]) : null
          }
        };
      }
    } catch {
    }
    return { edges: [], pageInfo: { hasNextPage: false, endCursor: null } };
  }
};

// src/presence/index.ts
var PresenceModule = class {
  constructor(http, cache, emitter, logger, getTokens) {
    this.http = http;
    this.cache = cache;
    this.emitter = emitter;
    this.logger = logger;
    this.getTokens = getTokens;
  }
  http;
  cache;
  emitter;
  logger;
  getTokens;
  subscribedUserIds = /* @__PURE__ */ new Set();
  async get(userId, signal) {
    const tokens = this.getTokens();
    const cacheKey = nsKey("presence", userId);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    this.logger.debug("Fetching presence", { tag: "PRESENCE", userId });
    const { url, body } = buildGraphQLRequest({
      queryName: "presenceGet",
      variables: { userID: userId },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd
    });
    const resp = await this.http.post(url, body, { signal });
    const text = await resp.text();
    const data = parseJsonResponse(text);
    const status = this.parsePresence(userId, data);
    await this.cache.set(cacheKey, status, 3e4);
    return status;
  }
  async setVisible(visible, signal) {
    const tokens = this.getTokens();
    this.logger.info("Setting presence visibility", { tag: "PRESENCE", visible });
    const { url, body } = buildGraphQLRequest({
      queryName: "presenceSet",
      variables: { input: { is_present: visible } },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd
    });
    await this.http.post(url, body, { signal });
  }
  subscribe(userIds) {
    for (const userId of userIds) {
      this.subscribedUserIds.add(userId);
    }
    this.logger.debug("Subscribed to presence updates", { tag: "PRESENCE", count: userIds.length });
  }
  unsubscribe(userIds) {
    for (const userId of userIds) {
      this.subscribedUserIds.delete(userId);
    }
  }
  /**
   * Update the in-memory presence cache for a user.
   * Called by the client whenever a presence update arrives from the MQTT layer,
   * so that `presence.get()` returns up-to-date data without a network round-trip.
   */
  updateCache(userId, isOnline, lastActiveAt) {
    void this.cache.set(nsKey("presence", userId), { userId, isOnline, lastActiveAt }, 3e4);
  }
  /**
   * Called internally to emit presence events for explicitly subscribed users only.
   * For global presence events (all users) the MQTT layer emits `presence:update` directly.
   */
  handlePresenceUpdate(userId, isOnline, lastActiveAt) {
    const status = { userId, isOnline, lastActiveAt };
    void this.cache.set(nsKey("presence", userId), status, 3e4);
    if (this.subscribedUserIds.size === 0 || this.subscribedUserIds.has(userId)) {
      this.emitter.emit("presence:update", { userId, isOnline, lastActiveAt });
    }
  }
  parsePresence(userId, data) {
    try {
      const d = data["data"];
      const user = d?.["user"] ?? d?.["presence"];
      const presenceData = user?.["presence_data"] ?? user;
      const isOnline = Boolean(presenceData?.["is_online"] ?? presenceData?.["is_present"] ?? false);
      const lastActiveRaw = presenceData?.["last_active_time"] ?? presenceData?.["last_active"];
      const lastActiveAt = typeof lastActiveRaw === "number" && lastActiveRaw > 0 ? new Date(lastActiveRaw * 1e3) : null;
      return { userId, isOnline, lastActiveAt };
    } catch {
      return { userId, isOnline: false, lastActiveAt: null };
    }
  }
};

// src/search/index.ts
var SearchModule = class {
  constructor(http, logger, getTokens) {
    this.http = http;
    this.logger = logger;
    this.getTokens = getTokens;
  }
  http;
  logger;
  getTokens;
  async messages(query, options = {}) {
    const tokens = this.getTokens();
    this.logger.debug("Searching messages", { tag: "SEARCH", query });
    const { url, body } = buildGraphQLRequest({
      queryName: "searchMessages",
      variables: {
        query,
        count: options.limit ?? 20,
        cursor: options.cursor ?? null,
        surface_type: "SEARCH_RESULTS_PAGE",
        filters: []
      },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd
    });
    const resp = await this.http.post(url, body, { signal: options.signal });
    const text = await resp.text();
    const data = parseJsonResponse(text);
    return this.parseMessageResults(data);
  }
  async threads(query, options = {}) {
    const tokens = this.getTokens();
    this.logger.debug("Searching threads", { tag: "SEARCH", query });
    const { url, body } = buildGraphQLRequest({
      queryName: "searchThreads",
      variables: {
        query,
        count: options.limit ?? 20,
        cursor: options.cursor ?? null,
        entityTypes: ["GROUP", "USER"]
      },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd
    });
    const resp = await this.http.post(url, body, { signal: options.signal });
    const text = await resp.text();
    const data = parseJsonResponse(text);
    return this.parseThreadResults(data);
  }
  parseMessageResults(data) {
    try {
      const d = data["data"];
      const results = d?.["search_results"];
      const rawEdges = results?.["edges"];
      const pageInfo = results?.["page_info"];
      const items = [];
      if (Array.isArray(rawEdges)) {
        for (const edge of rawEdges) {
          const node = edge["node"];
          if (!node) continue;
          const sender = node["sender"];
          items.push({
            messageId: String(node["message_id"] ?? node["id"] ?? ""),
            threadId: String(node["thread_key"] ?? ""),
            senderId: String(sender?.["id"] ?? ""),
            senderName: String(sender?.["name"] ?? ""),
            body: node["text"] ? String(node["text"]) : null,
            timestamp: new Date(Number(node["timestamp"] ?? Date.now())),
            snippet: node["snippet"] ? String(node["snippet"]) : null
          });
        }
      }
      return {
        items,
        hasMore: Boolean(pageInfo?.["has_next_page"]),
        cursor: pageInfo?.["end_cursor"] ? String(pageInfo["end_cursor"]) : null
      };
    } catch {
      return { items: [], hasMore: false, cursor: null };
    }
  }
  parseThreadResults(data) {
    try {
      const d = data["data"];
      const results = d?.["search_results"];
      const rawEdges = results?.["edges"];
      const pageInfo = results?.["page_info"];
      const items = [];
      if (Array.isArray(rawEdges)) {
        for (const edge of rawEdges) {
          const node = edge["node"];
          if (!node) continue;
          const participants = Array.isArray(node["all_participants"]) ? node["all_participants"].map(
            (p) => String(p["node"]?.["name"] ?? p["name"] ?? "")
          ) : [];
          const tsRaw = node["last_message"]?.["timestamp"];
          items.push({
            threadId: String(node["thread_key"] ?? node["id"] ?? ""),
            name: node["name"] ? String(node["name"]) : null,
            participantNames: participants,
            lastMessageTimestamp: typeof tsRaw === "number" || typeof tsRaw === "string" ? new Date(Number(tsRaw)) : null
          });
        }
      }
      return {
        items,
        hasMore: Boolean(pageInfo?.["has_next_page"]),
        cursor: pageInfo?.["end_cursor"] ? String(pageInfo["end_cursor"]) : null
      };
    } catch {
      return { items: [], hasMore: false, cursor: null };
    }
  }
};

// src/files/index.ts
var import_node_fs3 = require("fs");
var import_promises2 = require("stream/promises");
var import_node_stream = require("stream");
var import_uuid3 = require("uuid");
function buildMultipartBuffer(fields, file, boundary) {
  const CRLF = Buffer.from("\r\n");
  const parts = [];
  for (const field of fields) {
    parts.push(
      Buffer.from(`--${boundary}\r
Content-Disposition: form-data; name="${field.name}"\r
\r
${field.value}\r
`)
    );
  }
  parts.push(
    Buffer.from(
      `--${boundary}\r
Content-Disposition: form-data; name="${file.fieldName}"; filename="${file.fileName}"\r
Content-Type: ${file.contentType}\r
\r
`
    )
  );
  parts.push(file.data);
  parts.push(CRLF);
  parts.push(Buffer.from(`--${boundary}--\r
`));
  return Buffer.concat(parts);
}
var FilesModule = class {
  constructor(http, emitter, logger, getTokens) {
    this.http = http;
    this.emitter = emitter;
    this.logger = logger;
    this.getTokens = getTokens;
  }
  http;
  emitter;
  logger;
  getTokens;
  async upload(options) {
    const tokens = this.getTokens();
    const uploadId = (0, import_uuid3.v4)();
    this.logger.info("Starting file upload", { tag: "FILES", name: options.name, type: options.type, uploadId });
    this.emitter.emit("upload:progress", { uploadId, bytesTransferred: 0, totalBytes: options.size ?? 0, percent: 0 });
    const chunks = [];
    let bytesRead = 0;
    try {
      for await (const chunk of options.stream) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        chunks.push(buf);
        bytesRead += buf.byteLength;
        if (options.size) {
          const percent = Math.min(Math.round(bytesRead / options.size * 100), 99);
          this.emitter.emit("upload:progress", {
            uploadId,
            bytesTransferred: bytesRead,
            totalBytes: options.size,
            percent
          });
        }
      }
    } catch (err) {
      this.emitter.emit("upload:failed", { uploadId, error: err instanceof Error ? err : new Error(String(err)) });
      throw new UploadError(`Failed to read upload stream for "${options.name}"`, bytesRead, { name: options.name }, err);
    }
    const fileBuffer = Buffer.concat(chunks);
    const totalBytes = fileBuffer.byteLength;
    const boundary = `----PFCABoundary${uploadId.replace(/-/g, "").slice(0, 16)}`;
    const body = buildMultipartBuffer(
      [
        { name: "upload_id", value: uploadId },
        { name: "fb_dtsg", value: tokens.dtsg },
        { name: "lsd", value: tokens.lsd }
      ],
      { fieldName: "file", fileName: options.name, contentType: options.type, data: fileBuffer },
      boundary
    );
    let parsed;
    try {
      const resp = await this.http.postBuffer(FB_UPLOAD_URL, body, {
        headers: {
          "content-type": `multipart/form-data; boundary=${boundary}`,
          "content-length": String(body.byteLength)
        },
        signal: options.signal
      });
      const text = await resp.text();
      parsed = parseJsonResponse(text);
    } catch (err) {
      this.emitter.emit("upload:failed", { uploadId, error: err instanceof Error ? err : new Error(String(err)) });
      throw new UploadError(`Upload failed for "${options.name}"`, bytesRead, { name: options.name }, err);
    }
    const payload = parsed["payload"] ?? parsed;
    const metadataArr = payload["metadata"] ?? [];
    const firstMeta = metadataArr[0];
    const rawId = firstMeta?.["fbid"] ?? firstMeta?.["attachment_id"] ?? payload["fbid"] ?? payload["attachment_id"] ?? payload["attachment_token"];
    if (!rawId) {
      const errMsg = `Upload succeeded but Facebook returned no attachment ID for "${options.name}". Response: ${JSON.stringify(parsed).slice(0, 400)}`;
      const uploadErr = new UploadError(errMsg, totalBytes, { name: options.name });
      this.emitter.emit("upload:failed", { uploadId, error: uploadErr });
      throw uploadErr;
    }
    const attachmentToken = String(rawId);
    const result = { attachmentToken, uploadId, name: options.name, type: options.type, size: totalBytes };
    this.emitter.emit("upload:progress", { uploadId, bytesTransferred: totalBytes, totalBytes, percent: 100 });
    this.emitter.emit("upload:complete", { uploadId, attachmentToken });
    this.logger.info("File upload complete", { tag: "FILES", name: options.name, uploadId, totalBytes });
    return result;
  }
  async download(url, options) {
    this.logger.info("Starting file download", { tag: "FILES", url, destination: options.destination });
    const resp = await this.http.request({ url, method: "GET", signal: options.signal });
    const totalBytes = Number(resp.headers["content-length"] ?? 0);
    this.emitter.emit("download:progress", { url, bytesTransferred: 0, totalBytes, percent: 0 });
    const writeStream = (0, import_node_fs3.createWriteStream)(options.destination);
    let bytesWritten = 0;
    try {
      const buf = await resp.buffer();
      bytesWritten = buf.byteLength;
      await (0, import_promises2.pipeline)(import_node_stream.Readable.from(buf), writeStream);
      if (options.onProgress) options.onProgress(bytesWritten, totalBytes || bytesWritten);
    } catch (err) {
      writeStream.destroy();
      this.emitter.emit("download:failed", { url, error: err instanceof Error ? err : new Error(String(err)) });
      throw new DownloadError(`Download failed for "${url}"`, { url, destination: options.destination }, err);
    }
    this.emitter.emit("download:progress", {
      url,
      bytesTransferred: bytesWritten,
      totalBytes: totalBytes || bytesWritten,
      percent: 100
    });
    this.emitter.emit("download:complete", { url, bytesWritten });
    this.logger.info("File download complete", { tag: "FILES", url, bytesWritten });
  }
};

// src/polls/index.ts
var PollsModule = class {
  constructor(http, logger, getTokens) {
    this.http = http;
    this.logger = logger;
    this.getTokens = getTokens;
  }
  http;
  logger;
  getTokens;
  async create(options) {
    const tokens = this.getTokens();
    this.logger.info("Creating poll", { tag: "POLLS", threadId: options.threadId, question: options.question });
    const { url, body } = buildGraphQLRequest({
      queryName: "createPoll",
      variables: {
        threadID: options.threadId,
        question: options.question,
        options: options.options.map((text2, idx) => ({ id: String(idx + 1), text: text2 }))
      },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd
    });
    const resp = await this.http.post(url, body, { signal: options.signal });
    const text = await resp.text();
    const data = parseJsonResponse(text);
    return this.parsePoll(options.threadId, data, options.question, options.options);
  }
  async vote(options) {
    const tokens = this.getTokens();
    this.logger.info("Voting on poll", { tag: "POLLS", pollId: options.pollId, optionId: options.optionId });
    const { url, body } = buildGraphQLRequest({
      queryName: "votePoll",
      variables: { pollID: options.pollId, optionID: options.optionId },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd
    });
    await this.http.post(url, body, { signal: options.signal });
  }
  async getResults(pollId, signal) {
    const tokens = this.getTokens();
    this.logger.debug("Fetching poll results", { tag: "POLLS", pollId });
    const { url, body } = buildGraphQLRequest({
      queryName: "getPollResults",
      variables: { pollID: pollId },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd
    });
    const resp = await this.http.post(url, body, { signal });
    const text = await resp.text();
    const data = parseJsonResponse(text);
    const poll = this.parsePollResults(pollId, data);
    if (!poll) throw new NotFoundError(`Poll ${pollId} not found`, { pollId });
    return poll;
  }
  parsePoll(threadId, data, question, optionTexts) {
    try {
      const d = data["data"];
      const node = d?.["create_poll"] ?? d?.["poll"];
      const pollId = String(node?.["poll_id"] ?? node?.["id"] ?? `poll_${Date.now()}`);
      const opts = optionTexts.map((text, idx) => ({
        id: String(idx + 1),
        text,
        voterIds: [],
        voteCount: 0
      }));
      return {
        pollId,
        threadId,
        question,
        options: opts,
        totalVotes: 0,
        createdAt: /* @__PURE__ */ new Date()
      };
    } catch {
      return {
        pollId: `poll_${Date.now()}`,
        threadId,
        question,
        options: optionTexts.map((text, idx) => ({ id: String(idx + 1), text, voterIds: [], voteCount: 0 })),
        totalVotes: 0,
        createdAt: /* @__PURE__ */ new Date()
      };
    }
  }
  parsePollResults(pollId, data) {
    try {
      const d = data["data"];
      const node = d?.["poll"] ?? d?.["poll_question"];
      if (!node) return null;
      const rawOptions = Array.isArray(node["options"]) ? node["options"] : [];
      const opts = rawOptions.map((o) => {
        const voters = Array.isArray(o["voters"]) ? o["voters"] : [];
        return {
          id: String(o["id"] ?? ""),
          text: String(o["text"] ?? ""),
          voterIds: voters.map((v) => String(v["id"] ?? "")),
          voteCount: Number(o["total_count"] ?? voters.length)
        };
      });
      const totalVotes = opts.reduce((sum, o) => sum + o.voteCount, 0);
      return {
        pollId,
        threadId: String(node["thread_key"] ?? ""),
        question: String(node["text"] ?? node["question"] ?? ""),
        options: opts,
        totalVotes,
        createdAt: node["creation_time"] ? new Date(Number(node["creation_time"]) * 1e3) : /* @__PURE__ */ new Date()
      };
    } catch {
      return null;
    }
  }
};

// src/stickers/index.ts
var StickersModule = class {
  constructor(http, cache, logger, getTokens) {
    this.http = http;
    this.cache = cache;
    this.logger = logger;
    this.getTokens = getTokens;
  }
  http;
  cache;
  logger;
  getTokens;
  async send(options) {
    const tokens = this.getTokens();
    this.logger.info("Sending sticker", { tag: "STICKERS", threadId: options.threadId, stickerId: options.stickerId });
    const params = {
      action_type: "ma-type:user-generated-message",
      timestamp: Date.now().toString(),
      message_id: `client:${Date.now()}:${Math.random().toString(36).slice(2)}`,
      thread_fbid: options.threadId,
      sticker_id: options.stickerId,
      fb_dtsg: tokens.dtsg,
      lsd: tokens.lsd
    };
    const { url, body } = buildFormRequest({ url: FB_MESSAGING_SEND, params });
    const resp = await this.http.post(url, body, { signal: options.signal });
    const text = await resp.text();
    let parsed;
    try {
      parsed = parseJsonResponse(text);
    } catch {
      parsed = {};
    }
    const payload = parsed["payload"] ?? {};
    const messageId = String(payload["message_id"] ?? params["message_id"] ?? "");
    const timestamp = new Date(Number(payload["timestamp"] ?? Date.now()));
    this.logger.info("Sticker sent", { tag: "STICKERS", messageId, threadId: options.threadId });
    return { messageId, threadId: options.threadId, timestamp };
  }
  async getPack(packId, signal) {
    const tokens = this.getTokens();
    const cacheKey = nsKey("stickers", `pack:${packId}`);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    this.logger.debug("Fetching sticker pack", { tag: "STICKERS", packId });
    const { url, body } = buildGraphQLRequest({
      queryName: "stickerPack",
      variables: { packID: packId },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd
    });
    const resp = await this.http.post(url, body, { signal });
    const text = await resp.text();
    const data = parseJsonResponse(text);
    const pack = this.parseStickerPack(packId, data);
    if (!pack) throw new NotFoundError(`Sticker pack ${packId} not found`, { packId });
    await this.cache.set(cacheKey, pack, 36e5);
    return pack;
  }
  parseStickerPack(packId, data) {
    try {
      const d = data["data"];
      const node = d?.["sticker_package"] ?? d?.["sticker_pack"];
      if (!node) return null;
      const rawStickers = Array.isArray(node["stickers"]) ? node["stickers"] : [];
      const stickers = rawStickers.map((s) => ({
        stickerId: String(s["id"] ?? ""),
        label: s["label"] ? String(s["label"]) : null,
        stickerUrl: s["url"] ? String(s["url"]) : null,
        packId,
        width: Number(s["width"] ?? 0),
        height: Number(s["height"] ?? 0)
      }));
      return {
        packId,
        name: node["name"] ? String(node["name"]) : null,
        stickers
      };
    } catch {
      return null;
    }
  }
};

// src/diagnostics/index.ts
var import_promises3 = require("fs/promises");
var import_node_inspector = require("inspector");
var import_node_perf_hooks = require("perf_hooks");
var MEMORY_HIGH_THRESHOLD_MB = 400;
var MEMORY_POLL_INTERVAL_MS = 3e4;
function toMb(bytes) {
  return Math.round(bytes / 1024 / 1024 * 10) / 10;
}
var DiagnosticsModule = class {
  constructor(cache, logger, getTokens, getIsConnected, runHealthPing, emitter) {
    this.cache = cache;
    this.logger = logger;
    this.getTokens = getTokens;
    this.getIsConnected = getIsConnected;
    this.runHealthPing = runHealthPing;
    this.emitter = emitter;
    this.startGcMonitoring();
    this.startMemoryMonitoring();
  }
  cache;
  logger;
  getTokens;
  getIsConnected;
  runHealthPing;
  emitter;
  startedAt = /* @__PURE__ */ new Date();
  httpRequestCount = 0;
  httpErrorCount = 0;
  httpLatencies = [];
  mqttConnected = false;
  mqttReconnectCount = 0;
  mqttLastReconnectMs = null;
  // GC tracking via PerformanceObserver
  gcMajorCount = 0;
  gcTotalFreedBytes = 0;
  gcObserver = null;
  // Memory polling
  memoryPollTimer = null;
  startGcMonitoring() {
    try {
      this.gcObserver = new import_node_perf_hooks.PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const gcEntry = entry;
          const kind = gcEntry.kind ?? gcEntry.detail?.["kind"] ?? 0;
          const isMajor = kind === 2 || kind === 4;
          if (!isMajor) continue;
          const durationMs = Math.round(entry.duration);
          const mem = process.memoryUsage();
          const heapUsedMb = toMb(mem.heapUsed);
          const heapTotalMb = toMb(mem.heapTotal);
          const freedMb = Math.max(0, heapTotalMb - heapUsedMb);
          this.gcMajorCount++;
          this.gcTotalFreedBytes += freedMb * 1024 * 1024;
          this.logger.debug("Major GC event", { tag: "DIAGNOSTICS", durationMs, freedMb });
          this.emitter?.emit("gc:major", { durationMs, freedMb });
        }
      });
      this.gcObserver.observe({ entryTypes: ["gc"], buffered: false });
    } catch {
    }
  }
  startMemoryMonitoring() {
    this.memoryPollTimer = setInterval(() => {
      const mem = process.memoryUsage();
      const heapUsedMb = toMb(mem.heapUsed);
      const heapTotalMb = toMb(mem.heapTotal);
      if (heapUsedMb > MEMORY_HIGH_THRESHOLD_MB) {
        this.logger.warn("High memory usage detected", {
          tag: "DIAGNOSTICS",
          heapUsedMb,
          heapTotalMb,
          threshold: MEMORY_HIGH_THRESHOLD_MB
        });
        this.emitter?.emit("memory:high", {
          heapUsedMb,
          heapTotalMb,
          threshold: MEMORY_HIGH_THRESHOLD_MB
        });
      }
    }, MEMORY_POLL_INTERVAL_MS);
    this.memoryPollTimer.unref?.();
  }
  /** Called by the HTTP layer to track request metrics. */
  recordHttpRequest(latencyMs, isError) {
    this.httpRequestCount++;
    this.httpLatencies.push(latencyMs);
    if (this.httpLatencies.length > 1e4) {
      this.httpLatencies.splice(0, this.httpLatencies.length - 1e4);
    }
    if (isError) this.httpErrorCount++;
  }
  /** Called by the MQTT layer to track connection state. */
  recordMqttState(isConnected, reconnectCount, lastReconnectMs) {
    this.mqttConnected = isConnected;
    this.mqttReconnectCount = reconnectCount;
    if (lastReconnectMs !== null) this.mqttLastReconnectMs = lastReconnectMs;
  }
  getStats() {
    const tokens = this.getTokens();
    const cacheStats = this.cache.getStats();
    const mem = process.memoryUsage();
    const sorted = [...this.httpLatencies].sort((a, b) => a - b);
    const p = (pct) => {
      if (sorted.length === 0) return 0;
      const idx = Math.floor(pct / 100 * sorted.length);
      return sorted[Math.min(idx, sorted.length - 1)] ?? 0;
    };
    return {
      session: {
        startedAt: this.startedAt,
        userId: tokens.userId,
        isConnected: this.getIsConnected()
      },
      http: {
        requestCount: this.httpRequestCount,
        errorCount: this.httpErrorCount,
        p50Ms: Math.round(p(50)),
        p90Ms: Math.round(p(90)),
        p99Ms: Math.round(p(99))
      },
      mqtt: {
        isConnected: this.mqttConnected,
        reconnectCount: this.mqttReconnectCount,
        lastReconnectMs: this.mqttLastReconnectMs
      },
      cache: cacheStats,
      memory: {
        heapUsedMb: toMb(mem.heapUsed),
        heapTotalMb: toMb(mem.heapTotal),
        rss: toMb(mem.rss)
      },
      gc: {
        majorCount: this.gcMajorCount,
        totalFreedMb: Math.round(this.gcTotalFreedBytes / 1024 / 1024)
      },
      uptime: Math.round((Date.now() - this.startedAt.getTime()) / 1e3)
    };
  }
  async heapSnapshot(outputPath) {
    this.logger.info("Writing heap snapshot", { tag: "DIAGNOSTICS", outputPath });
    return new Promise((resolve, reject) => {
      const session = new import_node_inspector.Session();
      session.connect();
      const chunks = [];
      session.on("HeapProfiler.addHeapSnapshotChunk", ({ params }) => {
        chunks.push(params.chunk);
      });
      session.post("HeapProfiler.takeHeapSnapshot", { reportProgress: false }, (err) => {
        session.disconnect();
        if (err) {
          reject(err);
          return;
        }
        (0, import_promises3.writeFile)(outputPath, chunks.join(""), "utf8").then(resolve).catch(reject);
      });
    });
  }
  async healthCheck() {
    this.logger.debug("Running health check", { tag: "DIAGNOSTICS" });
    const checkedAt = /* @__PURE__ */ new Date();
    let latencyMs = 0;
    let ok = true;
    const details = {};
    try {
      const start = performance.now();
      latencyMs = await this.runHealthPing();
      if (latencyMs === 0) latencyMs = Math.round(performance.now() - start);
      details["http"] = "ok";
      details["mqtt"] = this.mqttConnected ? "connected" : "disconnected";
    } catch (err) {
      ok = false;
      details["error"] = err instanceof Error ? err.message : String(err);
    }
    const stats = this.getStats();
    details["uptime"] = stats.uptime;
    details["heapUsedMb"] = stats.memory.heapUsedMb;
    if (ok) {
      this.emitter?.emit("account:healthy", { checkedAt });
    }
    return { ok, latencyMs, checkedAt, details };
  }
  /** Stop background monitoring timers. Call on client disconnect. */
  destroy() {
    if (this.gcObserver) {
      try {
        this.gcObserver.disconnect();
      } catch {
      }
      this.gcObserver = null;
    }
    if (this.memoryPollTimer) {
      clearInterval(this.memoryPollTimer);
      this.memoryPollTimer = null;
    }
  }
};

// src/client/index.ts
var PandindiganClient = class {
  messages;
  threads;
  users;
  presence;
  search;
  files;
  polls;
  stickers;
  sessions;
  auth;
  diagnostics;
  /** @internal */
  http;
  /** @internal */
  mqtt;
  /** @internal */
  jar;
  /** @internal */
  storage;
  /** @internal */
  sessionStore;
  /** @internal */
  config;
  /** @internal */
  logger;
  /** @internal */
  cache;
  /** @internal — the single shared emitter for all subsystems */
  emitter;
  // ─── Typed event delegation ───────────────────────────────────────────────
  on(event, listener) {
    this.emitter.on(event, listener);
    return this;
  }
  off(event, listener) {
    this.emitter.off(event, listener);
    return this;
  }
  once(event, listener) {
    this.emitter.once(event, listener);
    return this;
  }
  /** @internal — ProxyManager for the MQTT WebSocket agent; closed on disconnect. */
  mqttProxyManager;
  /** @internal — use {@link createClient} */
  constructor(internal) {
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
      this.emitter
    );
  }
  /**
   * Open the real-time MQTT/WebSocket connection to receive live events.
   * Must be called after {@link createClient} if you need real-time events.
   */
  async login() {
    await this.mqtt.connect();
  }
  /**
   * @deprecated Use {@link PandindiganClient.login} instead. `connect()` is
   * kept as a backward-compatible alias and will be removed in a future
   * major version.
   */
  async connect() {
    await this.login();
  }
  /**
   * Gracefully disconnect — drains queued operations, sends MQTT DISCONNECT,
   * persists the updated AppState (when autoPersist is on), and closes all
   * connections.
   */
  async disconnect() {
    this.logger.info("Disconnecting client", { tag: "CLIENT" });
    this.auth.stopTimers();
    this.diagnostics.destroy();
    if (this.config.refresh.autoPersist) {
      try {
        const appState = await exportJar(this.jar);
        const userId = this.auth.tokens.userId;
        await this.sessionStore.save(userId, appState, { userId });
        this.logger.debug("AppState persisted to the configured session store on disconnect", {
          tag: "CLIENT",
          userId
        });
      } catch (err) {
        this.logger.warn("Failed to persist AppState on disconnect", { tag: "CLIENT", err });
      }
    }
    await this.mqtt.disconnect();
    await this.http.close();
    if (this.mqttProxyManager) {
      try {
        await this.mqttProxyManager.close();
      } catch {
      }
    }
    await this.sessionStore.close();
    if (this.storage.close) await this.storage.close();
    this.logger.info("Client disconnected", { tag: "CLIENT" });
  }
};
var login = (options = {}) => createClient(options);
async function createClient(options = {}) {
  const _startupStartMs = performance.now();
  const rawOverrides = {};
  if (options.logLevel) rawOverrides["logLevel"] = options.logLevel;
  if (options.logPretty !== void 0) rawOverrides["logPretty"] = options.logPretty;
  if (options.session) rawOverrides["session"] = options.session;
  if (options.refresh) rawOverrides["refresh"] = options.refresh;
  if (options.keepalive) rawOverrides["keepalive"] = options.keepalive;
  if (options.stealth) rawOverrides["stealth"] = options.stealth;
  if (options.proxy) {
    if (typeof options.proxy === "string") {
      rawOverrides["proxy"] = { url: options.proxy };
    } else {
      rawOverrides["proxy"] = options.proxy;
    }
  }
  if (options.http) rawOverrides["http"] = options.http;
  if (options.cache) rawOverrides["cache"] = options.cache;
  const config = loadConfig(rawOverrides);
  const logger = options.logger ?? createLogger({
    level: config.logLevel,
    pretty: config.logPretty,
    bindings: { tag: "PFCA" }
  });
  logger.info("Initializing panindigan-fca client", { tag: "CLIENT" });
  const appStateResult = loadAppState({
    appState: options.appState,
    appStatePath: options.appStatePath,
    debugAppState: options.debugAppState,
    logger
  });
  const resolvedAppState = appStateResult.valid ? appStateResult.cookies : void 0;
  if (!resolvedAppState && !options.credentials) {
    if (!options.session?.persistPath && !process.env["PFCA_SESSION_PERSIST_PATH"]) {
      throw new ConfigurationError(
        "createClient requires either appState, credentials, a session.persistPath to restore from, or one of APPSTATE / APPSTATE_JSON / APPSTATE_BASE64 / ./appstate.json in the environment"
      );
    }
  }
  const emitter = new TypedEventEmitter();
  const storage = options.storage ?? await createStorageAdapter(config, logger);
  const sessionStore = new LibSqlSessionStore();
  const { jar } = await resolveJar({
    appState: resolvedAppState,
    userId: options.userId,
    config,
    storage,
    emitter,
    logger,
    sessionStore
  });
  const cache = new CacheManager({ maxSize: config.cache.maxSize, ttlMs: config.cache.ttl });
  const stealth = new StealthManager(config.stealth, emitter, logger);
  const pipeline2 = new MiddlewarePipeline();
  for (const mw of options.middleware ?? []) pipeline2.use(mw);
  const http = new HttpClient(jar, config, stealth, pipeline2, logger, emitter);
  await http.init();
  const auth = await createAuthManager({
    appState: resolvedAppState,
    credentials: options.credentials,
    jar,
    http,
    emitter,
    storage,
    config,
    logger: logger.child({ tag: "AUTH" })
  });
  try {
    const latestAppState = await exportJar(jar);
    await sessionStore.save(auth.tokens.userId, latestAppState, { userId: auth.tokens.userId });
    logger.debug("Session keyed under userId", { tag: "SESSION", userId: auth.tokens.userId });
  } catch (err) {
    logger.warn("Failed to key session under userId \u2014 will retry on disconnect", { tag: "SESSION", err });
  }
  auth.startRefreshTimer();
  if (config.keepalive.enabled) {
    auth.startKeepaliveTimer();
  }
  const getTokens = () => auth.tokens;
  const mqttProxyUrl = config.proxy.url ?? config.proxy.pool[0] ?? null;
  let wsAgent;
  let mqttProxyManager;
  if (mqttProxyUrl) {
    try {
      mqttProxyManager = new ProxyManager(mqttProxyUrl);
      wsAgent = await mqttProxyManager.getWebSocketAgent();
      logger.debug("WebSocket proxy agent ready", {
        tag: "MQTT",
        proxy: mqttProxyManager.maskedUrl,
        protocol: mqttProxyManager.protocol
      });
    } catch (err) {
      logger.warn("Failed to create WebSocket proxy agent \u2014 MQTT will connect directly", {
        tag: "MQTT",
        proxy: maskProxyUrl(mqttProxyUrl),
        err
      });
      mqttProxyManager = void 0;
    }
  }
  let presenceModuleRef = null;
  const mqtt = new MqttClient(
    jar,
    auth.tokens.userId,
    emitter,
    config,
    logger,
    (userId, isOnline, lastActiveAt) => presenceModuleRef?.updateCache(userId, isOnline, lastActiveAt),
    wsAgent
  );
  const _startupDurationMs = Math.round(performance.now() - _startupStartMs);
  logger.success("Client ready", {
    tag: "STARTUP",
    userId: auth.tokens.userId,
    startupDurationMs: _startupDurationMs,
    storageAdapter: config.storage.adapter,
    stealthLevel: config.stealth.level,
    logLevel: config.logLevel,
    proxy: config.proxy.url ?? (config.proxy.pool.length > 0 ? `pool(${config.proxy.pool.length})` : null),
    mem: (() => {
      const m = process.memoryUsage();
      return `${Math.round(m.heapUsed / 1024 / 1024)}MB`;
    })()
  });
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
    mqttProxyManager
  });
  presenceModuleRef = client.presence;
  http.setRequestRecorder((latencyMs, isError) => {
    client.diagnostics.recordHttpRequest(latencyMs, isError);
  });
  emitter.on("connected", () => {
    client.diagnostics.recordMqttState(true, mqtt.getStats().reconnectCount, null);
  });
  emitter.on("disconnected", () => {
    client.diagnostics.recordMqttState(false, mqtt.getStats().reconnectCount, null);
  });
  emitter.on("reconnected", (ev) => {
    client.diagnostics.recordMqttState(true, mqtt.getStats().reconnectCount, ev.durationMs);
  });
  emitter.on("reconnect:failed", () => {
    client.diagnostics.recordMqttState(false, mqtt.getStats().reconnectCount, null);
  });
  emitter.on("account:refresh", (ev) => {
    sessionStore.save(ev.userId, ev.appState, { userId: ev.userId }).then(() => logger.debug("Session updated after cookie refresh", {
      tag: "SESSION",
      userId: ev.userId,
      cookieCount: ev.cookieCount
    })).catch((err) => logger.warn("Failed to persist refreshed session", {
      tag: "SESSION",
      userId: ev.userId,
      err
    }));
  });
  return client;
}

// src/network/index.ts
var import_promises4 = require("dns/promises");
var DNS_TTL_MS = 5 * 60 * 1e3;
var dnsCache = /* @__PURE__ */ new Map();
async function resolveWithCache(hostname) {
  const cached = dnsCache.get(hostname);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.addresses[Math.floor(Math.random() * cached.addresses.length)];
  }
  const results = await (0, import_promises4.lookup)(hostname, { all: true, family: 4 });
  const addresses = results.map((r) => r.address);
  dnsCache.set(hostname, { addresses, expiresAt: Date.now() + DNS_TTL_MS });
  return addresses[Math.floor(Math.random() * addresses.length)];
}
function clearDnsCache() {
  dnsCache.clear();
}

// src/api/index.ts
var API_ENDPOINTS = {
  // ── Authentication ────────────────────────────────────────────────────────
  login: {
    name: "login",
    method: "POST",
    url: FB_LOGIN_URL,
    description: "Email and password credential login. Returns session cookies.",
    requiredParams: ["email", "pass", "fb_dtsg_ag", "jazoest"]
  },
  logout: {
    name: "logout",
    method: "POST",
    url: FB_LOGOUT_URL,
    description: "Invalidates the current session and clears all session cookies.",
    requiredParams: ["fb_dtsg", "ref"]
  },
  // ── Messaging ─────────────────────────────────────────────────────────────
  messageSend: {
    name: "messageSend",
    method: "POST",
    url: FB_MESSAGING_SEND,
    description: "Send a text message, sticker, or file attachment to a thread.",
    requiredParams: ["thread_fbid", "fb_dtsg", "lsd"]
  },
  messageDelete: {
    name: "messageDelete",
    method: "POST",
    url: `${FB_BASE_URL}/ajax/mercury/delete_messages.php`,
    description: "Remove a message from the authenticated user's own view (not unsend).",
    requiredParams: ["message_ids[]", "fb_dtsg", "lsd"]
  },
  messageMarkRead: {
    name: "messageMarkRead",
    method: "POST",
    url: FB_API_GRAPHQL,
    description: "Mark all messages in a thread up to a watermark as read.",
    requiredParams: ["variables", "fb_dtsg", "lsd"]
  },
  setTypingIndicator: {
    name: "setTypingIndicator",
    method: "POST",
    url: `${FB_BASE_URL}/ajax/messaging/typ.php`,
    description: "Emit or clear a typing indicator in a thread.",
    requiredParams: ["thread", "typ", "fb_dtsg", "lsd"]
  },
  // ── Threads ───────────────────────────────────────────────────────────────
  threadList: {
    name: "threadList",
    method: "POST",
    url: FB_API_GRAPHQL,
    description: "Paginated list of the authenticated user's conversation threads.",
    requiredParams: ["variables", "fb_dtsg", "lsd"]
  },
  threadInfo: {
    name: "threadInfo",
    method: "POST",
    url: FB_API_GRAPHQL,
    description: "Full metadata for a single thread by its thread ID.",
    requiredParams: ["variables", "fb_dtsg", "lsd"]
  },
  threadCreate: {
    name: "threadCreate",
    method: "POST",
    url: FB_API_GRAPHQL,
    description: "Create a new group chat with an initial list of participant IDs.",
    requiredParams: ["variables", "fb_dtsg", "lsd"]
  },
  threadRename: {
    name: "threadRename",
    method: "POST",
    url: FB_API_GRAPHQL,
    description: "Rename a group conversation thread.",
    requiredParams: ["variables", "fb_dtsg", "lsd"]
  },
  threadSetPhoto: {
    name: "threadSetPhoto",
    method: "POST",
    url: `${FB_BASE_URL}/ajax/messaging/set_thread_image.php`,
    description: "Set or update the group photo for a thread. Multipart upload.",
    requiredParams: ["thread_image", "thread_fbid", "fb_dtsg", "lsd"]
  },
  threadAddParticipants: {
    name: "threadAddParticipants",
    method: "POST",
    url: FB_API_GRAPHQL,
    description: "Add one or more participants to an existing group thread.",
    requiredParams: ["variables", "fb_dtsg", "lsd"]
  },
  threadRemoveParticipant: {
    name: "threadRemoveParticipant",
    method: "POST",
    url: FB_API_GRAPHQL,
    description: "Remove a single participant from a group thread.",
    requiredParams: ["variables", "fb_dtsg", "lsd"]
  },
  threadLeave: {
    name: "threadLeave",
    method: "POST",
    url: `${FB_BASE_URL}/ajax/mercury/leave_thread.php`,
    description: "Remove the authenticated account from a group thread.",
    requiredParams: ["thread_fbid", "fb_dtsg", "lsd"]
  },
  threadMute: {
    name: "threadMute",
    method: "POST",
    url: FB_API_GRAPHQL,
    description: "Mute notifications for a thread, optionally for a duration.",
    requiredParams: ["variables", "fb_dtsg", "lsd"]
  },
  threadArchive: {
    name: "threadArchive",
    method: "POST",
    url: FB_API_GRAPHQL,
    description: "Move a thread to the archived folder or restore it.",
    requiredParams: ["variables", "fb_dtsg", "lsd"]
  },
  // ── Files ─────────────────────────────────────────────────────────────────
  fileUpload: {
    name: "fileUpload",
    method: "POST",
    url: FB_UPLOAD_URL,
    description: "Upload a binary file attachment. Responds with a server-assigned attachment ID.",
    requiredParams: ["upload_id", "fb_dtsg", "lsd"]
  },
  // ── Users ─────────────────────────────────────────────────────────────────
  userProfile: {
    name: "userProfile",
    method: "POST",
    url: FB_API_GRAPHQL,
    description: "Fetch public profile information for any Facebook user.",
    requiredParams: ["variables", "fb_dtsg", "lsd"]
  },
  selfProfile: {
    name: "selfProfile",
    method: "POST",
    url: FB_API_GRAPHQL,
    description: "Fetch the profile of the currently authenticated account.",
    requiredParams: ["variables", "fb_dtsg", "lsd"]
  },
  friendList: {
    name: "friendList",
    method: "POST",
    url: FB_API_GRAPHQL,
    description: "Paginated list of the authenticated user's friends.",
    requiredParams: ["variables", "fb_dtsg", "lsd"]
  },
  userSearch: {
    name: "userSearch",
    method: "POST",
    url: FB_API_GRAPHQL,
    description: "Full-text search for Facebook users by name.",
    requiredParams: ["variables", "fb_dtsg", "lsd"]
  },
  // ── Search ────────────────────────────────────────────────────────────────
  searchMessages: {
    name: "searchMessages",
    method: "POST",
    url: FB_API_GRAPHQL,
    description: "Full-text search across the authenticated user's messages.",
    requiredParams: ["variables", "fb_dtsg", "lsd"]
  },
  searchThreads: {
    name: "searchThreads",
    method: "POST",
    url: FB_API_GRAPHQL,
    description: "Search conversation threads by name or participant.",
    requiredParams: ["variables", "fb_dtsg", "lsd"]
  },
  // ── Reactions ─────────────────────────────────────────────────────────────
  messageReact: {
    name: "messageReact",
    method: "POST",
    url: FB_API_GRAPHQL,
    description: "Add or remove an emoji reaction on a specific message.",
    requiredParams: ["variables", "fb_dtsg", "lsd"]
  },
  messageGetReactions: {
    name: "messageGetReactions",
    method: "POST",
    url: FB_API_GRAPHQL,
    description: "Retrieve all emoji reactions on a single message.",
    requiredParams: ["variables", "fb_dtsg", "lsd"]
  },
  // ── Polls ─────────────────────────────────────────────────────────────────
  pollCreate: {
    name: "pollCreate",
    method: "POST",
    url: FB_API_GRAPHQL,
    description: "Create a poll with a question and answer options in a thread.",
    requiredParams: ["variables", "fb_dtsg", "lsd"]
  },
  pollVote: {
    name: "pollVote",
    method: "POST",
    url: FB_API_GRAPHQL,
    description: "Cast a vote on a poll option.",
    requiredParams: ["variables", "fb_dtsg", "lsd"]
  },
  pollResults: {
    name: "pollResults",
    method: "POST",
    url: FB_API_GRAPHQL,
    description: "Fetch current vote counts for all options in a poll.",
    requiredParams: ["variables", "fb_dtsg", "lsd"]
  },
  // ── Stickers ──────────────────────────────────────────────────────────────
  stickerSend: {
    name: "stickerSend",
    method: "POST",
    url: FB_MESSAGING_SEND,
    description: "Send a sticker to a thread using its sticker ID.",
    requiredParams: ["sticker_id", "thread_fbid", "fb_dtsg", "lsd"]
  },
  stickerPack: {
    name: "stickerPack",
    method: "POST",
    url: FB_API_GRAPHQL,
    description: "Retrieve all sticker metadata for a sticker pack.",
    requiredParams: ["variables", "fb_dtsg", "lsd"]
  },
  // ── Presence ──────────────────────────────────────────────────────────────
  presenceGet: {
    name: "presenceGet",
    method: "POST",
    url: FB_API_GRAPHQL,
    description: "Fetch the current online/offline presence status of one or more users.",
    requiredParams: ["variables", "fb_dtsg", "lsd"]
  },
  presenceSet: {
    name: "presenceSet",
    method: "POST",
    url: FB_API_GRAPHQL,
    description: "Set whether the authenticated account appears online to other users.",
    requiredParams: ["variables", "fb_dtsg", "lsd"]
  }
};
function getEndpointUrl(name) {
  return API_ENDPOINTS[name].url;
}
function isGraphQLEndpoint(url) {
  return url === FB_API_GRAPHQL;
}
function isMessageSendEndpoint(url) {
  return url.startsWith(FB_MESSAGING_SEND);
}

// src/requests/index.ts
function encodeFormBody(params) {
  const parts = [];
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((v, i) => {
        parts.push(
          `${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(v)}`
        );
      });
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.join("&");
}
function buildMultipartBody(fields, files, boundary) {
  const CRLF = "\r\n";
  const parts = [];
  for (const field of fields) {
    parts.push(
      Buffer.from(
        `--${boundary}${CRLF}Content-Disposition: form-data; name="${field.name}"${CRLF}${CRLF}${field.value}${CRLF}`,
        "utf8"
      )
    );
  }
  for (const file of files) {
    parts.push(
      Buffer.from(
        `--${boundary}${CRLF}Content-Disposition: form-data; name="${file.fieldName}"; filename="${file.fileName}"${CRLF}Content-Type: ${file.contentType}${CRLF}${CRLF}`,
        "utf8"
      )
    );
    parts.push(file.data);
    parts.push(Buffer.from(CRLF, "utf8"));
  }
  parts.push(Buffer.from(`--${boundary}--${CRLF}`, "utf8"));
  return Buffer.concat(parts);
}
function generateBoundary() {
  return `----PFCABoundary${randomHex(16)}`;
}
function buildJsonBody(data) {
  return JSON.stringify(data);
}
function buildGraphQLBody(options) {
  const friendlyName = options.friendlyName ?? (options.queryName ? GRAPHQL_FRIENDLY_NAMES[options.queryName] : "PandindiganQuery");
  const params = {
    variables: JSON.stringify(options.variables),
    server_timestamps: "true",
    fb_api_req_friendly_name: friendlyName,
    fb_dtsg: options.dtsg,
    fb_api_caller_class: "RelayModern",
    __a: "1",
    __comet_req: "15",
    lsd: options.lsd,
    __req: randomHex(2),
    ...options.extraParams
  };
  if (options.docId) params["doc_id"] = options.docId;
  return encodeFormBody(params);
}
function buildGraphQLRequest2(options) {
  const friendlyName = options.friendlyName ?? (options.queryName ? GRAPHQL_FRIENDLY_NAMES[options.queryName] : "PandindiganQuery");
  return {
    url: FB_API_GRAPHQL,
    body: buildGraphQLBody(options),
    friendlyName
  };
}
function buildLightspeedBody(options) {
  return encodeFormBody({
    request_payload: JSON.stringify(options.requestPayload),
    fb_dtsg: options.dtsg,
    lsd: options.lsd,
    __a: "1",
    ...options.appId ? { app_id: options.appId } : {},
    ...options.queryId ? { query_id: options.queryId } : {}
  });
}
function buildFormRequest3(options) {
  const params = { ...options.params };
  if (options.dtsg) {
    params["fb_dtsg"] = options.dtsg;
  }
  if (options.lsd) {
    params["lsd"] = options.lsd;
  }
  return { url: options.url, body: encodeFormBody(params) };
}
function makeFormRequestSpec(url, body) {
  return {
    url,
    method: "POST",
    headers: {},
    body,
    contentType: "application/x-www-form-urlencoded"
  };
}
function makeMultipartRequestSpec(url, body, boundary) {
  return {
    url,
    method: "POST",
    headers: {
      "content-type": `multipart/form-data; boundary=${boundary}`,
      "content-length": String(body.byteLength)
    },
    body,
    contentType: `multipart/form-data; boundary=${boundary}`
  };
}

// src/responses/index.ts
var import_zod2 = require("zod");
var IdSchema = import_zod2.z.union([import_zod2.z.string(), import_zod2.z.number()]).transform((v) => String(v));
var TimestampSchema = import_zod2.z.union([import_zod2.z.string(), import_zod2.z.number()]).transform((v) => {
  if (typeof v === "string") {
    const n = Number(v);
    if (!Number.isNaN(n)) {
      const ms2 = n > 1e12 ? n : n * 1e3;
      return new Date(ms2);
    }
    const parsed = Date.parse(v);
    return new Date(Number.isNaN(parsed) ? 0 : parsed);
  }
  const ms = v > 1e12 ? v : v * 1e3;
  return new Date(ms);
});
function stripFbPrefix(text) {
  return text.startsWith("for (;;);") ? text.slice(9) : text;
}
function parseRawResponse(text) {
  try {
    return JSON.parse(stripFbPrefix(text));
  } catch (err) {
    throw new DeserializationError(
      `Failed to parse Facebook response: ${err.message}`,
      { preview: text.slice(0, 200) },
      err
    );
  }
}
function validate(schema, data, context) {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  const issues = result.error.issues.slice(0, 5).map((i) => `  [${i.path.join(".")}] ${i.message}`).join("\n");
  throw new ResponseValidationError(
    `Response validation failed${context ? ` (${context})` : ""}:
${issues}`,
    {
      context,
      issues: result.error.issues.slice(0, 5),
      preview: JSON.stringify(data).slice(0, 300)
    },
    result.error
  );
}
var AttachmentSchema = import_zod2.z.object({
  id: IdSchema.optional().default(""),
  type: import_zod2.z.string().optional().default("unknown"),
  url: import_zod2.z.string().optional(),
  name: import_zod2.z.string().optional(),
  size: import_zod2.z.number().optional()
});
var MessageNodeSchema = import_zod2.z.object({
  message_id: IdSchema.optional(),
  id: IdSchema.optional(),
  timestamp_precise: TimestampSchema.optional(),
  timestamp: TimestampSchema.optional(),
  message: import_zod2.z.object({ text: import_zod2.z.string().nullable().optional() }).nullable().optional(),
  message_sender: import_zod2.z.object({
    id: IdSchema.optional(),
    name: import_zod2.z.string().optional()
  }).optional(),
  blob_attachments: import_zod2.z.array(AttachmentSchema).optional(),
  sticker: import_zod2.z.object({ id: IdSchema.optional(), label: import_zod2.z.string().optional() }).nullable().optional()
});
var MessageListResponseSchema = import_zod2.z.object({
  data: import_zod2.z.object({
    viewer: import_zod2.z.object({
      message_thread: import_zod2.z.object({
        thread_key: import_zod2.z.object({ thread_fbid: IdSchema.optional() }).optional(),
        messages: import_zod2.z.object({
          edges: import_zod2.z.array(
            import_zod2.z.object({
              node: MessageNodeSchema
            })
          ),
          page_info: import_zod2.z.object({
            has_previous_page: import_zod2.z.boolean().optional().default(false),
            start_cursor: import_zod2.z.string().nullable().optional()
          })
        })
      }).optional()
    }).optional()
  }).optional()
}).passthrough();
var SendMessageResponseSchema = import_zod2.z.object({
  payload: import_zod2.z.object({
    message_id: import_zod2.z.string().optional(),
    timestamp: TimestampSchema.optional()
  }).passthrough().optional(),
  error: import_zod2.z.number().optional(),
  errorSummary: import_zod2.z.string().optional()
}).passthrough();
var ParticipantSchema = import_zod2.z.object({
  id: IdSchema,
  name: import_zod2.z.string().optional().default(""),
  profile_picture: import_zod2.z.object({ uri: import_zod2.z.string().optional() }).nullable().optional()
});
var ThreadNodeSchema = import_zod2.z.object({
  thread_key: import_zod2.z.object({ thread_fbid: IdSchema.optional(), other_user_id: IdSchema.optional() }).optional(),
  id: IdSchema.optional(),
  name: import_zod2.z.string().nullable().optional(),
  image: import_zod2.z.object({ uri: import_zod2.z.string() }).nullable().optional(),
  is_group_thread: import_zod2.z.boolean().optional().default(false),
  all_participants: import_zod2.z.object({
    edges: import_zod2.z.array(
      import_zod2.z.object({ node: ParticipantSchema })
    ).optional().default([])
  }).optional(),
  unread_count: import_zod2.z.number().optional().default(0),
  mute_until: TimestampSchema.optional(),
  folder: import_zod2.z.string().optional(),
  updated_time_precise: TimestampSchema.optional(),
  last_message: import_zod2.z.object({
    nodes: import_zod2.z.array(MessageNodeSchema).optional()
  }).optional()
});
var ThreadEdgeSchema = import_zod2.z.object({ node: ThreadNodeSchema });
var ThreadListResponseSchema = import_zod2.z.object({
  data: import_zod2.z.object({
    // Connection may be under viewer.message_threads, user.message_threads,
    // or the top-level message_threads key — accept any.
    viewer: import_zod2.z.object({
      message_threads: import_zod2.z.object({
        edges: import_zod2.z.array(ThreadEdgeSchema).optional().default([]),
        page_info: import_zod2.z.object({
          has_next_page: import_zod2.z.boolean().optional().default(false),
          end_cursor: import_zod2.z.string().nullable().optional()
        }).optional()
      }).optional(),
      threads: import_zod2.z.object({
        edges: import_zod2.z.array(ThreadEdgeSchema).optional().default([]),
        page_info: import_zod2.z.object({
          has_next_page: import_zod2.z.boolean().optional().default(false),
          end_cursor: import_zod2.z.string().nullable().optional()
        }).optional()
      }).optional()
    }).optional(),
    user: import_zod2.z.object({
      message_threads: import_zod2.z.object({
        edges: import_zod2.z.array(ThreadEdgeSchema).optional().default([]),
        page_info: import_zod2.z.object({
          has_next_page: import_zod2.z.boolean().optional().default(false),
          end_cursor: import_zod2.z.string().nullable().optional()
        }).optional()
      }).optional()
    }).optional(),
    message_threads: import_zod2.z.object({
      edges: import_zod2.z.array(ThreadEdgeSchema).optional().default([]),
      page_info: import_zod2.z.object({
        has_next_page: import_zod2.z.boolean().optional().default(false),
        end_cursor: import_zod2.z.string().nullable().optional()
      }).optional()
    }).optional()
  }).optional()
}).passthrough();
var UserProfileSchema = import_zod2.z.object({
  id: IdSchema,
  name: import_zod2.z.string().optional().default(""),
  username: import_zod2.z.string().nullable().optional(),
  profile_picture: import_zod2.z.object({ uri: import_zod2.z.string().optional() }).nullable().optional(),
  friends_count: import_zod2.z.number().nullable().optional(),
  mutual_friends: import_zod2.z.object({ count: import_zod2.z.number().optional() }).nullable().optional(),
  is_friend: import_zod2.z.boolean().optional()
});
var UserProfileResponseSchema = import_zod2.z.object({
  data: import_zod2.z.object({
    user: UserProfileSchema.optional(),
    viewer: import_zod2.z.object({ actor: UserProfileSchema.optional() }).optional()
  }).optional()
}).passthrough();
var FriendListResponseSchema = import_zod2.z.object({
  data: import_zod2.z.object({
    viewer: import_zod2.z.object({
      friends: import_zod2.z.object({
        edges: import_zod2.z.array(
          import_zod2.z.object({ node: UserProfileSchema })
        ).optional().default([]),
        page_info: import_zod2.z.object({
          has_next_page: import_zod2.z.boolean().optional().default(false),
          end_cursor: import_zod2.z.string().nullable().optional()
        }).optional()
      }).optional()
    }).optional()
  }).optional()
}).passthrough();
var PresenceEntrySchema = import_zod2.z.object({
  user_id: IdSchema.optional(),
  // Facebook uses is_online or is_present depending on API version
  is_online: import_zod2.z.boolean().optional(),
  is_present: import_zod2.z.boolean().optional(),
  is_active: import_zod2.z.boolean().optional(),
  // Seconds-precision Unix timestamp — last_active_time or last_active
  last_active_time: import_zod2.z.union([import_zod2.z.string(), import_zod2.z.number()]).optional(),
  last_active: import_zod2.z.union([import_zod2.z.string(), import_zod2.z.number()]).optional()
});
var PresenceResponseSchema = import_zod2.z.object({
  data: import_zod2.z.object({
    user: import_zod2.z.object({
      presence_data: PresenceEntrySchema.optional(),
      // fallback: some queries nest under user directly
      is_online: import_zod2.z.boolean().optional(),
      is_present: import_zod2.z.boolean().optional(),
      last_active_time: import_zod2.z.union([import_zod2.z.string(), import_zod2.z.number()]).optional()
    }).optional(),
    presence: import_zod2.z.object({
      presence_data: PresenceEntrySchema.optional()
    }).optional()
  }).optional()
}).passthrough();
var PollOptionSchema = import_zod2.z.object({
  id: IdSchema.optional(),
  text: import_zod2.z.string(),
  vote_count: import_zod2.z.number().optional().default(0),
  voters: import_zod2.z.array(IdSchema).optional().default([])
});
var PollResponseSchema = import_zod2.z.object({
  data: import_zod2.z.object({
    poll: import_zod2.z.object({
      id: IdSchema.optional(),
      title: import_zod2.z.string().optional(),
      options: import_zod2.z.array(PollOptionSchema).optional().default([]),
      total_vote_count: import_zod2.z.number().optional().default(0),
      expiration_time: TimestampSchema.optional()
    }).optional()
  }).optional()
}).passthrough();
var MessageSearchNodeSchema = import_zod2.z.object({
  message_id: IdSchema.optional(),
  id: IdSchema.optional(),
  thread_key: import_zod2.z.object({ thread_fbid: IdSchema.optional() }).optional(),
  // Sender info appears on message search nodes
  sender: import_zod2.z.object({ id: IdSchema.optional(), name: import_zod2.z.string().optional() }).optional(),
  text: import_zod2.z.string().optional(),
  snippet: import_zod2.z.string().optional(),
  timestamp: import_zod2.z.union([import_zod2.z.string(), import_zod2.z.number()]).optional()
});
var MessageSearchResponseSchema = import_zod2.z.object({
  data: import_zod2.z.object({
    // Both message and thread searches use the search_results key
    search_results: import_zod2.z.object({
      edges: import_zod2.z.array(
        import_zod2.z.object({ node: MessageSearchNodeSchema })
      ).optional().default([]),
      page_info: import_zod2.z.object({
        has_next_page: import_zod2.z.boolean().optional().default(false),
        end_cursor: import_zod2.z.string().nullable().optional()
      }).optional()
    }).optional()
  }).optional()
}).passthrough();
var ThreadSearchNodeSchema = import_zod2.z.object({
  id: IdSchema.optional(),
  thread_key: import_zod2.z.union([IdSchema, import_zod2.z.object({ thread_fbid: IdSchema.optional() })]).optional(),
  name: import_zod2.z.string().nullable().optional(),
  is_group_thread: import_zod2.z.boolean().optional().default(false),
  all_participants: import_zod2.z.array(
    import_zod2.z.union([
      import_zod2.z.object({ node: import_zod2.z.object({ name: import_zod2.z.string().optional() }).passthrough() }),
      import_zod2.z.object({ name: import_zod2.z.string().optional() }).passthrough()
    ])
  ).optional(),
  last_message: import_zod2.z.object({ timestamp: import_zod2.z.union([import_zod2.z.string(), import_zod2.z.number()]).optional() }).optional()
});
var ThreadSearchResponseSchema = import_zod2.z.object({
  data: import_zod2.z.object({
    search_results: import_zod2.z.object({
      edges: import_zod2.z.array(
        import_zod2.z.object({ node: ThreadSearchNodeSchema })
      ).optional().default([]),
      page_info: import_zod2.z.object({
        has_next_page: import_zod2.z.boolean().optional().default(false),
        end_cursor: import_zod2.z.string().nullable().optional()
      }).optional()
    }).optional()
  }).optional()
}).passthrough();
var UploadResponseSchema = import_zod2.z.object({
  payload: import_zod2.z.object({
    metadata: import_zod2.z.array(
      import_zod2.z.object({
        fbid: import_zod2.z.union([import_zod2.z.string(), import_zod2.z.number()]).optional(),
        filename: import_zod2.z.string().optional(),
        filetype: import_zod2.z.string().optional(),
        attachment_id: import_zod2.z.union([import_zod2.z.string(), import_zod2.z.number()]).optional()
      })
    ).optional(),
    fbid: import_zod2.z.union([import_zod2.z.string(), import_zod2.z.number()]).optional(),
    attachment_id: import_zod2.z.union([import_zod2.z.string(), import_zod2.z.number()]).optional(),
    attachment_token: import_zod2.z.string().optional()
  }).optional()
}).passthrough();
function extractAttachmentId(raw) {
  const parsed = UploadResponseSchema.safeParse(raw);
  if (!parsed.success) return null;
  const p = parsed.data.payload;
  if (!p) return null;
  const first = p.metadata?.[0];
  const raw_id = first?.fbid ?? first?.attachment_id ?? p.fbid ?? p.attachment_id ?? p.attachment_token;
  return raw_id != null ? String(raw_id) : null;
}
var LoginResponseSchema = import_zod2.z.object({
  jsmods: import_zod2.z.object({
    require: import_zod2.z.array(import_zod2.z.unknown()).optional()
  }).optional(),
  error: import_zod2.z.number().optional(),
  errorSummary: import_zod2.z.string().optional(),
  errorDescription: import_zod2.z.string().optional()
}).passthrough();
function parseThreadListResponse(text) {
  const data = parseRawResponse(text);
  return validate(ThreadListResponseSchema, data, "threadList");
}
function parseMessageListResponse(text) {
  const data = parseRawResponse(text);
  return validate(MessageListResponseSchema, data, "messageList");
}
function parseSendMessageResponse(text) {
  const data = parseRawResponse(text);
  return validate(SendMessageResponseSchema, data, "sendMessage");
}
function parseUserProfileResponse(text) {
  const data = parseRawResponse(text);
  return validate(UserProfileResponseSchema, data, "userProfile");
}
function parseFriendListResponse(text) {
  const data = parseRawResponse(text);
  return validate(FriendListResponseSchema, data, "friendList");
}
function parsePresenceResponse(text) {
  const data = parseRawResponse(text);
  return validate(PresenceResponseSchema, data, "presence");
}
function parsePollResponse(text) {
  const data = parseRawResponse(text);
  return validate(PollResponseSchema, data, "poll");
}
function parseMessageSearchResponse(text) {
  const data = parseRawResponse(text);
  return validate(MessageSearchResponseSchema, data, "messageSearch");
}
function parseThreadSearchResponse(text) {
  const data = parseRawResponse(text);
  return validate(ThreadSearchResponseSchema, data, "threadSearch");
}
function parseUploadResponse(text) {
  const data = parseRawResponse(text);
  return validate(UploadResponseSchema, data, "upload");
}
function parseLoginResponse(text) {
  const data = parseRawResponse(text);
  return validate(LoginResponseSchema, data, "login");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  API_ENDPOINTS,
  AttachmentSchema,
  AuthError,
  AuthManager,
  CacheError,
  CacheManager,
  CheckpointRequiredError,
  ConfigurationError,
  ConnectionError,
  DEFAULT_CACHE_MAX_SIZE,
  DEFAULT_CACHE_TTL_MS,
  DNSError,
  DeserializationError,
  DiagnosticsModule,
  DownloadError,
  FileStorageAdapter,
  FilesModule,
  ForbiddenError,
  FriendListResponseSchema,
  GRAPHQL_FRIENDLY_NAMES,
  HttpClient,
  HttpError,
  InvalidAppStateError,
  LibSqlSessionStore,
  LibSqlStorageAdapter,
  LoginFailedError,
  LoginResponseSchema,
  MemoryStorageAdapter,
  MessageListResponseSchema,
  MessageNodeSchema,
  MessageSearchResponseSchema,
  MessagesModule,
  NetworkError,
  NotFoundError,
  PandindiganClient,
  PandindiganError,
  ParseError,
  PollOptionSchema,
  PollResponseSchema,
  PollsModule,
  PresenceEntrySchema,
  PresenceModule,
  PresenceResponseSchema,
  ProxyError,
  ProxyManager,
  RateLimitError,
  ResponseValidationError,
  SearchModule,
  SendMessageResponseSchema,
  ServerError,
  SessionExpiredError,
  SessionsModule,
  StealthManager,
  StickersModule,
  StorageCircuitOpenError,
  StorageError,
  ThreadListResponseSchema,
  ThreadNodeSchema,
  ThreadSearchResponseSchema,
  ThreadsModule,
  TimeoutError,
  TwoFactorRequiredError,
  TypedEventEmitter,
  UploadError,
  UploadResponseSchema,
  UserProfileResponseSchema,
  UserProfileSchema,
  UsersModule,
  buildFormRequestBody,
  buildGraphQLBody,
  buildGraphQLRequestBody,
  buildJsonBody,
  buildLightspeedBody,
  buildMultipartBody,
  buildStealthHeaders,
  clearDnsCache,
  createClient,
  createLogger,
  cryptoRandomFloat,
  cryptoRandomInt,
  decrypt,
  encodeFormBody,
  encrypt,
  exportJar,
  extractAttachmentId,
  generateBoundary,
  generateFingerprint,
  getEndpointUrl,
  getUserIdFromJar,
  hmac,
  humanDelay,
  hydrateJar,
  isGraphQLEndpoint,
  isMessageSendEndpoint,
  loadAppState,
  loadConfig,
  login,
  makeFormRequestSpec,
  makeMultipartRequestSpec,
  maskProxyUrl,
  normalizeCacheOptions,
  normalizeCookies,
  nsKey,
  parseFriendListResponse,
  parseLoginResponse,
  parseMessageListResponse,
  parseMessageSearchResponse,
  parsePollResponse,
  parsePresenceResponse,
  parseRawResponse,
  parseSendMessageResponse,
  parseThreadListResponse,
  parseThreadSearchResponse,
  parseUploadResponse,
  parseUserProfileResponse,
  randomHex,
  resolveProxyUrl,
  resolveWithCache,
  stripFbPrefix,
  validate,
  validateAppState
});
//# sourceMappingURL=index.cjs.map
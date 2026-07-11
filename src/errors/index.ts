export class PandindiganError extends Error {
  readonly code: string;
  readonly context: Record<string, unknown>;
  override readonly cause: unknown;

  constructor(
    message: string,
    code: string,
    context: Record<string, unknown> = {},
    cause?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
    this.cause = cause;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class NetworkError extends PandindiganError {}

export class ConnectionError extends NetworkError {
  constructor(message: string, context?: Record<string, unknown>, cause?: unknown) {
    super(message, 'PFCA_CONNECTION', context, cause);
  }
}

export class TimeoutError extends NetworkError {
  constructor(message: string, context?: Record<string, unknown>, cause?: unknown) {
    super(message, 'PFCA_TIMEOUT', context, cause);
  }
}

export class DNSError extends NetworkError {
  constructor(message: string, context?: Record<string, unknown>, cause?: unknown) {
    super(message, 'PFCA_DNS', context, cause);
  }
}

export class ProxyError extends NetworkError {
  constructor(message: string, context?: Record<string, unknown>, cause?: unknown) {
    super(message, 'PFCA_PROXY', context, cause);
  }
}

export class AuthError extends PandindiganError {}

export class InvalidAppStateError extends AuthError {
  constructor(message: string, context?: Record<string, unknown>, cause?: unknown) {
    super(message, 'PFCA_INVALID_APPSTATE', context, cause);
  }
}

export class SessionExpiredError extends AuthError {
  constructor(message: string, context?: Record<string, unknown>, cause?: unknown) {
    super(message, 'PFCA_SESSION_EXPIRED', context, cause);
  }
}

export class LoginFailedError extends AuthError {
  constructor(message: string, context?: Record<string, unknown>, cause?: unknown) {
    super(message, 'PFCA_LOGIN_FAILED', context, cause);
  }
}

export class TwoFactorRequiredError extends AuthError {
  constructor(message: string, context?: Record<string, unknown>, cause?: unknown) {
    super(message, 'PFCA_2FA_REQUIRED', context, cause);
  }
}

export class CheckpointRequiredError extends AuthError {
  constructor(
    message: string,
    public readonly checkpointUrl: string,
    context?: Record<string, unknown>,
    cause?: unknown,
  ) {
    super(message, 'PFCA_CHECKPOINT', { checkpointUrl, ...context }, cause);
  }
}

export class LoginApprovalRequiredError extends AuthError {
  constructor(message: string, context?: Record<string, unknown>, cause?: unknown) {
    super(message, 'PFCA_APPROVAL_REQUIRED', context, cause);
  }
}

export class FacebookRateLimitError extends AuthError {
  constructor(message: string, context?: Record<string, unknown>, cause?: unknown) {
    super(message, 'PFCA_FACEBOOK_RATE_LIMIT', context, cause);
  }
}

export class HtmlStructureChangedError extends AuthError {
  constructor(message: string, context?: Record<string, unknown>, cause?: unknown) {
    super(message, 'PFCA_HTML_STRUCTURE_CHANGED', context, cause);
  }
}

export class HttpError extends PandindiganError {
  constructor(
    message: string,
    code: string,
    public readonly statusCode: number,
    context?: Record<string, unknown>,
    cause?: unknown,
  ) {
    super(message, code, { statusCode, ...context }, cause);
  }
}

export class RateLimitError extends HttpError {
  constructor(
    message: string,
    public readonly retryAfterMs: number,
    context?: Record<string, unknown>,
  ) {
    super(message, 'PFCA_RATE_LIMITED', 429, { retryAfterMs, ...context });
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string, context?: Record<string, unknown>, cause?: unknown) {
    super(message, 'PFCA_FORBIDDEN', 403, context, cause);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string, context?: Record<string, unknown>, cause?: unknown) {
    super(message, 'PFCA_NOT_FOUND', 404, context, cause);
  }
}

export class ServerError extends HttpError {
  constructor(
    message: string,
    statusCode: number,
    context?: Record<string, unknown>,
    cause?: unknown,
  ) {
    super(message, 'PFCA_SERVER_ERROR', statusCode, context, cause);
  }
}

export class ParseError extends PandindiganError {}

export class ResponseValidationError extends ParseError {
  constructor(message: string, context?: Record<string, unknown>, cause?: unknown) {
    super(message, 'PFCA_RESPONSE_VALIDATION', context, cause);
  }
}

export class DeserializationError extends ParseError {
  constructor(message: string, context?: Record<string, unknown>, cause?: unknown) {
    super(message, 'PFCA_DESERIALIZATION', context, cause);
  }
}

export class StorageError extends PandindiganError {
  constructor(message: string, context?: Record<string, unknown>, cause?: unknown) {
    super(message, 'PFCA_STORAGE', context, cause);
  }
}

/**
 * Thrown when a request is blocked because the target endpoint's circuit
 * breaker is in the OPEN state. The caller should wait for the recovery window
 * (`circuitBreakerRecoveryMs`) before retrying.
 */
export class StorageCircuitOpenError extends PandindiganError {
  constructor(message: string, context?: Record<string, unknown>, cause?: unknown) {
    super(message, 'PFCA_STORAGE_CIRCUIT_OPEN', context, cause);
  }
}

export class CacheError extends PandindiganError {
  constructor(message: string, context?: Record<string, unknown>, cause?: unknown) {
    super(message, 'PFCA_CACHE', context, cause);
  }
}

export class ConfigurationError extends PandindiganError {
  constructor(message: string, context?: Record<string, unknown>, cause?: unknown) {
    super(message, 'PFCA_CONFIG', context, cause);
  }
}

export class UploadError extends PandindiganError {
  constructor(
    message: string,
    public readonly bytesTransferred: number = 0,
    context?: Record<string, unknown>,
    cause?: unknown,
  ) {
    super(message, 'PFCA_UPLOAD_FAILED', { bytesTransferred, ...context }, cause);
  }
}

export class DownloadError extends PandindiganError {
  constructor(message: string, context?: Record<string, unknown>, cause?: unknown) {
    super(message, 'PFCA_DOWNLOAD_FAILED', context, cause);
  }
}

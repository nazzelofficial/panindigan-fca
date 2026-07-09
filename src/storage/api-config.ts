/**
 * Remote storage API configuration.
 *
 * The client library communicates only with a remote HTTPS storage API.
 * It does not directly access or depend on any database implementation.
 *
 * The storage backend is completely abstracted behind the API layer.
 * The client has no knowledge of the underlying storage implementation.
 *  All persistence is handled through the configured Storage API
 *  or StorageAdapter.
 *
 * Only the remote API service manages database connections, credentials,
 * and storage configuration.
 *
 * Configuration is read from environment variables:
 *   PFCA_STORAGE_API_URL       — remote API base URL
 *   PFCA_STORAGE_API_ENDPOINTS — comma-separated API endpoints for failover
 *   PFCA_STORAGE_API_TOKEN     — optional bearer token for API authentication
 *
 * @internal
 */
const env = (globalThis as any).process?.env ?? {};

export const STORAGE_API_URL: string =
  env['PFCA_STORAGE_API_URL'] ?? '';

/**
 * Remote storage API endpoints for failover (optional).
 *
 * Comma-separated list of additional API endpoints. When provided,
 * each request attempts all endpoints in order before failing.
 */
export const STORAGE_API_ENDPOINTS: string =
  env['PFCA_STORAGE_API_ENDPOINTS'] ?? '';

/**
 * Remote storage API authentication token (optional).
 *
 * Bearer token for API requests. Only required if the remote API enforces auth.
 */
export const STORAGE_API_TOKEN: string =
  env['PFCA_STORAGE_API_TOKEN'] ?? '';

/**
 * Request timeout in milliseconds. Defaults to 10 seconds.
 */
export const STORAGE_API_TIMEOUT_MS: number =
  parseInt(env['PFCA_STORAGE_API_TIMEOUT_MS'] ?? '10000', 10);

/**
 * Maximum number of automatic retries. Defaults to 2.
 */
export const STORAGE_API_RETRIES: number =
  parseInt(env['PFCA_STORAGE_API_RETRIES'] ?? '2', 10);

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

import { FB_API_GRAPHQL, GRAPHQL_FRIENDLY_NAMES } from '../constants/index.js';
import { randomHex } from '../crypto/index.js';

// ─── Form URL-encoding ────────────────────────────────────────────────────────

/**
 * URL-encode a flat key-value map into an `application/x-www-form-urlencoded`
 * string.
 *
 * Values may be:
 *   - `string` — encoded directly
 *   - `string[]` — each element becomes a separate `key[i]=value` pair
 *   - `number | boolean` — coerced to string then encoded
 */
export function encodeFormBody(
  params: Record<string, string | string[] | number | boolean>,
): string {
  const parts: string[] = [];

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((v, i) => {
        parts.push(
          `${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(v)}`,
        );
      });
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }

  return parts.join('&');
}

// ─── Multipart form-data ──────────────────────────────────────────────────────

export interface MultipartField {
  name: string;
  value: string;
}

export interface MultipartFile {
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
export function buildMultipartBody(
  fields: MultipartField[],
  files: MultipartFile[],
  boundary: string,
): Buffer {
  const CRLF = '\r\n';
  const parts: Buffer[] = [];

  // Text fields
  for (const field of fields) {
    parts.push(
      Buffer.from(
        `--${boundary}${CRLF}` +
          `Content-Disposition: form-data; name="${field.name}"${CRLF}${CRLF}` +
          `${field.value}${CRLF}`,
        'utf8',
      ),
    );
  }

  // File parts
  for (const file of files) {
    parts.push(
      Buffer.from(
        `--${boundary}${CRLF}` +
          `Content-Disposition: form-data; name="${file.fieldName}"; filename="${file.fileName}"${CRLF}` +
          `Content-Type: ${file.contentType}${CRLF}${CRLF}`,
        'utf8',
      ),
    );
    parts.push(file.data);
    parts.push(Buffer.from(CRLF, 'utf8'));
  }

  // Closing boundary
  parts.push(Buffer.from(`--${boundary}--${CRLF}`, 'utf8'));

  return Buffer.concat(parts);
}

/**
 * Generate a unique MIME boundary string safe for use in multipart bodies.
 * Uses 16 random hex bytes — vanishingly unlikely to appear in any real payload.
 */
export function generateBoundary(): string {
  return `----PFCABoundary${randomHex(16)}`;
}

// ─── JSON bodies ──────────────────────────────────────────────────────────────

/**
 * Serialize a value as a JSON string for use as an `application/json` request body.
 */
export function buildJsonBody(data: unknown): string {
  return JSON.stringify(data);
}

// ─── GraphQL / Relay request bodies ──────────────────────────────────────────

export interface GraphQLBodyOptions {
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
export function buildGraphQLBody(options: GraphQLBodyOptions): string {
  const friendlyName =
    options.friendlyName ??
    (options.queryName ? GRAPHQL_FRIENDLY_NAMES[options.queryName] : 'PandindiganQuery');

  const params: Record<string, string> = {
    variables: JSON.stringify(options.variables),
    server_timestamps: 'true',
    fb_api_req_friendly_name: friendlyName,
    fb_dtsg: options.dtsg,
    fb_api_caller_class: 'RelayModern',
    __a: '1',
    __comet_req: '15',
    lsd: options.lsd,
    __req: randomHex(2),
    ...options.extraParams,
  };

  if (options.docId) params['doc_id'] = options.docId;

  return encodeFormBody(params);
}

/**
 * Convenience wrapper — builds the URL and body for a GraphQL request together.
 */
export function buildGraphQLRequest(options: GraphQLBodyOptions): {
  url: string;
  body: string;
  friendlyName: string;
} {
  const friendlyName =
    options.friendlyName ??
    (options.queryName ? GRAPHQL_FRIENDLY_NAMES[options.queryName] : 'PandindiganQuery');

  return {
    url: FB_API_GRAPHQL,
    body: buildGraphQLBody(options),
    friendlyName,
  };
}

// ─── Lightspeed / Inbox v2 request builder ────────────────────────────────────

export interface LightspeedRequestOptions {
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
export function buildLightspeedBody(options: LightspeedRequestOptions): string {
  return encodeFormBody({
    request_payload: JSON.stringify(options.requestPayload),
    fb_dtsg: options.dtsg,
    lsd: options.lsd,
    __a: '1',
    ...(options.appId ? { app_id: options.appId } : {}),
    ...(options.queryId ? { query_id: options.queryId } : {}),
  });
}

// ─── Form request builder ─────────────────────────────────────────────────────

export interface FormRequestOptions {
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
export function buildFormRequest(options: FormRequestOptions): { url: string; body: string } {
  const params = { ...options.params };
  if (options.dtsg) {
    (params as Record<string, string>)['fb_dtsg'] = options.dtsg;
  }
  if (options.lsd) {
    (params as Record<string, string>)['lsd'] = options.lsd;
  }
  return { url: options.url, body: encodeFormBody(params) };
}

// ─── Request metadata ─────────────────────────────────────────────────────────

export interface RequestSpec {
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
export function makeFormRequestSpec(url: string, body: string): RequestSpec {
  return {
    url,
    method: 'POST',
    headers: {},
    body,
    contentType: 'application/x-www-form-urlencoded',
  };
}

/**
 * Compose a fully-specified `RequestSpec` from a multipart body.
 * Ready to be passed directly to `HttpClient.postBuffer()`.
 */
export function makeMultipartRequestSpec(
  url: string,
  body: Buffer,
  boundary: string,
): RequestSpec {
  return {
    url,
    method: 'POST',
    headers: {
      'content-type': `multipart/form-data; boundary=${boundary}`,
      'content-length': String(body.byteLength),
    },
    body,
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

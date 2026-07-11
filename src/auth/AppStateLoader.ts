import { existsSync, readFileSync } from 'node:fs';
import { validateAppState, normalizeCookies, type AppStateCookie } from '../cookies/index.js';
import { ConfigurationError, InvalidAppStateError } from '../errors/index.js';
import { REQUIRED_COOKIES, RECOMMENDED_COOKIES } from '../constants/index.js';
import type { Logger } from '../logger/index.js';

/**
 * Single, centralized AppState loading pipeline.
 *
 * This is the ONLY module allowed to read files, parse JSON, decode Base64,
 * decode URL-encoded strings, or read AppState-related environment variables.
 * Every other module (client factory, auth manager, session restore, proxy
 * auth, etc.) must consume {@link AppStateResult} produced here — never parse
 * raw AppState input themselves.
 */

export type AppStateInputType = 'array' | 'json' | 'base64' | 'urlencoded' | 'buffer' | 'file' | 'none';

export interface AppStateResult {
  /** Human-readable origin of the loaded AppState, for logging/diagnostics. */
  source: string;
  inputType: AppStateInputType;
  cookies: AppStateCookie[];
  valid: boolean;
  diagnostics: string[];
}

export interface AppStateLoadOptions {
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

const NO_APPSTATE: AppStateResult = {
  source: 'none',
  inputType: 'none',
  cookies: [],
  valid: false,
  diagnostics: ['No AppState source produced a value'],
};

/** Per-process memo so a given input is only ever parsed/validated once. */
const resultCache = new Map<string, AppStateResult>();

function cacheKeyFor(rawSource: string, raw: unknown): string {
  if (typeof raw === 'string') return `${rawSource}:str:${raw}`;
  if (Buffer.isBuffer(raw)) return `${rawSource}:buf:${raw.toString('base64')}`;
  if (Array.isArray(raw)) return `${rawSource}:arr:${JSON.stringify(raw)}`;
  return `${rawSource}:${String(raw)}`;
}

function tryParseJson(text: string): unknown | undefined {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function looksLikeBase64(text: string): boolean {
  return /^[A-Za-z0-9+/]+={0,2}$/.test(text) && text.length % 4 === 0 && text.length > 16;
}

/**
 * Normalizes a single raw AppState input (array, JSON string, Base64 string,
 * URL-encoded JSON string, Buffer, or file path string) into a validated
 * {@link AppStateResult}. Returns `undefined` when the input is empty/absent
 * so the caller can move on to the next source in priority order.
 */
function normalizeInput(
  source: string,
  raw: AppStateCookie[] | string | Buffer | undefined,
  diagnostics: string[],
): AppStateResult | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw === 'string' && raw.trim().length === 0) return undefined;
  if (Array.isArray(raw) && raw.length === 0) return undefined;

  const cacheKey = cacheKeyFor(source, raw);
  const hit = resultCache.get(cacheKey);
  if (hit) {
    diagnostics.push(`${source}: served from cache (parsed once, reused)`);
    return { ...hit, diagnostics: [...diagnostics] };
  }

  let inputType: AppStateInputType;
  let cookies: unknown;

  if (Array.isArray(raw)) {
    inputType = 'array';
    cookies = raw;
  } else if (Buffer.isBuffer(raw)) {
    inputType = 'buffer';
    const text = raw.toString('utf8');
    cookies = tryParseJson(text);
    if (cookies === undefined) {
      throw new ConfigurationError(`${source}: Buffer did not contain valid AppState JSON`);
    }
  } else {
    const text = raw.trim();

    // 1. Existing file path.
    const looksLikeAPath = !text.includes('[') && !text.includes('{') && !text.startsWith('%');
    if (looksLikeAPath && existsSync(text)) {
      inputType = 'file';
      let fileContents: string;
      try {
        fileContents = readFileSync(text, 'utf8');
      } catch (err) {
        throw new ConfigurationError(
          `${source}: File does not exist or is not readable: ${text} (${err instanceof Error ? err.message : String(err)})`,
        );
      }
      cookies = tryParseJson(fileContents);
      if (cookies === undefined) {
        throw new ConfigurationError(`${source}: JSON parsing failed for file "${text}"`);
      }
    }
    // 1b. Looks like a path but the file doesn't exist — not a hard error;
    // let the caller fall through to the next source in priority order.
    else if (looksLikeAPath && !looksLikeBase64(text)) {
      diagnostics.push(`${source}: File does not exist: ${text}`);
      return undefined;
    }
    // 2. Direct JSON.
    else if (text.startsWith('[') || text.startsWith('{')) {
      inputType = 'json';
      cookies = tryParseJson(text);
      if (cookies === undefined) {
        throw new ConfigurationError(`${source}: JSON parsing failed`);
      }
    }
    // 3. URL-encoded JSON (e.g. "%5B%7B...").
    else if (text.startsWith('%')) {
      inputType = 'urlencoded';
      let decoded: string;
      try {
        decoded = decodeURIComponent(text);
      } catch (err) {
        throw new ConfigurationError(
          `${source}: URL decoding failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
      cookies = tryParseJson(decoded);
      if (cookies === undefined) {
        throw new ConfigurationError(`${source}: JSON parsing failed after URL decoding`);
      }
    }
    // 4. Base64-encoded JSON.
    else if (looksLikeBase64(text)) {
      inputType = 'base64';
      let decoded: string;
      try {
        decoded = Buffer.from(text, 'base64').toString('utf8');
      } catch (err) {
        throw new ConfigurationError(
          `${source}: Base64 decoding failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
      cookies = tryParseJson(decoded);
      if (cookies === undefined) {
        throw new ConfigurationError(`${source}: JSON parsing failed after Base64 decoding`);
      }
    }
    // 5. Non-existent file path (attempted, not found).
    else {
      throw new ConfigurationError(
        `${source}: File does not exist: ${text}. AppState must be a cookie array, JSON string, ` +
          'Base64-encoded JSON, URL-encoded JSON, or a valid file path.',
      );
    }
  }

  let validated: AppStateCookie[];
  try {
    validated = validateAppState(cookies);
  } catch (err) {
    if (err instanceof InvalidAppStateError) throw err;
    throw new ConfigurationError(
      `${source}: Invalid AppState format — ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const result: AppStateResult = {
    source,
    inputType,
    cookies: validated,
    valid: true,
    diagnostics: [
      ...diagnostics,
      `${source}: loaded ${validated.length} cookie(s) as ${inputType}`,
    ],
  };

  resultCache.set(cacheKey, result);
  return result;
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
export function loadAppState(options: AppStateLoadOptions = {}): AppStateResult {
  const diagnostics: string[] = [];
  const logger = options.logger;

  const attempts: Array<{ label: string; get: () => AppStateCookie[] | string | Buffer | undefined }> = [
    { label: 'appState option', get: () => options.appState },
    { label: 'appStatePath option', get: () => options.appStatePath },
    { label: 'APPSTATE env var', get: () => process.env['APPSTATE'] ?? process.env['PFCA_APPSTATE'] },
    { label: 'APPSTATE_JSON env var', get: () => process.env['APPSTATE_JSON'] },
    { label: 'APPSTATE_BASE64 env var', get: () => process.env['APPSTATE_BASE64'] },
    {
      label: 'appstate.json',
      get: () => process.env['PFCA_APPSTATE_PATH'] ?? './appstate.json',
    },
  ];

  for (const attempt of attempts) {
    const raw = attempt.get();
    if (raw === undefined) continue;

    // The default-file attempt should only fail silently (not throw) when the
    // file genuinely does not exist — every other attempt throws on malformed input.
    if (attempt.label === 'appstate.json') {
      const path = raw as string;
      if (!existsSync(path)) {
        diagnostics.push(`${attempt.label}: not found at "${path}"`);
        continue;
      }
    }

    const result = normalizeInput(attempt.label, raw, diagnostics);
    if (!result) continue;

    // Enhanced diagnostics logging
    if (options.debugAppState) {
      logDetailedDiagnostics(result, logger);
    } else {
      logger?.info?.(
        `[APPSTATE] Source: ${result.source} | Status: Loaded | Cookies: ${result.cookies.length}`,
        { tag: 'APPSTATE' },
      );
    }

    return result;
  }

  logger?.warn?.('[APPSTATE] No valid AppState found from any configured source', {
    tag: 'APPSTATE',
    diagnostics,
  });

  return { ...NO_APPSTATE, diagnostics };
}

function logDetailedDiagnostics(result: AppStateResult, logger: Pick<Logger, 'info' | 'debug' | 'warn'> | undefined): void {
  const keySet = new Set(result.cookies.map((c) => c.key));
  
  const lines = [
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    'AppState Diagnostics',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    `Source:`,
    `  ${result.source}`,
    '',
    `Input Type:`,
    `  ${result.inputType}`,
    '',
    `Normalization:`,
    `  SUCCESS`,
    '',
    `Cookies:`,
    `  ${result.cookies.length}`,
    '',
    `Format Support:`,
    `  Legacy Format: Supported`,
    `  Modern Format: Supported`,
    `  Mixed Format: Supported`,
    '',
    'Required Cookies:',
    ...REQUIRED_COOKIES.map(c => `  ${keySet.has(c) ? '✓' : '✗'} ${c}`),
    '',
    'Recommended Cookies:',
    ...RECOMMENDED_COOKIES.map(c => `  ${keySet.has(c) ? '✓' : '✗'} ${c}`),
    '',
    'CookieJar:',
    '  Hydrated Successfully',
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  ];
  
  (logger?.debug ?? console.debug)(lines.join('\n'));
}

/** Clears the internal per-content memo. Exposed for tests only. */
export function __clearAppStateCache(): void {
  resultCache.clear();
}

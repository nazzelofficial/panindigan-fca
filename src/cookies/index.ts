import { CookieJar, Cookie } from 'tough-cookie';
import { InvalidAppStateError } from '../errors/index.js';
import { REQUIRED_COOKIES } from '../constants/index.js';

// ── Interfaces ────────────────────────────────────────────────────────────────

/**
 * Raw cookie input shape accepted from **any** AppState exporter.
 *
 * Covers:
 * - Our canonical format (`key`, `expires`)
 * - Chrome DevTools / extension exports (`name`, `expirationDate` in epoch seconds)
 * - Firefox cookie exports (`name`, `session`)
 * - Netscape / curl export format
 *
 * {@link normalizeCookies} maps all variants to {@link AppStateCookie} before
 * any validation or hydration.
 */
export interface RawCookieInput {
  /** Canonical key field. Falls back to `name` if absent. */
  key?: string;
  /** Chrome / Firefox extension alias for `key`. */
  name?: string;
  /** Cookie value. `null` / missing entries are skipped during normalization. */
  value?: string | null;
  domain?: string;
  path?: string;
  /** Expiry as ISO string, Unix seconds number, or `"Infinity"`. */
  expires?: string | number;
  /**
   * Chrome extension format: epoch seconds (possibly fractional).
   * Takes precedence over `expires` when both are present.
   */
  expirationDate?: number;
  secure?: boolean;
  httpOnly?: boolean;
  hostOnly?: boolean;
  /** True for session-only cookies (no persistent expiry). */
  session?: boolean;
  sameSite?: string;
  /** Cookie priority: `"Low"` | `"Medium"` | `"High"`. */
  priority?: string;
  /** `"Secure"` | `"NonSecure"` — from Chrome DevTools Protocol. */
  sourceScheme?: string;
  sourcePort?: number | string;
  creation?: string;
  lastAccessed?: string;
}

/**
 * Canonical AppState cookie shape used throughout the library.
 *
 * Extended in v0.1.8 to carry all fields from {@link RawCookieInput} so that
 * round-tripping through `normalizeCookies → validateAppState → hydrateJar →
 * exportJar` preserves the original metadata.
 *
 * Extended in v0.1.9 to include both `key` and `name` fields for maximum
 * compatibility with legacy and modern FCA implementations.
 */
export interface AppStateCookie {
  key: string;
  name: string; // Included for compatibility with modern cookie formats
  value: string;
  domain: string;
  path: string;
  hostOnly?: boolean;
  creation?: string;
  lastAccessed?: string;
  secure?: boolean;
  httpOnly?: boolean;
  expires?: string | number;
  sameSite?: string;
  session?: boolean;
  priority?: string;
  sourceScheme?: string;
  sourcePort?: number | string;
}

// ── normalizeCookies ──────────────────────────────────────────────────────────

/**
 * Normalize an array of raw cookie objects from any supported exporter into
 * the canonical {@link AppStateCookie} schema.
 *
 * Operations performed (in order):
 * 1. **Field aliasing** — `name` → `key`, `expirationDate` → `expires`
 * 2. **Domain repair** — missing domain defaults to `.facebook.com`
 * 3. **Expiry detection** — cookies whose expiry is in the past are noted in
 *    diagnostics but not removed (Facebook session validity is server-side)
 * 4. **Deduplication** — when two entries share the same `key` + `domain`
 *    combination the later one wins (browser last-write-wins semantics)
 * 5. **Silent skip** — entries with no resolvable key or a `null` value are
 *    skipped with a diagnostic note instead of throwing
 *
 * @returns `[normalizedCookies, diagnostics]` — diagnostics is a human-readable
 *   list of every normalization action taken; useful for `debugAppState` logs.
 */
export function normalizeCookies(raw: unknown[]): [AppStateCookie[], string[]] {
  const diagnostics: string[] = [];
  // Dedup map: `key:domain` → last entry wins
  const seen = new Map<string, AppStateCookie>();

  for (let i = 0; i < raw.length; i++) {
    const entry = raw[i];
    if (!entry || typeof entry !== 'object') {
      diagnostics.push(`Cookie[${i}]: skipped — not an object`);
      continue;
    }

    const c = entry as RawCookieInput;

    // ── Key normalization ────────────────────────────────────────────────────
    const rawKey = (c.key ?? c.name ?? '').trim();
    if (!rawKey) {
      diagnostics.push(`Cookie[${i}]: skipped — no "key" or "name" field`);
      continue;
    }
    if (c.name && !c.key) {
      diagnostics.push(`Cookie[${i}] "${rawKey}": normalized "name" → "key"`);
    }

    // ── Value normalization ──────────────────────────────────────────────────
    if (c.value === undefined || c.value === null) {
      diagnostics.push(`Cookie[${i}] "${rawKey}": skipped — no "value" field`);
      continue;
    }
    const value = String(c.value);

    // ── Domain / path normalization ──────────────────────────────────────────
    const domain = (c.domain ?? '.facebook.com').trim() || '.facebook.com';
    const path = (c.path ?? '/').trim() || '/';

    // ── Expiry normalization ─────────────────────────────────────────────────
    let expires: string | number | undefined;
    if (typeof c.expirationDate === 'number') {
      // Chrome extension format: epoch seconds (may be fractional)
      expires = Math.floor(c.expirationDate);
      if (c.expires !== undefined) {
        diagnostics.push(`Cookie "${rawKey}": "expirationDate" took precedence over "expires"`);
      }
    } else if (c.expires !== undefined) {
      expires = c.expires;
    }

    // Warn on already-expired cookies (server-side auth may still work)
    if (typeof expires === 'number' && expires > 0 && expires * 1000 < Date.now()) {
      diagnostics.push(
        `Cookie "${rawKey}": expires is in the past (${new Date(expires * 1000).toISOString()})`,
      );
    }

    const normalized: AppStateCookie = {
      key: rawKey,
      name: rawKey, // Include both key and name for compatibility
      value,
      domain,
      path,
      secure: typeof c.secure === 'boolean' ? c.secure : false,
      httpOnly: typeof c.httpOnly === 'boolean' ? c.httpOnly : false,
      hostOnly: typeof c.hostOnly === 'boolean' ? c.hostOnly : false,
      ...(expires !== undefined ? { expires } : {}),
      ...(c.sameSite ? { sameSite: c.sameSite } : {}),
      ...(typeof c.session === 'boolean' ? { session: c.session } : {}),
      ...(c.priority ? { priority: c.priority } : {}),
      ...(c.sourceScheme ? { sourceScheme: c.sourceScheme } : {}),
      ...(c.sourcePort !== undefined ? { sourcePort: c.sourcePort } : {}),
      ...(c.creation ? { creation: c.creation } : {}),
      ...(c.lastAccessed ? { lastAccessed: c.lastAccessed } : {}),
    };

    // ── Deduplication ────────────────────────────────────────────────────────
    const dedupKey = `${rawKey}:${domain}`;
    if (seen.has(dedupKey)) {
      diagnostics.push(`Cookie "${rawKey}" (${domain}): duplicate removed — keeping last entry`);
    }
    seen.set(dedupKey, normalized);
  }

  return [Array.from(seen.values()), diagnostics];
}

// ── validateAppState ──────────────────────────────────────────────────────────

/**
 * Validate (and normalize) an AppState array for use with the library.
 *
 * - Accepts the full {@link RawCookieInput} shape (all field variants)
 * - Normalizes via {@link normalizeCookies} before checking required cookies
 * - Throws {@link InvalidAppStateError} with a descriptive message when:
 *   - Input is not a non-empty array
 *   - A required cookie (`c_user`, `xs`, `datr`) is missing after normalization
 *   - A required cookie carries an explicit expiry that is already in the past
 *
 * @returns Normalized, validated cookies ready for {@link hydrateJar}.
 */
export function validateAppState(appState: unknown): AppStateCookie[] {
  if (!Array.isArray(appState) || appState.length === 0) {
    throw new InvalidAppStateError('AppState must be a non-empty array of cookie objects');
  }

  // Normalize all input variants first
  const [cookies, normDiagnostics] = normalizeCookies(appState);

  if (cookies.length === 0) {
    throw new InvalidAppStateError(
      'AppState contains no valid cookies after normalization — all entries were malformed or had no value',
      { normalizationDiagnostics: normDiagnostics },
    );
  }

  // Check required cookies
  const keySet = new Set(cookies.map((c) => c.key));
  for (const required of REQUIRED_COOKIES) {
    if (!keySet.has(required)) {
      throw new InvalidAppStateError(
        `AppState is missing required cookie: ${required}`,
        { missingCookie: required, presentCookies: [...keySet], normalizationDiagnostics: normDiagnostics },
      );
    }
  }

  // Detect required cookies with explicit past expiry
  const expiredRequired: string[] = [];
  for (const cookie of cookies) {
    if (!(REQUIRED_COOKIES as ReadonlyArray<string>).includes(cookie.key)) continue;
    if (typeof cookie.expires === 'number' && cookie.expires > 0 && cookie.expires * 1000 < Date.now()) {
      expiredRequired.push(cookie.key);
    }
  }
  if (expiredRequired.length > 0) {
    throw new InvalidAppStateError(
      `AppState has expired required cookies: ${expiredRequired.join(', ')} — export a fresh AppState from your browser`,
      { expiredCookies: expiredRequired, normalizationDiagnostics: normDiagnostics },
    );
  }

  return cookies;
}

// ── hydrateJar ────────────────────────────────────────────────────────────────

/** Hydrate a `tough-cookie` jar from a validated AppState cookie array. */
export function hydrateJar(appState: AppStateCookie[]): CookieJar {
  const jar = new CookieJar();

  for (const entry of appState) {
    const domain = entry.domain.startsWith('.') ? entry.domain.slice(1) : entry.domain;
    const url = `https://${domain}${entry.path ?? '/'}`;

    let expires: Date | undefined;
    if (entry.session) {
      // Session cookie — no persistent expiry
      expires = undefined;
    } else if (entry.expires === 'Infinity' || entry.expires === undefined) {
      expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    } else if (typeof entry.expires === 'number') {
      expires = new Date(entry.expires * 1000);
    } else if (typeof entry.expires === 'string') {
      expires = new Date(entry.expires);
    }

    // Treat NaN / invalid dates as a 1-year default
    if (expires instanceof Date && isNaN(expires.getTime())) {
      expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }

    const cookie = new Cookie({
      key: entry.key,
      value: entry.value,
      domain: entry.domain.startsWith('.') ? entry.domain.slice(1) : entry.domain,
      path: entry.path ?? '/',
      secure: entry.secure ?? false,
      httpOnly: entry.httpOnly ?? false,
      hostOnly: entry.hostOnly ?? false,
      sameSite: entry.sameSite ?? 'no_restriction',
      expires: expires ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      creation: entry.creation ? new Date(entry.creation) : new Date(),
      lastAccessed: entry.lastAccessed ? new Date(entry.lastAccessed) : new Date(),
    });

    try {
      jar.setCookieSync(cookie, url);
    } catch {
      // Skip cookies that fail strict validation (e.g. invalid domain format)
    }
  }

  return jar;
}

// ── exportJar ─────────────────────────────────────────────────────────────────

/** Export all cookies from a `tough-cookie` jar as an AppState array. */
export async function exportJar(jar: CookieJar): Promise<AppStateCookie[]> {
  const store = jar.toJSON() as Record<string, unknown> | undefined;
  const cookies = (store?.['cookies'] as Array<Record<string, unknown>>) ?? [];

  return cookies.map((c) => {
    const key = String(c['key'] ?? '');
    return {
      key,
      name: key, // Include both key and name for maximum compatibility
      value: String(c['value'] ?? ''),
      domain: String(c['domain'] ?? '.facebook.com'),
      path: String(c['path'] ?? '/'),
      hostOnly: Boolean(c['hostOnly']),
      secure: Boolean(c['secure']),
      httpOnly: Boolean(c['httpOnly']),
      creation: c['creation'] ? String(c['creation']) : new Date().toISOString(),
      lastAccessed: c['lastAccessed'] ? String(c['lastAccessed']) : new Date().toISOString(),
      expires: c['expires'] ? String(c['expires']) : 'Infinity',
      sameSite: c['sameSite'] ? String(c['sameSite']) : undefined,
      session: c['session'] ? Boolean(c['session']) : undefined,
    };
  });
}

// ── getUserIdFromJar ──────────────────────────────────────────────────────────

/** Extract the Facebook user ID (`c_user` cookie value) from a hydrated jar. */
export function getUserIdFromJar(jar: CookieJar): string {
  const jarJson = jar.toJSON() as Record<string, unknown> | undefined;
  const cookies = (jarJson?.['cookies'] as Array<Record<string, unknown>>) ?? [];
  const cUser = cookies.find((c) => c['key'] === 'c_user');
  if (!cUser || !cUser['value']) {
    throw new InvalidAppStateError('Cannot find c_user cookie in AppState — user ID not available');
  }
  return String(cUser['value']);
}

// ── getCookieString ───────────────────────────────────────────────────────────

/** Get the `Cookie` header string for a URL from a hydrated jar. */
export function getCookieString(jar: CookieJar, url: string): string {
  return jar.getCookieStringSync(url);
}

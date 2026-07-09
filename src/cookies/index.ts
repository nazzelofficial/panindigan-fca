import { CookieJar, Cookie } from 'tough-cookie';
import { InvalidAppStateError } from '../errors/index.js';
import { REQUIRED_COOKIES } from '../constants/index.js';

export interface AppStateCookie {
  key: string;
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
}

export function validateAppState(appState: unknown): AppStateCookie[] {
  if (!Array.isArray(appState) || appState.length === 0) {
    throw new InvalidAppStateError('AppState must be a non-empty array of cookie objects');
  }

  const cookies = appState as AppStateCookie[];
  const keys = new Set(cookies.map((c) => c.key));

  for (const required of REQUIRED_COOKIES) {
    if (!keys.has(required)) {
      throw new InvalidAppStateError(
        `AppState is missing required cookie: ${required}`,
        { missingCookie: required, presentCookies: [...keys] },
      );
    }
  }

  for (const cookie of cookies) {
    if (typeof cookie.key !== 'string' || !cookie.key) {
      throw new InvalidAppStateError('Each AppState cookie must have a string "key" field');
    }
    if (typeof cookie.value !== 'string') {
      throw new InvalidAppStateError(`AppState cookie "${cookie.key}" must have a string "value" field`);
    }
  }

  return cookies;
}

export function hydrateJar(appState: AppStateCookie[]): CookieJar {
  const jar = new CookieJar();

  for (const entry of appState) {
    const domain = entry.domain.startsWith('.') ? entry.domain.slice(1) : entry.domain;
    const url = `https://${domain}${entry.path ?? '/'}`;

    let expires: Date | 'Infinity' | undefined;
    if (entry.expires === 'Infinity' || entry.expires === undefined) {
      expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    } else if (typeof entry.expires === 'number') {
      expires = new Date(entry.expires * 1000);
    } else if (typeof entry.expires === 'string') {
      expires = new Date(entry.expires);
    }

    const cookie = new Cookie({
      key: entry.key,
      value: entry.value,
      domain: entry.domain.startsWith('.') ? entry.domain.slice(1) : entry.domain,
      path: entry.path ?? '/',
      secure: entry.secure ?? false,
      httpOnly: entry.httpOnly ?? false,
      hostOnly: entry.hostOnly ?? false,
      expires: expires instanceof Date && isNaN(expires.getTime())
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        : (expires ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
      creation: entry.creation ? new Date(entry.creation) : new Date(),
      lastAccessed: entry.lastAccessed ? new Date(entry.lastAccessed) : new Date(),
    });

    try {
      jar.setCookieSync(cookie, url);
    } catch {
      // skip cookies that fail strict validation
    }
  }

  return jar;
}

export async function exportJar(jar: CookieJar): Promise<AppStateCookie[]> {
  const store = jar.toJSON() as Record<string, unknown> | undefined;
  const cookies = (store?.['cookies'] as Array<Record<string, unknown>>) ?? [];

  return cookies.map((c) => ({
    key: String(c['key'] ?? ''),
    value: String(c['value'] ?? ''),
    domain: String(c['domain'] ?? '.facebook.com'),
    path: String(c['path'] ?? '/'),
    hostOnly: Boolean(c['hostOnly']),
    secure: Boolean(c['secure']),
    httpOnly: Boolean(c['httpOnly']),
    creation: c['creation'] ? String(c['creation']) : new Date().toISOString(),
    lastAccessed: c['lastAccessed'] ? String(c['lastAccessed']) : new Date().toISOString(),
    expires: c['expires'] ? String(c['expires']) : 'Infinity',
  }));
}

export function getUserIdFromJar(jar: CookieJar): string {
  const jarJson = jar.toJSON() as Record<string, unknown> | undefined;
  const cookies = (jarJson?.['cookies'] as Array<Record<string, unknown>>) ?? [];
  const cUser = cookies.find((c) => c['key'] === 'c_user');
  if (!cUser || !cUser['value']) {
    throw new InvalidAppStateError('Cannot find c_user cookie in AppState — user ID not available');
  }
  return String(cUser['value']);
}

export function getCookieString(jar: CookieJar, url: string): string {
  return jar.getCookieStringSync(url);
}

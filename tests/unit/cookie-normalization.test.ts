/**
 * Comprehensive tests for the cookie normalization pipeline introduced in v0.1.8.
 *
 * Covers:
 * - Field aliasing: `name` → `key`, `expirationDate` → `expires`
 * - Deduplication (last-write-wins per key+domain)
 * - Expired cookie detection and descriptive errors
 * - Malformed / partial entries are skipped with diagnostics
 * - All new RawCookieInput fields are preserved
 * - validateAppState integrates normalization correctly
 * - hydrateJar handles sameSite and session flags
 */
import { describe, expect, it } from 'vitest';
import {
  normalizeCookies,
  validateAppState,
  hydrateJar,
  exportJar,
} from '../../src/cookies/index.js';
import { InvalidAppStateError } from '../../src/errors/index.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const VALID_CANONICAL = [
  { key: 'c_user', value: '100012345', domain: '.facebook.com', path: '/' },
  { key: 'xs', value: 'abc123', domain: '.facebook.com', path: '/' },
  { key: 'datr', value: 'xYz789', domain: '.facebook.com', path: '/' },
];

// Chrome DevTools Protocol / extension exporter format
const CHROME_FORMAT = [
  { name: 'c_user', value: '100012345', domain: '.facebook.com', path: '/', expirationDate: 9999999999 },
  { name: 'xs', value: 'abc123', domain: '.facebook.com', path: '/' },
  { name: 'datr', value: 'xYz789', domain: '.facebook.com', path: '/' },
];

// ── normalizeCookies ──────────────────────────────────────────────────────────

describe('normalizeCookies', () => {
  it('passes canonical format through unchanged', () => {
    const [cookies, diag] = normalizeCookies(VALID_CANONICAL);
    expect(cookies).toHaveLength(3);
    expect(cookies[0]?.key).toBe('c_user');
    expect(diag).toHaveLength(0);
  });

  it('normalizes `name` → `key` from Chrome extension format', () => {
    const [cookies, diag] = normalizeCookies(CHROME_FORMAT);
    expect(cookies).toHaveLength(3);
    expect(cookies.every((c) => typeof c.key === 'string' && c.key.length > 0)).toBe(true);
    expect(diag.some((d) => d.includes('normalized "name" → "key"'))).toBe(true);
  });

  it('normalizes `expirationDate` (epoch seconds) → `expires`', () => {
    const raw = [{ name: 'c_user', value: '1', domain: '.facebook.com', path: '/', expirationDate: 2000000000 }];
    const [cookies, diag] = normalizeCookies(raw);
    expect(cookies[0]?.expires).toBe(2000000000);
    // expirationDate is in the future — no expiry diagnostic
    expect(diag.some((d) => d.includes('expires is in the past'))).toBe(false);
  });

  it('prefers `expirationDate` over `expires` when both are present', () => {
    const raw = [{
      name: 'c_user',
      value: '1',
      domain: '.facebook.com',
      path: '/',
      expires: 1000000000,        // in the past
      expirationDate: 9999999999, // in the future
    }];
    const [cookies, diag] = normalizeCookies(raw);
    expect(cookies[0]?.expires).toBe(9999999999);
    expect(diag.some((d) => d.includes('expirationDate" took precedence'))).toBe(true);
  });

  it('deduplicates cookies with the same key+domain — last entry wins', () => {
    const raw = [
      { key: 'xs', value: 'first', domain: '.facebook.com', path: '/' },
      { key: 'xs', value: 'second', domain: '.facebook.com', path: '/' },
    ];
    const [cookies, diag] = normalizeCookies(raw);
    expect(cookies).toHaveLength(1);
    expect(cookies[0]?.value).toBe('second');
    expect(diag.some((d) => d.includes('duplicate removed'))).toBe(true);
  });

  it('same key on different domains are NOT duplicates', () => {
    const raw = [
      { key: 'fr', value: 'a', domain: '.facebook.com', path: '/' },
      { key: 'fr', value: 'b', domain: '.messenger.com', path: '/' },
    ];
    const [cookies] = normalizeCookies(raw);
    expect(cookies).toHaveLength(2);
  });

  it('skips entries with no key or name', () => {
    const raw = [{ value: 'orphan', domain: '.facebook.com', path: '/' }];
    const [cookies, diag] = normalizeCookies(raw);
    expect(cookies).toHaveLength(0);
    expect(diag[0]).toMatch(/skipped.*no "key" or "name"/);
  });

  it('skips entries with null or missing value', () => {
    const raw = [
      { key: 'a', value: null, domain: '.facebook.com', path: '/' },
      { key: 'b', domain: '.facebook.com', path: '/' },
    ];
    const [cookies, diag] = normalizeCookies(raw);
    expect(cookies).toHaveLength(0);
    expect(diag.some((d) => d.includes('no "value" field'))).toBe(true);
  });

  it('skips non-object entries', () => {
    const raw = [null, 'string', 42, undefined];
    const [cookies, diag] = normalizeCookies(raw);
    expect(cookies).toHaveLength(0);
    expect(diag.every((d) => d.includes('skipped'))).toBe(true);
  });

  it('detects and notes cookies with expiry in the past', () => {
    const pastEpoch = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    const raw = [{ key: 'old', value: 'v', domain: '.facebook.com', path: '/', expirationDate: pastEpoch }];
    const [, diag] = normalizeCookies(raw);
    expect(diag.some((d) => d.includes('expires is in the past'))).toBe(true);
  });

  it('preserves all extended fields: sameSite, priority, sourceScheme, sourcePort', () => {
    const raw = [{
      key: 'sb', value: 'val', domain: '.facebook.com', path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'Strict',
      priority: 'High',
      sourceScheme: 'Secure',
      sourcePort: 443,
      session: false,
    }];
    const [cookies] = normalizeCookies(raw);
    const c = cookies[0]!;
    expect(c.secure).toBe(true);
    expect(c.httpOnly).toBe(true);
    expect(c.sameSite).toBe('Strict');
    expect(c.priority).toBe('High');
    expect(c.sourceScheme).toBe('Secure');
    expect(c.sourcePort).toBe(443);
    expect(c.session).toBe(false);
  });

  it('defaults domain to .facebook.com when absent', () => {
    const raw = [{ key: 'x', value: 'v' }];
    const [cookies] = normalizeCookies(raw);
    expect(cookies[0]?.domain).toBe('.facebook.com');
  });

  it('defaults path to / when absent', () => {
    const raw = [{ key: 'x', value: 'v', domain: '.facebook.com' }];
    const [cookies] = normalizeCookies(raw);
    expect(cookies[0]?.path).toBe('/');
  });
});

// ── validateAppState ──────────────────────────────────────────────────────────

describe('validateAppState with normalization', () => {
  it('accepts canonical cookie array', () => {
    expect(validateAppState(VALID_CANONICAL)).toHaveLength(3);
  });

  it('accepts Chrome DevTools format (name + expirationDate)', () => {
    const result = validateAppState(CHROME_FORMAT);
    expect(result).toHaveLength(3);
    expect(result.every((c) => typeof c.key === 'string')).toBe(true);
  });

  it('accepts mixed format (some have `name`, some have `key`)', () => {
    const mixed = [
      { name: 'c_user', value: '1', domain: '.facebook.com', path: '/' },
      { key: 'xs', value: 'x', domain: '.facebook.com', path: '/' },
      { key: 'datr', value: 'd', domain: '.facebook.com', path: '/' },
    ];
    expect(() => validateAppState(mixed)).not.toThrow();
  });

  it('throws when a required cookie is missing', () => {
    const noDatr = VALID_CANONICAL.filter((c) => c.key !== 'datr');
    expect(() => validateAppState(noDatr)).toThrow(InvalidAppStateError);
    expect(() => validateAppState(noDatr)).toThrow(/missing required cookie: datr/);
  });

  it('throws with descriptive message when empty array', () => {
    expect(() => validateAppState([])).toThrow(InvalidAppStateError);
    expect(() => validateAppState([])).toThrow(/non-empty array/);
  });

  it('throws when all entries are malformed', () => {
    const allBad = [null, {}, { key: '', value: '' }];
    expect(() => validateAppState(allBad)).toThrow(InvalidAppStateError);
  });

  it('deduplicates and still passes when required cookies are present after dedup', () => {
    const withDups = [
      ...VALID_CANONICAL,
      { key: 'c_user', value: '999', domain: '.facebook.com', path: '/' }, // duplicate
    ];
    const result = validateAppState(withDups);
    // Deduplicated: only 3 unique cookies
    expect(result).toHaveLength(3);
    // Last value wins
    expect(result.find((c) => c.key === 'c_user')?.value).toBe('999');
  });

  it('throws when a required cookie has an explicit past expiry', () => {
    const expiredXs = VALID_CANONICAL.map((c) =>
      c.key === 'xs' ? { ...c, expirationDate: 1000 } : c, // epoch 1000 = year 1970
    );
    expect(() => validateAppState(expiredXs)).toThrow(InvalidAppStateError);
    expect(() => validateAppState(expiredXs)).toThrow(/expired required cookies.*xs/);
  });

  it('does NOT throw when only a non-required cookie is expired', () => {
    const withExpiredFr = [
      ...VALID_CANONICAL,
      { key: 'fr', value: 'val', domain: '.facebook.com', path: '/', expirationDate: 1000 },
    ];
    // fr is not a required cookie — should not throw
    expect(() => validateAppState(withExpiredFr)).not.toThrow();
  });
});

// ── hydrateJar ────────────────────────────────────────────────────────────────

describe('hydrateJar with extended fields', () => {
  it('hydrates cookies with sameSite without error', () => {
    const cookies = [
      { key: 'c_user', value: '1', domain: '.facebook.com', path: '/', sameSite: 'Lax' },
      { key: 'xs', value: 'x', domain: '.facebook.com', path: '/', sameSite: 'Strict' },
      { key: 'datr', value: 'd', domain: '.facebook.com', path: '/' },
    ];
    expect(() => hydrateJar(cookies)).not.toThrow();
    const jar = hydrateJar(cookies);
    expect(jar).toBeDefined();
  });

  it('treats session=true cookies without an expiry', () => {
    const cookies = [
      { key: 'c_user', value: '1', domain: '.facebook.com', path: '/', session: true },
      { key: 'xs', value: 'x', domain: '.facebook.com', path: '/' },
      { key: 'datr', value: 'd', domain: '.facebook.com', path: '/' },
    ];
    expect(() => hydrateJar(cookies)).not.toThrow();
  });
});

// ── Round-trip ────────────────────────────────────────────────────────────────

describe('normalizeCookies → validateAppState → hydrateJar → exportJar round-trip', () => {
  it('produces a valid exportable jar from Chrome-format input', async () => {
    const validated = validateAppState(CHROME_FORMAT);
    const jar = hydrateJar(validated);
    const exported = await exportJar(jar);
    expect(exported.length).toBeGreaterThanOrEqual(3);
    expect(exported.some((c) => c.key === 'c_user')).toBe(true);
    expect(exported.some((c) => c.key === 'xs')).toBe(true);
  });

  it('preserves cookie values through the full pipeline', async () => {
    const validated = validateAppState(VALID_CANONICAL);
    const jar = hydrateJar(validated);
    const exported = await exportJar(jar);
    const cUser = exported.find((c) => c.key === 'c_user');
    expect(cUser?.value).toBe('100012345');
  });
});

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadAppState, __clearAppStateCache } from '../../src/auth/AppStateLoader.js';
import { ConfigurationError, InvalidAppStateError } from '../../src/errors/index.js';

const validCookies = [
  { key: 'c_user', value: '123', domain: 'facebook.com', path: '/' },
  { key: 'xs', value: 'abc', domain: 'facebook.com', path: '/' },
  { key: 'datr', value: 'def', domain: 'facebook.com', path: '/' },
];

describe('AppStateLoader', () => {
  let dir: string;
  const ENV_KEYS = ['APPSTATE', 'PFCA_APPSTATE', 'APPSTATE_JSON', 'APPSTATE_BASE64', 'PFCA_APPSTATE_PATH'];
  const savedEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'pfca-appstate-'));
    __clearAppStateCache();
    for (const key of ENV_KEYS) {
      savedEnv[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
    for (const key of ENV_KEYS) {
      if (savedEnv[key] === undefined) delete process.env[key];
      else process.env[key] = savedEnv[key];
    }
  });

  it('accepts a cookie array', () => {
    const result = loadAppState({ appState: validCookies });
    expect(result.valid).toBe(true);
    expect(result.inputType).toBe('array');
    expect(result.source).toBe('appState option');
    expect(result.cookies).toHaveLength(3);
  });

  it('accepts a JSON string', () => {
    const result = loadAppState({ appState: JSON.stringify(validCookies) });
    expect(result.valid).toBe(true);
    expect(result.inputType).toBe('json');
  });

  it('accepts a Base64-encoded JSON string', () => {
    const encoded = Buffer.from(JSON.stringify(validCookies), 'utf8').toString('base64');
    const result = loadAppState({ appState: encoded });
    expect(result.valid).toBe(true);
    expect(result.inputType).toBe('base64');
  });

  it('accepts a URL-encoded JSON string', () => {
    const encoded = encodeURIComponent(JSON.stringify(validCookies));
    const result = loadAppState({ appState: encoded });
    expect(result.valid).toBe(true);
    expect(result.inputType).toBe('urlencoded');
  });

  it('accepts a file path via appState', () => {
    const filePath = join(dir, 'appstate.json');
    writeFileSync(filePath, JSON.stringify(validCookies));
    const result = loadAppState({ appState: filePath });
    expect(result.valid).toBe(true);
    expect(result.inputType).toBe('file');
  });

  it('accepts a file path via appStatePath', () => {
    const filePath = join(dir, 'custom-appstate.json');
    writeFileSync(filePath, JSON.stringify(validCookies));
    const result = loadAppState({ appStatePath: filePath });
    expect(result.valid).toBe(true);
    expect(result.source).toBe('appStatePath option');
  });

  it('throws ConfigurationError for invalid JSON', () => {
    expect(() => loadAppState({ appState: '[not valid json' })).toThrow(ConfigurationError);
  });

  it('returns not-valid when no source is configured and default file is missing', () => {
    const result = loadAppState({ appStatePath: join(dir, 'missing.json') });
    expect(result.valid).toBe(false);
    expect(result.cookies).toHaveLength(0);
  });

  it('throws InvalidAppStateError when c_user is missing', () => {
    const missingCUser = validCookies.filter((c) => c.key !== 'c_user');
    expect(() => loadAppState({ appState: missingCUser })).toThrow(InvalidAppStateError);
  });

  it('throws InvalidAppStateError when xs is missing', () => {
    const missingXs = validCookies.filter((c) => c.key !== 'xs');
    expect(() => loadAppState({ appState: missingXs })).toThrow(InvalidAppStateError);
  });

  it('rejects a malformed cookie schema', () => {
    const malformed = [{ key: 'c_user' }, { key: 'xs', value: 'abc' }, { key: 'datr', value: 'def' }];
    expect(() => loadAppState({ appState: malformed as never })).toThrow(InvalidAppStateError);
  });

  it('reads APPSTATE_JSON environment variable', () => {
    process.env['APPSTATE_JSON'] = JSON.stringify(validCookies);
    const result = loadAppState({});
    expect(result.valid).toBe(true);
    expect(result.source).toBe('APPSTATE_JSON env var');
  });

  it('reads APPSTATE_BASE64 environment variable', () => {
    process.env['APPSTATE_BASE64'] = Buffer.from(JSON.stringify(validCookies), 'utf8').toString('base64');
    const result = loadAppState({});
    expect(result.valid).toBe(true);
    expect(result.source).toBe('APPSTATE_BASE64 env var');
  });

  it('reads APPSTATE environment variable', () => {
    process.env['APPSTATE'] = JSON.stringify(validCookies);
    const result = loadAppState({});
    expect(result.valid).toBe(true);
    expect(result.source).toBe('APPSTATE env var');
  });

  it('prefers explicit appState option over environment variables', () => {
    process.env['APPSTATE_JSON'] = JSON.stringify(validCookies);
    const other = [
      { key: 'c_user', value: '999', domain: 'facebook.com', path: '/' },
      { key: 'xs', value: 'zzz', domain: 'facebook.com', path: '/' },
      { key: 'datr', value: 'yyy', domain: 'facebook.com', path: '/' },
    ];
    const result = loadAppState({ appState: other });
    expect(result.source).toBe('appState option');
    expect(result.cookies[0]?.value).toBe('999');
  });

  it('reuses the cached result for identical input instead of re-parsing', () => {
    const first = loadAppState({ appState: JSON.stringify(validCookies) });
    const second = loadAppState({ appState: JSON.stringify(validCookies) });
    expect(second.diagnostics.some((d) => d.includes('served from cache'))).toBe(true);
    expect(second.cookies).toEqual(first.cookies);
  });

  it('falls back through priority order to ./appstate.json equivalent via appStatePath default', () => {
    const filePath = join(dir, 'appstate.json');
    writeFileSync(filePath, JSON.stringify(validCookies));
    process.env['PFCA_APPSTATE_PATH'] = filePath;
    const result = loadAppState({});
    expect(result.valid).toBe(true);
    expect(result.source).toBe('appstate.json');
  });

  it('supports concurrent/repeated load calls without state leakage', () => {
    const results = [
      loadAppState({ appState: validCookies }),
      loadAppState({ appState: validCookies }),
      loadAppState({ appState: validCookies }),
    ];
    for (const r of results) {
      expect(r.valid).toBe(true);
      expect(r.cookies).toHaveLength(3);
    }
  });
});

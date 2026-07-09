import type { CookieJar } from 'tough-cookie';
import type { HttpClient } from '../http/index.js';
import type { TypedEventEmitter } from '../events/index.js';
import type { Logger } from '../logger/index.js';
import type { Config } from '../config/index.js';
import type { StorageAdapter } from '../storage/index.js';
import {
  hydrateJar,
  exportJar,
  validateAppState,
  getUserIdFromJar,
  type AppStateCookie,
} from '../cookies/index.js';
import {
  extractDtsgFromHtml,
  extractLsdFromHtml,
  parseJsonResponse,
} from '../graphql/index.js';
import {
  InvalidAppStateError,
  SessionExpiredError,
  LoginFailedError,
  TwoFactorRequiredError,
  CheckpointRequiredError,
} from '../errors/index.js';
import {
  FB_BASE_URL,
  FB_LOGIN_URL,
  FB_LOGOUT_URL,
  CHECKPOINT_PATHS,
  SUSPENSION_INDICATORS,
} from '../constants/index.js';

export interface SessionTokens {
  dtsg: string;
  lsd: string;
  userId: string;
}

export class AuthManager {
  private _tokens: SessionTokens | null = null;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private keepaliveTimer: ReturnType<typeof setInterval> | null = null;
  private _refreshFailCount = 0;

  constructor(
    private readonly jar: CookieJar,
    private readonly http: HttpClient,
    private readonly emitter: TypedEventEmitter,
    private readonly storage: StorageAdapter,
    private readonly config: Config,
    private readonly logger: Logger,
  ) {}

  get tokens(): SessionTokens {
    if (!this._tokens) throw new InvalidAppStateError('Session has not been bootstrapped');
    return this._tokens;
  }

  async bootstrap(): Promise<SessionTokens> {
    this.logger.info('Bootstrapping Facebook session', { tag: 'AUTH' });
    const resp = await this.http.get(`${FB_BASE_URL}/`, { skipRetry: false });
    const html = await resp.text();

    this.checkForCheckpoint(html);
    this.checkForSuspension(html);

    const dtsg = extractDtsgFromHtml(html);
    const lsd = extractLsdFromHtml(html);

    if (!dtsg || !lsd) {
      throw new InvalidAppStateError(
        'Failed to extract session tokens from Facebook — AppState may be expired',
        { hasDtsg: !!dtsg, hasLsd: !!lsd },
      );
    }

    const userId = getUserIdFromJar(this.jar);
    this._tokens = { dtsg, lsd, userId };
    this.logger.info('Session bootstrapped', { tag: 'AUTH', userId });
    return this._tokens;
  }

  async loginWithCredentials(email: string, password: string, twoFactorCode?: string): Promise<void> {
    this.logger.info('Logging in with credentials', { tag: 'AUTH' });
    const initResp = await this.http.get(`${FB_BASE_URL}/login/`);
    const initHtml = await initResp.text();
    const lsd = extractLsdFromHtml(initHtml) ?? '';
    const jazoest = this.calcJazoest(email);

    const params = new URLSearchParams({
      email,
      pass: password,
      login: '1',
      lsd,
      jazoest,
      timezone: String(-new Date().getTimezoneOffset()),
      lgndim: 'eyJ3IjoxOTIwLCJoIjoxMDgwLCJhdyI6MTkyMCwiYWgiOjEwODAsImMiOjI0fQ==',
      lgnrnd: Math.random().toString(36).slice(2, 14),
      lgnjs: Math.floor(Date.now() / 1000).toString(),
    });

    const resp = await this.http.post(FB_LOGIN_URL, params.toString());
    const html = await resp.text();

    if (html.includes('two_factor_authentication') || html.includes('approvals_code')) {
      if (!twoFactorCode) {
        throw new TwoFactorRequiredError('Two-factor authentication code required');
      }
      await this.submitTwoFactor(twoFactorCode, html);
      return;
    }

    if (html.includes('login_error') || html.includes('error_box')) {
      throw new LoginFailedError('Email or password is incorrect', { email });
    }

    this.checkForCheckpoint(html);
    await this.bootstrap();
  }

  private async submitTwoFactor(code: string, previousHtml: string): Promise<void> {
    const dtsg = extractDtsgFromHtml(previousHtml) ?? '';
    const lsd = extractLsdFromHtml(previousHtml) ?? '';
    const params = new URLSearchParams({
      approvals_code: code,
      fb_dtsg: dtsg,
      lsd,
      submit: 'Continue',
    });
    const resp = await this.http.post(
      `${FB_BASE_URL}/checkpoint/`,
      params.toString(),
    );
    const html = await resp.text();
    this.checkForCheckpoint(html);
    await this.bootstrap();
  }

  private calcJazoest(value: string): string {
    let sum = 0;
    for (const char of value) sum += char.charCodeAt(0);
    return `2${sum}`;
  }

  private checkForCheckpoint(html: string): void {
    for (const path of CHECKPOINT_PATHS) {
      if (html.includes(path)) {
        throw new CheckpointRequiredError(
          'Facebook requires identity verification',
          `${FB_BASE_URL}${path}`,
        );
      }
    }
  }

  private checkForSuspension(html: string): void {
    const lower = html.toLowerCase();
    for (const indicator of SUSPENSION_INDICATORS) {
      if (lower.includes(indicator)) {
        this.emitter.emit('account:suspended', { reason: indicator });
        throw new SessionExpiredError('Facebook account has been suspended');
      }
    }
  }

  async refreshCookies(): Promise<void> {
    this.logger.info('Refreshing cookies', { tag: 'AUTH' });
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
      this.emitter.emit('appstate:update', updated);
      if (this._tokens) {
        this.emitter.emit('account:refresh', {
          userId: this._tokens.userId,
          appState: updated,
          cookieCount: updated.length,
          dtsg: this._tokens.dtsg,
          lsd: this._tokens.lsd,
          refreshedAt: new Date(),
        });
      }
      if (this.config.refresh.autoPersist && this.config.session.persistPath) {
        await this.storage.set('session:appstate', updated);
        this.emitter.emit('session:saved', { persistPath: this.config.session.persistPath });
      }
      this.logger.info('Cookies refreshed', { tag: 'AUTH' });
    } catch (err) {
      this._refreshFailCount += 1;
      const error = err instanceof Error ? err : new Error(String(err));
      const maxAttempts = this.config.refresh.retries;
      const willRetry = this._refreshFailCount < maxAttempts;
      const nextRetryAt = new Date(Date.now() + this.config.refresh.checkInterval);
      const lastFailedAt = new Date();
      this.logger.warn('Cookie refresh failed', {
        tag: 'AUTH',
        err,
        attempts: this._refreshFailCount,
        maxAttempts,
        willRetry,
      });
      this.emitter.emit('appstate:refresh:failed', {
        error,
        attempts: this._refreshFailCount,
      });
      this.emitter.emit('account:refresh:failed', {
        userId: this._tokens?.userId ?? null,
        error,
        attempts: this._refreshFailCount,
        maxAttempts,
        willRetry,
        nextRetryAt,
        lastFailedAt,
      });
      if (!willRetry) {
        this.logger.error('Session is stale — max refresh attempts exhausted', {
          tag: 'AUTH',
          userId: this._tokens?.userId ?? null,
          attempts: this._refreshFailCount,
        });
        this.emitter.emit('account:stale', {
          userId: this._tokens?.userId ?? null,
          lastError: error,
          attempts: this._refreshFailCount,
          staleSince: lastFailedAt,
          hint: 'Export a fresh AppState from your browser and call createClient({ appState }) again.',
        });
      }
      if (!this.config.refresh.failSilently) throw err;
    }
  }

  async keepalive(): Promise<void> {
    try {
      await this.http.get(`${FB_BASE_URL}/`, { skipRetry: true });
      this.logger.debug('Keepalive ping sent', { tag: 'HEARTBEAT' });
    } catch (err) {
      this.logger.warn('Keepalive failed', { tag: 'HEARTBEAT', err });
      if (this.config.keepalive.onFailure === 'throw') throw err;
    }
  }

  async getAppState(): Promise<AppStateCookie[]> {
    return exportJar(this.jar);
  }

  async logout(): Promise<void> {
    this.logger.info('Logging out', { tag: 'AUTH' });
    this.stopTimers();
    try {
      if (this._tokens) {
        const params = new URLSearchParams({
          fb_dtsg: this._tokens.dtsg,
          lsd: this._tokens.lsd,
        });
        await this.http.post(FB_LOGOUT_URL, params.toString(), { skipRetry: true });
      }
    } catch {
      // ignore logout errors
    }
    this._tokens = null;
  }

  startRefreshTimer(): void {
    if (this.refreshTimer) return;
    this.refreshTimer = setInterval(async () => {
      await this.refreshCookies();
    }, this.config.refresh.checkInterval);
    this.refreshTimer.unref?.();
  }

  startKeepaliveTimer(): void {
    if (!this.config.keepalive.enabled) return;
    if (this.keepaliveTimer) return;
    this.keepaliveTimer = setInterval(async () => {
      await this.keepalive();
    }, this.config.keepalive.interval);
    this.keepaliveTimer.unref?.();
  }

  stopTimers(): void {
    if (this.refreshTimer) { clearInterval(this.refreshTimer); this.refreshTimer = null; }
    if (this.keepaliveTimer) { clearInterval(this.keepaliveTimer); this.keepaliveTimer = null; }
  }
}

export async function createAuthManager(options: {
  appState?: AppStateCookie[];
  credentials?: { email: string; password: string; twoFactorCode?: string };
  jar: CookieJar;
  http: HttpClient;
  emitter: TypedEventEmitter;
  storage: StorageAdapter;
  config: Config;
  logger: Logger;
}): Promise<AuthManager> {
  const { appState, credentials, jar, http, emitter, storage, config, logger } = options;

  if (appState) {
    const validated = validateAppState(appState);
    const freshJar = hydrateJar(validated);
    const entries = freshJar.toJSON() as Record<string, unknown> | undefined;
    jar.removeAllCookiesSync();
    const cookies = (entries?.['cookies'] as Array<Record<string, unknown>>) ?? [];
    for (const c of cookies) {
      try {
        const domain = String(c['domain'] ?? '.facebook.com');
        const path = String(c['path'] ?? '/');
        const domainClean = domain.startsWith('.') ? domain.slice(1) : domain;
        jar.setCookieSync(
          `${String(c['key'])}=${String(c['value'])}`,
          `https://${domainClean}${path}`,
        );
      } catch {
        // skip invalid cookies
      }
    }

    if (config.session.persistPath && config.refresh.autoPersist) {
      await storage.set('session:appstate', validated);
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

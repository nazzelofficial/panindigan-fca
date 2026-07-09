import UserAgent from 'user-agents';
import { cryptoRandomInt, cryptoRandomFloat, randomHex } from '../crypto/index.js';
import type { Config } from '../config/index.js';
import type { TypedEventEmitter } from '../events/index.js';
import type { Logger } from '../logger/index.js';

export interface BrowserFingerprint {
  userAgent: string;
  platform: string;
  locale: string;
  timezone: string;
  screenWidth: number;
  screenHeight: number;
  colorDepth: number;
  secChUa: string;
  secChUaPlatform: string;
}

const LOCALES = ['en-US', 'en-GB', 'en-PH', 'en-CA', 'en-AU', 'fil-PH'];
const TIMEZONES = ['Asia/Manila', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Singapore'];
const SCREEN_SIZES = [[1920, 1080], [1366, 768], [1440, 900], [1280, 800], [2560, 1440]] as const;

function seedHash(seed: string): number {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h + seed.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(h);
}

function seededPick<T>(items: readonly T[], seed: number, offset: number = 0): T {
  return items[(seed + offset) % items.length] as T;
}

export function generateFingerprint(seed?: string): BrowserFingerprint {
  const effectiveSeed = seed ?? randomHex(8);
  const h = seedHash(effectiveSeed);

  const ua = new UserAgent({
    deviceCategory: 'desktop',
    vendor: 'Google Inc.',
  });

  const locale = seededPick(LOCALES, h, 0);
  const timezone = seededPick(TIMEZONES, h, 1);
  const screenSize = seededPick(SCREEN_SIZES, h, 2);
  const platform = 'Win32';

  const chromeVersion = 120 + (h % 10);
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
    secChUaPlatform: '"Windows"',
  };
}

export function buildStealthHeaders(fp: BrowserFingerprint, referer?: string): Record<string, string> {
  return {
    'user-agent': fp.userAgent,
    'accept-language': `${fp.locale},en;q=0.9`,
    'accept-encoding': 'gzip, deflate, br',
    'sec-ch-ua': fp.secChUa,
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': fp.secChUaPlatform,
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    ...(referer ? { referer } : {}),
  };
}

export async function humanDelay(
  config: Config['stealth']['delays'],
  type: 'action' | 'message' | 'pagination',
): Promise<void> {
  if (!config.enabled) return;
  const range = type === 'message'
    ? config.messageDelay
    : type === 'pagination'
      ? config.paginationDelay
      : config.actionDelay;
  const ms = cryptoRandomInt(range.min, range.max);
  await new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function calcTypingDelayMs(body: string, wpmConfig: { min: number; max: number }, naturalPauses: boolean): number {
  const words = body.split(/\s+/).length;
  const wpm = cryptoRandomInt(wpmConfig.min, wpmConfig.max);
  const baseMs = Math.round((words / wpm) * 60 * 1000);
  if (!naturalPauses) return baseMs;
  const pauseFactor = 0.8 + cryptoRandomFloat() * 0.4;
  return Math.round(baseMs * pauseFactor);
}

export class StealthManager {
  readonly fingerprint: BrowserFingerprint;
  private requestCount = 0;
  private warmupStartTime: number | null = null;

  constructor(
    private readonly config: Config['stealth'],
    private readonly emitter: TypedEventEmitter,
    private readonly logger: Logger,
  ) {
    const seed = config.fingerprint.seed ?? config.userAgent.seed ?? randomHex(8);
    this.fingerprint = config.fingerprint.enabled ? generateFingerprint(seed) : generateFingerprint();
    if (config.fingerprint.enabled) {
      emitter.emit('stealth:fingerprint:assigned', {
        userAgent: this.fingerprint.userAgent,
        platform: this.fingerprint.platform,
        locale: this.fingerprint.locale,
      });
    }
    if (config.warmup.enabled) {
      this.warmupStartTime = Date.now();
      emitter.emit('stealth:warmup:start', { targetRateLimitRpm: config.rateLimit.requestsPerMinute });
      logger.info('Stealth warm-up started', { tag: 'STEALTH', duration: config.warmup.duration });
    }
  }

  getHeaders(referer?: string): Record<string, string> {
    const level = this.config.level;
    if (level === 'off') return {};
    return buildStealthHeaders(this.fingerprint, referer);
  }

  isWarmupComplete(): boolean {
    if (!this.config.warmup.enabled || this.warmupStartTime === null) return true;
    const elapsed = Date.now() - this.warmupStartTime;
    const durationMs = this.config.warmup.duration * 60 * 1000;
    if (elapsed >= durationMs) {
      this.emitter.emit('stealth:warmup:complete', { durationMs: elapsed });
      this.warmupStartTime = null;
      return true;
    }
    return false;
  }

  getCurrentRateLimit(): number {
    if (!this.config.warmup.enabled || this.isWarmupComplete()) {
      return this.config.rateLimit.requestsPerMinute;
    }
    const elapsed = Date.now() - (this.warmupStartTime ?? Date.now());
    const durationMs = this.config.warmup.duration * 60 * 1000;
    const progress = Math.min(elapsed / durationMs, 1);
    const fraction = this.config.warmup.startFraction + (1 - this.config.warmup.startFraction) * progress;
    return Math.max(1, Math.round(this.config.rateLimit.requestsPerMinute * fraction));
  }

  incrementRequestCount(): void {
    this.requestCount++;
  }
}

import pino from 'pino';
import type { Logger as PinoLogger } from 'pino';
import { SENSITIVE_FIELDS } from '../constants/index.js';

/**
 * Extended logger interface — includes a `success` level for completed-operation
 * messages, sitting between INFO (30) and WARN (40) at severity 35.
 */
export interface Logger {
  trace(msg: string, ctx?: Record<string, unknown>): void;
  debug(msg: string, ctx?: Record<string, unknown>): void;
  info(msg: string, ctx?: Record<string, unknown>): void;
  /** Indicates a successfully completed operation (severity 35, between INFO and WARN). */
  success(msg: string, ctx?: Record<string, unknown>): void;
  warn(msg: string, ctx?: Record<string, unknown>): void;
  error(msg: string, ctx?: Record<string, unknown>): void;
  fatal(msg: string, ctx?: Record<string, unknown>): void;
  child(bindings: Record<string, unknown>): Logger;
}

/**
 * SUCCESS is between INFO (30) and WARN (40) — signals a completed, healthy
 * operation without the alarm connotation of WARN.
 */
const SUCCESS_LEVEL_NUM = 35;

function buildRedactPaths(): string[] {
  const paths: string[] = [];
  for (const field of SENSITIVE_FIELDS) {
    paths.push(field);
    paths.push(`*.${field}`);
    paths.push(`*.*.${field}`);
    paths.push(`[*].${field}`);
  }
  return paths;
}

/**
 * Detect whether the current runtime supports ANSI colour codes.
 * Returns false on CI, Docker, or any environment that sets NO_COLOR / FORCE_COLOR=0.
 * Returns true when FORCE_COLOR is set (or stdout is a TTY and NO_COLOR is absent).
 */
function detectColorSupport(): boolean {
  const env = (globalThis as typeof globalThis & { process?: { env?: Record<string, string>; stdout?: { isTTY?: boolean } } }).process?.env ?? {};
  const stdout = (globalThis as typeof globalThis & { process?: { stdout?: { isTTY?: boolean } } }).process?.stdout;

  if (env['NO_COLOR']) return false;
  if (env['FORCE_COLOR'] === '0') return false;
  if (env['FORCE_COLOR']) return true;
  if (env['CI']) return false;
  return !!(stdout?.isTTY);
}

// pino's generic parameter varies by custom-levels configuration, so we widen
// to `pino.Logger<string, boolean>` to keep the internal `wrap` helper generic.
type AnyPinoLogger = pino.Logger<string, boolean>;

type PinoWithCustomLevels = AnyPinoLogger & {
  success(ctx: Record<string, unknown>, msg: string): void;
};

export function createLogger(options: {
  level?: string;
  pretty?: boolean;
  bindings?: Record<string, unknown>;
}): Logger {
  const level = options.level ?? 'info';
  const pretty = options.pretty ?? false;
  const colorize = detectColorSupport();

  const transport = pretty
    ? {
        target: 'pino-pretty',
        options: {
          colorize,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l o',
          ignore: 'pid,hostname',
          messageFormat: '[{tag}] {msg}',
          customLevels: `success:${SUCCESS_LEVEL_NUM}`,
          customColors: 'success:green',
          useOnlyCustomProps: false,
        },
      }
    : undefined;

  const base = pino(
    {
      level,
      customLevels: { success: SUCCESS_LEVEL_NUM },
      useOnlyCustomLevels: false,
      redact: {
        paths: buildRedactPaths(),
        censor: '[REDACTED]',
      },
      serializers: {
        err: pino.stdSerializers.err,
      },
      ...(transport ? { transport } : {}),
    },
  ) as unknown as AnyPinoLogger;

  /**
   * Build a Logger whose pino child is always constructed from the clean `base`
   * with a flat set of accumulated bindings. This prevents pino from stacking
   * duplicate keys (e.g. `"tag":"PFCA","tag":"CLIENT"`) when:
   *  - child() is called with a key that already exists in the parent bindings, OR
   *  - a per-call ctx object overrides a key that is already bound.
   *
   * @param bound - Flat merged bindings in effect for this logger level.
   */
  function wrap(bound: Record<string, unknown>): Logger {
    // Always build the pino child from the clean `base` so the JSON has exactly
    // the keys in `bound` — never inherited duplicates from an ancestor child.
    const p = Object.keys(bound).length > 0
      ? (base.child(bound) as unknown as PinoWithCustomLevels)
      : (base as unknown as PinoWithCustomLevels);

    // When ctx overlaps with a bound key, merge both into a fresh child from
    // base so the JSON output never contains duplicate field names.
    function resolve(ctx: Record<string, unknown> | undefined): [PinoWithCustomLevels, Record<string, unknown>] {
      if (!ctx) return [p, {}];
      const hasConflict = Object.keys(ctx).some((k) => Object.prototype.hasOwnProperty.call(bound, k));
      if (hasConflict) {
        return [base.child({ ...bound, ...ctx }) as unknown as PinoWithCustomLevels, {}];
      }
      return [p, ctx];
    }

    return {
      trace:   (msg, ctx) => { const [l, c] = resolve(ctx); l.trace(c, msg); },
      debug:   (msg, ctx) => { const [l, c] = resolve(ctx); l.debug(c, msg); },
      info:    (msg, ctx) => { const [l, c] = resolve(ctx); l.info(c, msg); },
      success: (msg, ctx) => { const [l, c] = resolve(ctx); l.success(c, msg); },
      warn:    (msg, ctx) => { const [l, c] = resolve(ctx); l.warn(c, msg); },
      error:   (msg, ctx) => { const [l, c] = resolve(ctx); l.error(c, msg); },
      fatal:   (msg, ctx) => { const [l, c] = resolve(ctx); l.fatal(c, msg); },
      // Merge new bindings over the accumulated set so later values win.
      child:   (bindings) => wrap({ ...bound, ...bindings }),
    };
  }

  const logger = wrap(options.bindings ?? {});
  return logger;
}

export const defaultLogger: Logger = createLogger({ level: 'info' });

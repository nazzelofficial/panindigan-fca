import pino from 'pino';
import type { Logger as PinoLogger } from 'pino';
import { SENSITIVE_FIELDS } from '../constants/index.js';

export interface Logger {
  trace(msg: string, ctx?: Record<string, unknown>): void;
  debug(msg: string, ctx?: Record<string, unknown>): void;
  info(msg: string, ctx?: Record<string, unknown>): void;
  warn(msg: string, ctx?: Record<string, unknown>): void;
  error(msg: string, ctx?: Record<string, unknown>): void;
  fatal(msg: string, ctx?: Record<string, unknown>): void;
  child(bindings: Record<string, unknown>): Logger;
}

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

export function createLogger(options: {
  level?: string;
  pretty?: boolean;
  bindings?: Record<string, unknown>;
}): Logger {
  const level = options.level ?? 'info';
  const pretty = options.pretty ?? false;

  const transport = pretty
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l o',
          ignore: 'pid,hostname',
          messageFormat: '[{level}] [{tag}] {msg}',
        },
      }
    : undefined;

  const base = pino(
    {
      level,
      redact: {
        paths: buildRedactPaths(),
        censor: '[REDACTED]',
      },
      serializers: {
        err: pino.stdSerializers.err,
      },
      ...(transport ? { transport } : {}),
    },
  );

  function wrap(p: PinoLogger): Logger {
    return {
      trace: (msg, ctx) => p.trace(ctx ?? {}, msg),
      debug: (msg, ctx) => p.debug(ctx ?? {}, msg),
      info: (msg, ctx) => p.info(ctx ?? {}, msg),
      warn: (msg, ctx) => p.warn(ctx ?? {}, msg),
      error: (msg, ctx) => p.error(ctx ?? {}, msg),
      fatal: (msg, ctx) => p.fatal(ctx ?? {}, msg),
      child: (bindings) => wrap(p.child(bindings)),
    };
  }

  const logger = wrap(options.bindings ? base.child(options.bindings) : base);
  return logger;
}

export const defaultLogger: Logger = createLogger({ level: 'info' });

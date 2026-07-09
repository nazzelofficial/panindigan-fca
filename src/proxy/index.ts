/**
 * ProxyManager — central proxy layer for panindigan-fca.
 *
 * Owns URL parsing, validation, agent construction, and connection reuse for
 * every outbound network connection made by the library (HTTP, MQTT/WebSocket).
 * Proxy credentials are masked in all logs and error messages.
 */

import { Agent, ProxyAgent } from 'undici';
import { connect as tlsConnect } from 'node:tls';
import * as https from 'node:https';
import * as net from 'node:net';
import * as tls from 'node:tls';
import { ConfigurationError } from '../errors/index.js';

// ─── Public types ─────────────────────────────────────────────────────────────

/** Object form of proxy configuration. */
export interface ProxyConfig {
  url: string;
}

/** Proxy option accepted by `createClient` — string shorthand or object. */
export type ProxyOptions = string | ProxyConfig;

// ─── Internal types ───────────────────────────────────────────────────────────

interface SocksProxyConfig {
  type: 4 | 5;
  host: string;
  port: number;
  userId?: string;
  password?: string;
}

// ─── Supported protocols ──────────────────────────────────────────────────────

const SUPPORTED_PROTOCOLS = new Set([
  'http:',
  'https:',
  'socks4:',
  'socks4a:',
  'socks5:',
  'socks5h:',
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Mask proxy URL credentials for safe logging.
 * `http://user:pass@host:8080` → `http://***:***@host:8080`
 */
export function maskProxyUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.username || parsed.password) {
      parsed.username = '***';
      parsed.password = '***';
    }
    return parsed.toString();
  } catch {
    return '<invalid-proxy-url>';
  }
}

/**
 * Normalise a `ProxyOptions` value (string shorthand or object) to a URL string.
 * Returns `null` when proxy is not configured.
 */
export function resolveProxyUrl(option?: ProxyOptions | null): string | null {
  if (!option) return null;
  if (typeof option === 'string') return option || null;
  return option.url || null;
}

function validateProxyUrl(url: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new ConfigurationError(
      `Invalid proxy URL: "${maskProxyUrl(url)}"`,
      { proxyUrl: maskProxyUrl(url) },
    );
  }

  if (!SUPPORTED_PROTOCOLS.has(parsed.protocol)) {
    throw new ConfigurationError(
      `Unsupported proxy protocol "${parsed.protocol}". ` +
      `Supported protocols: ${[...SUPPORTED_PROTOCOLS].join(', ')}`,
      { proxyUrl: maskProxyUrl(url), protocol: parsed.protocol },
    );
  }

  if (!parsed.hostname) {
    throw new ConfigurationError(
      `Proxy URL is missing a hostname: "${maskProxyUrl(url)}"`,
      { proxyUrl: maskProxyUrl(url) },
    );
  }

  return parsed;
}

function isSocks(protocol: string): boolean {
  return /^socks/i.test(protocol);
}

function parseSocks(parsed: URL): SocksProxyConfig {
  // socks4 / socks4a → type 4; socks5 / socks5h → type 5
  const type: 4 | 5 = parsed.protocol.startsWith('socks4') ? 4 : 5;
  return {
    type,
    host: parsed.hostname,
    port: Number(parsed.port) || 1080,
    userId: parsed.username ? decodeURIComponent(parsed.username) : undefined,
    password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
  };
}

// ─── WebSocket agents ─────────────────────────────────────────────────────────

/**
 * Build an https.Agent that tunnels WSS connections through a SOCKS proxy.
 * Dynamic import of `socks` so it only loads when a SOCKS proxy is configured.
 */
async function buildSocksWsAgent(config: SocksProxyConfig): Promise<https.Agent> {
  const { SocksClient } = await import('socks');

  const agent = new https.Agent({ keepAlive: true });

  // Override createConnection — the only hook ws uses when an agent is supplied.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (agent as any).createConnection = (
    options: { host: string; port: number; servername?: string },
    callback: (err: Error | null, socket: tls.TLSSocket | null) => void,
  ): void => {
    SocksClient.createConnection({
      proxy: {
        host:     config.host,
        port:     config.port,
        type:     config.type,
        userId:   config.userId,
        password: config.password,
      },
      command:     'connect',
      destination: { host: options.host, port: options.port },
    })
      .then(({ socket }) => {
        const tlsSock = tlsConnect({
          socket,
          servername:          options.servername ?? options.host,
          rejectUnauthorized:  true,
        });
        tlsSock.once('secureConnect', () => callback(null, tlsSock));
        tlsSock.once('error',         (err) => callback(err, null));
      })
      .catch((err: Error) => callback(err, null));
  };

  return agent;
}

/**
 * Build an https.Agent that tunnels WSS connections through an HTTP/HTTPS proxy
 * using the HTTP CONNECT method.
 */
function buildHttpConnectWsAgent(parsed: URL): https.Agent {
  const proxyHost = parsed.hostname;
  const proxyPort = Number(parsed.port) || (parsed.protocol === 'https:' ? 443 : 8080);
  const auth      = (parsed.username && parsed.password)
    ? Buffer.from(`${decodeURIComponent(parsed.username)}:${decodeURIComponent(parsed.password)}`).toString('base64')
    : null;

  const agent = new https.Agent({ keepAlive: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (agent as any).createConnection = (
    options: { host: string; port: number; servername?: string },
    callback: (err: Error | null, socket: tls.TLSSocket | null) => void,
  ): void => {
    const rawSocket = net.connect(proxyPort, proxyHost);

    rawSocket.once('error', (err) => callback(err, null));

    rawSocket.once('connect', () => {
      const connectRequest = [
        `CONNECT ${options.host}:${options.port} HTTP/1.1`,
        `Host: ${options.host}:${options.port}`,
        ...(auth ? [`Proxy-Authorization: Basic ${auth}`] : []),
        '',
        '',
      ].join('\r\n');

      rawSocket.write(connectRequest);

      // Accumulate raw bytes to safely locate the \r\n\r\n header boundary.
      // Using a binary Buffer (not a string) so TLS handshake bytes that arrive
      // in the same chunk as the CONNECT response are not corrupted by UTF-8 decoding.
      let buf = Buffer.allocUnsafe(0);
      const CRLF2 = Buffer.from('\r\n\r\n');

      rawSocket.on('data', (chunk: Buffer) => {
        buf = Buffer.concat([buf, chunk]);
        const idx = buf.indexOf(CRLF2);
        if (idx === -1) return; // headers not yet complete

        rawSocket.removeAllListeners('data');

        const statusLine = buf.subarray(0, idx).toString('utf8').split('\r\n')[0] ?? '';
        const ok = / 200[^\d]/.test(statusLine) || statusLine.endsWith(' 200');

        if (!ok) {
          rawSocket.destroy();
          callback(new Error(`HTTP CONNECT failed: ${statusLine}`), null);
          return;
        }

        // Any bytes after \r\n\r\n are the start of the TLS handshake — push
        // them back into the socket so the TLS layer sees them.
        const remaining = buf.subarray(idx + 4);
        if (remaining.length > 0) {
          rawSocket.unshift(remaining);
        }

        // Tunnel established — upgrade to TLS.
        const tlsSock = tlsConnect({
          socket:             rawSocket,
          servername:         options.servername ?? options.host,
          rejectUnauthorized: true,
        });
        tlsSock.once('secureConnect', () => callback(null, tlsSock));
        tlsSock.once('error',         (err) => callback(err, null));
      });
    });
  };

  return agent;
}

// ─── Undici SOCKS agent (for HttpClient) ─────────────────────────────────────

/**
 * Build an undici Agent that routes all origins through the given SOCKS proxy.
 * Uses Agent (not Pool) so it works across multiple origins (www.facebook.com,
 * upload.facebook.com, etc.) — Pool is origin-bound.
 */
async function buildSocksUndiciAgent(
  config: SocksProxyConfig,
  maxConnections: number,
  connectTimeoutMs: number,
): Promise<Agent> {
  const { SocksClient } = await import('socks');

  return new Agent({
    connections:          maxConnections,
    keepAliveTimeout:     30_000,
    keepAliveMaxTimeout:  300_000,
    headersTimeout:       60_000,
    bodyTimeout:          120_000,
    // @ts-expect-error — undici v7 connect option typings differ slightly from runtime
    connect: (
      opts: { hostname: string; port: string; protocol: string; servername?: string | null },
      cb: (err: Error | null, socket: unknown) => void,
    ) => {
      const isHttps    = opts.protocol === 'https:';
      const destPort   = Number(opts.port) || (isHttps ? 443 : 80);
      const destHost   = opts.hostname;

      SocksClient.createConnection({
        proxy: {
          host:     config.host,
          port:     config.port,
          type:     config.type,
          userId:   config.userId,
          password: config.password,
        },
        command:     'connect',
        destination: { host: destHost, port: destPort },
        timeout:     connectTimeoutMs,
      })
        .then(({ socket }) => {
          if (isHttps) {
            const servername = (opts.servername ?? opts.hostname) || destHost;
            const tlsSock    = tlsConnect({ socket, servername, rejectUnauthorized: true });
            tlsSock.once('secureConnect', () => cb(null, tlsSock));
            tlsSock.once('error',         (err) => cb(err, null));
          } else {
            cb(null, socket);
          }
        })
        .catch((err: Error) => cb(err, null));
    },
  });
}

// ─── ProxyManager ─────────────────────────────────────────────────────────────

/**
 * Manages a single proxy connection — parses, validates, and caches the
 * undici dispatcher and WebSocket agent so they are never recreated per request.
 */
export class ProxyManager {
  private readonly parsed:    URL;
  private readonly _masked:   string;

  /** Cached undici dispatcher (Agent or ProxyAgent). */
  private _dispatcher: Agent | ProxyAgent | null = null;
  /** Cached WebSocket HTTPS agent. */
  private _wsAgent: https.Agent | null = null;

  constructor(readonly proxyUrl: string) {
    this.parsed  = validateProxyUrl(proxyUrl);
    this._masked = maskProxyUrl(proxyUrl);
  }

  /** Proxy URL with credentials redacted — safe for logs and errors. */
  get maskedUrl(): string {
    return this._masked;
  }

  /** Detected protocol, e.g. `"socks5:"`. */
  get protocol(): string {
    return this.parsed.protocol;
  }

  /** Proxy hostname. */
  get host(): string {
    return this.parsed.hostname;
  }

  /** Whether this proxy uses a SOCKS protocol. */
  isSocksProxy(): boolean {
    return isSocks(this.parsed.protocol);
  }

  /**
   * Return the cached undici dispatcher for HTTP requests.
   * Builds and caches it on first call; subsequent calls are synchronous.
   */
  async getUndiciDispatcher(
    maxConnections: number,
    connectTimeoutMs: number,
  ): Promise<Agent | ProxyAgent> {
    if (this._dispatcher) return this._dispatcher;

    if (isSocks(this.parsed.protocol)) {
      this._dispatcher = await buildSocksUndiciAgent(
        parseSocks(this.parsed),
        maxConnections,
        connectTimeoutMs,
      );
    } else {
      this._dispatcher = new ProxyAgent({ uri: this.proxyUrl });
    }

    return this._dispatcher;
  }

  /**
   * Return the cached https.Agent for WebSocket (ws library) connections.
   * Builds and caches it on first call.
   */
  async getWebSocketAgent(): Promise<https.Agent> {
    if (this._wsAgent) return this._wsAgent;

    if (isSocks(this.parsed.protocol)) {
      this._wsAgent = await buildSocksWsAgent(parseSocks(this.parsed));
    } else {
      this._wsAgent = buildHttpConnectWsAgent(this.parsed);
    }

    return this._wsAgent;
  }

  /** Release resources held by the undici dispatcher. */
  async close(): Promise<void> {
    if (this._dispatcher) {
      try {
        await this._dispatcher.close();
      } catch {
        // ignore
      }
      this._dispatcher = null;
    }
    if (this._wsAgent) {
      this._wsAgent.destroy();
      this._wsAgent = null;
    }
  }
}
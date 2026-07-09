import type { HttpClient } from '../http/index.js';
import type { CacheManager } from '../cache/index.js';
import type { Logger } from '../logger/index.js';
import type { SessionTokens } from '../auth/index.js';
import { buildGraphQLRequest, buildFormRequest, parseJsonResponse } from '../graphql/index.js';
import { FB_MESSAGING_SEND } from '../constants/index.js';
import { nsKey } from '../cache/index.js';
import { NotFoundError } from '../errors/index.js';

export interface StickerMeta {
  stickerId: string;
  label: string | null;
  stickerUrl: string | null;
  packId: string | null;
  width: number;
  height: number;
}

export interface StickerPack {
  packId: string;
  name: string | null;
  stickers: StickerMeta[];
}

export interface SendStickerOptions {
  threadId: string;
  stickerId: string;
  signal?: AbortSignal;
}

export interface SendStickerResult {
  messageId: string;
  threadId: string;
  timestamp: Date;
}

export class StickersModule {
  constructor(
    private readonly http: HttpClient,
    private readonly cache: CacheManager,
    private readonly logger: Logger,
    private readonly getTokens: () => SessionTokens,
  ) {}

  async send(options: SendStickerOptions): Promise<SendStickerResult> {
    const tokens = this.getTokens();
    this.logger.info('Sending sticker', { tag: 'STICKERS', threadId: options.threadId, stickerId: options.stickerId });

    const params: Record<string, string> = {
      action_type: 'ma-type:user-generated-message',
      timestamp: Date.now().toString(),
      message_id: `client:${Date.now()}:${Math.random().toString(36).slice(2)}`,
      thread_fbid: options.threadId,
      sticker_id: options.stickerId,
      fb_dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    };

    const { url, body } = buildFormRequest({ url: FB_MESSAGING_SEND, params });
    const resp = await this.http.post(url, body, { signal: options.signal });
    const text = await resp.text();

    let parsed: Record<string, unknown>;
    try {
      parsed = parseJsonResponse(text) as Record<string, unknown>;
    } catch {
      parsed = {};
    }

    const payload = (parsed['payload'] as Record<string, unknown>) ?? {};
    const messageId = String(payload['message_id'] ?? params['message_id'] ?? '');
    const timestamp = new Date(Number(payload['timestamp'] ?? Date.now()));

    this.logger.info('Sticker sent', { tag: 'STICKERS', messageId, threadId: options.threadId });
    return { messageId, threadId: options.threadId, timestamp };
  }

  async getPack(packId: string, signal?: AbortSignal): Promise<StickerPack> {
    const tokens = this.getTokens();
    const cacheKey = nsKey('stickers', `pack:${packId}`);

    const cached = await this.cache.get<StickerPack>(cacheKey);
    if (cached) return cached;

    this.logger.debug('Fetching sticker pack', { tag: 'STICKERS', packId });

    const { url, body } = buildGraphQLRequest({
      queryName: 'stickerPack',
      variables: { packID: packId },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    });

    const resp = await this.http.post(url, body, { signal });
    const text = await resp.text();
    const data = parseJsonResponse(text) as Record<string, unknown>;

    const pack = this.parseStickerPack(packId, data);
    if (!pack) throw new NotFoundError(`Sticker pack ${packId} not found`, { packId });

    await this.cache.set(cacheKey, pack, 3600000);
    return pack;
  }

  private parseStickerPack(packId: string, data: Record<string, unknown>): StickerPack | null {
    try {
      const d = data['data'] as Record<string, unknown> | undefined;
      const node = (d?.['sticker_package'] ?? d?.['sticker_pack']) as Record<string, unknown> | undefined;
      if (!node) return null;

      const rawStickers = Array.isArray(node['stickers'])
        ? (node['stickers'] as Array<Record<string, unknown>>)
        : [];

      const stickers: StickerMeta[] = rawStickers.map((s) => ({
        stickerId: String(s['id'] ?? ''),
        label: s['label'] ? String(s['label']) : null,
        stickerUrl: s['url'] ? String(s['url']) : null,
        packId,
        width: Number(s['width'] ?? 0),
        height: Number(s['height'] ?? 0),
      }));

      return {
        packId,
        name: node['name'] ? String(node['name']) : null,
        stickers,
      };
    } catch {
      return null;
    }
  }
}

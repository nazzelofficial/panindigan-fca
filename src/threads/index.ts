import type { HttpClient } from '../http/index.js';
import type { CacheManager } from '../cache/index.js';
import type { TypedEventEmitter } from '../events/index.js';
import type { Logger } from '../logger/index.js';
import type { SessionTokens } from '../auth/index.js';
import { buildGraphQLRequest, buildFormRequest, parseJsonResponse } from '../graphql/index.js';
import { nsKey } from '../cache/index.js';
import { NotFoundError } from '../errors/index.js';
import {
  DEFAULT_THREAD_LIMIT,
  MAX_THREAD_LIMIT,
  FB_LEAVE_THREAD_URL,
  FB_SET_THREAD_IMAGE_URL,
} from '../constants/index.js';
import type { Readable } from 'node:stream';

export interface Thread {
  threadId: string;
  name: string | null;
  isGroup: boolean;
  participantIds: string[];
  unreadCount: number;
  lastMessageTimestamp: Date | null;
  photoUrl: string | null;
  muteUntil: Date | null;
  isArchived: boolean;
}

export interface ThreadListOptions {
  limit?: number;
  cursor?: string | null;
  signal?: AbortSignal;
}

export interface PageResult<T> {
  items: T[];
  hasMore: boolean;
  cursor: string | null;
}

export interface CreateGroupOptions {
  participantIds: string[];
  name?: string;
  signal?: AbortSignal;
}

function parseThread(node: Record<string, unknown>): Thread {
  const participants = Array.isArray(node['all_participants'])
    ? (node['all_participants'] as Array<Record<string, unknown>>).map(
        (p) => String((p['node'] as Record<string, unknown>)?.['id'] ?? p['id'] ?? ''),
      )
    : [];

  const muteRaw = node['mute_until'];
  const muteUntil =
    typeof muteRaw === 'number' && muteRaw > 0
      ? new Date(muteRaw * 1000)
      : null;

  const tsRaw = (node['last_message'] as Record<string, unknown> | undefined)?.['timestamp'];
  const lastMessageTimestamp =
    typeof tsRaw === 'number' || typeof tsRaw === 'string'
      ? new Date(Number(tsRaw))
      : null;

  return {
    threadId: String(node['thread_key'] ?? node['id'] ?? ''),
    name: node['name'] ? String(node['name']) : null,
    isGroup: Boolean(node['is_group_thread'] ?? node['thread_type'] === 'GROUP'),
    participantIds: participants,
    unreadCount: Number(node['unread_count'] ?? 0),
    lastMessageTimestamp,
    photoUrl: node['image']
      ? String((node['image'] as Record<string, unknown>)['uri'] ?? '')
      : null,
    muteUntil,
    isArchived: Boolean(node['folder'] === 'ARCHIVED'),
  };
}

export class ThreadsModule {
  constructor(
    private readonly http: HttpClient,
    private readonly cache: CacheManager,
    private readonly emitter: TypedEventEmitter,
    private readonly logger: Logger,
    private readonly getTokens: () => SessionTokens,
  ) {}

  async list(options: ThreadListOptions = {}): Promise<PageResult<Thread>> {
    const tokens = this.getTokens();
    const limit = Math.min(options.limit ?? DEFAULT_THREAD_LIMIT, MAX_THREAD_LIMIT);
    const cacheKey = nsKey('threads', `list:${limit}:${options.cursor ?? 'start'}`);

    const cached = await this.cache.get<PageResult<Thread>>(cacheKey);
    if (cached) return cached;

    this.logger.debug('Fetching thread list', { tag: 'THREADS', limit });

    const { url, body } = buildGraphQLRequest({
      queryName: 'threadList',
      variables: {
        limit,
        before: options.cursor ?? null,
        tags: ['INBOX'],
        includeDeliveryReceipts: true,
        includeSeqID: false,
      },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    });

    const resp = await this.http.post(url, body, { signal: options.signal });
    const text = await resp.text();
    const data = parseJsonResponse(text) as Record<string, unknown>;

    const edges = this.extractThreadEdges(data);
    const items = edges.map((e) => parseThread(e));
    const pageInfo = this.extractPageInfo(data);

    const result: PageResult<Thread> = {
      items,
      hasMore: pageInfo.hasNextPage,
      cursor: pageInfo.endCursor,
    };

    await this.cache.set(cacheKey, result, 30000);
    return result;
  }

  async get(threadId: string, signal?: AbortSignal): Promise<Thread> {
    const tokens = this.getTokens();
    const cacheKey = nsKey('threads', threadId);

    const cached = await this.cache.get<Thread>(cacheKey);
    if (cached) return cached;

    this.logger.debug('Fetching thread info', { tag: 'THREADS', threadId });

    const { url, body } = buildGraphQLRequest({
      queryName: 'threadInfo',
      variables: { threadID: threadId },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    });

    const resp = await this.http.post(url, body, { signal });
    const text = await resp.text();
    const data = parseJsonResponse(text) as Record<string, unknown>;
    const node = this.extractThreadNode(data);

    if (!node) throw new NotFoundError(`Thread ${threadId} not found`, { threadId });

    const thread = parseThread(node);
    await this.cache.set(cacheKey, thread, 60000);
    return thread;
  }

  async create(options: CreateGroupOptions): Promise<Thread> {
    const tokens = this.getTokens();
    this.logger.info('Creating group thread', { tag: 'THREADS', count: options.participantIds.length });

    const { url, body } = buildGraphQLRequest({
      queryName: 'createGroup',
      variables: {
        to: options.participantIds,
        name: options.name ?? '',
        message: { text: '' },
      },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    });

    const resp = await this.http.post(url, body, { signal: options.signal });
    const text = await resp.text();
    const data = parseJsonResponse(text) as Record<string, unknown>;
    const node = this.extractThreadNode(data) ?? {};
    const thread = parseThread(node);

    this.logger.info('Group thread created', { tag: 'THREADS', threadId: thread.threadId });
    return thread;
  }

  async rename(threadId: string, name: string, signal?: AbortSignal): Promise<void> {
    const tokens = this.getTokens();
    this.logger.info('Renaming thread', { tag: 'THREADS', threadId, name });

    const { url, body } = buildGraphQLRequest({
      queryName: 'renameThread',
      variables: { threadID: threadId, name },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    });

    await this.http.post(url, body, { signal });
    await this.cache.delete(nsKey('threads', threadId));
    this.emitter.emit('thread:renamed', { threadId, newName: name, changedBy: tokens.userId });
  }

  async setPhoto(threadId: string, stream: Readable, signal?: AbortSignal): Promise<void> {
    const tokens = this.getTokens();
    this.logger.info('Setting thread photo', { tag: 'THREADS', threadId });

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array));
    }
    const imageBuffer = Buffer.concat(chunks);

    const boundary = `----WebKitFormBoundary${Math.random().toString(36).slice(2)}`;

    // Build the multipart body as a raw Buffer — no toString() on binary data.
    const CRLF = Buffer.from('\r\n');
    const bodyBuffer = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="thread_image"; filename="photo.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`),
      imageBuffer,
      CRLF,
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="thread_id"\r\n\r\n${threadId}\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="fb_dtsg"\r\n\r\n${tokens.dtsg}\r\n`),
      Buffer.from(`--${boundary}--\r\n`),
    ]);

    const setPhotoResp = await this.http.postBuffer(FB_SET_THREAD_IMAGE_URL, bodyBuffer, {
      headers: {
        'content-type': `multipart/form-data; boundary=${boundary}`,
        'content-length': String(bodyBuffer.byteLength),
      },
      signal,
    });

    let newPhotoUrl = '';
    try {
      const respText = await setPhotoResp.text();
      const respData = parseJsonResponse(respText) as Record<string, unknown>;
      const respPayload = (respData['payload'] as Record<string, unknown>) ?? respData;
      newPhotoUrl = String(
        respPayload['image_uri'] ??
        respPayload['photo_url'] ??
        respPayload['uri'] ??
        (respPayload['image'] as Record<string, unknown> | undefined)?.['uri'] ??
        '',
      );
    } catch {
      // URL stays empty — the set still succeeded; callers can fetch updated thread to get URL
    }

    await this.cache.delete(nsKey('threads', threadId));
    this.emitter.emit('thread:photo:changed', { threadId, newPhotoUrl, changedBy: tokens.userId });
  }

  async addParticipants(threadId: string, userIds: string[], signal?: AbortSignal): Promise<void> {
    const tokens = this.getTokens();
    this.logger.info('Adding participants', { tag: 'THREADS', threadId, count: userIds.length });

    const { url, body } = buildGraphQLRequest({
      queryName: 'addParticipants',
      variables: { threadID: threadId, to: userIds },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    });

    await this.http.post(url, body, { signal });
    await this.cache.delete(nsKey('threads', threadId));

    for (const userId of userIds) {
      this.emitter.emit('thread:participant:added', { threadId, addedUserId: userId, addedByUserId: tokens.userId });
    }
  }

  async removeParticipant(threadId: string, userId: string, signal?: AbortSignal): Promise<void> {
    const tokens = this.getTokens();
    this.logger.info('Removing participant', { tag: 'THREADS', threadId, userId });

    const { url, body } = buildGraphQLRequest({
      queryName: 'removeParticipant',
      variables: { threadID: threadId, userId },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    });

    await this.http.post(url, body, { signal });
    await this.cache.delete(nsKey('threads', threadId));
    this.emitter.emit('thread:participant:removed', { threadId, removedUserId: userId, removedByUserId: tokens.userId });
  }

  async leave(threadId: string, signal?: AbortSignal): Promise<void> {
    const tokens = this.getTokens();
    this.logger.info('Leaving thread', { tag: 'THREADS', threadId });

    const { url, body } = buildFormRequest({
      url: FB_LEAVE_THREAD_URL,
      params: { thread_fbid: threadId },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    });

    await this.http.post(url, body, { signal });
    await this.cache.delete(nsKey('threads', threadId));
  }

  async mute(threadId: string, durationMs?: number, signal?: AbortSignal): Promise<void> {
    const tokens = this.getTokens();
    const muteUntilTimestamp = durationMs !== undefined
      ? Math.floor((Date.now() + durationMs) / 1000)
      : -1;

    this.logger.info('Muting thread', { tag: 'THREADS', threadId, muteUntilTimestamp });

    const { url, body } = buildGraphQLRequest({
      queryName: 'muteThread',
      variables: { threadID: threadId, muteUntilTimestamp },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    });

    await this.http.post(url, body, { signal });
    await this.cache.delete(nsKey('threads', threadId));
    this.emitter.emit('thread:muted', {
      threadId,
      mutedUntil: muteUntilTimestamp > 0 ? new Date(muteUntilTimestamp * 1000) : null,
    });
  }

  async unmute(threadId: string, signal?: AbortSignal): Promise<void> {
    return this.mute(threadId, 0, signal);
  }

  async archive(threadId: string, signal?: AbortSignal): Promise<void> {
    const tokens = this.getTokens();
    this.logger.info('Archiving thread', { tag: 'THREADS', threadId });

    const { url, body } = buildGraphQLRequest({
      queryName: 'archiveThread',
      variables: { threadID: threadId, folder: 'ARCHIVED' },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    });

    await this.http.post(url, body, { signal });
    await this.cache.delete(nsKey('threads', threadId));
    this.emitter.emit('thread:archived', { threadId, archived: true });
  }

  async unarchive(threadId: string, signal?: AbortSignal): Promise<void> {
    const tokens = this.getTokens();
    this.logger.info('Unarchiving thread', { tag: 'THREADS', threadId });

    const { url, body } = buildGraphQLRequest({
      queryName: 'archiveThread',
      variables: { threadID: threadId, folder: 'INBOX' },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    });

    await this.http.post(url, body, { signal });
    await this.cache.delete(nsKey('threads', threadId));
  }

  private extractThreadEdges(data: Record<string, unknown>): Record<string, unknown>[] {
    try {
      const d = data['data'] as Record<string, unknown> | undefined;
      const viewer = (d?.['viewer'] ?? d?.['user'] ?? d) as Record<string, unknown> | undefined;
      const inbox = (viewer?.['message_threads'] ?? viewer?.['threads']) as Record<string, unknown> | undefined;
      const edges = inbox?.['edges'];
      if (Array.isArray(edges)) {
        return edges.map((e) => (e as Record<string, unknown>)['node'] as Record<string, unknown>);
      }
    } catch {
      // fall through
    }
    return [];
  }

  private extractThreadNode(data: Record<string, unknown>): Record<string, unknown> | null {
    try {
      const d = data['data'] as Record<string, unknown> | undefined;
      const thread = d?.['message_thread'] ?? d?.['thread'];
      if (thread && typeof thread === 'object') return thread as Record<string, unknown>;
    } catch {
      // fall through
    }
    return null;
  }

  private extractPageInfo(data: Record<string, unknown>): { hasNextPage: boolean; endCursor: string | null } {
    try {
      const d = data['data'] as Record<string, unknown> | undefined;
      const viewer = (d?.['viewer'] ?? d?.['user'] ?? d) as Record<string, unknown> | undefined;
      const inbox = (viewer?.['message_threads'] ?? viewer?.['threads']) as Record<string, unknown> | undefined;
      const pageInfo = inbox?.['page_info'] as Record<string, unknown> | undefined;
      if (pageInfo) {
        return {
          hasNextPage: Boolean(pageInfo['has_next_page']),
          endCursor: pageInfo['end_cursor'] ? String(pageInfo['end_cursor']) : null,
        };
      }
    } catch {
      // fall through
    }
    return { hasNextPage: false, endCursor: null };
  }
}

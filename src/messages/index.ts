import type { HttpClient } from '../http/index.js';
import type { CacheManager } from '../cache/index.js';
import type { TypedEventEmitter } from '../events/index.js';
import type { Logger } from '../logger/index.js';
import type { SessionTokens } from '../auth/index.js';
import { buildGraphQLRequest, buildFormRequest, parseJsonResponse } from '../graphql/index.js';
import { FB_MESSAGING_SEND, FB_UPLOAD_URL, FB_DELETE_MESSAGES_URL, FB_TYPING_URL } from '../constants/index.js';
import { nsKey } from '../cache/index.js';
import { UploadError } from '../errors/index.js';
import { v4 as uuidv4 } from 'uuid';
import type { Readable } from 'node:stream';

export interface SendMessageOptions {
  threadId: string;
  body?: string;
  attachments?: Array<{ name: string; type: string; stream: Readable; size?: number }>;
  replyTo?: string;
  mentionedUsers?: Array<{ userId: string; offset: number; length: number }>;
  stickerId?: string;
  signal?: AbortSignal;
}

export interface SendMessageResult {
  messageId: string;
  threadId: string;
  timestamp: Date;
}

export interface Message {
  messageId: string;
  threadId: string;
  senderId: string;
  senderName: string;
  body: string | null;
  attachments: Array<{
    id: string;
    type: string;
    url?: string;
    name?: string;
    size?: number;
    stickerId?: string;
    shareTitle?: string;
    shareDescription?: string;
  }>;
  timestamp: Date;
  isGroup: boolean;
  replyTo?: string;
}

export interface ReplyOptions {
  /** The message being replied to. */
  messageId: string;
  /** The thread that contains the message. Required because reply() does not fetch messages from the network. */
  threadId: string;
  body: string;
  attachments?: Array<{ name: string; type: string; stream: Readable; size?: number }>;
  signal?: AbortSignal;
}

export interface PageResult<T> {
  items: T[];
  hasMore: boolean;
  cursor: string | null;
}

/** Build a multipart/form-data body as a raw Buffer. */
function buildUploadMultipart(
  fields: Array<{ name: string; value: string }>,
  file: { fileName: string; contentType: string; data: Buffer },
  boundary: string,
): Buffer {
  const CRLF = Buffer.from('\r\n');
  const parts: Buffer[] = [];

  for (const field of fields) {
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${field.name}"\r\n\r\n${field.value}\r\n`,
      ),
    );
  }

  parts.push(
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${file.fileName}"\r\nContent-Type: ${file.contentType}\r\n\r\n`,
    ),
  );
  parts.push(file.data);
  parts.push(CRLF);
  parts.push(Buffer.from(`--${boundary}--\r\n`));
  return Buffer.concat(parts);
}

export class MessagesModule {
  constructor(
    private readonly http: HttpClient,
    private readonly cache: CacheManager,
    private readonly emitter: TypedEventEmitter,
    private readonly logger: Logger,
    private readonly getTokens: () => SessionTokens,
  ) {}

  /**
   * Upload a single attachment and return its attachment ID as reported by Facebook.
   * Emits upload:progress, upload:complete, and upload:failed events.
   */
  private async uploadAttachment(
    file: { name: string; type: string; stream: Readable; size?: number },
    tokens: SessionTokens,
    signal?: AbortSignal,
  ): Promise<string> {
    const uploadId = uuidv4();
    this.emitter.emit('upload:progress', {
      uploadId,
      bytesTransferred: 0,
      totalBytes: file.size ?? 0,
      percent: 0,
    });

    const chunks: Buffer[] = [];
    let bytesRead = 0;

    try {
      for await (const chunk of file.stream) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array);
        chunks.push(buf);
        bytesRead += buf.byteLength;
        if (file.size) {
          const percent = Math.min(Math.round((bytesRead / file.size) * 100), 99);
          this.emitter.emit('upload:progress', {
            uploadId,
            bytesTransferred: bytesRead,
            totalBytes: file.size,
            percent,
          });
        }
      }
    } catch (err) {
      this.emitter.emit('upload:failed', { uploadId, error: err instanceof Error ? err : new Error(String(err)) });
      throw new UploadError(`Failed to read stream for attachment "${file.name}"`, bytesRead, { name: file.name }, err);
    }

    const fileBuffer = Buffer.concat(chunks);
    const totalBytes = fileBuffer.byteLength;
    const boundary = `----PFCABound${uploadId.replace(/-/g, '').slice(0, 16)}`;

    const body = buildUploadMultipart(
      [
        { name: 'upload_id', value: uploadId },
        { name: 'fb_dtsg', value: tokens.dtsg },
        { name: 'lsd', value: tokens.lsd },
      ],
      { fileName: file.name, contentType: file.type, data: fileBuffer },
      boundary,
    );

    let parsed: Record<string, unknown>;
    try {
      const resp = await this.http.postBuffer(FB_UPLOAD_URL, body, {
        headers: {
          'content-type': `multipart/form-data; boundary=${boundary}`,
          'content-length': String(body.byteLength),
        },
        signal,
      });
      const text = await resp.text();
      parsed = parseJsonResponse(text) as Record<string, unknown>;
    } catch (err) {
      this.emitter.emit('upload:failed', { uploadId, error: err instanceof Error ? err : new Error(String(err)) });
      throw new UploadError(`Upload failed for attachment "${file.name}"`, bytesRead, { name: file.name }, err);
    }

    // Facebook returns the attachment/file ID in various response shapes.
    // Require a real server-assigned ID — fall back to undefined, never to the
    // client-generated uploadId, because that would produce invalid attachment
    // params in the subsequent send call.
    const payload = (parsed['payload'] as Record<string, unknown>) ?? parsed;
    const metadataArr = (payload['metadata'] as Array<Record<string, unknown>> | undefined) ?? [];
    const firstMeta = metadataArr[0] as Record<string, unknown> | undefined;

    const rawId =
      firstMeta?.['fbid'] ??
      payload['fbid'] ??
      payload['attachment_id'] ??
      payload['attachment_token'];

    if (!rawId) {
      const errMsg = `Upload succeeded but Facebook returned no attachment ID for "${file.name}". Response: ${JSON.stringify(parsed).slice(0, 400)}`;
      const uploadErr = new UploadError(errMsg, totalBytes, { name: file.name });
      this.emitter.emit('upload:failed', { uploadId, error: uploadErr });
      throw uploadErr;
    }

    const attachmentId = String(rawId);

    this.emitter.emit('upload:progress', { uploadId, bytesTransferred: totalBytes, totalBytes, percent: 100 });
    this.emitter.emit('upload:complete', { uploadId, attachmentToken: attachmentId });

    return attachmentId;
  }

  async send(options: SendMessageOptions): Promise<SendMessageResult> {
    if (!options.body && !options.stickerId && (!options.attachments || options.attachments.length === 0)) {
      throw new Error('Message must have at least one of: body, stickerId, or attachments');
    }
    const tokens = this.getTokens();
    this.logger.info('Sending message', { tag: 'MESSAGES', threadId: options.threadId });

    const params: Record<string, string> = {
      action_type: 'ma-type:user-generated-message',
      timestamp: Date.now().toString(),
      message_id: `client:${Date.now()}:${Math.random().toString(36).slice(2)}`,
      thread_fbid: options.threadId,
      fb_dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    };

    if (options.body) params['body'] = options.body;
    if (options.stickerId) params['sticker_id'] = options.stickerId;
    if (options.replyTo) params['replied_to_message_id'] = options.replyTo;

    if (options.mentionedUsers?.length) {
      const mentions = options.mentionedUsers.map((m) => ({
        entity_id: m.userId,
        offset: m.offset,
        length: m.length,
        type: 'p',
      }));
      params['profile_tags_data'] = JSON.stringify(mentions);
    }

    // Upload attachments sequentially and include their IDs in the message
    if (options.attachments?.length) {
      const imageIds: string[] = [];
      const videoIds: string[] = [];
      const fileIds: string[] = [];

      for (const att of options.attachments) {
        this.logger.debug('Uploading attachment', { tag: 'MESSAGES', name: att.name, type: att.type });
        const attachmentId = await this.uploadAttachment(att, tokens, options.signal);

        const mimeBase = att.type.split('/')[0];
        if (mimeBase === 'image') {
          imageIds.push(attachmentId);
        } else if (mimeBase === 'video') {
          videoIds.push(attachmentId);
        } else {
          fileIds.push(attachmentId);
        }
      }

      // Append attachment IDs to form params — Facebook uses indexed array params
      imageIds.forEach((id, i) => { params[`image_ids[${i}]`] = id; });
      videoIds.forEach((id, i) => { params[`video_ids[${i}]`] = id; });
      fileIds.forEach((id, i) => { params[`file_ids[${i}]`] = id; });
    }

    const { url, body } = buildFormRequest({ url: FB_MESSAGING_SEND, params, dtsg: tokens.dtsg, lsd: tokens.lsd });
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

    await this.cache.delete(nsKey('threads', options.threadId));
    this.logger.info('Message sent', { tag: 'MESSAGES', messageId, threadId: options.threadId });
    return { messageId, threadId: options.threadId, timestamp };
  }

  /**
   * Reply to a specific message.
   * Both `messageId` (to reply to) and `threadId` are required.
   */
  async reply(options: ReplyOptions): Promise<SendMessageResult> {
    return this.send({
      threadId: options.threadId,
      body: options.body,
      replyTo: options.messageId,
      attachments: options.attachments,
      signal: options.signal,
    });
  }

  /**
   * Permanently unsend (retract) a message you sent.
   * The message is removed for all participants.
   */
  async unsend(messageId: string, signal?: AbortSignal): Promise<void> {
    const tokens = this.getTokens();
    this.logger.info('Unsending message', { tag: 'MESSAGES', messageId });
    const { url, body } = buildGraphQLRequest({
      queryName: 'sendMessage',
      variables: { messageId },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
      friendlyName: 'UnsendMessageMutation',
    });
    await this.http.post(url, body, { signal });
    await this.cache.delete(nsKey('messages', messageId));
  }

  /**
   * Delete a message from your view only (not for other participants).
   * Uses Facebook's delete_message endpoint.
   */
  async delete(messageId: string, signal?: AbortSignal): Promise<void> {
    const tokens = this.getTokens();
    this.logger.info('Deleting message (own view)', { tag: 'MESSAGES', messageId });

    const { url, body } = buildFormRequest({
      url: FB_DELETE_MESSAGES_URL,
      params: {
        'message_ids[]': messageId,
      },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    });

    await this.http.post(url, body, { signal });
    await this.cache.delete(nsKey('messages', messageId));
  }

  async forward(options: {
    messageId: string;
    toThreadIds: string[];
    signal?: AbortSignal;
  }): Promise<Array<{ threadId: string; ok: boolean; error?: string }>> {
    const tokens  = this.getTokens();
    const results = await Promise.allSettled(
      options.toThreadIds.map(async (threadId) => {
        const params: Record<string, string> = {
          action_type:          'ma-type:forward-message',
          forwarded_message_id: options.messageId,
          thread_fbid:          threadId,
          fb_dtsg:              tokens.dtsg,
          lsd:                  tokens.lsd,
        };
        const { url, body } = buildFormRequest({ url: FB_MESSAGING_SEND, params });
        await this.http.post(url, body, { signal: options.signal });
        return threadId;
      }),
    );

    return results.map((r, i) =>
      r.status === 'fulfilled'
        ? { threadId: options.toThreadIds[i]!, ok: true }
        : {
            threadId: options.toThreadIds[i]!,
            ok:       false,
            error:    r.reason instanceof Error ? r.reason.message : String(r.reason),
          },
    );
  }

  async react(options: { messageId: string; reaction: string; signal?: AbortSignal }): Promise<void> {
    const tokens = this.getTokens();
    this.logger.debug('Reacting to message', {
      tag: 'MESSAGES',
      messageId: options.messageId,
      reaction: options.reaction,
    });
    const { url, body } = buildGraphQLRequest({
      queryName: 'reactMessage',
      variables: {
        data: {
          action: options.reaction ? 'ADD_REACTION' : 'REMOVE_REACTION',
          reaction: options.reaction,
          message_id: options.messageId,
        },
      },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    });
    await this.http.post(url, body, { signal: options.signal });
  }

  async getReactions(
    messageId: string,
    signal?: AbortSignal,
  ): Promise<Array<{ userId: string; userName: string; reaction: string; timestamp: Date }>> {
    const tokens = this.getTokens();
    const { url, body } = buildGraphQLRequest({
      variables: { messageId },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
      friendlyName: 'GetMessageReactionsQuery',
    });
    const resp = await this.http.post(url, body, { signal });
    const text = await resp.text();
    try {
      const data = parseJsonResponse(text) as Record<string, unknown>;
      const reactions = ((data['data'] as Record<string, unknown>)?.['messageReactions']) as unknown[];
      if (!Array.isArray(reactions)) return [];
      return reactions.map((r) => {
        const rr = r as Record<string, unknown>;
        return {
          userId: String(rr['userId'] ?? rr['user_id'] ?? ''),
          userName: String(rr['userName'] ?? rr['user_name'] ?? ''),
          reaction: String(rr['reaction'] ?? ''),
          timestamp: new Date(Number(rr['timestamp'] ?? Date.now())),
        };
      });
    } catch {
      return [];
    }
  }

  async list(options: {
    threadId: string;
    limit?: number;
    before?: string;
    after?: string;
    signal?: AbortSignal;
  }): Promise<PageResult<Message>> {
    const tokens = this.getTokens();
    const limit = Math.min(options.limit ?? 20, 100);
    const cacheKey = nsKey(
      'messages-list',
      `${options.threadId}:${limit}:${options.before ?? ''}:${options.after ?? ''}`,
    );
    const cached = await this.cache.get<PageResult<Message>>(cacheKey);
    if (cached) return cached;

    const { url, body } = buildGraphQLRequest({
      variables: {
        threadID: options.threadId,
        first: limit,
        before: options.before ?? null,
        after: options.after ?? null,
      },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
      friendlyName: 'ThreadMessagesQuery',
    });

    const resp = await this.http.post(url, body, { signal: options.signal });
    const text = await resp.text();
    let result: PageResult<Message> = { items: [], hasMore: false, cursor: null };
    try {
      const data = parseJsonResponse(text) as Record<string, unknown>;
      const nodes = this.extractMessageNodes(data);
      result = { items: nodes.messages, hasMore: nodes.hasMore, cursor: nodes.cursor };
    } catch {
      result = { items: [], hasMore: false, cursor: null };
    }
    await this.cache.set(cacheKey, result, 30000);
    return result;
  }

  private extractNodeAttachments(node: Record<string, unknown>): Message['attachments'] {
    const results: Message['attachments'] = [];

    // Sticker
    const sticker = node['sticker'] as Record<string, unknown> | undefined;
    if (sticker) {
      const stickerUri =
        (sticker['image128px'] as Record<string, unknown> | undefined)?.['uri'] ??
        (sticker['image64px'] as Record<string, unknown> | undefined)?.['uri'];
      results.push({
        id: String(sticker['id'] ?? ''),
        type: 'sticker',
        url: stickerUri ? String(stickerUri) : undefined,
        stickerId: String(sticker['id'] ?? ''),
      });
      return results;
    }

    // Blob attachments (image, video, file, share)
    const blobs = node['blob_attachments'] as unknown[] | undefined;
    if (Array.isArray(blobs)) {
      for (const b of blobs) {
        if (!b || typeof b !== 'object') continue;
        const att = b as Record<string, unknown>;
        const typename = String(att['__typename'] ?? att['type'] ?? 'unknown');
        const id = String(att['attachment_fbid'] ?? att['legacy_attachment_id'] ?? att['id'] ?? '');
        const url =
          (att['large_preview'] as Record<string, unknown> | undefined)?.['uri'] ??
          (att['full_screen_image'] as Record<string, unknown> | undefined)?.['uri'] ??
          att['url'] ?? att['uri'];
        const name = att['filename'] ?? att['name'];
        const size = att['file_size'] ?? att['fileSize'];

        if (typename.includes('Share')) {
          const shareUrl = (att['share'] as Record<string, unknown> | undefined)?.['url'];
          const shareTitle = (att['share'] as Record<string, unknown> | undefined)?.['title'];
          const shareDesc = (att['share'] as Record<string, unknown> | undefined)?.['description'];
          results.push({
            id,
            type: 'share',
            url: shareUrl ? String(shareUrl) : undefined,
            shareTitle: shareTitle ? String(shareTitle) : undefined,
            shareDescription: shareDesc ? String(shareDesc) : undefined,
          });
        } else {
          results.push({
            id,
            type: typename.toLowerCase().replace('message', ''),
            url: url ? String(url) : undefined,
            name: name ? String(name) : undefined,
            size: size ? Number(size) : undefined,
          });
        }
      }
    }

    return results;
  }

  private extractMessageNodes(data: Record<string, unknown>): {
    messages: Message[];
    hasMore: boolean;
    cursor: string | null;
  } {
    const dataField = (data['data'] as Record<string, unknown>) ?? {};
    const viewer = (dataField['viewer'] as Record<string, unknown>) ?? {};
    const messages = (viewer['message_thread'] as Record<string, unknown>) ?? {};
    const edges = (messages['messages'] as Record<string, unknown>)?.['edges'] as unknown[];
    if (!Array.isArray(edges)) return { messages: [], hasMore: false, cursor: null };
    const items = edges.map((e) => {
      const node = (e as Record<string, unknown>)['node'] as Record<string, unknown>;
      const repliedTo = node['replied_to_message'] as Record<string, unknown> | undefined;
      return {
        messageId: String(node['message_id'] ?? node['id'] ?? ''),
        threadId: String(messages['thread_key'] ?? ''),
        senderId: String((node['message_sender'] as Record<string, unknown>)?.['id'] ?? ''),
        senderName: String((node['message_sender'] as Record<string, unknown>)?.['name'] ?? ''),
        body: node['message'] ? String((node['message'] as Record<string, unknown>)['text'] ?? '') : null,
        attachments: this.extractNodeAttachments(node),
        timestamp: new Date(Number(node['timestamp_precise'] ?? Date.now())),
        isGroup: false,
        replyTo: repliedTo
          ? String(repliedTo['message_id'] ?? repliedTo['id'] ?? '') || undefined
          : undefined,
      } satisfies Message;
    });
    const pageInfo =
      ((messages['messages'] as Record<string, unknown>)?.['page_info'] as Record<string, unknown>) ?? {};
    return {
      messages: items,
      hasMore: Boolean(pageInfo['has_previous_page']),
      cursor: pageInfo['start_cursor'] ? String(pageInfo['start_cursor']) : null,
    };
  }

  async get(messageId: string, signal?: AbortSignal): Promise<Message> {
    const cached = await this.cache.get<Message>(nsKey('messages', messageId));
    if (cached) return cached;
    const tokens = this.getTokens();
    const { url, body } = buildGraphQLRequest({
      variables: { messageId },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
      friendlyName: 'FetchMessageByIdQuery',
    });
    const resp = await this.http.post(url, body, { signal });
    const text = await resp.text();
    const data = parseJsonResponse(text) as Record<string, unknown>;
    const node = (((data['data'] as Record<string, unknown>)?.['message']) as Record<string, unknown>) ?? {};
    const repliedTo = node['replied_to_message'] as Record<string, unknown> | undefined;
    const msg: Message = {
      messageId,
      threadId: String(node['thread_id'] ?? node['thread_key'] ?? ''),
      senderId: String((node['sender'] as Record<string, unknown>)?.['id'] ?? ''),
      senderName: String((node['sender'] as Record<string, unknown>)?.['name'] ?? ''),
      body: node['text'] ?? node['body'] ? String(node['text'] ?? node['body']) : null,
      attachments: this.extractNodeAttachments(node),
      timestamp: new Date(Number(node['timestamp'] ?? node['timestamp_precise'] ?? Date.now())),
      isGroup: Boolean(node['is_group_thread']),
      replyTo: repliedTo
        ? String(repliedTo['message_id'] ?? repliedTo['id'] ?? '') || undefined
        : undefined,
    };
    await this.cache.set(nsKey('messages', messageId), msg, 300000);
    return msg;
  }

  async markRead(threadId: string, signal?: AbortSignal): Promise<void> {
    const tokens = this.getTokens();
    const { url, body } = buildGraphQLRequest({
      queryName: 'markRead',
      variables: { threadId, watermark: Date.now() },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    });
    await this.http.post(url, body, { signal });
    await this.cache.delete(nsKey('threads', threadId));
  }

  async setTyping(options: { threadId: string; typing: boolean; signal?: AbortSignal }): Promise<void> {
    const tokens = this.getTokens();
    const params: Record<string, string> = {
      thread: options.threadId,
      typ: options.typing ? '1' : '0',
      fb_dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    };
    const { url, body } = buildFormRequest({
      url: FB_TYPING_URL,
      params,
    });
    await this.http.post(url, body, { signal: options.signal });
  }
}

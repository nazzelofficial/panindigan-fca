import type { HttpClient } from '../http/index.js';
import type { Logger } from '../logger/index.js';
import type { SessionTokens } from '../auth/index.js';
import { buildGraphQLRequest, parseJsonResponse } from '../graphql/index.js';

export interface MessageSearchResult {
  messageId: string;
  threadId: string;
  senderId: string;
  senderName: string;
  body: string | null;
  timestamp: Date;
  snippet: string | null;
}

export interface ThreadSearchResult {
  threadId: string;
  name: string | null;
  participantNames: string[];
  lastMessageTimestamp: Date | null;
}

export interface SearchOptions {
  limit?: number;
  cursor?: string | null;
  signal?: AbortSignal;
}

export interface PageResult<T> {
  items: T[];
  hasMore: boolean;
  cursor: string | null;
}

export class SearchModule {
  constructor(
    private readonly http: HttpClient,
    private readonly logger: Logger,
    private readonly getTokens: () => SessionTokens,
  ) {}

  async messages(query: string, options: SearchOptions = {}): Promise<PageResult<MessageSearchResult>> {
    const tokens = this.getTokens();
    this.logger.debug('Searching messages', { tag: 'SEARCH', query });

    const { url, body } = buildGraphQLRequest({
      queryName: 'searchMessages',
      variables: {
        query,
        count: options.limit ?? 20,
        cursor: options.cursor ?? null,
        surface_type: 'SEARCH_RESULTS_PAGE',
        filters: [],
      },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    });

    const resp = await this.http.post(url, body, { signal: options.signal });
    const text = await resp.text();
    const data = parseJsonResponse(text) as Record<string, unknown>;

    return this.parseMessageResults(data);
  }

  async threads(query: string, options: SearchOptions = {}): Promise<PageResult<ThreadSearchResult>> {
    const tokens = this.getTokens();
    this.logger.debug('Searching threads', { tag: 'SEARCH', query });

    const { url, body } = buildGraphQLRequest({
      queryName: 'searchThreads',
      variables: {
        query,
        count: options.limit ?? 20,
        cursor: options.cursor ?? null,
        entityTypes: ['GROUP', 'USER'],
      },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    });

    const resp = await this.http.post(url, body, { signal: options.signal });
    const text = await resp.text();
    const data = parseJsonResponse(text) as Record<string, unknown>;

    return this.parseThreadResults(data);
  }

  private parseMessageResults(data: Record<string, unknown>): PageResult<MessageSearchResult> {
    try {
      const d = data['data'] as Record<string, unknown> | undefined;
      const results = d?.['search_results'] as Record<string, unknown> | undefined;
      const rawEdges = results?.['edges'];
      const pageInfo = results?.['page_info'] as Record<string, unknown> | undefined;

      const items: MessageSearchResult[] = [];
      if (Array.isArray(rawEdges)) {
        for (const edge of rawEdges) {
          const node = (edge as Record<string, unknown>)['node'] as Record<string, unknown> | undefined;
          if (!node) continue;
          const sender = node['sender'] as Record<string, unknown> | undefined;
          items.push({
            messageId: String(node['message_id'] ?? node['id'] ?? ''),
            threadId: String(node['thread_key'] ?? ''),
            senderId: String(sender?.['id'] ?? ''),
            senderName: String(sender?.['name'] ?? ''),
            body: node['text'] ? String(node['text']) : null,
            timestamp: new Date(Number(node['timestamp'] ?? Date.now())),
            snippet: node['snippet'] ? String(node['snippet']) : null,
          });
        }
      }

      return {
        items,
        hasMore: Boolean(pageInfo?.['has_next_page']),
        cursor: pageInfo?.['end_cursor'] ? String(pageInfo['end_cursor']) : null,
      };
    } catch {
      return { items: [], hasMore: false, cursor: null };
    }
  }

  private parseThreadResults(data: Record<string, unknown>): PageResult<ThreadSearchResult> {
    try {
      const d = data['data'] as Record<string, unknown> | undefined;
      const results = d?.['search_results'] as Record<string, unknown> | undefined;
      const rawEdges = results?.['edges'];
      const pageInfo = results?.['page_info'] as Record<string, unknown> | undefined;

      const items: ThreadSearchResult[] = [];
      if (Array.isArray(rawEdges)) {
        for (const edge of rawEdges) {
          const node = (edge as Record<string, unknown>)['node'] as Record<string, unknown> | undefined;
          if (!node) continue;
          const participants = Array.isArray(node['all_participants'])
            ? (node['all_participants'] as Array<Record<string, unknown>>).map((p) =>
                String((p['node'] as Record<string, unknown>)?.['name'] ?? p['name'] ?? ''),
              )
            : [];
          const tsRaw = (node['last_message'] as Record<string, unknown> | undefined)?.['timestamp'];
          items.push({
            threadId: String(node['thread_key'] ?? node['id'] ?? ''),
            name: node['name'] ? String(node['name']) : null,
            participantNames: participants,
            lastMessageTimestamp:
              typeof tsRaw === 'number' || typeof tsRaw === 'string'
                ? new Date(Number(tsRaw))
                : null,
          });
        }
      }

      return {
        items,
        hasMore: Boolean(pageInfo?.['has_next_page']),
        cursor: pageInfo?.['end_cursor'] ? String(pageInfo['end_cursor']) : null,
      };
    } catch {
      return { items: [], hasMore: false, cursor: null };
    }
  }
}

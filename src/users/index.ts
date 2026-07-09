import type { HttpClient } from '../http/index.js';
import type { CacheManager } from '../cache/index.js';
import type { Logger } from '../logger/index.js';
import type { SessionTokens } from '../auth/index.js';
import { buildGraphQLRequest, parseJsonResponse } from '../graphql/index.js';
import { nsKey } from '../cache/index.js';
import { NotFoundError } from '../errors/index.js';

export interface UserProfile {
  id: string;
  name: string;
  username: string | null;
  profilePictureUrl: string | null;
  isFriend: boolean;
  mutualFriendCount: number | null;
}

export interface FriendListOptions {
  limit?: number;
  cursor?: string | null;
  signal?: AbortSignal;
}

export interface PageResult<T> {
  items: T[];
  hasMore: boolean;
  cursor: string | null;
}

export interface SearchUsersOptions {
  limit?: number;
  signal?: AbortSignal;
}

function parseUserProfile(node: Record<string, unknown>): UserProfile {
  return {
    id: String(node['id'] ?? ''),
    name: String(node['name'] ?? ''),
    username: node['username'] ? String(node['username']) : null,
    profilePictureUrl: node['profile_picture']
      ? String((node['profile_picture'] as Record<string, unknown>)['uri'] ?? '')
      : null,
    isFriend: Boolean(
      (node['friendship_status'] as Record<string, unknown> | undefined)?.['are_friends'] ??
        node['is_friend'] ??
        false,
    ),
    mutualFriendCount: node['mutual_friends']
      ? Number((node['mutual_friends'] as Record<string, unknown>)['count'] ?? 0)
      : null,
  };
}

export class UsersModule {
  constructor(
    private readonly http: HttpClient,
    private readonly cache: CacheManager,
    private readonly logger: Logger,
    private readonly getTokens: () => SessionTokens,
  ) {}

  async getProfile(userId: string, signal?: AbortSignal): Promise<UserProfile> {
    const tokens = this.getTokens();
    const cacheKey = nsKey('users', userId);

    const cached = await this.cache.get<UserProfile>(cacheKey);
    if (cached) return cached;

    this.logger.debug('Fetching user profile', { tag: 'USERS', userId });

    const { url, body } = buildGraphQLRequest({
      queryName: 'userInfo',
      variables: { userID: userId, scale: 1, includeFriendshipStatus: true },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    });

    const resp = await this.http.post(url, body, { signal });
    const text = await resp.text();
    const data = parseJsonResponse(text) as Record<string, unknown>;
    const node = this.extractUserNode(data);

    if (!node) throw new NotFoundError(`User ${userId} not found`, { userId });

    const profile = parseUserProfile(node);
    await this.cache.set(cacheKey, profile, 300000);
    return profile;
  }

  async getSelf(signal?: AbortSignal): Promise<UserProfile> {
    const tokens = this.getTokens();
    const cacheKey = nsKey('users', `self:${tokens.userId}`);

    const cached = await this.cache.get<UserProfile>(cacheKey);
    if (cached) return cached;

    this.logger.debug('Fetching own profile', { tag: 'USERS', userId: tokens.userId });

    const { url, body } = buildGraphQLRequest({
      variables: { userID: tokens.userId, scale: 1, includeFriendshipStatus: false },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
      friendlyName: 'ProfileCometRootQuery',
    });

    const resp = await this.http.post(url, body, { signal });
    const text = await resp.text();
    const data = parseJsonResponse(text) as Record<string, unknown>;
    const node = this.extractUserNode(data) ?? { id: tokens.userId, name: 'Me' };

    const profile = parseUserProfile(node);
    await this.cache.set(cacheKey, profile, 300000);
    return profile;
  }

  async getFriends(options: FriendListOptions = {}): Promise<PageResult<UserProfile>> {
    const tokens = this.getTokens();
    const limit = options.limit ?? 20;
    const cacheKey = nsKey('users', `friends:${limit}:${options.cursor ?? 'start'}`);

    const cached = await this.cache.get<PageResult<UserProfile>>(cacheKey);
    if (cached) return cached;

    this.logger.debug('Fetching friend list', { tag: 'USERS', limit });

    const { url, body } = buildGraphQLRequest({
      queryName: 'friendList',
      variables: {
        count: limit,
        cursor: options.cursor ?? null,
        scale: 1,
      },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    });

    const resp = await this.http.post(url, body, { signal: options.signal });
    const text = await resp.text();
    const data = parseJsonResponse(text) as Record<string, unknown>;

    const { edges, pageInfo } = this.extractConnection(data, 'friends');
    const items = edges.map(parseUserProfile);

    const result: PageResult<UserProfile> = { items, hasMore: pageInfo.hasNextPage, cursor: pageInfo.endCursor };
    await this.cache.set(cacheKey, result, 60000);
    return result;
  }

  async search(query: string, options: SearchUsersOptions = {}): Promise<UserProfile[]> {
    const tokens = this.getTokens();
    this.logger.debug('Searching users', { tag: 'USERS', query });

    const { url, body } = buildGraphQLRequest({
      queryName: 'searchThreads',
      variables: { query, count: options.limit ?? 10, entityTypes: ['USER'] },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    });

    const resp = await this.http.post(url, body, { signal: options.signal });
    const text = await resp.text();
    const data = parseJsonResponse(text) as Record<string, unknown>;

    const { edges } = this.extractConnection(data, 'search_results');
    return edges.map(parseUserProfile);
  }

  private extractUserNode(data: Record<string, unknown>): Record<string, unknown> | null {
    try {
      const d = data['data'] as Record<string, unknown> | undefined;
      const user = d?.['user'] ?? d?.['userOrMe'];
      if (user && typeof user === 'object') return user as Record<string, unknown>;
    } catch {
      // fall through
    }
    return null;
  }

  private extractConnection(
    data: Record<string, unknown>,
    key: string,
  ): { edges: Record<string, unknown>[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } {
    try {
      const d = data['data'] as Record<string, unknown> | undefined;
      const viewer = (d?.['viewer'] ?? d?.['user'] ?? d) as Record<string, unknown> | undefined;
      const conn = (viewer?.[key] ?? d?.[key]) as Record<string, unknown> | undefined;
      const rawEdges = conn?.['edges'];
      const pageInfo = conn?.['page_info'] as Record<string, unknown> | undefined;

      if (Array.isArray(rawEdges)) {
        const edges = rawEdges.map((e) => {
          const item = e as Record<string, unknown>;
          return (item['node'] as Record<string, unknown>) ?? item;
        });
        return {
          edges,
          pageInfo: {
            hasNextPage: Boolean(pageInfo?.['has_next_page']),
            endCursor: pageInfo?.['end_cursor'] ? String(pageInfo['end_cursor']) : null,
          },
        };
      }
    } catch {
      // fall through
    }
    return { edges: [], pageInfo: { hasNextPage: false, endCursor: null } };
  }
}

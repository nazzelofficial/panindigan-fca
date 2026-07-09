import type { HttpClient } from '../http/index.js';
import type { CacheManager } from '../cache/index.js';
import type { TypedEventEmitter } from '../events/index.js';
import type { Logger } from '../logger/index.js';
import type { SessionTokens } from '../auth/index.js';
import { buildGraphQLRequest, parseJsonResponse } from '../graphql/index.js';
import { nsKey } from '../cache/index.js';

export interface PresenceStatus {
  userId: string;
  isOnline: boolean;
  lastActiveAt: Date | null;
}

export class PresenceModule {
  private readonly subscribedUserIds = new Set<string>();

  constructor(
    private readonly http: HttpClient,
    private readonly cache: CacheManager,
    private readonly emitter: TypedEventEmitter,
    private readonly logger: Logger,
    private readonly getTokens: () => SessionTokens,
  ) {}

  async get(userId: string, signal?: AbortSignal): Promise<PresenceStatus> {
    const tokens = this.getTokens();
    const cacheKey = nsKey('presence', userId);

    const cached = await this.cache.get<PresenceStatus>(cacheKey);
    if (cached) return cached;

    this.logger.debug('Fetching presence', { tag: 'PRESENCE', userId });

    const { url, body } = buildGraphQLRequest({
      queryName: 'presenceGet',
      variables: { userID: userId },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    });

    const resp = await this.http.post(url, body, { signal });
    const text = await resp.text();
    const data = parseJsonResponse(text) as Record<string, unknown>;

    const status = this.parsePresence(userId, data);
    await this.cache.set(cacheKey, status, 30000);
    return status;
  }

  async setVisible(visible: boolean, signal?: AbortSignal): Promise<void> {
    const tokens = this.getTokens();
    this.logger.info('Setting presence visibility', { tag: 'PRESENCE', visible });

    const { url, body } = buildGraphQLRequest({
      queryName: 'presenceSet',
      variables: { input: { is_present: visible } },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    });

    await this.http.post(url, body, { signal });
  }

  subscribe(userIds: string[]): void {
    for (const userId of userIds) {
      this.subscribedUserIds.add(userId);
    }
    this.logger.debug('Subscribed to presence updates', { tag: 'PRESENCE', count: userIds.length });
  }

  unsubscribe(userIds: string[]): void {
    for (const userId of userIds) {
      this.subscribedUserIds.delete(userId);
    }
  }

  /**
   * Update the in-memory presence cache for a user.
   * Called by the client whenever a presence update arrives from the MQTT layer,
   * so that `presence.get()` returns up-to-date data without a network round-trip.
   */
  updateCache(userId: string, isOnline: boolean, lastActiveAt: Date | null): void {
    void this.cache.set(nsKey('presence', userId), { userId, isOnline, lastActiveAt }, 30000);
  }

  /**
   * Called internally to emit presence events for explicitly subscribed users only.
   * For global presence events (all users) the MQTT layer emits `presence:update` directly.
   */
  handlePresenceUpdate(userId: string, isOnline: boolean, lastActiveAt: Date | null): void {
    const status: PresenceStatus = { userId, isOnline, lastActiveAt };
    void this.cache.set(nsKey('presence', userId), status, 30000);
    if (this.subscribedUserIds.size === 0 || this.subscribedUserIds.has(userId)) {
      this.emitter.emit('presence:update', { userId, isOnline, lastActiveAt });
    }
  }

  private parsePresence(userId: string, data: Record<string, unknown>): PresenceStatus {
    try {
      const d = data['data'] as Record<string, unknown> | undefined;
      const user = (d?.['user'] ?? d?.['presence']) as Record<string, unknown> | undefined;
      const presenceData = (user?.['presence_data'] ?? user) as Record<string, unknown> | undefined;
      const isOnline = Boolean(presenceData?.['is_online'] ?? presenceData?.['is_present'] ?? false);
      const lastActiveRaw = presenceData?.['last_active_time'] ?? presenceData?.['last_active'];
      const lastActiveAt =
        typeof lastActiveRaw === 'number' && lastActiveRaw > 0
          ? new Date(lastActiveRaw * 1000)
          : null;
      return { userId, isOnline, lastActiveAt };
    } catch {
      return { userId, isOnline: false, lastActiveAt: null };
    }
  }
}

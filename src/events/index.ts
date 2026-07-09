import { EventEmitter as EventEmitter3 } from 'eventemitter3';
import type { AppStateCookie } from '../cookies/index.js';

export interface MessageEvent {
  messageId: string;
  threadId: string;
  senderId: string;
  senderName: string;
  body: string | null;
  attachments: MessageAttachment[];
  timestamp: Date;
  isGroup: boolean;
  /** ID of the message being replied to, if this is a reply. */
  replyTo?: string;
}

export interface MessageAttachment {
  id: string;
  type: string;
  url?: string;
  name?: string;
  size?: number;
  /** Present when type === 'sticker' */
  stickerId?: string;
  /** Present when type === 'share' */
  shareTitle?: string;
  /** Present when type === 'share' */
  shareDescription?: string;
}

export interface MessageReactionEvent {
  messageId: string;
  threadId: string;
  senderId: string;
  senderName: string;
  reaction: string;
  timestamp: Date;
}

export interface MessageReactionRemovedEvent {
  messageId: string;
  threadId: string;
  senderId: string;
  timestamp: Date;
}

export interface MessageUnsendEvent {
  messageId: string;
  threadId: string;
  senderId: string;
  timestamp: Date;
}

export interface MessageDeliveredEvent {
  messageId: string;
  threadId: string;
  deliveredTo: string[];
  timestamp: Date;
}

export interface MessageSeenEvent {
  messageId: string;
  threadId: string;
  seenBy: string[];
  timestamp: Date;
}

export interface ThreadTypingEvent {
  threadId: string;
  senderId: string;
  senderName: string;
  isTyping: boolean;
}

export interface ThreadReadEvent {
  threadId: string;
  readBy: string[];
  upToTimestamp: Date;
}

export interface ThreadRenamedEvent {
  threadId: string;
  newName: string;
  changedBy: string;
}

export interface ThreadParticipantAddedEvent {
  threadId: string;
  addedUserId: string;
  addedByUserId: string;
}

export interface ThreadParticipantRemovedEvent {
  threadId: string;
  removedUserId: string;
  removedByUserId: string;
}

export interface ThreadPhotoChangedEvent {
  threadId: string;
  newPhotoUrl: string;
  changedBy: string;
}

export interface ThreadMutedEvent {
  threadId: string;
  mutedUntil: Date | null;
}

export interface ThreadArchivedEvent {
  threadId: string;
  /** true = moved to archive, false = moved back to inbox */
  archived: boolean;
}

export interface PresenceUpdateEvent {
  userId: string;
  isOnline: boolean;
  lastActiveAt: Date | null;
}

export interface ConnectedEvent { timestamp: Date }
export interface DisconnectedEvent { reason: string; willReconnect: boolean }
export interface ReconnectingEvent { attempt: number; maxAttempts: number; delayMs: number }
export interface ReconnectedEvent { attempt: number; durationMs: number }
export interface ReconnectFailedEvent { attempts: number; lastError: Error }

export interface AppStateRefreshFailedEvent { error: Error; attempts: number }

export interface AccountRefreshFailedEvent {
  /** Facebook user ID of the affected account (null if session was never bootstrapped). */
  userId: string | null;
  /** The error that caused the failure. */
  error: Error;
  /** How many consecutive failures have occurred (resets to 0 on next success). */
  attempts: number;
  /** Max attempts before the refresh timer gives up (from config). */
  maxAttempts: number;
  /** Whether the timer will try again on the next interval. */
  willRetry: boolean;
  /** Approximate Date when the next retry will fire (based on checkInterval). */
  nextRetryAt: Date;
  /** When this failure occurred. */
  lastFailedAt: Date;
}
export interface SessionRestoredEvent { persistPath: string }
export interface SessionSavedEvent { persistPath: string }

export interface AccountCheckpointEvent { checkpointUrl: string; reason: string }
export interface AccountRestrictedEvent { feature: string; until: Date }
export interface AccountWarningEvent { message: string; source: string }
export interface AccountSuspendedEvent { reason: string }
export interface AccountHealthyEvent { checkedAt: Date }

export interface AccountStaleEvent {
  /** Facebook user ID of the affected account (null if session never bootstrapped). */
  userId: string | null;
  /** The last error that exhausted all retry attempts. */
  lastError: Error;
  /** Total consecutive failures that occurred before giving up. */
  attempts: number;
  /** When the session was declared stale. */
  staleSince: Date;
  /** A human-readable hint for the operator. */
  hint: string;
}

export interface AccountRefreshEvent {
  /** Facebook user ID of the account whose cookies were rotated. */
  userId: string;
  /** The updated AppState cookie array — persist or hand off as needed. */
  appState: AppStateCookie[];
  /** Number of cookies in the new AppState. */
  cookieCount: number;
  /** Freshly extracted fb_dtsg token. */
  dtsg: string;
  /** Freshly extracted lsd token. */
  lsd: string;
  /** When the refresh completed. */
  refreshedAt: Date;
}

export interface ProxyRotateEvent { from: string; to: string; requestCount: number }
export interface ProxyFailedEvent { url: string; error: Error }
export interface ProxyHealthyEvent { url: string; latencyMs: number }

export interface UploadProgressEvent { uploadId: string; bytesTransferred: number; totalBytes: number; percent: number }
export interface UploadCompleteEvent { uploadId: string; attachmentToken: string }
export interface UploadFailedEvent { uploadId: string; error: Error }
export interface DownloadProgressEvent { url: string; bytesTransferred: number; totalBytes: number; percent: number }
export interface DownloadCompleteEvent { url: string; bytesWritten: number }
export interface DownloadFailedEvent { url: string; error: Error }

export interface SlowRequestEvent { url: string; durationMs: number; threshold: number }
export interface MemoryHighEvent { heapUsedMb: number; heapTotalMb: number; threshold: number }
export interface GcMajorEvent { durationMs: number; freedMb: number }

export interface StealthWarmupStartEvent { targetRateLimitRpm: number }
export interface StealthWarmupCompleteEvent { durationMs: number }
export interface StealthRateLimitDetectedEvent { endpoint: string; retryAfterMs: number }
export interface StealthRateLimitClearedEvent { endpoint: string }
export interface StealthFingerprintAssignedEvent { userAgent: string; platform: string; locale: string }

export interface ClientEventMap {
  'message': [MessageEvent];
  'message:reaction': [MessageReactionEvent];
  'message:reaction:removed': [MessageReactionRemovedEvent];
  'message:unsend': [MessageUnsendEvent];
  'message:delivered': [MessageDeliveredEvent];
  'message:seen': [MessageSeenEvent];

  'thread:typing': [ThreadTypingEvent];
  'thread:read': [ThreadReadEvent];
  'thread:renamed': [ThreadRenamedEvent];
  'thread:participant:added': [ThreadParticipantAddedEvent];
  'thread:participant:removed': [ThreadParticipantRemovedEvent];
  'thread:photo:changed': [ThreadPhotoChangedEvent];
  'thread:muted': [ThreadMutedEvent];
  'thread:archived': [ThreadArchivedEvent];

  'presence:update': [PresenceUpdateEvent];
  'presence:typing': [{ userId: string; threadId: string; isTyping: boolean }];

  'appstate:update': [AppStateCookie[]];
  'appstate:refresh:failed': [AppStateRefreshFailedEvent];
  'account:refresh:failed': [AccountRefreshFailedEvent];
  'session:expired': [];
  'session:restored': [SessionRestoredEvent];
  'session:saved': [SessionSavedEvent];

  'connected': [ConnectedEvent];
  'disconnected': [DisconnectedEvent];
  'reconnecting': [ReconnectingEvent];
  'reconnected': [ReconnectedEvent];
  'reconnect:failed': [ReconnectFailedEvent];

  'account:checkpoint': [AccountCheckpointEvent];
  'account:restricted': [AccountRestrictedEvent];
  'account:warning': [AccountWarningEvent];
  'account:suspended': [AccountSuspendedEvent];
  'account:healthy': [AccountHealthyEvent];
  'account:refresh': [AccountRefreshEvent];
  'account:stale': [AccountStaleEvent];

  'proxy:rotate': [ProxyRotateEvent];
  'proxy:failed': [ProxyFailedEvent];
  'proxy:healthy': [ProxyHealthyEvent];

  'upload:progress': [UploadProgressEvent];
  'upload:complete': [UploadCompleteEvent];
  'upload:failed': [UploadFailedEvent];
  'download:progress': [DownloadProgressEvent];
  'download:complete': [DownloadCompleteEvent];
  'download:failed': [DownloadFailedEvent];

  'slow:request': [SlowRequestEvent];
  'memory:high': [MemoryHighEvent];
  'gc:major': [GcMajorEvent];

  'stealth:warmup:start': [StealthWarmupStartEvent];
  'stealth:warmup:complete': [StealthWarmupCompleteEvent];
  'stealth:ratelimit:detected': [StealthRateLimitDetectedEvent];
  'stealth:ratelimit:cleared': [StealthRateLimitClearedEvent];
  'stealth:fingerprint:assigned': [StealthFingerprintAssignedEvent];

  'ratelimit:detected': [{ retryAfterMs: number; endpoint: string }];
  'ratelimit:cleared': [{ endpoint: string }];
}

export class TypedEventEmitter extends EventEmitter3<ClientEventMap> {}

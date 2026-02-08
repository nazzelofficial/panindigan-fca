import fs from 'fs';

export interface AppState {
  key: string;
  value: string;
  domain: string;
  path: string;
  hostOnly: boolean;
  creation: string;
  lastAccessed: string;
}

export interface User {
  id: string;
  name: string;
  firstName?: string;
  vanity?: string;
  thumbSrc?: string;
  profileUrl?: string;
  gender?: string;
  type?: string;
  isFriend?: boolean;
  isBirthday?: boolean;
}

export interface Attachment {
  type: 'photo' | 'video' | 'audio' | 'file' | 'sticker' | 'share' | 'animated_image';
  id?: string;
  url?: string;
  previewUrl?: string;
  filename?: string;
  fileSize?: number;
  duration?: number;
  width?: number;
  height?: number;
}

export interface Message {
  messageId: string;
  threadId: string;
  senderId: string;
  timestamp: number;
  body?: string;
  attachments: Attachment[];
  mentions: { [key: string]: string };
  isUnread: boolean;
  isGroup: boolean;
  replyTo?: {
    messageId: string;
    body?: string;
    senderId?: string;
  };
  reactions: {
    [key: string]: {
      reaction: string;
      userId: string;
    }
  };
}

export interface Thread {
  threadId: string;
  threadName: string;
  participants: string[];
  userInfo: User[];
  unreadCount: number;
  messageCount: number;
  imageSrc?: string;
  timestamp: number;
  muteUntil: number | null;
  isGroup: boolean;
  adminIds: string[];
  nicknames: { [key: string]: string };
  color?: string;
  emoji?: string;
  approvalMode?: boolean;
}

export interface SendMessageOptions {
  body?: string;
  attachment?: string | Buffer | fs.ReadStream;
  url?: string;
  sticker?: string;
  emoji?: string;
  emojiSize?: 'small' | 'medium' | 'large';
  mentions?: { tag: string; id: string }[];
  replyToMessageId?: string;
}

export interface LoginOptions {
  appState?: AppState[];
  email?: string;
  password?: string;
  forceLogin?: boolean;
  userAgent?: string;
}

export interface AutoRefreshOptions {
  enable: boolean;
  interval?: number; // default 20 * 60 * 1000 (20 min)
  mqttKeepAliveInterval?: number; // default 30 (seconds)
  onRefresh?: (newAppState: AppState[]) => void;
  onRefreshError?: (error: Error) => void;
}

export interface AntiDetectionOptions {
  enable: boolean;
  userAgentRotation?: boolean;
  randomDelays?: boolean; // Basic random delay
  behavioralSimulation?: {
    enable: boolean;
    typingSimulation?: boolean; // Realistic typing speed
    readReceiptDelays?: boolean; // Natural reading time
    activityRandomization?: boolean; // Idle times
    patternDiffusion?: boolean; // Adaptive delays
  };
  securityGuard?: {
    enable: boolean;
    smartRateLimiting?: boolean;
    antiSpam?: boolean;
    checkpointSolver?: boolean; // Auto-solver enabled?
    captchaIntegration?: {
      provider: '2captcha' | 'anticaptcha';
      apiKey: string;
    };
  };
  proxy?: {
    enable: boolean;
    source: 'list' | 'url';
    proxies?: string[]; // List of proxy URLs (http://user:pass@host:port)
    rotationStrategy?: 'random' | 'round-robin' | 'sticky';
  };
  fingerprint?: {
    enable: boolean;
    autoRotate?: boolean;
    rotationInterval?: number; // ms
    spoofing?: {
        screen?: boolean;
        timezone?: boolean;
        audio?: boolean;
        canvas?: boolean;
    };
  };
}

export interface ApiOption {
  listenEvents?: boolean;
  selfListen?: boolean;
  listenTyping?: boolean;
  updatePresence?: boolean;
  forceLogin?: boolean;
  userAgent?: string;
  logLevel?: 'error' | 'warn' | 'info' | 'silent';
  autoRefresh?: AutoRefreshOptions;
  antiDetection?: AntiDetectionOptions;
}

export type EventType = 'message' | 'event' | 'typ' | 'read_receipt' | 'presence' | 'message_reaction';

export interface MQTTEvent {
  type: EventType;
  threadId?: string;
  messageId?: string;
  senderId?: string;
  timestamp?: number;
  data?: any;
}

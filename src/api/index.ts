/**
 * src/api/index.ts
 *
 * Typed registry of every Facebook private-API endpoint the library calls.
 * Each entry carries the HTTP method, canonical URL, required parameter names,
 * and a description of the expected response shape.
 *
 * Modules (messages, threads, users …) import from here rather than hard-coding
 * URLs, keeping endpoint definitions in one authoritative place.
 */

import {
  FB_BASE_URL,
  FB_API_GRAPHQL,
  FB_MESSAGING_SEND,
  FB_UPLOAD_URL,
  FB_LOGIN_URL,
  FB_LOGOUT_URL,
  GRAPHQL_FRIENDLY_NAMES,
} from '../constants/index.js';

// ─── Primitive request description ───────────────────────────────────────────

export type HttpMethod = 'GET' | 'POST';

export interface EndpointDefinition {
  /** Endpoint name — used in logging and tracing. */
  readonly name: string;
  readonly method: HttpMethod;
  readonly url: string;
  /** Human-readable description of what the endpoint does. */
  readonly description: string;
  /** Required top-level parameter names (informational — not enforced at runtime). */
  readonly requiredParams?: readonly string[];
}

// ─── Endpoint registry ────────────────────────────────────────────────────────

export const API_ENDPOINTS = {
  // ── Authentication ────────────────────────────────────────────────────────
  login: {
    name: 'login',
    method: 'POST',
    url: FB_LOGIN_URL,
    description: 'Email and password credential login. Returns session cookies.',
    requiredParams: ['email', 'pass', 'fb_dtsg_ag', 'jazoest'],
  },

  logout: {
    name: 'logout',
    method: 'POST',
    url: FB_LOGOUT_URL,
    description: 'Invalidates the current session and clears all session cookies.',
    requiredParams: ['fb_dtsg', 'ref'],
  },

  // ── Messaging ─────────────────────────────────────────────────────────────
  messageSend: {
    name: 'messageSend',
    method: 'POST',
    url: FB_MESSAGING_SEND,
    description: 'Send a text message, sticker, or file attachment to a thread.',
    requiredParams: ['thread_fbid', 'fb_dtsg', 'lsd'],
  },

  messageDelete: {
    name: 'messageDelete',
    method: 'POST',
    url: `${FB_BASE_URL}/ajax/mercury/delete_messages.php`,
    description: 'Remove a message from the authenticated user\'s own view (not unsend).',
    requiredParams: ['message_ids[]', 'fb_dtsg', 'lsd'],
  },

  messageMarkRead: {
    name: 'messageMarkRead',
    method: 'POST',
    url: FB_API_GRAPHQL,
    description: 'Mark all messages in a thread up to a watermark as read.',
    requiredParams: ['variables', 'fb_dtsg', 'lsd'],
  },

  setTypingIndicator: {
    name: 'setTypingIndicator',
    method: 'POST',
    url: `${FB_BASE_URL}/ajax/messaging/typ.php`,
    description: 'Emit or clear a typing indicator in a thread.',
    requiredParams: ['thread', 'typ', 'fb_dtsg', 'lsd'],
  },

  // ── Threads ───────────────────────────────────────────────────────────────
  threadList: {
    name: 'threadList',
    method: 'POST',
    url: FB_API_GRAPHQL,
    description: 'Paginated list of the authenticated user\'s conversation threads.',
    requiredParams: ['variables', 'fb_dtsg', 'lsd'],
  },

  threadInfo: {
    name: 'threadInfo',
    method: 'POST',
    url: FB_API_GRAPHQL,
    description: 'Full metadata for a single thread by its thread ID.',
    requiredParams: ['variables', 'fb_dtsg', 'lsd'],
  },

  threadCreate: {
    name: 'threadCreate',
    method: 'POST',
    url: FB_API_GRAPHQL,
    description: 'Create a new group chat with an initial list of participant IDs.',
    requiredParams: ['variables', 'fb_dtsg', 'lsd'],
  },

  threadRename: {
    name: 'threadRename',
    method: 'POST',
    url: FB_API_GRAPHQL,
    description: 'Rename a group conversation thread.',
    requiredParams: ['variables', 'fb_dtsg', 'lsd'],
  },

  threadSetPhoto: {
    name: 'threadSetPhoto',
    method: 'POST',
    url: `${FB_BASE_URL}/ajax/messaging/set_thread_image.php`,
    description: 'Set or update the group photo for a thread. Multipart upload.',
    requiredParams: ['thread_image', 'thread_fbid', 'fb_dtsg', 'lsd'],
  },

  threadAddParticipants: {
    name: 'threadAddParticipants',
    method: 'POST',
    url: FB_API_GRAPHQL,
    description: 'Add one or more participants to an existing group thread.',
    requiredParams: ['variables', 'fb_dtsg', 'lsd'],
  },

  threadRemoveParticipant: {
    name: 'threadRemoveParticipant',
    method: 'POST',
    url: FB_API_GRAPHQL,
    description: 'Remove a single participant from a group thread.',
    requiredParams: ['variables', 'fb_dtsg', 'lsd'],
  },

  threadLeave: {
    name: 'threadLeave',
    method: 'POST',
    url: `${FB_BASE_URL}/ajax/mercury/leave_thread.php`,
    description: 'Remove the authenticated account from a group thread.',
    requiredParams: ['thread_fbid', 'fb_dtsg', 'lsd'],
  },

  threadMute: {
    name: 'threadMute',
    method: 'POST',
    url: FB_API_GRAPHQL,
    description: 'Mute notifications for a thread, optionally for a duration.',
    requiredParams: ['variables', 'fb_dtsg', 'lsd'],
  },

  threadArchive: {
    name: 'threadArchive',
    method: 'POST',
    url: FB_API_GRAPHQL,
    description: 'Move a thread to the archived folder or restore it.',
    requiredParams: ['variables', 'fb_dtsg', 'lsd'],
  },

  // ── Files ─────────────────────────────────────────────────────────────────
  fileUpload: {
    name: 'fileUpload',
    method: 'POST',
    url: FB_UPLOAD_URL,
    description: 'Upload a binary file attachment. Responds with a server-assigned attachment ID.',
    requiredParams: ['upload_id', 'fb_dtsg', 'lsd'],
  },

  // ── Users ─────────────────────────────────────────────────────────────────
  userProfile: {
    name: 'userProfile',
    method: 'POST',
    url: FB_API_GRAPHQL,
    description: 'Fetch public profile information for any Facebook user.',
    requiredParams: ['variables', 'fb_dtsg', 'lsd'],
  },

  selfProfile: {
    name: 'selfProfile',
    method: 'POST',
    url: FB_API_GRAPHQL,
    description: 'Fetch the profile of the currently authenticated account.',
    requiredParams: ['variables', 'fb_dtsg', 'lsd'],
  },

  friendList: {
    name: 'friendList',
    method: 'POST',
    url: FB_API_GRAPHQL,
    description: 'Paginated list of the authenticated user\'s friends.',
    requiredParams: ['variables', 'fb_dtsg', 'lsd'],
  },

  userSearch: {
    name: 'userSearch',
    method: 'POST',
    url: FB_API_GRAPHQL,
    description: 'Full-text search for Facebook users by name.',
    requiredParams: ['variables', 'fb_dtsg', 'lsd'],
  },

  // ── Search ────────────────────────────────────────────────────────────────
  searchMessages: {
    name: 'searchMessages',
    method: 'POST',
    url: FB_API_GRAPHQL,
    description: 'Full-text search across the authenticated user\'s messages.',
    requiredParams: ['variables', 'fb_dtsg', 'lsd'],
  },

  searchThreads: {
    name: 'searchThreads',
    method: 'POST',
    url: FB_API_GRAPHQL,
    description: 'Search conversation threads by name or participant.',
    requiredParams: ['variables', 'fb_dtsg', 'lsd'],
  },

  // ── Reactions ─────────────────────────────────────────────────────────────
  messageReact: {
    name: 'messageReact',
    method: 'POST',
    url: FB_API_GRAPHQL,
    description: 'Add or remove an emoji reaction on a specific message.',
    requiredParams: ['variables', 'fb_dtsg', 'lsd'],
  },

  messageGetReactions: {
    name: 'messageGetReactions',
    method: 'POST',
    url: FB_API_GRAPHQL,
    description: 'Retrieve all emoji reactions on a single message.',
    requiredParams: ['variables', 'fb_dtsg', 'lsd'],
  },

  // ── Polls ─────────────────────────────────────────────────────────────────
  pollCreate: {
    name: 'pollCreate',
    method: 'POST',
    url: FB_API_GRAPHQL,
    description: 'Create a poll with a question and answer options in a thread.',
    requiredParams: ['variables', 'fb_dtsg', 'lsd'],
  },

  pollVote: {
    name: 'pollVote',
    method: 'POST',
    url: FB_API_GRAPHQL,
    description: 'Cast a vote on a poll option.',
    requiredParams: ['variables', 'fb_dtsg', 'lsd'],
  },

  pollResults: {
    name: 'pollResults',
    method: 'POST',
    url: FB_API_GRAPHQL,
    description: 'Fetch current vote counts for all options in a poll.',
    requiredParams: ['variables', 'fb_dtsg', 'lsd'],
  },

  // ── Stickers ──────────────────────────────────────────────────────────────
  stickerSend: {
    name: 'stickerSend',
    method: 'POST',
    url: FB_MESSAGING_SEND,
    description: 'Send a sticker to a thread using its sticker ID.',
    requiredParams: ['sticker_id', 'thread_fbid', 'fb_dtsg', 'lsd'],
  },

  stickerPack: {
    name: 'stickerPack',
    method: 'POST',
    url: FB_API_GRAPHQL,
    description: 'Retrieve all sticker metadata for a sticker pack.',
    requiredParams: ['variables', 'fb_dtsg', 'lsd'],
  },

  // ── Presence ──────────────────────────────────────────────────────────────
  presenceGet: {
    name: 'presenceGet',
    method: 'POST',
    url: FB_API_GRAPHQL,
    description: 'Fetch the current online/offline presence status of one or more users.',
    requiredParams: ['variables', 'fb_dtsg', 'lsd'],
  },

  presenceSet: {
    name: 'presenceSet',
    method: 'POST',
    url: FB_API_GRAPHQL,
    description: 'Set whether the authenticated account appears online to other users.',
    requiredParams: ['variables', 'fb_dtsg', 'lsd'],
  },
} as const satisfies Record<string, EndpointDefinition>;

export type ApiEndpointName = keyof typeof API_ENDPOINTS;

// ─── GraphQL friendly-name map (re-exported for convenience) ─────────────────
export { GRAPHQL_FRIENDLY_NAMES };

// ─── Endpoint URL helpers ─────────────────────────────────────────────────────

/**
 * Look up the URL for a named API endpoint.
 * Prefer importing the constant directly — this helper is for dynamic dispatch.
 */
export function getEndpointUrl(name: ApiEndpointName): string {
  return API_ENDPOINTS[name].url;
}

/**
 * Returns true if the given URL belongs to Facebook's GraphQL API surface.
 */
export function isGraphQLEndpoint(url: string): boolean {
  return url === FB_API_GRAPHQL;
}

/**
 * Returns true if the given URL is a messaging send endpoint
 * (text messages and sticker sends use the same endpoint).
 */
export function isMessageSendEndpoint(url: string): boolean {
  return url.startsWith(FB_MESSAGING_SEND);
}

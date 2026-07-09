/**
 * src/responses/index.ts
 *
 * Incoming response parsers and Zod validators.
 *
 * Every response from Facebook's private API is validated here before the
 * parsed data is handed back to the calling module. This ensures:
 *   - Unknown response shapes surface as `ResponseValidationError` immediately
 *     (rather than as silent `undefined` deep inside a module)
 *   - TypeScript types are derived from the schema, not from hand-written
 *     interfaces that can drift from reality
 *
 * When Facebook changes a response shape, `ResponseValidationError` fires on
 * the first bad response, making the breakage visible and actionable rather
 * than producing subtly wrong data.
 *
 * Usage pattern in modules:
 *   const raw = await resp.json();
 *   const thread = parseThreadResponse(raw);   // throws ResponseValidationError on mismatch
 */

import { z } from 'zod';
import { ResponseValidationError, DeserializationError } from '../errors/index.js';

// ─── Shared primitives ────────────────────────────────────────────────────────

/** Accept any non-null value as an ID and coerce to string. */
const IdSchema = z.union([z.string(), z.number()]).transform((v) => String(v));

/**
 * Accept a Unix timestamp (ms or s) or an ISO date string and normalise to a Date.
 *
 * Facebook sends timestamps in three forms:
 *   - Millisecond integer  (e.g. 1720000000000)
 *   - Second integer       (e.g. 1720000)
 *   - ISO-8601 string      (e.g. "2026-07-07T04:00:00.000Z")
 *
 * `Number()` of an ISO string returns `NaN`, so we fall back to `Date.parse`.
 */
const TimestampSchema = z
  .union([z.string(), z.number()])
  .transform((v) => {
    if (typeof v === 'string') {
      // Try numeric first (Facebook often sends timestamps as string-digits)
      const n = Number(v);
      if (!Number.isNaN(n)) {
        const ms = n > 1e12 ? n : n * 1000;
        return new Date(ms);
      }
      // Fall back to ISO / date-string parse
      const parsed = Date.parse(v);
      return new Date(Number.isNaN(parsed) ? 0 : parsed);
    }
    const ms = v > 1e12 ? v : v * 1000;
    return new Date(ms);
  });

// ─── Strip Facebook's anti-parsing prefix ────────────────────────────────────

/**
 * Facebook prefixes many JSON responses with `for (;;);` to prevent direct
 * JSONP evaluation. Strip it before parsing.
 */
export function stripFbPrefix(text: string): string {
  return text.startsWith('for (;;);') ? text.slice(9) : text;
}

/**
 * Parse and strip a raw Facebook HTTP response body into an unknown value.
 * Throws `DeserializationError` on JSON parse failure.
 */
export function parseRawResponse(text: string): unknown {
  try {
    return JSON.parse(stripFbPrefix(text));
  } catch (err) {
    throw new DeserializationError(
      `Failed to parse Facebook response: ${(err as Error).message}`,
      { preview: text.slice(0, 200) },
      err,
    );
  }
}

// ─── Validate helper ──────────────────────────────────────────────────────────

/**
 * Run a Zod schema against `data`. On failure, throws `ResponseValidationError`
 * with full Zod issue details and a truncated raw-data preview.
 *
 * Uses `ZodTypeAny` so the function accepts schemas that have transforms or
 * `.default()` (where `_input !== _output`). The return type is inferred from
 * the schema's output type via `z.output<S>`.
 */
export function validate<S extends z.ZodTypeAny>(
  schema: S,
  data: unknown,
  context?: string,
): z.output<S> {
  const result = schema.safeParse(data);
  if (result.success) return result.data as z.output<S>;
  const issues = result.error.issues
    .slice(0, 5)
    .map((i) => `  [${i.path.join('.')}] ${i.message}`)
    .join('\n');
  throw new ResponseValidationError(
    `Response validation failed${context ? ` (${context})` : ''}:\n${issues}`,
    {
      context,
      issues: result.error.issues.slice(0, 5),
      preview: JSON.stringify(data).slice(0, 300),
    },
    result.error,
  );
}

// ─── Attachment schema ────────────────────────────────────────────────────────

export const AttachmentSchema = z.object({
  id: IdSchema.optional().default(''),
  type: z.string().optional().default('unknown'),
  url: z.string().optional(),
  name: z.string().optional(),
  size: z.number().optional(),
});

export type ParsedAttachment = z.output<typeof AttachmentSchema>;

// ─── Message schema ───────────────────────────────────────────────────────────

export const MessageNodeSchema = z.object({
  message_id: IdSchema.optional(),
  id: IdSchema.optional(),
  timestamp_precise: TimestampSchema.optional(),
  timestamp: TimestampSchema.optional(),
  message: z
    .object({ text: z.string().nullable().optional() })
    .nullable()
    .optional(),
  message_sender: z
    .object({
      id: IdSchema.optional(),
      name: z.string().optional(),
    })
    .optional(),
  blob_attachments: z.array(AttachmentSchema).optional(),
  sticker: z
    .object({ id: IdSchema.optional(), label: z.string().optional() })
    .nullable()
    .optional(),
});

export type MessageNode = z.output<typeof MessageNodeSchema>;

export const MessageListResponseSchema = z.object({
  data: z
    .object({
      viewer: z
        .object({
          message_thread: z
            .object({
              thread_key: z.object({ thread_fbid: IdSchema.optional() }).optional(),
              messages: z.object({
                edges: z.array(
                  z.object({
                    node: MessageNodeSchema,
                  }),
                ),
                page_info: z.object({
                  has_previous_page: z.boolean().optional().default(false),
                  start_cursor: z.string().nullable().optional(),
                }),
              }),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
}).passthrough();

export type MessageListResponse = z.output<typeof MessageListResponseSchema>;

// ─── Send-message response ────────────────────────────────────────────────────

/**
 * Facebook returns the new message's ID and timestamp inside `payload`.
 * The schema is loose (`passthrough`) because field names vary between
 * API versions; we only extract what we need.
 */
export const SendMessageResponseSchema = z
  .object({
    payload: z
      .object({
        message_id: z.string().optional(),
        timestamp: TimestampSchema.optional(),
      })
      .passthrough()
      .optional(),
    error: z.number().optional(),
    errorSummary: z.string().optional(),
  })
  .passthrough();

export type SendMessageResponse = z.output<typeof SendMessageResponseSchema>;

// ─── Thread schema ────────────────────────────────────────────────────────────

export const ParticipantSchema = z.object({
  id: IdSchema,
  name: z.string().optional().default(''),
  profile_picture: z
    .object({ uri: z.string().optional() })
    .nullable()
    .optional(),
});

export type ParsedParticipant = z.output<typeof ParticipantSchema>;

export const ThreadNodeSchema = z.object({
  thread_key: z
    .object({ thread_fbid: IdSchema.optional(), other_user_id: IdSchema.optional() })
    .optional(),
  id: IdSchema.optional(),
  name: z.string().nullable().optional(),
  image: z.object({ uri: z.string() }).nullable().optional(),
  is_group_thread: z.boolean().optional().default(false),
  all_participants: z
    .object({
      edges: z.array(
        z.object({ node: ParticipantSchema }),
      ).optional().default([]),
    })
    .optional(),
  unread_count: z.number().optional().default(0),
  mute_until: TimestampSchema.optional(),
  folder: z.string().optional(),
  updated_time_precise: TimestampSchema.optional(),
  last_message: z
    .object({
      nodes: z.array(MessageNodeSchema).optional(),
    })
    .optional(),
});

export type ThreadNode = z.output<typeof ThreadNodeSchema>;

// Thread list uses a connection-style edge array.
// Facebook returns the thread list under several possible paths depending
// on the query version (viewer / user / top-level).
const ThreadEdgeSchema = z.object({ node: ThreadNodeSchema });

export const ThreadListResponseSchema = z.object({
  data: z
    .object({
      // Connection may be under viewer.message_threads, user.message_threads,
      // or the top-level message_threads key — accept any.
      viewer: z
        .object({
          message_threads: z
            .object({
              edges: z.array(ThreadEdgeSchema).optional().default([]),
              page_info: z
                .object({
                  has_next_page: z.boolean().optional().default(false),
                  end_cursor: z.string().nullable().optional(),
                })
                .optional(),
            })
            .optional(),
          threads: z
            .object({
              edges: z.array(ThreadEdgeSchema).optional().default([]),
              page_info: z
                .object({
                  has_next_page: z.boolean().optional().default(false),
                  end_cursor: z.string().nullable().optional(),
                })
                .optional(),
            })
            .optional(),
        })
        .optional(),
      user: z
        .object({
          message_threads: z
            .object({
              edges: z.array(ThreadEdgeSchema).optional().default([]),
              page_info: z
                .object({
                  has_next_page: z.boolean().optional().default(false),
                  end_cursor: z.string().nullable().optional(),
                })
                .optional(),
            })
            .optional(),
        })
        .optional(),
      message_threads: z
        .object({
          edges: z.array(ThreadEdgeSchema).optional().default([]),
          page_info: z
            .object({
              has_next_page: z.boolean().optional().default(false),
              end_cursor: z.string().nullable().optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
}).passthrough();

export type ThreadListResponse = z.output<typeof ThreadListResponseSchema>;

// ─── User profile schema ──────────────────────────────────────────────────────

export const UserProfileSchema = z.object({
  id: IdSchema,
  name: z.string().optional().default(''),
  username: z.string().nullable().optional(),
  profile_picture: z
    .object({ uri: z.string().optional() })
    .nullable()
    .optional(),
  friends_count: z.number().nullable().optional(),
  mutual_friends: z
    .object({ count: z.number().optional() })
    .nullable()
    .optional(),
  is_friend: z.boolean().optional(),
});

export type ParsedUserProfile = z.output<typeof UserProfileSchema>;

export const UserProfileResponseSchema = z.object({
  data: z
    .object({
      user: UserProfileSchema.optional(),
      viewer: z.object({ actor: UserProfileSchema.optional() }).optional(),
    })
    .optional(),
}).passthrough();

export type UserProfileResponse = z.output<typeof UserProfileResponseSchema>;

// ─── Friend-list schema ───────────────────────────────────────────────────────

export const FriendListResponseSchema = z.object({
  data: z
    .object({
      viewer: z
        .object({
          friends: z
            .object({
              edges: z.array(
                z.object({ node: UserProfileSchema }),
              ).optional().default([]),
              page_info: z
                .object({
                  has_next_page: z.boolean().optional().default(false),
                  end_cursor: z.string().nullable().optional(),
                })
                .optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
}).passthrough();

export type FriendListResponse = z.output<typeof FriendListResponseSchema>;

// ─── Presence schema ──────────────────────────────────────────────────────────

// Presence: Facebook returns presence under data.user.presence_data or
// data.presence.presence_data (depending on query version).
export const PresenceEntrySchema = z.object({
  user_id: IdSchema.optional(),
  // Facebook uses is_online or is_present depending on API version
  is_online: z.boolean().optional(),
  is_present: z.boolean().optional(),
  is_active: z.boolean().optional(),
  // Seconds-precision Unix timestamp — last_active_time or last_active
  last_active_time: z.union([z.string(), z.number()]).optional(),
  last_active: z.union([z.string(), z.number()]).optional(),
});

export type ParsedPresenceEntry = z.output<typeof PresenceEntrySchema>;

export const PresenceResponseSchema = z.object({
  data: z
    .object({
      user: z
        .object({
          presence_data: PresenceEntrySchema.optional(),
          // fallback: some queries nest under user directly
          is_online: z.boolean().optional(),
          is_present: z.boolean().optional(),
          last_active_time: z.union([z.string(), z.number()]).optional(),
        })
        .optional(),
      presence: z
        .object({
          presence_data: PresenceEntrySchema.optional(),
        })
        .optional(),
    })
    .optional(),
}).passthrough();

export type PresenceResponse = z.output<typeof PresenceResponseSchema>;

// ─── Poll schema ──────────────────────────────────────────────────────────────

export const PollOptionSchema = z.object({
  id: IdSchema.optional(),
  text: z.string(),
  vote_count: z.number().optional().default(0),
  voters: z.array(IdSchema).optional().default([]),
});

export type ParsedPollOption = z.output<typeof PollOptionSchema>;

export const PollResponseSchema = z.object({
  data: z
    .object({
      poll: z
        .object({
          id: IdSchema.optional(),
          title: z.string().optional(),
          options: z.array(PollOptionSchema).optional().default([]),
          total_vote_count: z.number().optional().default(0),
          expiration_time: TimestampSchema.optional(),
        })
        .optional(),
    })
    .optional(),
}).passthrough();

export type PollResponse = z.output<typeof PollResponseSchema>;

// ─── Search schemas ───────────────────────────────────────────────────────────

// Search: both message search and thread search use data.search_results.edges[].node.
// The shape of the node differs per query type.

export const MessageSearchNodeSchema = z.object({
  message_id: IdSchema.optional(),
  id: IdSchema.optional(),
  thread_key: z
    .object({ thread_fbid: IdSchema.optional() })
    .optional(),
  // Sender info appears on message search nodes
  sender: z
    .object({ id: IdSchema.optional(), name: z.string().optional() })
    .optional(),
  text: z.string().optional(),
  snippet: z.string().optional(),
  timestamp: z.union([z.string(), z.number()]).optional(),
});

export type ParsedMessageSearchNode = z.output<typeof MessageSearchNodeSchema>;

export const MessageSearchResponseSchema = z.object({
  data: z
    .object({
      // Both message and thread searches use the search_results key
      search_results: z
        .object({
          edges: z.array(
            z.object({ node: MessageSearchNodeSchema }),
          ).optional().default([]),
          page_info: z
            .object({
              has_next_page: z.boolean().optional().default(false),
              end_cursor: z.string().nullable().optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
}).passthrough();

export type MessageSearchResponse = z.output<typeof MessageSearchResponseSchema>;

export const ThreadSearchNodeSchema = z.object({
  id: IdSchema.optional(),
  thread_key: z.union([IdSchema, z.object({ thread_fbid: IdSchema.optional() })]).optional(),
  name: z.string().nullable().optional(),
  is_group_thread: z.boolean().optional().default(false),
  all_participants: z
    .array(
      z.union([
        z.object({ node: z.object({ name: z.string().optional() }).passthrough() }),
        z.object({ name: z.string().optional() }).passthrough(),
      ]),
    )
    .optional(),
  last_message: z
    .object({ timestamp: z.union([z.string(), z.number()]).optional() })
    .optional(),
});

export type ParsedThreadSearchNode = z.output<typeof ThreadSearchNodeSchema>;

export const ThreadSearchResponseSchema = z.object({
  data: z
    .object({
      search_results: z
        .object({
          edges: z.array(
            z.object({ node: ThreadSearchNodeSchema }),
          ).optional().default([]),
          page_info: z
            .object({
              has_next_page: z.boolean().optional().default(false),
              end_cursor: z.string().nullable().optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
}).passthrough();

export type ThreadSearchResponse = z.output<typeof ThreadSearchResponseSchema>;

// ─── Upload response schema ───────────────────────────────────────────────────

export const UploadResponseSchema = z.object({
  payload: z
    .object({
      metadata: z
        .array(
          z.object({
            fbid: z.union([z.string(), z.number()]).optional(),
            filename: z.string().optional(),
            filetype: z.string().optional(),
            attachment_id: z.union([z.string(), z.number()]).optional(),
          }),
        )
        .optional(),
      fbid: z.union([z.string(), z.number()]).optional(),
      attachment_id: z.union([z.string(), z.number()]).optional(),
      attachment_token: z.string().optional(),
    })
    .optional(),
}).passthrough();

export type UploadResponse = z.output<typeof UploadResponseSchema>;

/**
 * Extract the real server-assigned attachment ID from an upload response.
 * Returns `null` if no ID is present (caller should throw `UploadError`).
 */
export function extractAttachmentId(raw: unknown): string | null {
  const parsed = UploadResponseSchema.safeParse(raw);
  if (!parsed.success) return null;
  const p = parsed.data.payload;
  if (!p) return null;
  const first = p.metadata?.[0];
  const raw_id = first?.fbid ?? first?.attachment_id ?? p.fbid ?? p.attachment_id ?? p.attachment_token;
  return raw_id != null ? String(raw_id) : null;
}

// ─── Auth / session-check schema ─────────────────────────────────────────────

export const LoginResponseSchema = z.object({
  jsmods: z
    .object({
      require: z.array(z.unknown()).optional(),
    })
    .optional(),
  error: z.number().optional(),
  errorSummary: z.string().optional(),
  errorDescription: z.string().optional(),
}).passthrough();

export type LoginResponse = z.output<typeof LoginResponseSchema>;

// ─── Convenience parse functions ──────────────────────────────────────────────
// Each function parses raw JSON text (including Facebook's `for (;;);` prefix),
// validates the shape, and returns a typed result.

export function parseThreadListResponse(text: string): ThreadListResponse {
  const data = parseRawResponse(text);
  return validate(ThreadListResponseSchema, data, 'threadList');
}

export function parseMessageListResponse(text: string): MessageListResponse {
  const data = parseRawResponse(text);
  return validate(MessageListResponseSchema, data, 'messageList');
}

export function parseSendMessageResponse(text: string): SendMessageResponse {
  const data = parseRawResponse(text);
  return validate(SendMessageResponseSchema, data, 'sendMessage');
}

export function parseUserProfileResponse(text: string): UserProfileResponse {
  const data = parseRawResponse(text);
  return validate(UserProfileResponseSchema, data, 'userProfile');
}

export function parseFriendListResponse(text: string): FriendListResponse {
  const data = parseRawResponse(text);
  return validate(FriendListResponseSchema, data, 'friendList');
}

export function parsePresenceResponse(text: string): PresenceResponse {
  const data = parseRawResponse(text);
  return validate(PresenceResponseSchema, data, 'presence');
}

export function parsePollResponse(text: string): PollResponse {
  const data = parseRawResponse(text);
  return validate(PollResponseSchema, data, 'poll');
}

export function parseMessageSearchResponse(text: string): MessageSearchResponse {
  const data = parseRawResponse(text);
  return validate(MessageSearchResponseSchema, data, 'messageSearch');
}

export function parseThreadSearchResponse(text: string): ThreadSearchResponse {
  const data = parseRawResponse(text);
  return validate(ThreadSearchResponseSchema, data, 'threadSearch');
}

export function parseUploadResponse(text: string): UploadResponse {
  const data = parseRawResponse(text);
  return validate(UploadResponseSchema, data, 'upload');
}

export function parseLoginResponse(text: string): LoginResponse {
  const data = parseRawResponse(text);
  return validate(LoginResponseSchema, data, 'login');
}

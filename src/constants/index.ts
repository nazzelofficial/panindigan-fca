export { STORAGE_API_URL, STORAGE_API_ENDPOINTS, STORAGE_API_TOKEN, STORAGE_API_TIMEOUT_MS, STORAGE_API_RETRIES } from '../storage/api-config.js';

export const FB_BASE_URL = 'https://www.facebook.com';
export const FB_API_GRAPHQL = 'https://www.facebook.com/api/graphql/';
export const FB_MESSAGING_SEND = 'https://www.facebook.com/messaging/send/';
export const FB_UPLOAD_URL = 'https://upload.facebook.com/ajax/mercury/upload.php';
export const FB_STICKER_URL = 'https://www.facebook.com/ajax/mercury/change_sticker_pack.php';
export const FB_LOGIN_URL = 'https://www.facebook.com/login/device-based/regular/login/';
export const FB_LOGOUT_URL = 'https://www.facebook.com/logout/';

export const FB_DELETE_MESSAGES_URL = 'https://www.facebook.com/ajax/mercury/delete_messages.php';
export const FB_TYPING_URL = 'https://www.facebook.com/ajax/messaging/typ.php';
export const FB_LEAVE_THREAD_URL = 'https://www.facebook.com/ajax/mercury/leave_thread.php';
export const FB_SET_THREAD_IMAGE_URL = 'https://www.facebook.com/ajax/messaging/set_thread_image.php';
export const FB_CHECKPOINT_URL = 'https://www.facebook.com/checkpoint/';
export const FB_HOME_URL = 'https://www.facebook.com/';

export const MQTT_HOST = 'edge-chat.messenger.com';
export const MQTT_URL = 'wss://edge-chat.messenger.com/chat';
export const MQTT_BROKERS = [
  'wss://edge-chat.messenger.com/chat',
  'wss://edge-chat.facebook.com/chat',
] as const;
export const MQTT_APP_ID = '2220391788200892';
export const MQTT_KEEPALIVE_SEC = 60;

export const FB_APP_ID = '2220391788200892';
export const FB_CLIENT_REVISION = 1;

export const REQUIRED_COOKIES = ['c_user', 'xs', 'datr'] as const;

export const RECOMMENDED_COOKIES = ['fr', 'sb', 'wd', 'presence'] as const;

export const SENSITIVE_FIELDS = [
  'password',
  'secret',
  'token',
  'cookie',
  'authorization',
  'appState',
  'xs',
  'c_user',
  'fr',
  'datr',
  'sb',
] as const;

export const DEFAULT_HEADERS: Record<string, string> = {
  accept: '*/*',
  'accept-language': 'en-US,en;q=0.9',
  'cache-control': 'no-cache',
  origin: 'https://www.facebook.com',
  pragma: 'no-cache',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'x-fb-friendly-name': 'PandindiganFCA',
};

export const CONTENT_TYPE_FORM = 'application/x-www-form-urlencoded';
export const CONTENT_TYPE_JSON = 'application/json';

export const MAX_MESSAGE_LENGTH = 20000;
export const MAX_THREAD_LIMIT = 100;
export const MAX_MESSAGE_LIMIT = 100;
export const DEFAULT_THREAD_LIMIT = 20;
export const DEFAULT_MESSAGE_LIMIT = 20;

export const GRAPHQL_FRIENDLY_NAMES = {
  threadList: 'LSPlatformThreadlistFeedQuery',
  threadInfo: 'LSPlatformGraphQLLightspeedRequestForIGLSPQuery',
  messageList: 'LSPlatformGraphQLLightspeedRequestForIGLSPQuery',
  sendMessage: 'useSendMessageMutation',
  userInfo: 'CometUserHoverCardContentQuery',
  friendList: 'FriendingCometFriendListCardPaginationQuery',
  searchThreads: 'SearchCometResultsPaginatedResultsQuery',
  searchMessages: 'MercurySearchPageSearchQuery',
  reactMessage: 'useCometUFISetMessageReactionMutation',
  markRead: 'MarkThreadReadMutation',
  setTyping: 'MercuryTypingMutation',
  unsendMessage: 'UnsendMessageMutation',
  createGroup: 'CreateGroupThreadMutation',
  addParticipants: 'AddParticipantsMutation',
  removeParticipant: 'RemoveParticipantMutation',
  renameThread: 'ChangeThreadNameMutation',
  muteThread: 'MuteThreadMutation',
  archiveThread: 'ArchiveThreadMutation',
  createPoll: 'CreatePollMutation',
  votePoll: 'VotePollMutation',
  getPollResults: 'GetPollResultsQuery',
  stickerPack: 'GetStickerPackQuery',
  presenceGet: 'FetchPresenceQuery',
  presenceSet: 'SetPresenceMutation',
} as const;

export const RETRY_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

export const CHECKPOINT_PATHS = [
  '/checkpoint/',
  '/checkpoint/block/',
  '/login/checkpoint/',
] as const;

export const SUSPENSION_INDICATORS = [
  'your account has been disabled',
  'account has been suspended',
  'account was disabled',
] as const;

export const RESTRICTION_INDICATORS = [
  'temporarily blocked',
  'temporarily restricted',
  'your account is restricted',
] as const;

export const RATE_LIMIT_INDICATORS = [
  'too many requests',
  'rate limit exceeded',
  'please try again later',
  'you are temporarily blocked from performing this action',
] as const;

export const LOGIN_APPROVAL_INDICATORS = [
  'login approval needed',
  'approve this login',
  'review recent login',
  'was this you',
  'unusual login attempt',
] as const;

export const EXPIRED_SESSION_INDICATORS = [
  'session expired',
  'please log in again',
  'your session has expired',
  'you need to log in to continue',
] as const;

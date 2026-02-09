export const FACEBOOK_URL = 'https://www.facebook.com';
export const MESSENGER_URL = 'https://www.messenger.com';

export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.7; rv:135.0) Gecko/20100101 Firefox/135.0'
];

export const HEADERS = {
  'User-Agent': USER_AGENTS[0],
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'max-age=0',
  'Connection': 'keep-alive',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
  'Origin': FACEBOOK_URL,
  'Referer': FACEBOOK_URL + '/',
  'DNT': '1'
};

export const MQTT_BROKER_URL = 'wss://edge-chat.messenger.com/chat';
export const FACEBOOK_APP_ID = 219994525426954;

export const MQTT_CONFIG = {
  PROTOCOL_NAME: 'MQIsdp',
  PROTOCOL_LEVEL: 3,
  CLIENT_ID: 'mqttwsclient',
  KEEP_ALIVE_DEFAULT: 30,
  RECONNECT_PERIOD: 3000,
  CONNECT_TIMEOUT: 10000,
  CHAT_ON: true,
  FOREGROUND: false,
  CONNECTION_TYPE: 'websocket',
  NO_AUTO_FG: true
} as const;

export const MQTT_TOPICS = {
  MESSAGING: '/t_ms',
  TYPING: '/thread_typing',
  PRESENCE: '/orca_presence',
  LEGACY_WEB: '/legacy_web',
  WEBRTC: '/webrtc',
  NOTIFICATIONS: '/orca_typing_notifications',
  P_P: '/p_p',
  P_A: '/p_a'
};

export const MQTT_CAPABILITIES = {
  VOIP: 1,
  VIDEO: 2,
  AUDIO: 4,
  STICKER: 8,
  GIF: 16,
  LOCATION: 32,
  TYPING: 64,
  ECHO: 128
};

export const REGEX_PATTERNS = {
  DTSG: /name="fb_dtsg" value="(.*?)"/,
  DTSG_INITIAL: /\["DTSGInitialData",\[\],{"token":"(.*?)"/,
  USER_ID: /c_user=(\d+)/,
  USER_ID_COOKIE: /c_user/,
  IRIS_SEQ_ID: /"irisSeqID":"(.*?)"/,
  LSD: /name="lsd" value="(.*?)"/,
  HASH: /"h":"(.*?)"/,
  SPIN_R: /"__spin_r":(\d+)/,
  SPIN_B: /"__spin_b":"(.*?)"/,
  SPIN_T: /"__spin_t":(\d+)/,
  JAZOEST: /name="jazoest" value="(\d+)"/
};

export const GRAPHQL_DOC_IDS = {
  NOTIFICATIONS: '4766533043400325',
  THREAD_LIST: '1349387578499440',
  USER_INFO: '3591164797598801',
  FRIENDS_LIST: '10156903248383894'
};

export const ERROR_MESSAGES = {
  NOT_LOGGED_IN: 'Not logged in. Check your appState or environment variables.',
  LOGIN_FAILED: 'Login failed. Please check your credentials or cookie validity.',
  NO_APPSTATE: 'No AppState provided. Set FB_APPSTATE environment variable or pass it in options.',
  NETWORK_ERROR: 'Network error occurred.',
  MQTT_CONNECTION_FAILED: 'Failed to connect to MQTT broker.'
};

export const REGION_HINTS = {
  GLOBAL: 'global',
  FRC: 'FRC',
  NA: 'NA',
  ASIA: 'ASIA'
};

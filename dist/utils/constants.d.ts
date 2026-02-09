export declare const FACEBOOK_URL = "https://www.facebook.com";
export declare const MESSENGER_URL = "https://www.messenger.com";
export declare const USER_AGENTS: string[];
export declare const HEADERS: {
    'User-Agent': string;
    Accept: string;
    'Accept-Language': string;
    'Cache-Control': string;
    Connection: string;
    'Sec-Fetch-Dest': string;
    'Sec-Fetch-Mode': string;
    'Sec-Fetch-Site': string;
    'Sec-Fetch-User': string;
    'Upgrade-Insecure-Requests': string;
    Origin: string;
    Referer: string;
    DNT: string;
};
export declare const MQTT_BROKER_URL = "wss://edge-chat.messenger.com/chat";
export declare const FACEBOOK_APP_ID = 219994525426954;
export declare const MQTT_CONFIG: {
    readonly PROTOCOL_NAME: "MQIsdp";
    readonly PROTOCOL_LEVEL: 3;
    readonly CLIENT_ID: "mqttwsclient";
    readonly KEEP_ALIVE_DEFAULT: 30;
    readonly RECONNECT_PERIOD: 3000;
    readonly CONNECT_TIMEOUT: 10000;
    readonly CHAT_ON: true;
    readonly FOREGROUND: false;
    readonly CONNECTION_TYPE: "websocket";
    readonly NO_AUTO_FG: true;
};
export declare const MQTT_TOPICS: {
    MESSAGING: string;
    TYPING: string;
    PRESENCE: string;
    LEGACY_WEB: string;
    WEBRTC: string;
    NOTIFICATIONS: string;
    P_P: string;
    P_A: string;
};
export declare const MQTT_CAPABILITIES: {
    VOIP: number;
    VIDEO: number;
    AUDIO: number;
    STICKER: number;
    GIF: number;
    LOCATION: number;
    TYPING: number;
    ECHO: number;
};
export declare const REGEX_PATTERNS: {
    DTSG: RegExp;
    DTSG_INITIAL: RegExp;
    USER_ID: RegExp;
    USER_ID_COOKIE: RegExp;
    IRIS_SEQ_ID: RegExp;
    LSD: RegExp;
    HASH: RegExp;
    SPIN_R: RegExp;
    SPIN_B: RegExp;
    SPIN_T: RegExp;
    JAZOEST: RegExp;
};
export declare const GRAPHQL_DOC_IDS: {
    NOTIFICATIONS: string;
    THREAD_LIST: string;
    USER_INFO: string;
    FRIENDS_LIST: string;
};
export declare const ERROR_MESSAGES: {
    NOT_LOGGED_IN: string;
    LOGIN_FAILED: string;
    NO_APPSTATE: string;
    NETWORK_ERROR: string;
    MQTT_CONNECTION_FAILED: string;
};
export declare const REGION_HINTS: {
    GLOBAL: string;
    FRC: string;
    NA: string;
    ASIA: string;
};

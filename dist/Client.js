"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanindiganClient = void 0;
const auth_1 = require("./auth");
const mqtt_1 = require("./api/mqtt");
const autoRefresh_1 = require("./utils/autoRefresh");
const utils_1 = require("./utils/utils");
const MessageQueue_1 = require("./utils/MessageQueue");
const PerformanceManager_1 = require("./utils/PerformanceManager");
const Formatter_1 = require("./utils/Formatter");
const fs = __importStar(require("fs"));
const form_data_1 = __importDefault(require("form-data"));
const constants_1 = require("./utils/constants");
const Logger_1 = require("./utils/Logger");
class PanindiganClient {
    constructor(options = {}) {
        this.ctx = null;
        this.mqtt = null;
        this.autoRefresh = null;
        this.onEventCallback = null;
        this.formatter = null;
        this.options = options;
        this.msgQueue = new MessageQueue_1.MessageQueue();
        this.perfMgr = PerformanceManager_1.PerformanceManager.getInstance();
    }
    async login(loginOptions = {}) {
        // 1. Check provided appState
        // 2. Check environment variable FB_APPSTATE
        if (!loginOptions.appState) {
            if (process.env.FB_APPSTATE) {
                try {
                    const rawState = process.env.FB_APPSTATE;
                    // Handle both JSON string and Base64 encoded JSON
                    if (rawState.trim().startsWith('[')) {
                        loginOptions.appState = JSON.parse(rawState);
                    }
                    else {
                        const buffer = Buffer.from(rawState, 'base64');
                        loginOptions.appState = JSON.parse(buffer.toString('utf-8'));
                    }
                    Logger_1.logger.info('[Panindigan] Loaded AppState from environment variable.');
                }
                catch (e) {
                    Logger_1.logger.error('[Panindigan] Failed to parse FB_APPSTATE from environment.', e);
                }
            }
        }
        if (!loginOptions.appState || loginOptions.appState.length === 0) {
            throw new Error(constants_1.ERROR_MESSAGES.NO_APPSTATE);
        }
        this.ctx = await (0, auth_1.login)(loginOptions, this.options);
        // Start AutoRefresh
        if (this.options.autoRefresh?.enable) {
            this.autoRefresh = new autoRefresh_1.AutoRefresh(this.ctx, this.options);
            this.autoRefresh.start();
        }
        this.formatter = new Formatter_1.Formatter(this.ctx);
        if (this.options.listenEvents) {
            this.startListening();
        }
    }
    startListening() {
        if (!this.ctx)
            return;
        this.mqtt = new mqtt_1.MQTTClient(this.ctx, (event) => {
            if (typeof this.onEventCallback === 'function') {
                try {
                    if (event.type === 'message' && event.delta) {
                        const formatted = this.formatter?.format(event.delta);
                        if (formatted) {
                            this.onEventCallback(null, formatted);
                        }
                    }
                    else if (event.type === 'mqtt_error') {
                        this.onEventCallback(event.error, null);
                    }
                    else {
                        this.onEventCallback(null, event);
                    }
                }
                catch (e) {
                    Logger_1.logger.error('Error in event callback:', e);
                }
            }
        });
        this.mqtt.connect();
    }
    listenMqtt(callback) {
        this.onEventCallback = callback;
        if (!this.mqtt || !this.mqtt.getStatus()) {
            this.startListening();
        }
    }
    on(callback) {
        // Adapter for legacy .on method to match (err, event) signature
        this.onEventCallback = (err, event) => {
            if (err)
                return; // Legacy .on usually just wants events? Or maybe we should log error?
            callback(event);
        };
        if (!this.mqtt || !this.mqtt.getStatus()) {
            this.startListening();
        }
    }
    async uploadAttachment(attachment) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const form = new form_data_1.default();
        form.append('upload_1024', typeof attachment === 'string' ? fs.createReadStream(attachment) : attachment);
        // form.append('voice_clip', 'true'); // If voice message
        const res = await this.ctx.req.post('https://upload.facebook.com/ajax/mercury/upload.php', form, {
            headers: {
                ...form.getHeaders(),
                'x-msgr-region': 'FRC',
            },
            params: {
                fb_dtsg: this.ctx.fb_dtsg,
                jazoest: this.ctx.ttstamp,
            }
        });
        // Parse response to get attachment IDs
        // Response is usually: for (;;); {"payload":{"metadata":[{"image_id":...}]}}
        const body = res.data.toString().replace('for (;;);', '');
        const json = JSON.parse(body);
        return json.payload?.metadata?.map((m) => m.image_id || m.file_id || m.video_id) || [];
    }
    async sendMessage(threadId, message) {
        return this.msgQueue.enqueue(async () => {
            if (!this.ctx)
                throw new Error('Not logged in');
            const msg = typeof message === 'string' ? { body: message } : message;
            const messageId = (Date.now() * 1000 + Math.floor(Math.random() * 1000)).toString();
            let attachmentIds = [];
            if (msg.attachment) {
                attachmentIds = await this.uploadAttachment(msg.attachment);
            }
            const form = {
                client: 'mercury',
                fb_dtsg: this.ctx.fb_dtsg,
                jazoest: this.ctx.ttstamp,
                body: msg.body || '',
                message_id: messageId,
                other_user_fbid: threadId,
                thread_fbid: threadId,
                has_attachment: attachmentIds.length > 0,
                ephemeral_ttl_mode: 0,
            };
            if (attachmentIds.length > 0) {
                attachmentIds.forEach((id, i) => {
                    form[`image_ids[${i}]`] = id;
                });
            }
            if (msg.replyToMessageId) {
                form['replied_to_message_id'] = msg.replyToMessageId;
            }
            // Attempt to send via legacy endpoint
            const res = await this.ctx.req.post('/messaging/send/', form);
            return res.data;
        }, 10); // Priority 10
    }
    async getThreadList(limit = 20) {
        const cacheKey = `thread_list_${limit}`;
        const cached = this.perfMgr.getCache(cacheKey);
        if (cached)
            return cached;
        if (!this.ctx)
            throw new Error('Not logged in');
        const form = {
            fb_dtsg: this.ctx.fb_dtsg,
            jazoest: this.ctx.ttstamp,
            queries: JSON.stringify({
                o0: {
                    doc_id: '1349387578499440',
                    query_params: {
                        limit,
                        tags: ['INBOX'],
                        before: null,
                        includeDeliveryReceipts: true,
                        includeSeqID: false
                    }
                }
            })
        };
        const res = await this.ctx.req.post('/api/graphqlbatch/', form);
        const data = (0, utils_1.parseGraphQLBatch)(res.data);
        if (data[0] && data[0].viewer && data[0].viewer.message_threads) {
            const result = data[0].viewer.message_threads.nodes.map((t) => ({
                threadId: t.thread_key.thread_fbid || t.thread_key.other_user_id,
                threadName: t.name,
                isGroup: t.is_group_thread,
                unreadCount: t.unread_count,
                messageCount: t.messages_count,
                timestamp: t.updated_time_precise,
                participants: t.all_participants.nodes.map((p) => p.messaging_actor.id),
            }));
            this.perfMgr.setCache(cacheKey, result, 30); // 30s cache
            return result;
        }
        return [];
    }
    async getUserInfo(userIds) {
        const sortedIds = [...userIds].sort();
        const cacheKey = `user_info_${sortedIds.join('_')}`;
        const cached = this.perfMgr.getCache(cacheKey);
        if (cached)
            return cached;
        if (!this.ctx)
            throw new Error('Not logged in');
        // Use GraphQL Batch for user info
        const queries = {};
        userIds.forEach((id, i) => {
            queries[`u${i}`] = {
                doc_id: constants_1.GRAPHQL_DOC_IDS.USER_INFO,
                query_params: {
                    id: id
                }
            };
        });
        const form = {
            fb_dtsg: this.ctx.fb_dtsg,
            jazoest: this.ctx.ttstamp,
            queries: JSON.stringify(queries)
        };
        const res = await this.ctx.req.post('/api/graphqlbatch/', form);
        const responseMap = (0, utils_1.parseGraphQLBatchMap)(res.data);
        const result = userIds.map((id, i) => {
            const data = responseMap[`u${i}`];
            // Structure: { user: { name, gender, url, profile_picture: { uri } } }
            // Or { profile: { ... } } depending on the query
            const p = data?.user || data?.profile || {};
            return {
                id,
                name: p.name || 'Unknown User',
                firstName: p.short_name || p.name?.split(' ')[0],
                vanity: p.vanity || p.username,
                thumbSrc: p.profile_picture?.uri,
                profileUrl: p.url || `https://www.facebook.com/${id}`,
                gender: p.gender,
                type: p.type || 'user',
                isFriend: p.is_viewer_friend,
                isBirthday: p.is_birthday
            };
        });
        this.perfMgr.setCache(cacheKey, result, 300); // 5 min cache
        return result;
    }
    async getMessageHistory(threadId, limit = 20, timestamp) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const form = {
            fb_dtsg: this.ctx.fb_dtsg,
            jazoest: this.ctx.ttstamp,
            messages_limit: limit,
            thread_id: threadId,
            timestamp: timestamp
        };
        const res = await this.ctx.req.post('/ajax/mercury/thread_info.php', form);
        const messages = res.data.payload?.actions || [];
        return messages.map((m) => ({
            messageId: m.message_id,
            threadId: m.thread_fbid || threadId,
            senderId: m.author.split(':')[1],
            timestamp: m.timestamp,
            body: m.body,
            attachments: m.attachments?.map((a) => ({
                type: a.attach_type,
                id: a.metadata?.fbid,
                url: a.url,
                previewUrl: a.preview_url,
                filename: a.name,
            })) || [],
            mentions: {}, // Parsing logic needed if critical
            isUnread: false,
            isGroup: m.is_group,
            reactions: m.reactions?.reduce((acc, r) => {
                acc[r.user_id] = { reaction: r.reaction, userId: r.user_id };
                return acc;
            }, {}) || {}
        }));
    }
    async unsendMessage(messageId) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const form = {
            client: 'mercury',
            fb_dtsg: this.ctx.fb_dtsg,
            jazoest: this.ctx.ttstamp,
            message_id: messageId
        };
        await this.ctx.req.post('/messaging/unsend_message/', form);
    }
    async sendMessageReaction(messageId, reaction) {
        if (!this.ctx)
            throw new Error('Not logged in');
        // reaction: '😍', '😆', '😮', '😢', '😠', '👍', '👎' or empty string to remove
        const form = {
            client: 'mercury',
            fb_dtsg: this.ctx.fb_dtsg,
            jazoest: this.ctx.ttstamp,
            message_id: messageId,
            reaction: reaction
        };
        await this.ctx.req.post('/messaging/save_reaction/', form);
    }
    async sendTypingIndicator(threadId, isTyping) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const form = {
            client: 'mercury',
            fb_dtsg: this.ctx.fb_dtsg,
            jazoest: this.ctx.ttstamp,
            source: 'mercury-chat',
            thread: threadId,
            typ: isTyping ? 1 : 0,
            to: threadId
        };
        await this.ctx.req.post('/ajax/messaging/typ.php', form);
    }
    async markAsRead(threadId) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const form = {
            client: 'mercury',
            fb_dtsg: this.ctx.fb_dtsg,
            jazoest: this.ctx.ttstamp,
            ids: { [threadId]: true },
            watermarkTimestamp: Date.now(),
            shouldSendReadReceipt: true
        };
        await this.ctx.req.post('/ajax/mercury/change_read_status.php', form);
    }
    async createGroup(participantIds, message) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const messageId = (Date.now() * 1000 + Math.floor(Math.random() * 1000)).toString();
        const form = {
            client: 'mercury',
            fb_dtsg: this.ctx.fb_dtsg,
            jazoest: this.ctx.ttstamp,
            message_batch: JSON.stringify([{
                    action_type: 'ma-type:user-generated-message',
                    author: 'fbid:' + this.ctx.userID,
                    timestamp: Date.now(),
                    timestamp_absolute: 'Today',
                    timestamp_relative: 'Today',
                    timestamp_time_passed: '0',
                    is_unread: false,
                    is_cleared: false,
                    is_forward: false,
                    is_filtered_content: false,
                    is_filtered_content_bh: false,
                    is_filtered_content_account: false,
                    is_filtered_content_quasar: false,
                    is_filtered_content_invalid_app: false,
                    is_filtered_content_no_apps: false,
                    h: 'req:' + messageId,
                    message_id: messageId,
                    source: 'source:chat:web',
                    body: message || '',
                    html_body: false,
                    ui_push_phase: 'V3',
                    status: '0',
                    offline_threading_id: messageId,
                    message_sender: 'fbid:' + this.ctx.userID,
                    threading_id: messageId,
                    manual_retry_cnt: '0',
                    thread_fbid: '',
                    to_users: participantIds
                }])
        };
        const res = await this.ctx.req.post('/ajax/mercury/send_messages.php', form);
        // Parse response to find the new thread ID
        // Often in `actions` -> `thread_fbid`
        return res.data.payload?.actions?.[0]?.thread_fbid || '';
    }
    async changeThreadColor(threadId, color) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const form = {
            client: 'mercury',
            fb_dtsg: this.ctx.fb_dtsg,
            jazoest: this.ctx.ttstamp,
            color_choice: color,
            thread_or_other_fbid: threadId
        };
        await this.ctx.req.post('/messaging/save_thread_customization/', form);
    }
    async addParticipant(threadId, userIds) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const form = {
            client: 'mercury',
            fb_dtsg: this.ctx.fb_dtsg,
            jazoest: this.ctx.ttstamp,
            to_ids: userIds,
            thread_fbid: threadId
        };
        await this.ctx.req.post('/chat/add_participants/', form);
    }
    async removeParticipant(threadId, userId) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const form = {
            client: 'mercury',
            fb_dtsg: this.ctx.fb_dtsg,
            jazoest: this.ctx.ttstamp,
            uid: userId,
            tid: threadId
        };
        await this.ctx.req.post('/chat/remove_participants/', form);
    }
    async changeThreadEmoji(threadId, emoji) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const form = {
            client: 'mercury',
            fb_dtsg: this.ctx.fb_dtsg,
            jazoest: this.ctx.ttstamp,
            emoji_choice: emoji,
            thread_or_other_fbid: threadId
        };
        await this.ctx.req.post('/messaging/save_thread_customization/', form);
    }
    async changeNickname(threadId, userId, nickname) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const form = {
            client: 'mercury',
            fb_dtsg: this.ctx.fb_dtsg,
            jazoest: this.ctx.ttstamp,
            nickname: nickname,
            participant_id: userId,
            thread_or_other_fbid: threadId
        };
        await this.ctx.req.post('/messaging/save_thread_customization/', form);
    }
    // --- Friend Management ---
    async addFriend(userId) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { addFriend } = await Promise.resolve().then(() => __importStar(require('./api/friends')));
        return addFriend(this.ctx, userId);
    }
    async cancelFriendRequest(userId) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { cancelFriendRequest } = await Promise.resolve().then(() => __importStar(require('./api/friends')));
        return cancelFriendRequest(this.ctx, userId);
    }
    async removeFriend(userId) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { removeFriend } = await Promise.resolve().then(() => __importStar(require('./api/friends')));
        return removeFriend(this.ctx, userId);
    }
    async getFriendsList() {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { getFriendsList } = await Promise.resolve().then(() => __importStar(require('./api/friends')));
        return getFriendsList(this.ctx);
    }
    // --- Blocking ---
    async blockUser(userId) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { blockUser } = await Promise.resolve().then(() => __importStar(require('./api/blocking')));
        return blockUser(this.ctx, userId);
    }
    async unblockUser(userId) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { unblockUser } = await Promise.resolve().then(() => __importStar(require('./api/blocking')));
        return unblockUser(this.ctx, userId);
    }
    // --- Search ---
    async searchUser(query) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { searchUser } = await Promise.resolve().then(() => __importStar(require('./api/search')));
        return searchUser(this.ctx, query);
    }
    // --- Forwarding ---
    async forwardMessage(messageId, threadId) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { forwardMessage } = await Promise.resolve().then(() => __importStar(require('./api/forwardMessage')));
        return forwardMessage(this.ctx, messageId, threadId);
    }
    // --- Polls ---
    async createPoll(threadId, title, options) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { createPoll } = await Promise.resolve().then(() => __importStar(require('./api/polls')));
        return createPoll(this.ctx, threadId, title, options);
    }
    // --- Admin ---
    async changeAdminStatus(threadId, userId, isAdmin) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { changeAdminStatus } = await Promise.resolve().then(() => __importStar(require('./api/admin')));
        return changeAdminStatus(this.ctx, threadId, userId, isAdmin);
    }
    // --- Thread Extra ---
    async changeThreadName(threadId, newName) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { changeThreadName } = await Promise.resolve().then(() => __importStar(require('./api/thread_extra')));
        return changeThreadName(this.ctx, threadId, newName);
    }
    async changeThreadImage(threadId, imagePath) {
        if (!this.ctx)
            throw new Error('Not logged in');
        // Upload first
        const attachmentIds = await this.uploadAttachment(imagePath);
        if (attachmentIds.length === 0)
            throw new Error('Failed to upload image');
        const { changeThreadImage } = await Promise.resolve().then(() => __importStar(require('./api/thread_extra')));
        return changeThreadImage(this.ctx, threadId, attachmentIds[0]);
    }
    // --- Timeline ---
    async createPost(message, privacy = 'EVERYONE', targetId) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { createPost } = await Promise.resolve().then(() => __importStar(require('./api/timeline')));
        return createPost(this.ctx, message, privacy, targetId);
    }
    async deletePost(postId) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { deletePost } = await Promise.resolve().then(() => __importStar(require('./api/timeline')));
        return deletePost(this.ctx, postId);
    }
    async reactToPost(postId, reaction) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { reactToPost } = await Promise.resolve().then(() => __importStar(require('./api/timeline')));
        return reactToPost(this.ctx, postId, reaction);
    }
    async commentOnPost(postId, comment) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { commentOnPost } = await Promise.resolve().then(() => __importStar(require('./api/timeline')));
        return commentOnPost(this.ctx, postId, comment);
    }
    async sharePost(postId, text) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { sharePost } = await Promise.resolve().then(() => __importStar(require('./api/timeline')));
        return sharePost(this.ctx, postId, text);
    }
    // --- Notifications ---
    async getNotifications(limit = 10) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { getNotifications } = await Promise.resolve().then(() => __importStar(require('./api/notifications')));
        return getNotifications(this.ctx, limit);
    }
    async markNotificationsRead() {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { markNotificationsRead } = await Promise.resolve().then(() => __importStar(require('./api/notifications')));
        return markNotificationsRead(this.ctx);
    }
    // --- Advanced Messaging ---
    async sendSticker(threadId, stickerId) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { sendSticker } = await Promise.resolve().then(() => __importStar(require('./api/messaging_advanced')));
        return sendSticker(this.ctx, threadId, stickerId);
    }
    async deleteMessage(messageId) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { deleteMessage } = await Promise.resolve().then(() => __importStar(require('./api/messaging_advanced')));
        return deleteMessage(this.ctx, messageId);
    }
    async sendImage(threadId, image, caption) {
        return this.sendMessage(threadId, { body: caption || '', attachment: image });
    }
    async sendVideo(threadId, video, caption) {
        return this.sendMessage(threadId, { body: caption || '', attachment: video });
    }
    async sendAudio(threadId, audio) {
        return this.sendMessage(threadId, { body: '', attachment: audio });
    }
    async sendFile(threadId, file, caption) {
        return this.sendMessage(threadId, { body: caption || '', attachment: file });
    }
    // --- Advanced Thread Management ---
    async deleteThread(threadId) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { deleteThread } = await Promise.resolve().then(() => __importStar(require('./api/thread_management')));
        return deleteThread(this.ctx, threadId);
    }
    async archiveThread(threadId, archive = true) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { archiveThread } = await Promise.resolve().then(() => __importStar(require('./api/thread_management')));
        return archiveThread(this.ctx, threadId, archive);
    }
    async muteThread(threadId, seconds = -1) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { muteThread } = await Promise.resolve().then(() => __importStar(require('./api/thread_management')));
        return muteThread(this.ctx, threadId, seconds);
    }
    async pinThread(threadId, pin) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { pinThread } = await Promise.resolve().then(() => __importStar(require('./api/thread_management')));
        return pinThread(this.ctx, threadId, pin);
    }
    async setApprovalMode(threadId, approvalMode) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { setApprovalMode } = await Promise.resolve().then(() => __importStar(require('./api/group_settings')));
        return setApprovalMode(this.ctx, threadId, approvalMode);
    }
    async approveJoinRequest(threadId, userId) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { approveJoinRequest } = await Promise.resolve().then(() => __importStar(require('./api/group_settings')));
        return approveJoinRequest(this.ctx, threadId, userId);
    }
    async leaveGroup(threadId) {
        if (!this.ctx)
            throw new Error('Not logged in');
        return this.removeParticipant(threadId, this.ctx.userID);
    }
    // --- Friend Requests ---
    async acceptFriendRequest(userId) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { acceptFriendRequest } = await Promise.resolve().then(() => __importStar(require('./api/friends')));
        return acceptFriendRequest(this.ctx, userId);
    }
    async deleteFriendRequest(userId) {
        if (!this.ctx)
            throw new Error('Not logged in');
        const { deleteFriendRequest } = await Promise.resolve().then(() => __importStar(require('./api/friends')));
        return deleteFriendRequest(this.ctx, userId);
    }
}
exports.PanindiganClient = PanindiganClient;

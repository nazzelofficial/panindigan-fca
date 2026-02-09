import { LoginOptions, ApiOption, SendMessageOptions, Thread, User, Message } from './types';
import { login, ApiCtx } from './auth';
import { MQTTClient } from './api/mqtt';
import { AutoRefresh } from './utils/autoRefresh';
import { parseGraphQLBatch, parseGraphQLBatchMap } from './utils/utils';
import { MessageQueue } from './utils/MessageQueue';
import { PerformanceManager } from './utils/PerformanceManager';
import * as fs from 'fs';
import FormData from 'form-data';
import { HEADERS, ERROR_MESSAGES, GRAPHQL_DOC_IDS } from './utils/constants';
import { logger } from './utils/Logger';

export class PanindiganClient {
  private ctx: ApiCtx | null = null;
  private mqtt: MQTTClient | null = null;
  private autoRefresh: AutoRefresh | null = null;
  private options: ApiOption;
  private onEventCallback: ((event: any) => void) | null = null;
  private msgQueue: MessageQueue;
  private perfMgr: PerformanceManager;

  constructor(options: ApiOption = {}) {
    this.options = options;
    this.msgQueue = new MessageQueue();
    this.perfMgr = PerformanceManager.getInstance();
  }

  public async login(loginOptions: LoginOptions = {}): Promise<void> {
    // 1. Check provided appState
    // 2. Check environment variable FB_APPSTATE
    if (!loginOptions.appState) {
      if (process.env.FB_APPSTATE) {
        try {
          const rawState = process.env.FB_APPSTATE;
          // Handle both JSON string and Base64 encoded JSON
          if (rawState.trim().startsWith('[')) {
            loginOptions.appState = JSON.parse(rawState);
          } else {
            const buffer = Buffer.from(rawState, 'base64');
            loginOptions.appState = JSON.parse(buffer.toString('utf-8'));
          }
          logger.info('[Panindigan] Loaded AppState from environment variable.');
        } catch (e) {
          logger.error('[Panindigan] Failed to parse FB_APPSTATE from environment.', e as Error);
        }
      }
    }

    if (!loginOptions.appState || loginOptions.appState.length === 0) {
      throw new Error(ERROR_MESSAGES.NO_APPSTATE);
    }

    this.ctx = await login(loginOptions, this.options);
    
    // Start AutoRefresh
    if (this.options.autoRefresh?.enable) {
      this.autoRefresh = new AutoRefresh(this.ctx, this.options);
      this.autoRefresh.start();
    }

    if (this.options.listenEvents) {
      this.startListening();
    }
  }

  private startListening() {
    if (!this.ctx) return;
    this.mqtt = new MQTTClient(this.ctx, (event) => {
      if (this.onEventCallback) {
        this.onEventCallback(event);
      }
    });
    this.mqtt.connect();
  }

  public on(callback: (event: any) => void) {
    this.onEventCallback = callback;
  }

  public async uploadAttachment(attachment: string | fs.ReadStream | Buffer): Promise<string[]> {
    if (!this.ctx) throw new Error('Not logged in');
    
    const form = new FormData();
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
    return json.payload?.metadata?.map((m: any) => m.image_id || m.file_id || m.video_id) || [];
  }

  public async sendMessage(threadId: string, message: string | SendMessageOptions): Promise<any> {
    return this.msgQueue.enqueue(async () => {
        if (!this.ctx) throw new Error('Not logged in');

        const msg: SendMessageOptions = typeof message === 'string' ? { body: message } : message;
        const messageId = (Date.now() * 1000 + Math.floor(Math.random() * 1000)).toString();

        let attachmentIds: string[] = [];
        if (msg.attachment) {
          attachmentIds = await this.uploadAttachment(msg.attachment);
        }

        const form: any = {
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

  public async getThreadList(limit: number = 20): Promise<Thread[]> {
    const cacheKey = `thread_list_${limit}`;
    const cached = this.perfMgr.getCache<Thread[]>(cacheKey);
    if (cached) return cached;

    if (!this.ctx) throw new Error('Not logged in');
    
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
    const data = parseGraphQLBatch(res.data);
    
    if (data[0] && data[0].viewer && data[0].viewer.message_threads) {
      const result = data[0].viewer.message_threads.nodes.map((t: any) => ({
        threadId: t.thread_key.thread_fbid || t.thread_key.other_user_id,
        threadName: t.name,
        isGroup: t.is_group_thread,
        unreadCount: t.unread_count,
        messageCount: t.messages_count,
        timestamp: t.updated_time_precise,
        participants: t.all_participants.nodes.map((p: any) => p.messaging_actor.id),
      }));
      this.perfMgr.setCache(cacheKey, result, 30); // 30s cache
      return result;
    }
    return [];
  }

  public async getUserInfo(userIds: string[]): Promise<User[]> {
    const sortedIds = [...userIds].sort();
    const cacheKey = `user_info_${sortedIds.join('_')}`;
    const cached = this.perfMgr.getCache<User[]>(cacheKey);
    if (cached) return cached;

    if (!this.ctx) throw new Error('Not logged in');
    
    // Use GraphQL Batch for user info
    const queries: Record<string, any> = {};
    userIds.forEach((id, i) => {
      queries[`u${i}`] = {
        doc_id: GRAPHQL_DOC_IDS.USER_INFO,
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
    const responseMap = parseGraphQLBatchMap(res.data);

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

  public async getMessageHistory(threadId: string, limit: number = 20, timestamp?: number): Promise<Message[]> {
    if (!this.ctx) throw new Error('Not logged in');

    const form = {
      fb_dtsg: this.ctx.fb_dtsg,
      jazoest: this.ctx.ttstamp,
      messages_limit: limit,
      thread_id: threadId,
      timestamp: timestamp
    };

    const res = await this.ctx.req.post('/ajax/mercury/thread_info.php', form);
    const messages = res.data.payload?.actions || [];

    return messages.map((m: any) => ({
      messageId: m.message_id,
      threadId: m.thread_fbid || threadId,
      senderId: m.author.split(':')[1],
      timestamp: m.timestamp,
      body: m.body,
      attachments: m.attachments?.map((a: any) => ({
        type: a.attach_type,
        id: a.metadata?.fbid,
        url: a.url,
        previewUrl: a.preview_url,
        filename: a.name,
      })) || [],
      mentions: {}, // Parsing logic needed if critical
      isUnread: false,
      isGroup: m.is_group,
      reactions: m.reactions?.reduce((acc: any, r: any) => {
        acc[r.user_id] = { reaction: r.reaction, userId: r.user_id };
        return acc;
      }, {}) || {}
    }));
  }

  public async unsendMessage(messageId: string): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');

    const form = {
      client: 'mercury',
      fb_dtsg: this.ctx.fb_dtsg,
      jazoest: this.ctx.ttstamp,
      message_id: messageId
    };

    await this.ctx.req.post('/messaging/unsend_message/', form);
  }

  public async sendMessageReaction(messageId: string, reaction: string): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');

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

  public async sendTypingIndicator(threadId: string, isTyping: boolean): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');

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

  public async markAsRead(threadId: string): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');

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

  public async createGroup(participantIds: string[], message?: string): Promise<string> {
    if (!this.ctx) throw new Error('Not logged in');

    const messageId = (Date.now() * 1000 + Math.floor(Math.random() * 1000)).toString();
    
    const form: any = {
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

  public async changeThreadColor(threadId: string, color: string): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');

    const form = {
      client: 'mercury',
      fb_dtsg: this.ctx.fb_dtsg,
      jazoest: this.ctx.ttstamp,
      color_choice: color,
      thread_or_other_fbid: threadId
    };

    await this.ctx.req.post('/messaging/save_thread_customization/', form);
  }

  public async addParticipant(threadId: string, userIds: string[]): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');
    
    const form = {
      client: 'mercury',
      fb_dtsg: this.ctx.fb_dtsg,
      jazoest: this.ctx.ttstamp,
      to_ids: userIds,
      thread_fbid: threadId
    };

    await this.ctx.req.post('/chat/add_participants/', form);
  }

  public async removeParticipant(threadId: string, userId: string): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');

    const form = {
      client: 'mercury',
      fb_dtsg: this.ctx.fb_dtsg,
      jazoest: this.ctx.ttstamp,
      uid: userId,
      tid: threadId
    };

    await this.ctx.req.post('/chat/remove_participants/', form);
  }

  public async changeThreadEmoji(threadId: string, emoji: string): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');

    const form = {
      client: 'mercury',
      fb_dtsg: this.ctx.fb_dtsg,
      jazoest: this.ctx.ttstamp,
      emoji_choice: emoji,
      thread_or_other_fbid: threadId
    };

    await this.ctx.req.post('/messaging/save_thread_customization/', form);
  }

  public async changeNickname(threadId: string, userId: string, nickname: string): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');

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
  public async addFriend(userId: string): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');
    const { addFriend } = await import('./api/friends');
    return addFriend(this.ctx, userId);
  }

  public async cancelFriendRequest(userId: string): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');
    const { cancelFriendRequest } = await import('./api/friends');
    return cancelFriendRequest(this.ctx, userId);
  }

  public async removeFriend(userId: string): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');
    const { removeFriend } = await import('./api/friends');
    return removeFriend(this.ctx, userId);
  }

  public async getFriendsList(): Promise<any[]> {
    if (!this.ctx) throw new Error('Not logged in');
    const { getFriendsList } = await import('./api/friends');
    return getFriendsList(this.ctx);
  }

  // --- Blocking ---
  public async blockUser(userId: string): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');
    const { blockUser } = await import('./api/blocking');
    return blockUser(this.ctx, userId);
  }

  public async unblockUser(userId: string): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');
    const { unblockUser } = await import('./api/blocking');
    return unblockUser(this.ctx, userId);
  }

  // --- Search ---
  public async searchUser(query: string): Promise<any[]> {
    if (!this.ctx) throw new Error('Not logged in');
    const { searchUser } = await import('./api/search');
    return searchUser(this.ctx, query);
  }

  // --- Forwarding ---
  public async forwardMessage(messageId: string, threadId: string): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');
    const { forwardMessage } = await import('./api/forwardMessage');
    return forwardMessage(this.ctx, messageId, threadId);
  }

  // --- Polls ---
  public async createPoll(threadId: string, title: string, options: string[]): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');
    const { createPoll } = await import('./api/polls');
    return createPoll(this.ctx, threadId, title, options);
  }

  // --- Admin ---
  public async changeAdminStatus(threadId: string, userId: string, isAdmin: boolean): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');
    const { changeAdminStatus } = await import('./api/admin');
    return changeAdminStatus(this.ctx, threadId, userId, isAdmin);
  }

  // --- Thread Extra ---
  public async changeThreadName(threadId: string, newName: string): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');
    const { changeThreadName } = await import('./api/thread_extra');
    return changeThreadName(this.ctx, threadId, newName);
  }

  public async changeThreadImage(threadId: string, imagePath: string | Buffer | fs.ReadStream): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');
    // Upload first
    const attachmentIds = await this.uploadAttachment(imagePath);
    if (attachmentIds.length === 0) throw new Error('Failed to upload image');
    const { changeThreadImage } = await import('./api/thread_extra');
    return changeThreadImage(this.ctx, threadId, attachmentIds[0]);
  }

  // --- Timeline ---
  public async createPost(message: string, privacy: 'EVERYONE' | 'FRIENDS' | 'SELF' = 'EVERYONE', targetId?: string): Promise<string> {
    if (!this.ctx) throw new Error('Not logged in');
    const { createPost } = await import('./api/timeline');
    return createPost(this.ctx, message, privacy, targetId);
  }

  public async deletePost(postId: string): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');
    const { deletePost } = await import('./api/timeline');
    return deletePost(this.ctx, postId);
  }

  public async reactToPost(postId: string, reaction: 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY'): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');
    const { reactToPost } = await import('./api/timeline');
    return reactToPost(this.ctx, postId, reaction);
  }

  public async commentOnPost(postId: string, comment: string): Promise<string> {
    if (!this.ctx) throw new Error('Not logged in');
    const { commentOnPost } = await import('./api/timeline');
    return commentOnPost(this.ctx, postId, comment);
  }

  public async sharePost(postId: string, text?: string): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');
    const { sharePost } = await import('./api/timeline');
    return sharePost(this.ctx, postId, text);
  }

  // --- Notifications ---
  public async getNotifications(limit: number = 10): Promise<any[]> {
    if (!this.ctx) throw new Error('Not logged in');
    const { getNotifications } = await import('./api/notifications');
    return getNotifications(this.ctx, limit);
  }

  public async markNotificationsRead(): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');
    const { markNotificationsRead } = await import('./api/notifications');
    return markNotificationsRead(this.ctx);
  }

  // --- Advanced Messaging ---
  public async sendSticker(threadId: string, stickerId: string): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');
    const { sendSticker } = await import('./api/messaging_advanced');
    return sendSticker(this.ctx, threadId, stickerId);
  }

  public async deleteMessage(messageId: string): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');
    const { deleteMessage } = await import('./api/messaging_advanced');
    return deleteMessage(this.ctx, messageId);
  }

  public async sendImage(threadId: string, image: string | Buffer | fs.ReadStream, caption?: string): Promise<any> {
    return this.sendMessage(threadId, { body: caption || '', attachment: image });
  }

  public async sendVideo(threadId: string, video: string | Buffer | fs.ReadStream, caption?: string): Promise<any> {
    return this.sendMessage(threadId, { body: caption || '', attachment: video });
  }

  public async sendAudio(threadId: string, audio: string | Buffer | fs.ReadStream): Promise<any> {
    return this.sendMessage(threadId, { body: '', attachment: audio });
  }

  public async sendFile(threadId: string, file: string | Buffer | fs.ReadStream, caption?: string): Promise<any> {
    return this.sendMessage(threadId, { body: caption || '', attachment: file });
  }

  // --- Advanced Thread Management ---
  public async deleteThread(threadId: string): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');
    const { deleteThread } = await import('./api/thread_management');
    return deleteThread(this.ctx, threadId);
  }

  public async archiveThread(threadId: string, archive: boolean = true): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');
    const { archiveThread } = await import('./api/thread_management');
    return archiveThread(this.ctx, threadId, archive);
  }

  public async muteThread(threadId: string, seconds: number = -1): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');
    const { muteThread } = await import('./api/thread_management');
    return muteThread(this.ctx, threadId, seconds);
  }

  public async pinThread(threadId: string, pin: boolean): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');
    const { pinThread } = await import('./api/thread_management');
    return pinThread(this.ctx, threadId, pin);
  }

  public async setApprovalMode(threadId: string, approvalMode: boolean): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');
    const { setApprovalMode } = await import('./api/group_settings');
    return setApprovalMode(this.ctx, threadId, approvalMode);
  }

  public async approveJoinRequest(threadId: string, userId: string): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');
    const { approveJoinRequest } = await import('./api/group_settings');
    return approveJoinRequest(this.ctx, threadId, userId);
  }

  public async leaveGroup(threadId: string): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');
    return this.removeParticipant(threadId, this.ctx.userID);
  }

  // --- Friend Requests ---
  public async acceptFriendRequest(userId: string): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');
    const { acceptFriendRequest } = await import('./api/friends');
    return acceptFriendRequest(this.ctx, userId);
  }

  public async deleteFriendRequest(userId: string): Promise<void> {
    if (!this.ctx) throw new Error('Not logged in');
    const { deleteFriendRequest } = await import('./api/friends');
    return deleteFriendRequest(this.ctx, userId);
  }
}

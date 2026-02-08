"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forwardMessage = forwardMessage;
async function forwardMessage(ctx, messageId, threadId) {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        message_id: messageId,
        thread_fbid: threadId
    };
    await ctx.req.post('/messaging/forward_message/', form);
}

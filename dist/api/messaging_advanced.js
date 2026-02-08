"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSticker = sendSticker;
exports.deleteMessage = deleteMessage;
async function sendSticker(ctx, threadId, stickerId) {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        sticker_id: stickerId,
        thread_fbid: threadId
    };
    await ctx.req.post('/messaging/send/', form);
}
async function deleteMessage(ctx, messageId) {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        message_ids: [messageId]
    };
    await ctx.req.post('/ajax/mercury/delete_messages.php', form);
}

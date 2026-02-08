import { ApiCtx } from '../auth';

export async function sendSticker(ctx: ApiCtx, threadId: string, stickerId: string): Promise<void> {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        sticker_id: stickerId,
        thread_fbid: threadId
    };

    await ctx.req.post('/messaging/send/', form);
}

export async function deleteMessage(ctx: ApiCtx, messageId: string): Promise<void> {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        message_ids: [messageId]
    };

    await ctx.req.post('/ajax/mercury/delete_messages.php', form);
}

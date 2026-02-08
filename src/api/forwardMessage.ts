import { ApiCtx } from '../auth';

export async function forwardMessage(ctx: ApiCtx, messageId: string, threadId: string): Promise<void> {
  const form = {
    client: 'mercury',
    fb_dtsg: ctx.fb_dtsg,
    jazoest: ctx.ttstamp,
    message_id: messageId,
    thread_fbid: threadId
  };

  await ctx.req.post('/messaging/forward_message/', form);
}

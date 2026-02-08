import { ApiCtx } from '../auth';

export async function changeThreadName(ctx: ApiCtx, threadId: string, newName: string): Promise<void> {
  const form = {
    client: 'mercury',
    fb_dtsg: ctx.fb_dtsg,
    jazoest: ctx.ttstamp,
    thread_name: newName,
    thread_id: threadId
  };

  await ctx.req.post('/messaging/set_thread_name/?dpr=1', form);
}

export async function changeThreadImage(ctx: ApiCtx, threadId: string, imageId: string): Promise<void> {
  const form = {
    client: 'mercury',
    fb_dtsg: ctx.fb_dtsg,
    jazoest: ctx.ttstamp,
    thread_image_id: imageId,
    thread_id: threadId
  };

  await ctx.req.post('/messaging/set_thread_image/?dpr=1', form);
}

import { ApiCtx } from '../auth';

export async function blockUser(ctx: ApiCtx, userId: string): Promise<void> {
  const form = {
    fb_dtsg: ctx.fb_dtsg,
    jazoest: ctx.ttstamp,
    fbid: userId
  };

  await ctx.req.post('/nfx/block_messages/', form);
}

export async function unblockUser(ctx: ApiCtx, userId: string): Promise<void> {
  const form = {
    fb_dtsg: ctx.fb_dtsg,
    jazoest: ctx.ttstamp,
    fbid: userId
  };

  await ctx.req.post('/ajax/nfx/messenger_undo_block', form);
}

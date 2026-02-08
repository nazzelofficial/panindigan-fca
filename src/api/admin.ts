import { ApiCtx } from '../auth';

export async function changeAdminStatus(ctx: ApiCtx, threadId: string, userId: string, isAdmin: boolean): Promise<void> {
  const form = {
    client: 'mercury',
    fb_dtsg: ctx.fb_dtsg,
    jazoest: ctx.ttstamp,
    admin_ids: [userId],
    thread_fbid: threadId,
    add: isAdmin
  };

  await ctx.req.post('/messaging/save_admins/?dpr=1', form);
}

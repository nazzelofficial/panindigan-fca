import { ApiCtx } from '../auth';

export async function setApprovalMode(ctx: ApiCtx, threadId: string, approvalMode: boolean): Promise<void> {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        thread_fbid: threadId,
        set_mode: approvalMode ? 1 : 0
    };
    
    await ctx.req.post('/messaging/set_approval_mode/?dpr=1', form);
}

export async function approveJoinRequest(ctx: ApiCtx, threadId: string, userId: string): Promise<void> {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        thread_fbid: threadId,
        user_id: userId,
        action: 'approve' // or reject
    };

    await ctx.req.post('/messaging/group/join_request/', form);
}

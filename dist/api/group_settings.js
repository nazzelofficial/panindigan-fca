"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setApprovalMode = setApprovalMode;
exports.approveJoinRequest = approveJoinRequest;
async function setApprovalMode(ctx, threadId, approvalMode) {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        thread_fbid: threadId,
        set_mode: approvalMode ? 1 : 0
    };
    await ctx.req.post('/messaging/set_approval_mode/?dpr=1', form);
}
async function approveJoinRequest(ctx, threadId, userId) {
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

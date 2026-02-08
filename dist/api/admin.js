"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeAdminStatus = changeAdminStatus;
async function changeAdminStatus(ctx, threadId, userId, isAdmin) {
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

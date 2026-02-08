"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteThread = deleteThread;
exports.archiveThread = archiveThread;
exports.muteThread = muteThread;
exports.pinThread = pinThread;
async function deleteThread(ctx, threadId) {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        ids: [threadId]
    };
    await ctx.req.post('/ajax/mercury/delete_thread.php', form);
}
async function archiveThread(ctx, threadId, archive) {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        ids: { [threadId]: archive },
        archive: archive
    };
    await ctx.req.post('/ajax/mercury/change_archived_status.php', form);
}
async function muteThread(ctx, threadId, muteSeconds = -1) {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        thread_fbid: threadId,
        mute_settings: muteSeconds
    };
    await ctx.req.post('/ajax/mercury/change_mute_settings.php', form);
}
async function pinThread(ctx, threadId, pin) {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        thread_fbid: threadId,
        pin: pin
    };
    await ctx.req.post('/ajax/mercury/change_pinned_status.php', form);
}

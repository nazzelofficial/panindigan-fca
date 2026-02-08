"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockUser = blockUser;
exports.unblockUser = unblockUser;
async function blockUser(ctx, userId) {
    const form = {
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        fbid: userId
    };
    await ctx.req.post('/nfx/block_messages/', form);
}
async function unblockUser(ctx, userId) {
    const form = {
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        fbid: userId
    };
    await ctx.req.post('/ajax/nfx/messenger_undo_block', form);
}

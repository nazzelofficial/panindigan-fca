"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeThreadName = changeThreadName;
exports.changeThreadImage = changeThreadImage;
async function changeThreadName(ctx, threadId, newName) {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        thread_name: newName,
        thread_id: threadId
    };
    await ctx.req.post('/messaging/set_thread_name/?dpr=1', form);
}
async function changeThreadImage(ctx, threadId, imageId) {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        thread_image_id: imageId,
        thread_id: threadId
    };
    await ctx.req.post('/messaging/set_thread_image/?dpr=1', form);
}

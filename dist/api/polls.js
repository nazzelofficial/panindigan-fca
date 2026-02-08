"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPoll = createPoll;
async function createPoll(ctx, threadId, title, options) {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        question_text: title,
        target_id: threadId
    };
    options.forEach((opt, i) => {
        form[`option_text_array[${i}]`] = opt;
    });
    await ctx.req.post('/messaging/group/create_poll/?dpr=1', form);
}

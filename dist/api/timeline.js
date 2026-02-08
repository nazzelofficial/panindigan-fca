"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPost = createPost;
exports.deletePost = deletePost;
exports.reactToPost = reactToPost;
exports.commentOnPost = commentOnPost;
exports.sharePost = sharePost;
async function createPost(ctx, message, privacy = 'EVERYONE', targetId) {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        ximinal_text: message,
        audience: {
            privacy: {
                base_state: privacy,
                id: privacy === 'SELF' ? ctx.userID : undefined
            }
        },
        target_id: targetId || ctx.userID
    };
    const res = await ctx.req.post('/ajax/updatestatus.php', form);
    // Response usually contains the story ID in header or payload
    return res.headers['x-fb-post-id'] || '';
}
async function deletePost(ctx, postId) {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        story_id: postId
    };
    await ctx.req.post('/ajax/feed/delete_story.php', form);
}
async function reactToPost(ctx, postId, reaction) {
    // Map reaction to ID
    const reactionIds = {
        'LIKE': 1,
        'LOVE': 2,
        'HAHA': 4,
        'WOW': 3,
        'SAD': 7,
        'ANGRY': 8
    };
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        ft_ent_identifier: postId,
        reaction_type: reactionIds[reaction]
    };
    await ctx.req.post('/ufi/reaction/', form);
}
async function commentOnPost(ctx, postId, comment) {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        ft_ent_identifier: postId,
        comment_text: comment
    };
    const res = await ctx.req.post('/ufi/add/comment/', form);
    return res.data.payload?.commentID || '';
}
async function sharePost(ctx, postId, text) {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        sharer_id: postId,
        message: text || ''
    };
    await ctx.req.post('/ajax/sharer/submit/', form);
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFriend = addFriend;
exports.cancelFriendRequest = cancelFriendRequest;
exports.removeFriend = removeFriend;
exports.acceptFriendRequest = acceptFriendRequest;
exports.deleteFriendRequest = deleteFriendRequest;
exports.getFriendsList = getFriendsList;
const utils_1 = require("../utils/utils");
const constants_1 = require("../utils/constants");
async function addFriend(ctx, userId) {
    const form = {
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        to_friend: userId,
        action: 'add_friend',
        how_found: 'profile_button'
    };
    await ctx.req.post('/ajax/add_friend/action.php', form);
}
async function cancelFriendRequest(ctx, userId) {
    const form = {
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        friend: userId,
        action: 'cancel'
    };
    await ctx.req.post('/ajax/friends/requests/cancel.php', form);
}
async function removeFriend(ctx, userId) {
    const form = {
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        uid: userId,
        unref: 'bd_profile_button'
    };
    await ctx.req.post('/ajax/profile/remove_friend.php', form);
}
async function acceptFriendRequest(ctx, userId) {
    const form = {
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        to_friend: userId,
        action: 'confirm'
    };
    await ctx.req.post('/ajax/add_friend/action.php', form);
}
async function deleteFriendRequest(ctx, userId) {
    const form = {
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        request_id: userId,
        action: 'delete'
    };
    await ctx.req.post('/ajax/friends/requests/delete.php', form);
}
async function getFriendsList(ctx) {
    // Use GraphQL for reliable friend list fetching
    const form = {
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        queries: JSON.stringify({
            o0: {
                doc_id: constants_1.GRAPHQL_DOC_IDS.FRIENDS_LIST,
                query_params: {
                    exclude_ids: [],
                    limit: 100,
                    order: 'ALPHABETICAL'
                }
            }
        })
    };
    const res = await ctx.req.post('/api/graphqlbatch/', form);
    // Parse GraphQL response using robust parser
    const data = (0, utils_1.parseGraphQLBatch)(res.data);
    if (data[0] && data[0].viewer && data[0].viewer.all_friends) {
        return data[0].viewer.all_friends.nodes || [];
    }
    return [];
}

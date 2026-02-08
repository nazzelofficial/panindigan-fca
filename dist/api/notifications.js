"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = getNotifications;
exports.markNotificationsRead = markNotificationsRead;
const utils_1 = require("../utils/utils");
const constants_1 = require("../utils/constants");
async function getNotifications(ctx, limit = 10) {
    const form = {
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        queries: JSON.stringify({
            o0: {
                doc_id: constants_1.GRAPHQL_DOC_IDS.NOTIFICATIONS,
                query_params: {
                    limit: limit
                }
            }
        })
    };
    const res = await ctx.req.post('/api/graphqlbatch/', form);
    try {
        const data = (0, utils_1.parseGraphQLBatch)(res.data);
        // Navigate through the response structure
        // Typically: data[0].viewer.notifications.edges
        if (data[0] && data[0].viewer && data[0].viewer.notifications) {
            return data[0].viewer.notifications.edges;
        }
        return [];
    }
    catch (e) {
        return [];
    }
}
async function markNotificationsRead(ctx) {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
    };
    await ctx.req.post('/ajax/notifications/mark_read.php', form);
}

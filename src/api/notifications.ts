import { ApiCtx } from '../auth';
import { parseGraphQLBatch } from '../utils/utils';
import { GRAPHQL_DOC_IDS } from '../utils/constants';

export async function getNotifications(ctx: ApiCtx, limit: number = 10): Promise<any[]> {
    const form = {
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        queries: JSON.stringify({
            o0: {
                doc_id: GRAPHQL_DOC_IDS.NOTIFICATIONS,
                query_params: {
                    limit: limit
                }
            }
        })
    };

    const res = await ctx.req.post('/api/graphqlbatch/', form);
    
    try {
        const data = parseGraphQLBatch(res.data);
        // Navigate through the response structure
        // Typically: data[0].viewer.notifications.edges
        if (data[0] && data[0].viewer && data[0].viewer.notifications) {
            return data[0].viewer.notifications.edges;
        }
        return [];
    } catch (e) {
        return [];
    }
}

export async function markNotificationsRead(ctx: ApiCtx): Promise<void> {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
    };
    await ctx.req.post('/ajax/notifications/mark_read.php', form);
}

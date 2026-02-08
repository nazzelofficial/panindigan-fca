import { ApiCtx } from '../auth';
export declare function getNotifications(ctx: ApiCtx, limit?: number): Promise<any[]>;
export declare function markNotificationsRead(ctx: ApiCtx): Promise<void>;

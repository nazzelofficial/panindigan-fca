import { ApiCtx } from '../auth';
export declare function changeAdminStatus(ctx: ApiCtx, threadId: string, userId: string, isAdmin: boolean): Promise<void>;

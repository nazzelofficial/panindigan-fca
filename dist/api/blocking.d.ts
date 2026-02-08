import { ApiCtx } from '../auth';
export declare function blockUser(ctx: ApiCtx, userId: string): Promise<void>;
export declare function unblockUser(ctx: ApiCtx, userId: string): Promise<void>;

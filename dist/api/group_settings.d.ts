import { ApiCtx } from '../auth';
export declare function setApprovalMode(ctx: ApiCtx, threadId: string, approvalMode: boolean): Promise<void>;
export declare function approveJoinRequest(ctx: ApiCtx, threadId: string, userId: string): Promise<void>;

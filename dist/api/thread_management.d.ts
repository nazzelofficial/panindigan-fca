import { ApiCtx } from '../auth';
export declare function deleteThread(ctx: ApiCtx, threadId: string): Promise<void>;
export declare function archiveThread(ctx: ApiCtx, threadId: string, archive: boolean): Promise<void>;
export declare function muteThread(ctx: ApiCtx, threadId: string, muteSeconds?: number): Promise<void>;
export declare function pinThread(ctx: ApiCtx, threadId: string, pin: boolean): Promise<void>;

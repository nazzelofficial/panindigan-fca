import { ApiCtx } from '../auth';
export declare function createPoll(ctx: ApiCtx, threadId: string, title: string, options: string[]): Promise<void>;

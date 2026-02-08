import { ApiCtx } from '../auth';
export declare function changeThreadName(ctx: ApiCtx, threadId: string, newName: string): Promise<void>;
export declare function changeThreadImage(ctx: ApiCtx, threadId: string, imageId: string): Promise<void>;

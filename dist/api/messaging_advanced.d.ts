import { ApiCtx } from '../auth';
export declare function sendSticker(ctx: ApiCtx, threadId: string, stickerId: string): Promise<void>;
export declare function deleteMessage(ctx: ApiCtx, messageId: string): Promise<void>;

import { ApiCtx } from '../auth';
export declare function createPost(ctx: ApiCtx, message: string, privacy?: 'EVERYONE' | 'FRIENDS' | 'SELF', targetId?: string): Promise<string>;
export declare function deletePost(ctx: ApiCtx, postId: string): Promise<void>;
export declare function reactToPost(ctx: ApiCtx, postId: string, reaction: 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY'): Promise<void>;
export declare function commentOnPost(ctx: ApiCtx, postId: string, comment: string): Promise<string>;
export declare function sharePost(ctx: ApiCtx, postId: string, text?: string): Promise<void>;

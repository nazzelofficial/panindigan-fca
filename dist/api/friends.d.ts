import { ApiCtx } from '../auth';
export declare function addFriend(ctx: ApiCtx, userId: string): Promise<void>;
export declare function cancelFriendRequest(ctx: ApiCtx, userId: string): Promise<void>;
export declare function removeFriend(ctx: ApiCtx, userId: string): Promise<void>;
export declare function acceptFriendRequest(ctx: ApiCtx, userId: string): Promise<void>;
export declare function deleteFriendRequest(ctx: ApiCtx, userId: string): Promise<void>;
export declare function getFriendsList(ctx: ApiCtx): Promise<any[]>;

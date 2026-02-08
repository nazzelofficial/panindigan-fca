import { PermissionLevel } from './types';
export declare class PermissionGuard {
    private ownerIds;
    private adminIds;
    constructor(ownerIds?: string[], adminIds?: string[]);
    getUserLevel(userId: string): PermissionLevel;
    hasPermission(userId: string, requiredLevel: PermissionLevel): boolean;
    addAdmin(userId: string): void;
    removeAdmin(userId: string): void;
    isOwner(userId: string): boolean;
}

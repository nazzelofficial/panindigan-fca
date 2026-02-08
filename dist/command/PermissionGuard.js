"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionGuard = void 0;
class PermissionGuard {
    constructor(ownerIds = [], adminIds = []) {
        this.ownerIds = new Set(ownerIds);
        this.adminIds = new Set(adminIds);
    }
    getUserLevel(userId) {
        if (this.ownerIds.has(userId))
            return 'OWNER';
        if (this.adminIds.has(userId))
            return 'ADMIN';
        return 'USER';
    }
    hasPermission(userId, requiredLevel) {
        const userLevel = this.getUserLevel(userId);
        const levels = {
            'USER': 0,
            'ADMIN': 1,
            'OWNER': 2
        };
        return levels[userLevel] >= levels[requiredLevel];
    }
    addAdmin(userId) {
        this.adminIds.add(userId);
    }
    removeAdmin(userId) {
        this.adminIds.delete(userId);
    }
    isOwner(userId) {
        return this.ownerIds.has(userId);
    }
}
exports.PermissionGuard = PermissionGuard;

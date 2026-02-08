"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CooldownManager = void 0;
class CooldownManager {
    constructor() {
        // Map<CommandName, Map<UserId, ExpiryTimestamp>>
        this.cooldowns = new Map();
    }
    setCooldown(commandName, userId, durationSeconds) {
        if (durationSeconds <= 0)
            return;
        if (!this.cooldowns.has(commandName)) {
            this.cooldowns.set(commandName, new Map());
        }
        const timestamps = this.cooldowns.get(commandName);
        const expiry = Date.now() + (durationSeconds * 1000);
        timestamps.set(userId, expiry);
        // Auto-cleanup
        setTimeout(() => {
            timestamps.delete(userId);
            if (timestamps.size === 0) {
                this.cooldowns.delete(commandName);
            }
        }, durationSeconds * 1000);
    }
    checkCooldown(commandName, userId) {
        const timestamps = this.cooldowns.get(commandName);
        if (!timestamps)
            return null;
        const expiry = timestamps.get(userId);
        if (!expiry)
            return null;
        const now = Date.now();
        if (now < expiry) {
            return Math.ceil((expiry - now) / 1000);
        }
        return null;
    }
    clearCooldown(commandName, userId) {
        const timestamps = this.cooldowns.get(commandName);
        if (timestamps) {
            timestamps.delete(userId);
        }
    }
}
exports.CooldownManager = CooldownManager;

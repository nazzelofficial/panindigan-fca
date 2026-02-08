export declare class CooldownManager {
    private cooldowns;
    constructor();
    setCooldown(commandName: string, userId: string, durationSeconds: number): void;
    checkCooldown(commandName: string, userId: string): number | null;
    clearCooldown(commandName: string, userId: string): void;
}

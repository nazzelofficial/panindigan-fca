import { PanindiganClient } from '../Client';
import { Message } from '../types';
import { Command, CommandHandlerOptions, MiddlewareFunction, CommandEvents } from './types';
import { PermissionGuard } from './PermissionGuard';
import { CooldownManager } from './CooldownManager';
import { EventEmitter } from 'events';
export interface CommandHandler {
    on<U extends keyof CommandEvents>(event: U, listener: CommandEvents[U]): this;
    emit<U extends keyof CommandEvents>(event: U, ...args: Parameters<CommandEvents[U]>): boolean;
}
export declare class CommandHandler extends EventEmitter {
    private client;
    private commands;
    private aliases;
    private options;
    private middleware;
    permissions: PermissionGuard;
    cooldowns: CooldownManager;
    constructor(client: PanindiganClient, options?: CommandHandlerOptions);
    private initialize;
    use(middleware: MiddlewareFunction): this;
    register(command: Command): void;
    registerDirectory(dirPath: string): void;
    reloadCommands(dirPath: string): void;
    private parseArgs;
    handleMessage(message: Message): Promise<void>;
    getCommands(): Command[];
    getCommand(name: string): Command | undefined;
}

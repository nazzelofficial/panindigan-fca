import { PanindiganClient } from '../Client';
import { Message, SendMessageOptions } from '../types';
export type PermissionLevel = 'USER' | 'ADMIN' | 'OWNER';
export interface CommandContext {
    client: PanindiganClient;
    message: Message;
    args: string[];
    body: string;
    prefix: string;
    reply: (text: string | SendMessageOptions) => Promise<any>;
}
export interface CommandOptions {
    name: string;
    aliases?: string[];
    description?: string;
    usage?: string;
    category?: string;
    permissionLevel?: PermissionLevel;
    cooldown?: number;
    hidden?: boolean;
}
export interface Command extends CommandOptions {
    execute: (ctx: CommandContext) => Promise<any>;
}
export interface CommandHandlerOptions {
    prefixes?: string[];
    caseSensitive?: boolean;
    ownerIds?: string[];
    adminIds?: string[];
    ignoreBots?: boolean;
    cooldownMessage?: string;
    permissionMessage?: string;
}
export type MiddlewareFunction = (ctx: CommandContext, next: () => Promise<void>) => Promise<void>;
export interface CommandEvents {
    'commandRegistered': (command: Command) => void;
    'commandStart': (command: Command, ctx: CommandContext) => void;
    'commandFinish': (command: Command, ctx: CommandContext) => void;
    'commandError': (command: Command, error: Error, ctx: CommandContext) => void;
    'commandCooldown': (command: Command, remaining: number, ctx: CommandContext) => void;
    'commandPermission': (command: Command, level: PermissionLevel, ctx: CommandContext) => void;
}

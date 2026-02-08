import { PanindiganClient } from '../Client';
import { Message } from '../types';

export type PermissionLevel = 'USER' | 'ADMIN' | 'OWNER';

export interface CommandContext {
  client: PanindiganClient;
  message: Message;
  args: string[];
  body: string; // Original body without prefix/command
  prefix: string;
}

export interface CommandOptions {
  name: string;
  aliases?: string[];
  description?: string;
  usage?: string;
  category?: string;
  permissionLevel?: PermissionLevel;
  cooldown?: number; // In seconds
  hidden?: boolean;
}

export interface Command extends CommandOptions {
  execute: (ctx: CommandContext) => Promise<any>;
}

export interface CommandHandlerOptions {
  prefixes?: string[]; // Default: ['!']
  ownerIds?: string[];
  adminIds?: string[];
  ignoreBots?: boolean; // Ignore messages from other bots (if identifiable)
  cooldownMessage?: string; // Custom cooldown message
  permissionMessage?: string; // Custom permission message
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

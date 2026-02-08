import { PanindiganClient } from '../Client';
import { Message } from '../types';
import { Command, CommandHandlerOptions, CommandContext, MiddlewareFunction, CommandEvents } from './types';
import { PermissionGuard } from './PermissionGuard';
import { CooldownManager } from './CooldownManager';
import { logger } from '../utils/Logger';
import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';

// Safe interface for EventEmitter
export interface CommandHandler {
  on<U extends keyof CommandEvents>(event: U, listener: CommandEvents[U]): this;
  emit<U extends keyof CommandEvents>(event: U, ...args: Parameters<CommandEvents[U]>): boolean;
}

export class CommandHandler extends EventEmitter {
  private client: PanindiganClient;
  private commands: Map<string, Command>;
  private aliases: Map<string, string>;
  private options: CommandHandlerOptions;
  private middleware: MiddlewareFunction[];
  
  public permissions: PermissionGuard;
  public cooldowns: CooldownManager;

  constructor(client: PanindiganClient, options: CommandHandlerOptions = {}) {
    super();
    this.client = client;
    this.options = {
      prefixes: ['!'],
      ownerIds: [],
      adminIds: [],
      ignoreBots: true,
      ...options
    };

    this.commands = new Map();
    this.aliases = new Map();
    this.middleware = [];
    this.permissions = new PermissionGuard(this.options.ownerIds, this.options.adminIds);
    this.cooldowns = new CooldownManager();

    this.initialize();
  }

  private initialize() {
    this.client.on(async (event: any) => {
      if (event.type === 'message' || (event.body && event.senderId && event.threadId)) {
        await this.handleMessage(event as Message);
      }
    });
  }

  public use(middleware: MiddlewareFunction) {
    this.middleware.push(middleware);
    return this;
  }

  public register(command: Command) {
    if (!command.name) {
      throw new Error('Command must have a name.');
    }

    this.commands.set(command.name.toLowerCase(), command);
    
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.aliases.set(alias.toLowerCase(), command.name.toLowerCase());
      }
    }
    
    this.emit('commandRegistered', command);
    logger.info(`[CommandHandler] Registered command: ${command.name}`);
  }

  public registerDirectory(dirPath: string) {
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        this.registerDirectory(fullPath);
      } else if (file.endsWith('.js') || file.endsWith('.ts')) {
        try {
            // Delete cache for hot reloading
            delete require.cache[require.resolve(fullPath)];
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const mod = require(fullPath);
            const cmd = mod.default || mod;
            
            if (cmd && cmd.name && cmd.execute) {
              this.register(cmd);
            }
        } catch (e) {
            logger.error(`[CommandHandler] Failed to load command from ${file}:`, e as Error);
        }
      }
    }
  }

  public reloadCommands(dirPath: string) {
    this.commands.clear();
    this.aliases.clear();
    this.registerDirectory(dirPath);
    logger.info('[CommandHandler] All commands reloaded.');
  }

  private parseArgs(str: string): string[] {
    const args: string[] = [];
    let current = '';
    let inQuote = false;
    let quoteChar = '';

    for (let i = 0; i < str.length; i++) {
      const char = str[i];

      if (inQuote) {
        if (char === quoteChar) {
          inQuote = false;
        } else {
          current += char;
        }
      } else {
        if (char === '"' || char === "'") {
          inQuote = true;
          quoteChar = char;
        } else if (char === ' ') {
          if (current.length > 0) {
            args.push(current);
            current = '';
          }
        } else {
          current += char;
        }
      }
    }

    if (current.length > 0) {
      args.push(current);
    }

    return args;
  }

  public async handleMessage(message: Message) {
    if (!message.body) return;
    
    // 1. Check Prefix
    let prefix = '';
    const body = message.body.trim();
    
    for (const p of (this.options.prefixes || ['!'])) {
      if (body.startsWith(p)) {
        prefix = p;
        break;
      }
    }

    if (!prefix) return;

    // 2. Parse Command Name and Args
    // Remove prefix
    const content = body.slice(prefix.length).trim();
    // Split by space first to get command name
    const firstSpace = content.indexOf(' ');
    const commandName = (firstSpace === -1 ? content : content.slice(0, firstSpace)).toLowerCase();
    
    // Parse args from the rest
    const argsString = firstSpace === -1 ? '' : content.slice(firstSpace + 1);
    const args = this.parseArgs(argsString);

    if (!commandName) return;

    // 3. Find Command
    let command = this.commands.get(commandName);
    if (!command) {
      const alias = this.aliases.get(commandName);
      if (alias) {
        command = this.commands.get(alias);
      }
    }

    if (!command) return;

    // 4. Check Permissions
    if (command.permissionLevel) {
      const hasPerm = this.permissions.hasPermission(message.senderId, command.permissionLevel);
      if (!hasPerm) {
        this.emit('commandPermission', command, command.permissionLevel, { client: this.client, message, args, body, prefix });
        if (this.options.permissionMessage) {
          await this.client.sendMessage(message.threadId, this.options.permissionMessage);
        } else {
            await this.client.sendMessage(message.threadId, `❌ You need permission level ${command.permissionLevel} to use this command.`);
        }
        return;
      }
    }

    // 5. Check Cooldowns
    if (command.cooldown) {
      const remaining = this.cooldowns.checkCooldown(command.name, message.senderId);
      if (remaining) {
        this.emit('commandCooldown', command, remaining, { client: this.client, message, args, body, prefix });
        if (this.options.cooldownMessage) {
             await this.client.sendMessage(message.threadId, this.options.cooldownMessage.replace('{time}', remaining.toString()));
        } else {
             await this.client.sendMessage(message.threadId, `⏳ Please wait ${remaining}s before using ${command.name} again.`);
        }
        return;
      }
      this.cooldowns.setCooldown(command.name, message.senderId, command.cooldown);
    }

    // 6. Build Context
    const ctx: CommandContext = {
      client: this.client,
      message: message,
      args: args,
      body: body,
      prefix: prefix
    };

    // 7. Execute Middleware Chain + Command
    try {
      this.emit('commandStart', command, ctx);
      
      const executeChain = async (index: number): Promise<void> => {
        if (index < this.middleware.length) {
          await this.middleware[index](ctx, () => executeChain(index + 1));
        } else {
          await command!.execute(ctx);
        }
      };

      await executeChain(0);
      this.emit('commandFinish', command, ctx);
      
    } catch (e: any) {
      this.emit('commandError', command, e, ctx);
      logger.error(`[CommandHandler] Error executing ${command.name}:`, e);
      await this.client.sendMessage(message.threadId, `⚠️ An error occurred while executing the command: ${e.message}`);
    }
  }

  public getCommands(): Command[] {
    return Array.from(this.commands.values());
  }

  public getCommand(name: string): Command | undefined {
      let command = this.commands.get(name.toLowerCase());
      if (!command) {
          const alias = this.aliases.get(name.toLowerCase());
          if (alias) {
              command = this.commands.get(alias);
          }
      }
      return command;
  }
}

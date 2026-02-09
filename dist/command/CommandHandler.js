"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandHandler = void 0;
const PermissionGuard_1 = require("./PermissionGuard");
const CooldownManager_1 = require("./CooldownManager");
const Logger_1 = require("../utils/Logger");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const events_1 = require("events");
class CommandHandler extends events_1.EventEmitter {
    constructor(client, options = {}) {
        super();
        this.client = client;
        this.options = {
            prefixes: [],
            caseSensitive: false,
            ownerIds: [],
            adminIds: [],
            ignoreBots: true,
            ...options
        };
        this.commands = new Map();
        this.aliases = new Map();
        this.middleware = [];
        this.permissions = new PermissionGuard_1.PermissionGuard(this.options.ownerIds, this.options.adminIds);
        this.cooldowns = new CooldownManager_1.CooldownManager();
        this.initialize();
    }
    initialize() {
        this.client.on(async (event) => {
            if (event.type === 'message' || (event.body && event.senderId && event.threadId)) {
                await this.handleMessage(event);
            }
        });
    }
    use(middleware) {
        this.middleware.push(middleware);
        return this;
    }
    register(command) {
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
        Logger_1.logger.info(`[CommandHandler] Registered command: ${command.name}`);
    }
    registerDirectory(dirPath) {
        if (!fs.existsSync(dirPath))
            return;
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            const fullPath = path.join(dirPath, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                this.registerDirectory(fullPath);
            }
            else if (file.endsWith('.js') || file.endsWith('.ts')) {
                try {
                    // Delete cache for hot reloading
                    delete require.cache[require.resolve(fullPath)];
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const mod = require(fullPath);
                    const cmd = mod.default || mod;
                    if (cmd && cmd.name && cmd.execute) {
                        this.register(cmd);
                    }
                }
                catch (e) {
                    Logger_1.logger.error(`[CommandHandler] Failed to load command from ${file}:`, e);
                }
            }
        }
    }
    reloadCommands(dirPath) {
        this.commands.clear();
        this.aliases.clear();
        this.registerDirectory(dirPath);
        Logger_1.logger.info('[CommandHandler] All commands reloaded.');
    }
    parseArgs(str) {
        const args = [];
        let current = '';
        let inQuote = false;
        let quoteChar = '';
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            if (inQuote) {
                if (char === quoteChar) {
                    inQuote = false;
                }
                else {
                    current += char;
                }
            }
            else {
                if (char === '"' || char === "'") {
                    inQuote = true;
                    quoteChar = char;
                }
                else if (char === ' ') {
                    if (current.length > 0) {
                        args.push(current);
                        current = '';
                    }
                }
                else {
                    current += char;
                }
            }
        }
        if (current.length > 0) {
            args.push(current);
        }
        return args;
    }
    async handleMessage(message) {
        if (!message.body)
            return;
        const body = message.body.trim();
        Logger_1.logger.debug(`[CommandHandler] Checking message: "${body}" from ${message.senderId}`);
        // 1. Check Prefix
        let prefix = '';
        const prefixes = this.options.prefixes || [];
        for (const p of prefixes) {
            if (this.options.caseSensitive) {
                if (body.startsWith(p)) {
                    prefix = p;
                    break;
                }
            }
            else {
                if (body.toLowerCase().startsWith(p.toLowerCase())) {
                    // Use the actual characters from body that matched the prefix length
                    prefix = body.slice(0, p.length);
                    break;
                }
            }
        }
        if (!prefix) {
            // If no prefix matched, allow the command handler to process the message as a potential command
            // This supports "custom messenger bot" behavior where commands can be triggered without prefixes
            prefix = '';
        }
        // logger.debug(`[CommandHandler] Matched prefix: "${prefix}"`);
        // 2. Parse Command Name and Args
        // Remove prefix
        const content = body.slice(prefix.length).trim();
        // Split by space first to get command name
        const firstSpace = content.indexOf(' ');
        let commandName = (firstSpace === -1 ? content : content.slice(0, firstSpace));
        if (!this.options.caseSensitive) {
            commandName = commandName.toLowerCase();
        }
        // Parse args from the rest
        const argsString = firstSpace === -1 ? '' : content.slice(firstSpace + 1);
        const args = this.parseArgs(argsString);
        if (!commandName)
            return;
        // 3. Find Command
        let command = this.commands.get(commandName);
        if (!command && !this.options.caseSensitive) {
            // If case insensitive, map keys might be lowercase (register uses lowerCase)
            // But let's ensure we check aliases too
            command = this.commands.get(commandName.toLowerCase());
        }
        if (!command) {
            // Check aliases
            let alias = this.aliases.get(commandName);
            if (!alias && !this.options.caseSensitive) {
                alias = this.aliases.get(commandName.toLowerCase());
            }
            if (alias) {
                command = this.commands.get(alias);
            }
        }
        if (!command)
            return;
        Logger_1.logger.info(`[CommandHandler] Matched command: ${command.name}`);
        // 4. Build Context
        const ctx = {
            client: this.client,
            message: message,
            args: args,
            body: body,
            prefix: prefix,
            reply: async (text) => {
                return this.client.sendMessage(message.threadId, text);
            }
        };
        // 5. Check Permissions
        if (command.permissionLevel) {
            const hasPerm = this.permissions.hasPermission(message.senderId, command.permissionLevel);
            if (!hasPerm) {
                this.emit('commandPermission', command, command.permissionLevel, ctx);
                if (this.options.permissionMessage) {
                    await ctx.reply(this.options.permissionMessage);
                }
                else {
                    await ctx.reply(`❌ You need permission level ${command.permissionLevel} to use this command.`);
                }
                return;
            }
        }
        // 6. Check Cooldowns
        if (command.cooldown) {
            const remaining = this.cooldowns.checkCooldown(command.name, message.senderId);
            if (remaining) {
                this.emit('commandCooldown', command, remaining, ctx);
                if (this.options.cooldownMessage) {
                    await ctx.reply(this.options.cooldownMessage.replace('{time}', remaining.toString()));
                }
                else {
                    await ctx.reply(`⏳ Please wait ${remaining}s before using ${command.name} again.`);
                }
                return;
            }
            this.cooldowns.setCooldown(command.name, message.senderId, command.cooldown);
        }
        // 7. Execute Middleware Chain + Command
        try {
            this.emit('commandStart', command, ctx);
            const executeChain = async (index) => {
                if (index < this.middleware.length) {
                    await this.middleware[index](ctx, () => executeChain(index + 1));
                }
                else {
                    await command.execute(ctx);
                }
            };
            await executeChain(0);
            this.emit('commandFinish', command, ctx);
            Logger_1.logger.success(`[CommandHandler] Command ${command.name} executed successfully.`);
        }
        catch (e) {
            this.emit('commandError', command, e, ctx);
            Logger_1.logger.error(`[CommandHandler] Error executing ${command.name}:`, e);
            await this.client.sendMessage(message.threadId, `⚠️ An error occurred while executing the command: ${e.message}`);
        }
    }
    getCommands() {
        return Array.from(this.commands.values());
    }
    getCommand(name) {
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
exports.CommandHandler = CommandHandler;

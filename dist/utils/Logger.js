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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = void 0;
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class Logger {
    constructor(options = {}) {
        this.options = {
            logDir: 'logs',
            enableFileLogging: true,
            enableConsoleLogging: true,
            logLevel: ['SUCCESS', 'INFO', 'WARNING', 'ERROR', 'DEBUG', 'SYSTEM'],
            ...options
        };
        this.logDir = path.resolve(process.cwd(), this.options.logDir);
        if (this.options.enableFileLogging && !fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }
    getTimestamp() {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0];
        return `${date} ${time}`;
    }
    getLogFileName() {
        const date = new Date().toISOString().split('T')[0];
        return path.join(this.logDir, `app-${date}.log`);
    }
    formatMessage(level, message, context) {
        const timestamp = this.getTimestamp();
        const msgString = typeof message === 'object' ? JSON.stringify(message, null, 2) : message;
        const ctx = context ? `[${context}] ` : '';
        return `[${timestamp}] ${level} ${ctx}${msgString}`;
    }
    writeToFile(formattedMessage) {
        if (!this.options.enableFileLogging)
            return;
        const file = this.getLogFileName();
        fs.appendFileSync(file, formattedMessage + '\n');
    }
    log(level, message, context) {
        if (!this.options.logLevel?.includes(level))
            return;
        const formattedMessage = this.formatMessage(level, message, context);
        this.writeToFile(formattedMessage);
        if (this.options.enableConsoleLogging) {
            const timestamp = chalk_1.default.gray(`[${this.getTimestamp()}]`);
            const ctx = context ? chalk_1.default.bold(`[${context}] `) : '';
            let coloredLevel = '';
            let icon = '';
            let msgColor = (text) => text;
            switch (level) {
                case 'SUCCESS':
                    coloredLevel = chalk_1.default.green.bold('SUCCESS');
                    icon = chalk_1.default.green('✓');
                    msgColor = chalk_1.default.green;
                    break;
                case 'INFO':
                    coloredLevel = chalk_1.default.blue.bold('INFO');
                    icon = chalk_1.default.blue('ℹ');
                    msgColor = chalk_1.default.blueBright;
                    break;
                case 'WARNING':
                    coloredLevel = chalk_1.default.yellow.bold('WARNING');
                    icon = chalk_1.default.yellow('⚠');
                    msgColor = chalk_1.default.yellow;
                    break;
                case 'ERROR':
                    coloredLevel = chalk_1.default.red.bold('ERROR');
                    icon = chalk_1.default.red('✗');
                    msgColor = chalk_1.default.red;
                    break;
                case 'DEBUG':
                    coloredLevel = chalk_1.default.magenta.bold('DEBUG');
                    icon = chalk_1.default.magenta('⚙');
                    msgColor = chalk_1.default.magenta;
                    break;
                case 'SYSTEM':
                    coloredLevel = chalk_1.default.white.bold('SYSTEM');
                    icon = chalk_1.default.white('⚙');
                    msgColor = chalk_1.default.white;
                    break;
            }
            const msgString = typeof message === 'object' ? JSON.stringify(message, null, 2) : message;
            console.log(`${timestamp} ${icon} ${coloredLevel} ${ctx}${msgColor(msgString)}`);
        }
    }
    success(message, context) {
        this.log('SUCCESS', message, context);
    }
    info(message, context) {
        this.log('INFO', message, context);
    }
    warn(message, context) {
        this.log('WARNING', message, context);
    }
    error(message, error, context) {
        let msg = typeof message === 'string' ? message : JSON.stringify(message);
        if (error) {
            msg += `\nStack Trace:\n${error.stack}`;
        }
        this.log('ERROR', msg, context);
    }
    debug(message, context) {
        this.log('DEBUG', message, context);
    }
    system(message, context) {
        this.log('SYSTEM', message, context);
    }
}
exports.Logger = Logger;
exports.logger = new Logger();

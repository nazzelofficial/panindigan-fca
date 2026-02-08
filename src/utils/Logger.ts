import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

export type LogLevel = 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG' | 'SYSTEM';

export interface LoggerOptions {
  logDir?: string;
  enableFileLogging?: boolean;
  enableConsoleLogging?: boolean;
  logLevel?: LogLevel[];
  dateFormat?: string;
}

export class Logger {
  private options: LoggerOptions;
  private logDir: string;

  constructor(options: LoggerOptions = {}) {
    this.options = {
      logDir: 'logs',
      enableFileLogging: true,
      enableConsoleLogging: true,
      logLevel: ['SUCCESS', 'INFO', 'WARNING', 'ERROR', 'DEBUG', 'SYSTEM'],
      ...options
    };
    this.logDir = path.resolve(process.cwd(), this.options.logDir!);
    
    if (this.options.enableFileLogging && !fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getTimestamp(): string {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];
    return `${date} ${time}`;
  }

  private getLogFileName(): string {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `app-${date}.log`);
  }

  private formatMessage(level: LogLevel, message: string | object, context?: string): string {
    const timestamp = this.getTimestamp();
    const msgString = typeof message === 'object' ? JSON.stringify(message, null, 2) : message;
    const ctx = context ? `[${context}] ` : '';
    return `[${timestamp}] ${level} ${ctx}${msgString}`;
  }

  private writeToFile(formattedMessage: string) {
    if (!this.options.enableFileLogging) return;
    const file = this.getLogFileName();
    fs.appendFileSync(file, formattedMessage + '\n');
  }

  public log(level: LogLevel, message: string | object, context?: string) {
    if (!this.options.logLevel?.includes(level)) return;

    const formattedMessage = this.formatMessage(level, message, context);
    this.writeToFile(formattedMessage);

    if (this.options.enableConsoleLogging) {
      const timestamp = chalk.gray(`[${this.getTimestamp()}]`);
      const ctx = context ? chalk.bold(`[${context}] `) : '';
      let coloredLevel = '';
      let icon = '';
      let msgColor = (text: string) => text;

      switch (level) {
        case 'SUCCESS':
          coloredLevel = chalk.green.bold('SUCCESS');
          icon = chalk.green('✓');
          msgColor = chalk.green;
          break;
        case 'INFO':
          coloredLevel = chalk.blue.bold('INFO');
          icon = chalk.blue('ℹ');
          msgColor = chalk.blueBright;
          break;
        case 'WARNING':
          coloredLevel = chalk.yellow.bold('WARNING');
          icon = chalk.yellow('⚠');
          msgColor = chalk.yellow;
          break;
        case 'ERROR':
          coloredLevel = chalk.red.bold('ERROR');
          icon = chalk.red('✗');
          msgColor = chalk.red;
          break;
        case 'DEBUG':
          coloredLevel = chalk.magenta.bold('DEBUG');
          icon = chalk.magenta('⚙');
          msgColor = chalk.magenta;
          break;
        case 'SYSTEM':
          coloredLevel = chalk.white.bold('SYSTEM');
          icon = chalk.white('⚙');
          msgColor = chalk.white;
          break;
      }

      const msgString = typeof message === 'object' ? JSON.stringify(message, null, 2) : message;
      console.log(`${timestamp} ${icon} ${coloredLevel} ${ctx}${msgColor(msgString)}`);
    }
  }

  public success(message: string | object, context?: string) {
    this.log('SUCCESS', message, context);
  }

  public info(message: string | object, context?: string) {
    this.log('INFO', message, context);
  }

  public warn(message: string | object, context?: string) {
    this.log('WARNING', message, context);
  }

  public error(message: string | object, error?: Error, context?: string) {
    let msg = typeof message === 'string' ? message : JSON.stringify(message);
    if (error) {
      msg += `\nStack Trace:\n${error.stack}`;
    }
    this.log('ERROR', msg, context);
  }

  public debug(message: string | object, context?: string) {
    this.log('DEBUG', message, context);
  }

  public system(message: string | object, context?: string) {
    this.log('SYSTEM', message, context);
  }
}

export const logger = new Logger();

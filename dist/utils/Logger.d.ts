export type LogLevel = 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG' | 'SYSTEM';
export interface LoggerOptions {
    logDir?: string;
    enableFileLogging?: boolean;
    enableConsoleLogging?: boolean;
    logLevel?: LogLevel[];
    dateFormat?: string;
}
export declare class Logger {
    private options;
    private logDir;
    constructor(options?: LoggerOptions);
    private getTimestamp;
    private getLogFileName;
    private formatMessage;
    private writeToFile;
    log(level: LogLevel, message: string | object, context?: string): void;
    success(message: string | object, context?: string): void;
    info(message: string | object, context?: string): void;
    warn(message: string | object, context?: string): void;
    error(message: string | object, error?: Error, context?: string): void;
    debug(message: string | object, context?: string): void;
    system(message: string | object, context?: string): void;
}
export declare const logger: Logger;

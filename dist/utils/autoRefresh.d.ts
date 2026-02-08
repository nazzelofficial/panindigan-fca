import { ApiCtx } from '../auth';
import { ApiOption } from '../types';
export declare class AutoRefresh {
    private ctx;
    private options;
    private refreshTimer;
    constructor(ctx: ApiCtx, options: ApiOption);
    start(): void;
    stop(): void;
    private performRefresh;
}

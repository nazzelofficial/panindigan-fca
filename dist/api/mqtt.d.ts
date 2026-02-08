import { ApiCtx } from '../auth';
export declare class MQTTClient {
    private client;
    private ctx;
    private eventCallback;
    constructor(ctx: ApiCtx, callback: (event: any) => void);
    connect(): void;
    private subscribe;
    disconnect(): void;
}

import { ApiCtx } from '../auth';
export declare class MQTTClient {
    private client;
    private ctx;
    private eventCallback;
    private perfMgr;
    private syncToken;
    getSyncToken(): string | null;
    private capabilities;
    private sessionID;
    isConnecting: boolean;
    constructor(ctx: ApiCtx, callback: (event: any) => void);
    connect(): void;
    private subscribe;
    private handleMessage;
    publish(topic: string, payload: any, qos?: 0 | 1 | 2): void;
    disconnect(): void;
    getStatus(): boolean;
}

declare module 'websocket-stream' {
    import { Duplex } from 'stream';
    function websocket(target: string, options?: any): Duplex;
    export = websocket;
}
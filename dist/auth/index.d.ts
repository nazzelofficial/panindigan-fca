import { Request } from '../utils/request';
import { AppState, LoginOptions } from '../types';
export interface ApiCtx {
    userID: string;
    jar: AppState[];
    clientID: string;
    globalOptions: any;
    loggedIn: boolean;
    access_token: string;
    clientMutationId: number;
    mqttClient?: any;
    req: Request;
    fb_dtsg?: string;
    ttstamp?: string;
    irisSeqID?: string;
}
export declare function login(options: LoginOptions, globalOptions?: any): Promise<ApiCtx>;

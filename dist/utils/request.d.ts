import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { AppState, AntiDetectionOptions } from '../types';
export declare class Request {
    private _jar;
    private _instance;
    private _defaultHeaders;
    private _antiDetection;
    private _uaRotator;
    private _fingerprintMgr;
    private _behavioralSim;
    private _securityGuard;
    private _perfMgr;
    constructor(appState?: AppState[], antiDetection?: AntiDetectionOptions);
    getJar(): AppState[];
    getUserAgent(): string;
    setJar(jar: AppState[]): void;
    get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse>;
    post(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse>;
}

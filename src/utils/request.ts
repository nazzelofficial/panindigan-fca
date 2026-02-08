import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AppState, AntiDetectionOptions } from '../types';
import { HEADERS, FACEBOOK_URL } from './constants';
import { formatCookie } from './utils';
import { UserAgentRotator } from './UserAgentRotator';
import { FingerprintManager } from './FingerprintManager';
import { BehavioralSimulator } from './BehavioralSimulator';
import { SecurityGuard } from './SecurityGuard';

import { PerformanceManager } from './PerformanceManager';

export class Request {
  private _jar: AppState[] = [];
  private _instance: AxiosInstance;
  private _defaultHeaders: any;
  private _antiDetection: AntiDetectionOptions | undefined;
  private _uaRotator: UserAgentRotator;
  private _fingerprintMgr: FingerprintManager;
  private _behavioralSim: BehavioralSimulator;
  private _securityGuard: SecurityGuard;
  private _perfMgr: PerformanceManager;

  constructor(appState?: AppState[], antiDetection?: AntiDetectionOptions) {
    this._jar = appState || [];
    this._antiDetection = antiDetection;
    this._defaultHeaders = { ...HEADERS };
    this._uaRotator = new UserAgentRotator();
    this._fingerprintMgr = new FingerprintManager();
    this._behavioralSim = new BehavioralSimulator(antiDetection?.behavioralSimulation || { enable: false });
    this._securityGuard = new SecurityGuard(antiDetection?.securityGuard || { enable: false });
    this._perfMgr = PerformanceManager.getInstance();

    if (this._antiDetection?.fingerprint?.enable) {
      if (this._antiDetection.fingerprint.autoRotate) {
        this._fingerprintMgr.startRotation(this._antiDetection.fingerprint.rotationInterval);
      }
    }
    
    const axiosConfig: any = {
      baseURL: FACEBOOK_URL,
      withCredentials: true,
      headers: this._defaultHeaders,
      validateStatus: () => true, // Handle errors manually
      httpAgent: this._perfMgr.httpAgent,
      httpsAgent: this._perfMgr.httpsAgent,
      decompress: true // Enable automatic decompression
    };

    // Compression Header
    this._defaultHeaders['Accept-Encoding'] = 'gzip, deflate, br';

    // Proxy Configuration
    if (this._antiDetection?.proxy?.enable && this._antiDetection.proxy.proxies?.length) {
        const proxyUrl = this._antiDetection.proxy.proxies[Math.floor(Math.random() * this._antiDetection.proxy.proxies.length)];
        try {
            const url = new URL(proxyUrl);
            axiosConfig.proxy = {
                protocol: url.protocol.replace(':', ''),
                host: url.hostname,
                port: parseInt(url.port),
                auth: (url.username && url.password) ? { username: url.username, password: url.password } : undefined
            };
        } catch (e) {
            console.warn('[Request] Invalid proxy URL provided:', proxyUrl);
        }
    }

    this._instance = axios.create(axiosConfig);

    this._instance.interceptors.request.use(async config => {
      (config as any).startTime = Date.now();
      
      // Security Guard: Rate Limiting
      await this._securityGuard.checkRateLimits();

      // Anti-Detection: Behavioral Delays
      if (this._antiDetection?.behavioralSimulation?.enable) {
          await this._behavioralSim.simulateDelay('action');
      } else if (this._antiDetection?.enable && this._antiDetection.randomDelays) {
        const delay = Math.floor(Math.random() * 400) + 100; // 100-500ms
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Anti-Detection: User Agent Rotation
      if (this._antiDetection?.enable && this._antiDetection.userAgentRotation) {
        config.headers['User-Agent'] = this._uaRotator.getRandomUserAgent('Desktop');
      }

      // Fingerprint Injection
      if (this._antiDetection?.fingerprint?.enable) {
        const fpHeaders = this._fingerprintMgr.getSecurityHeaders();
        config.headers = { ...config.headers, ...fpHeaders };
      }

      // Attach cookies
      const cookieHeader = formatCookie(this._jar, config.url || FACEBOOK_URL);
      if (cookieHeader) {
        config.headers['Cookie'] = cookieHeader;
      }
      return config;
    }, error => {
        // Record Error Metrics
        const duration = Date.now() - ((error.config as any)?.startTime || Date.now());
        this._perfMgr.recordRequest(duration, 0, 0, true);
        return Promise.reject(error);
    });

    this._instance.interceptors.response.use(async response => {
      // Record Metrics
      const duration = Date.now() - ((response.config as any)?.startTime || Date.now());
      const bytesIn = parseInt(response.headers['content-length'] || '0');
      const bytesOut = 0; // Approx, hard to get exact from axios
      this._perfMgr.recordRequest(duration, bytesIn, bytesOut, false);

      // Checkpoint Detection
      if (response.data && typeof response.data === 'string') {
          const handled = await this._securityGuard.handleCheckpoint(response.data);
          if (!handled) {
               // Log warning but don't break flow unless critical
          }
      }

      // Update cookies
      const setCookie = response.headers['set-cookie'];
      if (setCookie) {
        setCookie.forEach((c: string) => {
          const parts = c.split(';')[0].split('=');
          const key = parts[0];
          const value = parts.slice(1).join('=');
          const domain = c.match(/domain=([^;]+)/i)?.[1] || '.facebook.com';
          
          const existing = this._jar.findIndex(k => k.key === key && domain.includes(k.domain.replace(/^\./, '')));
          if (existing > -1) {
            this._jar[existing].value = value;
          } else {
            this._jar.push({
              key,
              value,
              domain,
              path: '/',
              hostOnly: false,
              creation: new Date().toISOString(),
              lastAccessed: new Date().toISOString()
            });
          }
        });
      }
      return response;
    });
  }

  public getJar(): AppState[] {
    return this._jar;
  }

  public setJar(jar: AppState[]) {
    this._jar = jar;
  }

  public async get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this._instance.get(url, config);
  }

  public async post(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this._instance.post(url, data, config);
  }
}

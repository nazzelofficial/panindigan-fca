import { ApiCtx } from '../auth';

export interface Fingerprint {
  screen: {
    width: number;
    height: number;
    pixelRatio: number;
    colorDepth: number;
  };
  timezone: {
    name: string;
    offset: number;
  };
  browser: {
    userAgent: string;
    language: string;
    platform: string;
    plugins: string[];
  };
  hardware: {
    concurrency: number;
    memory: number;
  };
  signatures: {
    canvas: string;
    webgl: string;
    audio: string;
  };
}

export class FingerprintManager {
  private fingerprint: Fingerprint | null = null;
  private rotationInterval: NodeJS.Timeout | null = null;
  private lastRotation: number = 0;

  constructor() {
    this.generateFingerprint();
  }

  public getFingerprint(): Fingerprint {
    if (!this.fingerprint) {
      this.generateFingerprint();
    }
    return this.fingerprint!;
  }

  public startRotation(intervalMs: number = 6 * 60 * 60 * 1000) { // Default 6 hours
    if (this.rotationInterval) clearInterval(this.rotationInterval);
    
    this.rotationInterval = setInterval(() => {
      console.log('[FingerprintManager] Auto-rotating fingerprint...');
      this.rotateFingerprint();
    }, intervalMs);
  }

  public stopRotation() {
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
      this.rotationInterval = null;
    }
  }

  public rotateFingerprint() {
    this.generateFingerprint();
    this.lastRotation = Date.now();
  }

  public getSecurityHeaders(): any {
    const fp = this.getFingerprint();
    const headers: any = {};

    // Entropy Injection: Add random noise headers (common in some frameworks/browsers)
    if (Math.random() > 0.5) {
        headers['X-Fb-Friendly-Name'] = this.getRandomFriendlyName();
    }

    // Canvas/WebGL Signatures as custom tracking headers (simulation)
    // headers['X-Canvas-Fingerprint'] = fp.signatures.canvas; // Caution: Real FB might not expect this, but it simulates unique client state tracking if the server looks for it (hypothetically) or just client-side consistency.
    
    // Better Entropy: Order of Accept-Language or slight variations
    // This is hard to enforce in Axios object, but we can provide values.
    
    return headers;
  }

  private getRandomFriendlyName(): string {
      const names = ['ViewerReactionsMutation', 'CometNewsFeedPagination', 'ProfileCometTimelineFeedRefetch', 'GeminiChatRequest'];
      return names[Math.floor(Math.random() * names.length)];
  }

  private generateFingerprint() {
    // Realistic Screen Resolutions
    const screens = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
      { width: 1536, height: 864 },
      { width: 2560, height: 1440 }
    ];
    const screen = screens[Math.floor(Math.random() * screens.length)];

    // Realistic Timezones (matching common VPN/Proxy locations usually)
    const timezones = [
      { name: 'America/New_York', offset: -300 },
      { name: 'Europe/London', offset: 0 },
      { name: 'Asia/Manila', offset: 480 },
      { name: 'Asia/Tokyo', offset: 540 }
    ];
    const tz = timezones[Math.floor(Math.random() * timezones.length)];

    // Generate random hashes for signatures
    const randomHash = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    this.fingerprint = {
      screen: {
        width: screen.width,
        height: screen.height,
        pixelRatio: Math.random() > 0.5 ? 2 : 1, // Retina or Standard
        colorDepth: 24
      },
      timezone: tz,
      browser: {
        userAgent: '', // Will be injected by UserAgentRotator or set externally
        language: 'en-US',
        platform: 'Win32',
        plugins: this.generatePluginList()
      },
      hardware: {
        concurrency: [4, 8, 12, 16][Math.floor(Math.random() * 4)],
        memory: [4, 8, 16, 32][Math.floor(Math.random() * 4)]
      },
      signatures: {
        canvas: randomHash(),
        webgl: randomHash(),
        audio: randomHash()
      }
    };
  }

  private generatePluginList(): string[] {
    const plugins = [
      'Chrome PDF Plugin',
      'Chrome PDF Viewer',
      'Native Client',
      'Widevine Content Decryption Module',
      'Microsoft Edge PDF Plugin',
      'WebKit built-in PDF'
    ];
    // Randomly select 3-5 plugins
    return plugins.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 3);
  }
}

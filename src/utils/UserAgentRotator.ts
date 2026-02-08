export interface UserAgent {
  userAgent: string;
  browser: 'Chrome' | 'Edge' | 'Firefox' | 'Safari';
  os: 'Windows' | 'Mac' | 'Linux' | 'Android' | 'iOS';
  platform: 'Desktop' | 'Mobile';
  version: string;
  weight: number; // Higher means more likely to be selected
}

export class UserAgentRotator {
  private userAgents: UserAgent[] = [
    // --- Desktop Windows (Chrome) - 2026 Era ---
    {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
      browser: 'Chrome',
      os: 'Windows',
      platform: 'Desktop',
      version: '145.0.0.0',
      weight: 10
    },
    {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
      browser: 'Chrome',
      os: 'Windows',
      platform: 'Desktop',
      version: '146.0.0.0',
      weight: 10
    },
    // --- Desktop Windows (Edge) ---
    {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0',
      browser: 'Edge',
      os: 'Windows',
      platform: 'Desktop',
      version: '145.0.0.0',
      weight: 8
    },
    // --- Desktop Mac (Chrome) ---
    {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
      browser: 'Chrome',
      os: 'Mac',
      platform: 'Desktop',
      version: '145.0.0.0',
      weight: 5
    },
    // --- Mobile Android (Chrome) ---
    {
      userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36',
      browser: 'Chrome',
      os: 'Android',
      platform: 'Mobile',
      version: '145.0.0.0',
      weight: 3
    }
  ];

  public getRandomUserAgent(platform?: 'Desktop' | 'Mobile'): string {
    let pool = this.userAgents;
    
    if (platform) {
      pool = pool.filter(ua => ua.platform === platform);
    }

    // Weight-based selection
    const totalWeight = pool.reduce((sum, ua) => sum + ua.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const ua of pool) {
      random -= ua.weight;
      if (random <= 0) {
        return ua.userAgent;
      }
    }
    
    return pool[0].userAgent; // Fallback
  }

  public addCustomUserAgent(ua: UserAgent) {
    this.userAgents.push(ua);
  }
}

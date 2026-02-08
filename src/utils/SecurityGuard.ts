import axios from 'axios';

export class SecurityGuard {
  private requestCounts: number = 0;
  private lastRequestReset: number = Date.now();
  private cooldownMode: boolean = false;
  
  // Rate limits: e.g., 60 requests per minute
  private readonly MAX_REQUESTS_PER_MINUTE = 60;
  private readonly COOLDOWN_DURATION = 120000; // 2 minutes

  constructor(private options: any) {}

  public async checkRateLimits(): Promise<void> {
    if (!this.options.enable || !this.options.smartRateLimiting) return;

    const now = Date.now();
    if (now - this.lastRequestReset > 60000) {
      this.requestCounts = 0;
      this.lastRequestReset = now;
      this.cooldownMode = false;
    }

    this.requestCounts++;

    if (this.requestCounts > this.MAX_REQUESTS_PER_MINUTE) {
      this.cooldownMode = true;
      console.warn(`[SecurityGuard] Rate limit exceeded (${this.requestCounts}/min). Entering cooldown...`);
      // Anti-spam protection: Enforce cooldown
      if (this.options.antiSpam) {
        await new Promise(resolve => setTimeout(resolve, this.COOLDOWN_DURATION));
        this.requestCounts = 0;
        this.lastRequestReset = Date.now();
        this.cooldownMode = false;
        console.log('[SecurityGuard] Cooldown finished. Resuming...');
      } else {
          throw new Error('Rate limit exceeded');
      }
    }
  }

  public async handleCheckpoint(body: string, pageUrl: string = 'https://www.facebook.com/'): Promise<boolean> {
    if (!this.options.checkpointSolver) return false;

    // Detect checkpoint
    if (body.includes('checkpoint') || body.includes('verification')) {
        console.log('[SecurityGuard] Checkpoint detected!');
        
        if (this.options.captchaIntegration) {
            console.log(`[SecurityGuard] Attempting to solve CAPTCHA using ${this.options.captchaIntegration.provider}...`);
            
            // Extract siteKey (simplified regex)
            const siteKeyMatch = body.match(/data-sitekey="([^"]+)"/);
            const siteKey = siteKeyMatch ? siteKeyMatch[1] : null;

            if (siteKey) {
                const solution = await this.solveCaptcha(siteKey, pageUrl);
                if (solution) {
                    console.log('[SecurityGuard] CAPTCHA solved successfully!');
                    // In a real flow, you would now submit the form with 'g-recaptcha-response': solution
                    return true;
                } else {
                    console.error('[SecurityGuard] Failed to solve CAPTCHA.');
                }
            } else {
                 console.warn('[SecurityGuard] No CAPTCHA sitekey found in checkpoint page.');
            }
        }
        return false;
    }
    return true;
  }

  private async solveCaptcha(siteKey: string, pageUrl: string): Promise<string | null> {
    if (!this.options.captchaIntegration) return null;
    
    const { provider, apiKey } = this.options.captchaIntegration;
    
    try {
        if (provider === '2captcha') {
            // 1. Request captcha solving
            const res = await axios.post(`http://2captcha.com/in.php?key=${apiKey}&method=userrecaptcha&googlekey=${siteKey}&pageurl=${pageUrl}&json=1`);
            if (res.data.status !== 1) throw new Error(res.data.request);
            const id = res.data.request;
            
            // 2. Poll for result
            let tries = 0;
            while (tries < 30) {
                await new Promise(r => setTimeout(r, 5000));
                const poll = await axios.get(`http://2captcha.com/res.php?key=${apiKey}&action=get&id=${id}&json=1`);
                if (poll.data.status === 1) return poll.data.request;
                if (poll.data.request !== 'CAPCHA_NOT_READY') throw new Error(poll.data.request);
                tries++;
            }
        } else if (provider === 'anticaptcha') {
            // 1. Create task
            const res = await axios.post('https://api.anti-captcha.com/createTask', {
                clientKey: apiKey,
                task: {
                    type: "NoCaptchaTaskProxyless",
                    websiteURL: pageUrl,
                    websiteKey: siteKey
                }
            });
            
            if (res.data.errorId !== 0) throw new Error(res.data.errorDescription);
            const taskId = res.data.taskId;

            // 2. Poll for result
            let tries = 0;
            while (tries < 30) {
                await new Promise(r => setTimeout(r, 5000));
                const poll = await axios.post('https://api.anti-captcha.com/getTaskResult', {
                    clientKey: apiKey,
                    taskId: taskId
                });
                
                if (poll.data.errorId !== 0) throw new Error(poll.data.errorDescription);
                if (poll.data.status === 'ready') return poll.data.solution.gRecaptchaResponse;
                tries++;
            }
        }
    } catch (e) {
        console.error('[SecurityGuard] CAPTCHA solving failed:', e);
    }
    return null;
  }
}

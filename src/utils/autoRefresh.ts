import { ApiCtx } from '../auth';
import { ApiOption } from '../types';
import { getFrom } from './utils';

export class AutoRefresh {
  private ctx: ApiCtx;
  private options: ApiOption;
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor(ctx: ApiCtx, options: ApiOption) {
    this.ctx = ctx;
    this.options = options;
  }

  public start() {
    if (!this.options.autoRefresh?.enable) return;

    const interval = this.options.autoRefresh.interval || 20 * 60 * 1000;
    console.log(`[AutoRefresh] Started. Interval: ${interval}ms`);

    this.refreshTimer = setInterval(async () => {
      await this.performRefresh();
    }, interval);
  }

  public stop() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private async performRefresh() {
    try {
      console.log('[AutoRefresh] Refreshing cookies...');
      
      // Ping main page to keep session alive and get fresh dtsg
      const res = await this.ctx.req.get('https://www.facebook.com/');
      const body = res.data;

      // Validate session
      const userID = getFrom(body, 'c_user=', ';') || 
                     this.ctx.jar.find(c => c.key === 'c_user')?.value;

      if (!userID || userID !== this.ctx.userID) {
        throw new Error('Session invalid after refresh');
      }

      // Update critical tokens if changed
      const fb_dtsg = getFrom(body, 'name="fb_dtsg" value="', '"') || 
                      getFrom(body, '["DTSGInitialData",[],{"token":"', '"');
      
      if (fb_dtsg) {
        this.ctx.fb_dtsg = fb_dtsg;
        // Recalculate ttstamp
        let ttstamp = '2';
        for (let i = 0; i < fb_dtsg.length; i++) {
          ttstamp += fb_dtsg.charCodeAt(i);
        }
        this.ctx.ttstamp = ttstamp;
      }

      console.log('[AutoRefresh] Refresh successful.');

      // Encrypt and Export
      if (this.options.autoRefresh?.onRefresh) {
        const cookies = this.ctx.req.getJar();
        
        // Basic AES-256 encryption for secure export if needed
        // In a real scenario, the key should be provided in options or environment
        // Here we just pass the jar, but we can add an 'encrypted' flag wrapper if requested
        // For this library, we return the CookieJar object directly as it's the standard format
        this.options.autoRefresh.onRefresh(cookies);
      }

    } catch (err: any) {
      console.error('[AutoRefresh] Failed:', err.message);
      if (this.options.autoRefresh?.onRefreshError) {
        this.options.autoRefresh.onRefreshError(err);
      }
      // Fallback: Could trigger re-login logic here if we had credentials stored
    }
  }
}

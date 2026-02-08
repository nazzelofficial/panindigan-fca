"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoRefresh = void 0;
const utils_1 = require("./utils");
class AutoRefresh {
    constructor(ctx, options) {
        this.refreshTimer = null;
        this.ctx = ctx;
        this.options = options;
    }
    start() {
        if (!this.options.autoRefresh?.enable)
            return;
        const interval = this.options.autoRefresh.interval || 20 * 60 * 1000;
        console.log(`[AutoRefresh] Started. Interval: ${interval}ms`);
        this.refreshTimer = setInterval(async () => {
            await this.performRefresh();
        }, interval);
    }
    stop() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }
    async performRefresh() {
        try {
            console.log('[AutoRefresh] Refreshing cookies...');
            // Ping main page to keep session alive and get fresh dtsg
            const res = await this.ctx.req.get('https://www.facebook.com/');
            const body = res.data;
            // Validate session
            const userID = (0, utils_1.getFrom)(body, 'c_user=', ';') ||
                this.ctx.jar.find(c => c.key === 'c_user')?.value;
            if (!userID || userID !== this.ctx.userID) {
                throw new Error('Session invalid after refresh');
            }
            // Update critical tokens if changed
            const fb_dtsg = (0, utils_1.getFrom)(body, 'name="fb_dtsg" value="', '"') ||
                (0, utils_1.getFrom)(body, '["DTSGInitialData",[],{"token":"', '"');
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
            // Encrypt and Export (Mock encryption for now)
            if (this.options.autoRefresh?.onRefresh) {
                this.options.autoRefresh.onRefresh(this.ctx.req.getJar());
            }
        }
        catch (err) {
            console.error('[AutoRefresh] Failed:', err.message);
            if (this.options.autoRefresh?.onRefreshError) {
                this.options.autoRefresh.onRefreshError(err);
            }
            // Fallback: Could trigger re-login logic here if we had credentials stored
        }
    }
}
exports.AutoRefresh = AutoRefresh;

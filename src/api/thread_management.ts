import { ApiCtx } from '../auth';

export async function deleteThread(ctx: ApiCtx, threadId: string): Promise<void> {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        ids: [threadId]
    };

    await ctx.req.post('/ajax/mercury/delete_thread.php', form);
}

export async function archiveThread(ctx: ApiCtx, threadId: string, archive: boolean): Promise<void> {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        ids: { [threadId]: archive },
        archive: archive
    };

    await ctx.req.post('/ajax/mercury/change_archived_status.php', form);
}

export async function muteThread(ctx: ApiCtx, threadId: string, muteSeconds: number = -1): Promise<void> {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        thread_fbid: threadId,
        mute_settings: muteSeconds
    };

    await ctx.req.post('/ajax/mercury/change_mute_settings.php', form);
}

export async function pinThread(ctx: ApiCtx, threadId: string, pin: boolean): Promise<void> {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        thread_fbid: threadId,
        pin: pin
    };

    await ctx.req.post('/ajax/mercury/change_pinned_status.php', form);
}

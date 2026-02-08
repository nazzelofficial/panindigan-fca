import { ApiCtx } from '../auth';

export async function createPost(ctx: ApiCtx, message: string, privacy: 'EVERYONE' | 'FRIENDS' | 'SELF' = 'EVERYONE', targetId?: string): Promise<string> {
  const form: any = {
    client: 'mercury',
    fb_dtsg: ctx.fb_dtsg,
    jazoest: ctx.ttstamp,
    ximinal_text: message,
    audience: {
        privacy: {
            base_state: privacy,
            id: privacy === 'SELF' ? ctx.userID : undefined
        }
    },
    target_id: targetId || ctx.userID
  };

  const res = await ctx.req.post('/ajax/updatestatus.php', form);
  // Response usually contains the story ID in header or payload
  return res.headers['x-fb-post-id'] || '';
}

export async function deletePost(ctx: ApiCtx, postId: string): Promise<void> {
  const form = {
    client: 'mercury',
    fb_dtsg: ctx.fb_dtsg,
    jazoest: ctx.ttstamp,
    story_id: postId
  };

  await ctx.req.post('/ajax/feed/delete_story.php', form);
}

export async function reactToPost(ctx: ApiCtx, postId: string, reaction: 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY'): Promise<void> {
    // Map reaction to ID
    const reactionIds: any = {
        'LIKE': 1,
        'LOVE': 2,
        'HAHA': 4,
        'WOW': 3,
        'SAD': 7,
        'ANGRY': 8
    };

    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        ft_ent_identifier: postId,
        reaction_type: reactionIds[reaction]
    };

    await ctx.req.post('/ufi/reaction/', form);
}

export async function commentOnPost(ctx: ApiCtx, postId: string, comment: string): Promise<string> {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        ft_ent_identifier: postId,
        comment_text: comment
    };

    const res = await ctx.req.post('/ufi/add/comment/', form);
    return res.data.payload?.commentID || '';
}

export async function sharePost(ctx: ApiCtx, postId: string, text?: string): Promise<void> {
    const form = {
        client: 'mercury',
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.ttstamp,
        sharer_id: postId,
        message: text || ''
    };
    
    await ctx.req.post('/ajax/sharer/submit/', form);
}

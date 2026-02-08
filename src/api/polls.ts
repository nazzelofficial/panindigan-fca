import { ApiCtx } from '../auth';

export async function createPoll(ctx: ApiCtx, threadId: string, title: string, options: string[]): Promise<void> {
  const form: any = {
    client: 'mercury',
    fb_dtsg: ctx.fb_dtsg,
    jazoest: ctx.ttstamp,
    question_text: title,
    target_id: threadId
  };

  options.forEach((opt, i) => {
    form[`option_text_array[${i}]`] = opt;
  });

  await ctx.req.post('/messaging/group/create_poll/?dpr=1', form);
}

import { ApiCtx } from '../auth';

export async function searchUser(ctx: ApiCtx, query: string): Promise<any[]> {
  const res = await ctx.req.get(`https://www.facebook.com/ajax/typeahead/search.php?value=${encodeURIComponent(query)}&viewer=${ctx.userID}&rsp=search&context=search&path=/home.php&request_id=${Date.now()}`);
  
  // Response is usually JSON with `payload.entries`
  // Clean the "for (;;);" prefix
  const body = res.data.toString().replace('for (;;);', '');
  try {
    const json = JSON.parse(body);
    return json.payload?.entries || [];
  } catch (e) {
    return [];
  }
}

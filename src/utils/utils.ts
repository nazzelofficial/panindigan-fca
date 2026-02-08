import { v4 as uuidv4 } from 'uuid';

export function getGUID(): string {
  return uuidv4();
}

export function generateOfflineThreadingID(): string {
  const ret = Date.now();
  const value = Math.floor(Math.random() * 4294967295);
  const str = ("0000000000000000000000" + value.toString(2)).slice(-22);
  const msgs = ret.toString(2) + str;
  return parseInt(msgs, 2).toString();
}

export function formatCookie(arr: any[], url: string): string {
  return arr.filter(c => url.includes(c.domain.replace(/^\./, ''))).map(c => `${c.key}=${c.value}`).join('; ');
}

export function getFrom(str: string, startToken: string, endToken: string): string {
  const start = str.indexOf(startToken) + startToken.length;
  if (start < startToken.length) return '';
  const last = str.indexOf(endToken, start);
  return str.substring(start, last > -1 ? last : undefined);
}

export function parseGraphQLBatch(response: string): any[] {
  const results: any[] = [];
  const lines = response.split('\n');
  for (const line of lines) {
    if (line.startsWith('{')) {
      try {
        const data = JSON.parse(line);
        if (data.o0 && data.o0.data) results.push(data.o0.data);
        // Handle other possible keys or error states
      } catch (e) {
        // Ignore parse errors for keep-alive lines
      }
    }
  }
  return results;
}

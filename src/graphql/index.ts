import { FB_API_GRAPHQL, GRAPHQL_FRIENDLY_NAMES } from '../constants/index.js';

export interface GraphQLPayload {
  url: string;
  body: string;
  friendlyName: string;
}

function encodeForm(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

export function buildGraphQLRequest(options: {
  docId?: string;
  queryName?: keyof typeof GRAPHQL_FRIENDLY_NAMES;
  variables: Record<string, unknown>;
  dtsg: string;
  lsd: string;
  friendlyName?: string;
}): GraphQLPayload {
  const name = options.friendlyName
    ?? (options.queryName ? GRAPHQL_FRIENDLY_NAMES[options.queryName] : 'PandindiganQuery');

  const params: Record<string, string> = {
    variables: JSON.stringify(options.variables),
    server_timestamps: 'true',
    fb_api_req_friendly_name: name,
    fb_dtsg: options.dtsg,
    fb_api_caller_class: 'RelayModern',
    __a: '1',
    __comet_req: '15',
    lsd: options.lsd,
    __req: Math.random().toString(36).slice(2, 6),
  };
  if (options.docId) params['doc_id'] = options.docId;

  return {
    url: FB_API_GRAPHQL,
    body: encodeForm(params),
    friendlyName: name,
  };
}

export function buildFormRequest(options: {
  url: string;
  params: Record<string, string>;
  dtsg?: string;
  lsd?: string;
}): { url: string; body: string } {
  const params = { ...options.params };
  if (options.dtsg) params['fb_dtsg'] = options.dtsg;
  if (options.lsd) params['lsd'] = options.lsd;
  return { url: options.url, body: encodeForm(params) };
}

export function parseJsonResponse(text: string): unknown {
  const stripped = text.startsWith('for (;;);') ? text.slice(9) : text;
  return JSON.parse(stripped);
}

export function extractDtsgFromHtml(html: string): string | null {
  const match = html.match(/"DTSGInitialData"\s*,\s*\[\s*\]\s*,\s*\{"token"\s*:\s*"([^"]+)"/);
  if (match) return match[1] ?? null;
  const match2 = html.match(/fb_dtsg[^"]*value="([^"]+)"/);
  if (match2) return match2[1] ?? null;
  const match3 = html.match(/"dtsg"\s*:\s*\{"token"\s*:\s*"([^"]+)"/);
  if (match3) return match3[1] ?? null;
  return null;
}

export function extractLsdFromHtml(html: string): string | null {
  const match = html.match(/"LSD"\s*,\s*\[\s*\]\s*,\s*\{"token"\s*:\s*"([^"]+)"/);
  if (match) return match[1] ?? null;
  const match2 = html.match(/name="lsd"\s+value="([^"]+)"/);
  if (match2) return match2[1] ?? null;
  return null;
}

export function extractJazoestFromHtml(html: string): string | null {
  const match = html.match(/jazoest=(\d+)/);
  return match ? match[1] ?? null : null;
}

export function parseLightspeedResponse(data: unknown): unknown[] {
  if (!data || typeof data !== 'object') return [];
  const obj = data as Record<string, unknown>;
  const payload = obj['payload'] ?? obj['data'];
  if (!payload || typeof payload !== 'object') return [];
  const actions = (payload as Record<string, unknown>)['actions'];
  if (!Array.isArray(actions)) return [];
  return actions;
}

import { lookup } from 'node:dns/promises';

interface DnsCacheEntry {
  addresses: string[];
  expiresAt: number;
}

const DNS_TTL_MS = 5 * 60 * 1000;
const dnsCache = new Map<string, DnsCacheEntry>();

export async function resolveWithCache(hostname: string): Promise<string> {
  const cached = dnsCache.get(hostname);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.addresses[Math.floor(Math.random() * cached.addresses.length)] as string;
  }
  const results = await lookup(hostname, { all: true, family: 4 });
  const addresses = results.map((r) => r.address);
  dnsCache.set(hostname, { addresses, expiresAt: Date.now() + DNS_TTL_MS });
  return addresses[Math.floor(Math.random() * addresses.length)] as string;
}

export function clearDnsCache(): void {
  dnsCache.clear();
}

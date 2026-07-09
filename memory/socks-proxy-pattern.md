---
name: SOCKS proxy — undici dispatcher pattern
description: Why Agent must be used instead of Pool for SOCKS proxy support in undici
---

# SOCKS proxy — undici Agent vs Pool

## Rule
Always use undici `Agent` (not `Pool`) when routing SOCKS proxy traffic.

**Why:** `Pool` is origin-bound — it creates one TCP pool for one `https://www.facebook.com` origin. The SDK makes requests to multiple origins (upload endpoints, graph endpoints, etc.). `Agent` manages per-origin pools internally and applies the same `connect` factory to every pool it creates, so SOCKS tunnelling works across all destinations.

**How to apply:** `buildSocksAgent()` in `src/http/index.ts` returns an `Agent`. The custom `connect` callback checks `opts.protocol` and upgrades plain-TCP socks sockets to TLS for HTTPS origins. Never replace with `Pool(origin, { connect })`.

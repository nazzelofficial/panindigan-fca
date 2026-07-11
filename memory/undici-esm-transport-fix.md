---
name: undici-esm-transport-fix
description: Root cause and fix for StorageApiClient failing silently in ESM builds (Docker/Koyeb/Bun).
---

## Rule
Never use `require('http')` or `require('https')` in any module in this project. Use `undici.request()` instead.

## Why
`StorageApiClient` used `require('https')` via a `getTransport()` helper with a `globalThis.require` fallback. In the ESM build (`dist/index.js`), Node.js provides no global `require`, so every HTTP call threw `ReferenceError` immediately. The error was caught by the retry loop: 3 attempts × ~200ms jitter = ~600ms before fallback mode — matching `"bootstrapDurationMs":599` observed in production Koyeb/Docker logs. The TypeScript `declare function require(...)` at the top of the file is a type declaration only; it does NOT inject a runtime `require` in ESM.

## How to apply
- Any code that needs HTTP/HTTPS: import `{ request } from 'undici'` (already a dependency).
- `AbortSignal.timeout(ms)` is safe — engines constraint is Node ≥ 22.
- Tests that mock the transport: use `vi.mock('undici', ...)` with `vi.hoisted()` to avoid the "cannot access before initialization" error, and include `Agent` and `ProxyAgent` stubs in the mock (the proxy module also imports from undici).

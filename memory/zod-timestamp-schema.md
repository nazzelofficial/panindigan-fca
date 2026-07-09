---
name: Zod timestamp schema — ISO string handling
description: TimestampSchema must handle numeric strings, bare numbers, and ISO date strings; Number() of ISO gives NaN
---

# Zod timestamp schema

## Rule
The `TimestampSchema` in `src/responses/index.ts` must handle three timestamp forms Facebook uses:
- Millisecond integer (e.g. `1720000000000`)
- Second integer (e.g. `1720000`)
- ISO-8601 string (e.g. `"2026-07-07T04:00:00.000Z"`)

**Why:** `Number("2026-07-07T...")` returns `NaN`. Original implementation used `Number(v)` for all strings, silently producing invalid dates for ISO strings.

**How to apply:** For strings, check `Number.isNaN(n)` and fall back to `Date.parse(v)`. Scale to ms only after confirming a valid numeric timestamp: `n > 1e12 ? n : n * 1000`.

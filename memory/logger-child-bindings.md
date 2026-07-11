---
name: Logger child bindings dedup
description: How to prevent pino from producing duplicate JSON keys when child() or per-call ctx overrides a parent binding (e.g. tag).
---

## Rule
`wrap()` in `src/logger/index.ts` must track accumulated bindings as a plain object and always call `base.child(merged)` — never `p.child(bindings)` on an already-bound child.

**Why:** Pino stacks child bindings rather than overwriting them. Calling `p.child({ tag: 'AUTH' })` on a logger that already carries `{ tag: 'PFCA' }` produces `{"tag":"PFCA","tag":"AUTH"}` — invalid/unpredictable JSON with duplicate keys.

**How to apply:**
- `wrap(bound: Record<string, unknown>)` accepts the full flat binding set.
- `child(bindings)` merges: `wrap({ ...bound, ...bindings })` — later keys win.
- Each log method (`info`, `warn`, etc.) resolves via a `resolve(ctx)` helper that detects key overlap with `bound`; on conflict it builds a throw-away `base.child({ ...bound, ...ctx })` so the JSON field appears exactly once with the ctx value winning.
- `base` (the raw pino root) MUST have no user bindings — all bindings flow through `wrap`.

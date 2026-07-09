---
name: account:healthy event — only on passing healthCheck
description: Emit account:healthy only when healthCheck ok===true to avoid false-positive events
---

# account:healthy event semantics

## Rule
`DiagnosticsModule.healthCheck()` must only emit `account:healthy` when `ok === true`.

**Why:** Emitting `account:healthy` on a failing check sends a false-positive signal to any listeners (monitoring, reconnect logic, etc.), masking real connectivity failures.

**How to apply:** Guard the emit with `if (ok)` before the return statement in `src/diagnostics/index.ts`.

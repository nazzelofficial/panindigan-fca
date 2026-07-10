---
name: Storage failover design
description: Key constraints for LibSqlStorageAdapter failover, pending-write queue, and close() safety.
---

## Rules

**close() must NOT call clear()** — Calling `this.client.clear()` on disconnect wipes ALL remote persistent data. `close()` flushes pending writes and stops timers only.

**Bootstrap never throws** — `bootstrap()` catches health-check failure, sets `fallbackMode = true`, and continues. Storage failures must never block Facebook login or createClient().

**FIFO ordering in replay** — `replayPendingWrites()` processes the queue head-first and stops at the first failure. Never splice failed writes to the tail (inverts causality if `clear` precedes `set`).

**Single-flight replay guard** — `isSyncing` flag prevents concurrent `backgroundSync()` runs from interleaving writes across ticks.

**Timer lifecycle** — `startBackgroundSync()` checks `connectionState === 'closed'` before creating the interval. Bootstrap calls `startBackgroundSync()` in `finally`, so this guard prevents a leaked timer when `close()` races with bootstrap completion.

**Why:** Discovered these constraints during v0.1.6 code review; all were flagged as correctness failures.

**How to apply:** Any future rewrite of LibSqlStorageAdapter must preserve these invariants.

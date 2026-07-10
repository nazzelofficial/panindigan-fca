---
name: Pino custom levels TypeScript
description: How to add custom pino levels without TypeScript generic conflicts.
---

## Problem

When you pass `customLevels: { success: 35 }` to `pino()`, the returned instance is typed as `pino.Logger<"success", boolean>`. If your `wrap()` helper accepts `pino.Logger` (which defaults to `pino.Logger<never, boolean>`), TypeScript complains about incompatible `onChild` callbacks.

## Solution

1. Define `type AnyPinoLogger = pino.Logger<string, boolean>` — a wide alias that is compatible with any concrete custom-level parameterization.
2. Cast the `pino()` return: `pino({ customLevels: ... }) as unknown as AnyPinoLogger`.
3. Type the `wrap()` helper as `(p: AnyPinoLogger): Logger`.
4. Access the custom level method via a cast: `(p as AnyPinoLogger & { success: (ctx, msg) => void }).success(...)`.

**Why:** Pino's generic `L extends string` varies by construction options; TypeScript can't unify `"success"` with `never` without the explicit cast.

**How to apply:** Any time a new custom level is added to the logger, use `AnyPinoLogger` as the internal type alias.

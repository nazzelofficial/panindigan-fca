---
name: circuit-breaker-integration-test-pattern
description: How to write LibSqlStorageAdapter integration tests that involve reconnect/replay after bootstrap failure.
---

## Rule
When testing `LibSqlStorageAdapter` reconnect or queue-replay scenarios, spy on the adapter's internal `client` methods directly rather than mocking undici responses.

## Why
`LibSqlStorageAdapter` uses `new StorageApiClient({ retries: 2, ... })`. When bootstrap fails, the internal `StorageApiClient` makes 3 attempts (1 original + 2 retries) against the same endpoint. With the default `circuitBreakerThreshold: 3`, all 3 failures open the circuit. Subsequent `backgroundSync()` calls find the circuit OPEN and block the health probe immediately — they never reach undici. Mocking undici after bootstrap therefore has no effect on recovery behavior.

## How to apply
```typescript
// Pattern for recovery / replay tests:
const internalClient = (adapter as any).client as StorageApiClient;
vi.spyOn(internalClient, 'health').mockResolvedValueOnce({ status: 'healthy', timestamp: '' });
vi.spyOn(internalClient, 'set').mockResolvedValueOnce({ ok: true });
await (adapter as any).backgroundSync();
expect(adapter.getDiagnostics().fallbackMode).toBe(false);
```

This bypasses the circuit breaker entirely (the spy replaces the `health()` method before `request()` is called) while correctly testing the adapter's reconnect and replay logic.

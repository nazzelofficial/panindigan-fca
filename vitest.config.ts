import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use globals so test files don't need to import describe/it/expect
    globals: true,

    // Run in Node.js — this is a Node-native library with no browser targets
    environment: 'node',

    // Discover test files in the standard layout
    include: [
      'tests/**/*.test.ts',
      'tests/**/*.spec.ts',
      'src/**/__tests__/**/*.test.ts',
    ],

    // Exclude build artefacts and node_modules
    exclude: ['node_modules', 'dist'],

    // Timeout per individual test (ms). Raise for integration/stress tests.
    testTimeout: 10_000,

    // Run test files sequentially inside a suite but run suites in parallel
    pool: 'forks',
    poolOptions: {
      forks: {
        // Let Vitest choose concurrency based on CPU count
        singleFork: false,
      },
    },

    // TypeScript support — Vitest uses Vite's esbuild transform under the hood
    // No extra plugin required for plain TypeScript + Node.js.

    // ── Coverage ─────────────────────────────────────────────────────────────
    coverage: {
      // Use V8's built-in coverage instrumentation — no Babel transforms needed
      provider: 'v8',

      // Emit reports in two formats:
      //   text  — shown inline in the terminal
      //   lcov  — consumed by CI coverage tools (Codecov, SonarQube, etc.)
      reporter: ['text', 'lcov', 'html'],

      // Only count source files — ignore tests and build outputs
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/__tests__/**',
        'dist/**',
        'node_modules/**',
      ],

      // ≥ 95% across all metrics — CI fails if any metric drops below this
      thresholds: {
        lines: 95,
        branches: 95,
        functions: 95,
        statements: 95,
      },

      // Write coverage reports here
      reportsDirectory: './coverage',

      // Do not report un-imported files as 0% — only measure what tests touch
      all: false,
    },

    // ── Reporter ──────────────────────────────────────────────────────────────
    // Use the default 'verbose' reporter in CI, default elsewhere
    reporter: process.env['CI'] === 'true' ? ['verbose', 'github-actions'] : ['verbose'],
  },
});

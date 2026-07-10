import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    extensions: ['.ts', '.js'],
  },

  test: {
    globals: true,
    environment: 'node',

    include: [
      'tests/**/*.test.ts',
      'tests/**/*.spec.ts',
      'src/**/__tests__/**/*.test.ts',
    ],

    exclude: [
      'node_modules/**',
      'dist/**',
    ],

    testTimeout: 10000,

    coverage: {
      provider: 'v8',

      reporter: [
        'text',
        'lcov',
        'html',
      ],

      include: [
        'src/auth/**/*.ts',
        'src/cache/**/*.ts',
        'src/config/**/*.ts',
        'src/cookies/**/*.ts',
        'src/errors/**/*.ts',
        'src/graphql/**/*.ts',
        'src/logger/**/*.ts',
        'src/network/**/*.ts',
        'src/proxy/**/*.ts',
        'src/requests/**/*.ts',
        'src/storage/**/*.ts',
      ],

      exclude: [
        // Type declarations
        'src/**/*.d.ts',

        // Tests
        'src/**/__tests__/**',
        'tests/**',

        // Build output
        'dist/**',
        'node_modules/**',

        // Entry/export files
        'src/index.ts',

        // Files without business logic
        'src/constants/**',
        'src/events/**',

        // Optional integrations
        'src/**/types.ts',
        'src/**/interfaces.ts',
      ],

      thresholds: {
        lines: 90,
        branches: 70,
        functions: 90,
        statements: 90,
      },

      reportsDirectory: './coverage',
    },

    reporter: process.env.CI
      ? [
          'verbose',
          'github-actions',
        ]
      : [
          'verbose',
        ],
  },
});
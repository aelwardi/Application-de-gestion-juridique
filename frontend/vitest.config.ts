import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue() as any],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/',
        '.nuxt/',
        '**/__mocks__/**',
        '**/fixtures/**', '**/*.test.ts',
        '**/*.spec.ts',
        '**/types/**',
        'public/',
        'plugins/leaflet.client.ts', // Plugin spécifique client-side
      ],
      thresholds: {
        statements: 60,
        branches: 50,
        functions: 55,
        lines: 60,
      },
      all: true,
      include: [
        'components/**/*.vue',
        'composables/**/*.ts',
        'utils/**/*.ts',
        'middleware/**/*.ts',
        'stores/**/*.ts',
      ],
    },
    include: ['tests/**/*.test.ts'],
    testTimeout: 10000,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
});
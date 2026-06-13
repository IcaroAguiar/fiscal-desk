import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['coverage/**', 'dist/**', 'dist-electron/**'],
      reporter: ['text', 'html', 'json-summary', 'lcov'],
    },
  },
});

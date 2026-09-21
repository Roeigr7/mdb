import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    setupFiles: ['./test/setup-e2e.ts'],
    // E2E hits a real HTTP app + DB; keep sequential to avoid shared-state races.
    fileParallelism: false,
    hookTimeout: 60_000,
    testTimeout: 30_000,
    // Deterministic scan stubs — do not require Ollama in CI/E2E.
    env: {
      DOCUMENT_AI_PROVIDER: 'mock',
      OCR_PROVIDER: 'mock',
      EXTRACTION_PROVIDER: 'mock',
    },
  },
});

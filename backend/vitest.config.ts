import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  // Resolves the path aliases declared in tsconfig.json, including the ones
  // added by `nest g library`.
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
    // Keep document AI on mocks so unit tests never require a live Ollama.
    env: {
      DOCUMENT_AI_PROVIDER: 'mock',
      OCR_PROVIDER: 'mock',
      EXTRACTION_PROVIDER: 'mock',
    },
  },
});

import { describe, expect, it } from 'vitest';
import {
  resolveDocumentProviders,
  resolveOllamaConfig,
} from './ollama-config.js';

describe('ollama-config', () => {
  it('defaults to mock providers', () => {
    expect(resolveDocumentProviders({})).toEqual({
      ocr: 'mock',
      extraction: 'mock',
    });
  });

  it('maps DOCUMENT_AI_PROVIDER=ollama to ollama + json', () => {
    expect(
      resolveDocumentProviders({ DOCUMENT_AI_PROVIDER: 'ollama' }),
    ).toEqual({
      ocr: 'ollama',
      extraction: 'json',
    });
  });

  it('allows explicit OCR / EXTRACTION overrides', () => {
    expect(
      resolveDocumentProviders({
        DOCUMENT_AI_PROVIDER: 'ollama',
        OCR_PROVIDER: 'mock',
        EXTRACTION_PROVIDER: 'mock',
      }),
    ).toEqual({
      ocr: 'mock',
      extraction: 'mock',
    });
  });

  it('reads Ollama URL and model from env without hardcoding callers', () => {
    expect(
      resolveOllamaConfig({
        OLLAMA_BASE_URL: 'http://127.0.0.1:11434/',
        OLLAMA_MODEL: 'llava:7b',
        OLLAMA_TIMEOUT_MS: '30000',
      }),
    ).toEqual({
      baseUrl: 'http://127.0.0.1:11434',
      model: 'llava:7b',
      timeoutMs: 30_000,
    });
  });

  it('falls back to local defaults when unset', () => {
    const config = resolveOllamaConfig({});
    expect(config.baseUrl).toBe('http://localhost:11434');
    expect(config.model).toBe('qwen2.5vl:3b');
    expect(config.timeoutMs).toBe(300_000);
  });
});

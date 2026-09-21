export type DocumentAiProvider = 'mock' | 'ollama';
export type OcrProviderName = 'mock' | 'ollama';
export type ExtractionProviderName = 'mock' | 'json';

export type OllamaConfig = {
  baseUrl: string;
  model: string;
  timeoutMs: number;
};

const DEFAULT_OLLAMA_BASE_URL = 'http://localhost:11434';
const DEFAULT_OLLAMA_MODEL = 'qwen2.5vl:3b';
const DEFAULT_TIMEOUT_MS = 300_000;

function normalizeProvider(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? '';
}

/**
 * Resolve OCR / extraction providers from env.
 * DOCUMENT_AI_PROVIDER=ollama implies OCR=ollama + EXTRACTION=json.
 * Explicit OCR_PROVIDER / EXTRACTION_PROVIDER override when set.
 */
export function resolveDocumentProviders(
  env: NodeJS.ProcessEnv = process.env,
): {
  ocr: OcrProviderName;
  extraction: ExtractionProviderName;
} {
  const documentAi = normalizeProvider(env.DOCUMENT_AI_PROVIDER);
  const ocrRaw = normalizeProvider(env.OCR_PROVIDER);
  const extractionRaw = normalizeProvider(env.EXTRACTION_PROVIDER);

  const ocr: OcrProviderName =
    ocrRaw === 'ollama' || ocrRaw === 'mock'
      ? ocrRaw
      : documentAi === 'ollama'
        ? 'ollama'
        : 'mock';

  const extraction: ExtractionProviderName =
    extractionRaw === 'json' || extractionRaw === 'mock'
      ? extractionRaw
      : ocr === 'ollama'
        ? 'json'
        : 'mock';

  return { ocr, extraction };
}

export function resolveOllamaConfig(
  env: NodeJS.ProcessEnv = process.env,
): OllamaConfig {
  const baseUrl =
    env.OLLAMA_BASE_URL?.trim().replace(/\/+$/, '') || DEFAULT_OLLAMA_BASE_URL;
  const model = env.OLLAMA_MODEL?.trim() || DEFAULT_OLLAMA_MODEL;
  const timeoutParsed = Number(env.OLLAMA_TIMEOUT_MS);
  const timeoutMs =
    Number.isFinite(timeoutParsed) && timeoutParsed > 0
      ? timeoutParsed
      : DEFAULT_TIMEOUT_MS;

  return { baseUrl, model, timeoutMs };
}

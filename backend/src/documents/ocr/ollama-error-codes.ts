/** Stable machine-readable codes for frontend i18n mapping. */
export const OllamaErrorCode = {
  NOT_RUNNING: 'OLLAMA_NOT_RUNNING',
  MODEL_NOT_INSTALLED: 'OLLAMA_MODEL_NOT_INSTALLED',
  INVALID_JSON: 'OLLAMA_INVALID_JSON',
  PDF_UNSUPPORTED: 'OLLAMA_PDF_UNSUPPORTED',
  REQUEST_FAILED: 'OLLAMA_REQUEST_FAILED',
  EMPTY_RESPONSE: 'OLLAMA_EMPTY_RESPONSE',
  TIMEOUT: 'OLLAMA_TIMEOUT',
} as const;

export type OllamaErrorCode =
  (typeof OllamaErrorCode)[keyof typeof OllamaErrorCode];

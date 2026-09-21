import {
  BadGatewayException,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { OcrInput, OcrResult, OcrService } from './ocr.interface.js';
import { resolveOllamaConfig, type OllamaConfig } from './ollama-config.js';
import { OllamaErrorCode } from './ollama-error-codes.js';

const VISION_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
]);

export const OLLAMA_VISION_PROMPT = `You are a document data extractor for receipts and invoices.
Extract ONLY information that is clearly visible in the document image.
Never invent, guess, or calculate values that are not explicitly shown.
If a field cannot be determined from the document, return null for that field.
Do not calculate VAT or totals unless the value is printed on the document.
Preserve original values when possible.
Return valid JSON only — no markdown, no commentary.

JSON schema:
{
  "type": "EXPENSE" | "INCOME" | null,
  "amount": number | null,
  "vatAmount": number | null,
  "date": "YYYY-MM-DD" | null,
  "supplier": string | null,
  "customer": string | null,
  "documentNumber": string | null,
  "category": string | null,
  "description": string | null,
  "currency": string | null,
  "paymentMethod": string | null
}

Rules for type:
- EXPENSE for invoices, receipts, purchase documents
- INCOME for customer payments / revenue documents
- null if unclear`;

type OllamaChatResponse = {
  message?: { content?: string };
  error?: string;
};

type FetchLike = typeof fetch;

@Injectable()
export class OllamaVisionService implements OcrService {
  private readonly logger = new Logger(OllamaVisionService.name);
  private config: OllamaConfig;
  private fetchImpl: FetchLike;

  /**
   * Nest DI requires a zero-arg constructor. Unit tests use {@link create}.
   */
  constructor() {
    this.config = resolveOllamaConfig();
    this.fetchImpl = fetch;
  }

  /** Build an instance with overrides (unit tests / manual wiring). */
  static create(
    config?: Partial<OllamaConfig>,
    fetchImpl: FetchLike = fetch,
  ): OllamaVisionService {
    const service = new OllamaVisionService();
    const resolved = resolveOllamaConfig();
    service.config = {
      baseUrl: config?.baseUrl ?? resolved.baseUrl,
      model: config?.model ?? resolved.model,
      timeoutMs: config?.timeoutMs ?? resolved.timeoutMs,
    };
    service.fetchImpl = fetchImpl;
    return service;
  }

  async extractText(input: OcrInput): Promise<OcrResult> {
    if (!input.buffer?.length) {
      throw new BadGatewayException(OllamaErrorCode.EMPTY_RESPONSE);
    }

    const mime = (input.mimeType ?? '').toLowerCase();
    if (mime === 'application/pdf') {
      // MVP: vision models need images. Keep PDF upload/storage working via mock,
      // but fail clearly when using Ollama so users switch to JPG/PNG.
      throw new BadGatewayException(OllamaErrorCode.PDF_UNSUPPORTED);
    }

    if (!VISION_MIME_TYPES.has(mime)) {
      throw new BadGatewayException(OllamaErrorCode.REQUEST_FAILED);
    }

    this.logger.log(
      `[SCAN] Ollama extraction started model=${this.config.model}`,
    );

    const imageBase64 = input.buffer.toString('base64');
    const url = `${this.config.baseUrl}/api/chat`;

    let response: Response;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        this.config.timeoutMs,
      );
      try {
        response = await this.fetchImpl(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            model: this.config.model,
            stream: false,
            format: 'json',
            messages: [
              {
                role: 'user',
                content: OLLAMA_VISION_PROMPT,
                images: [imageBase64],
              },
            ],
          }),
        });
      } finally {
        clearTimeout(timeout);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const name = error instanceof Error ? error.name : '';
      this.logger.error(`[SCAN] Ollama request failed: ${message}`);

      const timedOut =
        name === 'AbortError' ||
        /aborted|abort|timeout|timed out/i.test(message);
      if (timedOut) {
        throw new BadGatewayException(OllamaErrorCode.TIMEOUT);
      }

      throw new BadGatewayException(OllamaErrorCode.NOT_RUNNING);
    }

    if (!response.ok) {
      const bodyText = await response.text().catch(() => '');
      this.logger.error(
        `[SCAN] Ollama HTTP ${response.status} (body length=${bodyText.length})`,
      );

      if (
        response.status === 404 ||
        /model .+ not found/i.test(bodyText) ||
        /file does not exist/i.test(bodyText)
      ) {
        throw new BadGatewayException(OllamaErrorCode.MODEL_NOT_INSTALLED);
      }

      throw new BadGatewayException(OllamaErrorCode.REQUEST_FAILED);
    }

    let payload: OllamaChatResponse;
    try {
      payload = (await response.json()) as OllamaChatResponse;
    } catch {
      throw new BadGatewayException(OllamaErrorCode.INVALID_JSON);
    }

    if (payload.error) {
      if (/not found|file does not exist/i.test(payload.error)) {
        throw new BadGatewayException(OllamaErrorCode.MODEL_NOT_INSTALLED);
      }
      this.logger.error('[SCAN] Ollama returned an error payload');
      throw new BadGatewayException(OllamaErrorCode.REQUEST_FAILED);
    }

    const content = payload.message?.content?.trim() ?? '';
    if (!content) {
      throw new BadGatewayException(OllamaErrorCode.EMPTY_RESPONSE);
    }

    this.logger.log(
      `[SCAN] Ollama extraction completed contentLength=${content.length}`,
    );

    // Return JSON text for JsonExtractionService — never invent demo values.
    return { text: content };
  }
}

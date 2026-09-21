import { Injectable, Logger } from '@nestjs/common';
import type {
  DocumentExtractionService,
  ExtractedDocumentData,
} from './extraction.interface.js';
import {
  mapVisionJsonToExtractedData,
  safeParseJsonObject,
} from './parse-vision-json.js';
import { validateExtractedDocumentData } from './validate-extracted-data.js';

/**
 * Parses structured JSON produced by a vision model (e.g. Ollama).
 * Does not call any external API — JSON parse + validate only.
 */
@Injectable()
export class JsonExtractionService implements DocumentExtractionService {
  private readonly logger = new Logger(JsonExtractionService.name);

  async extract(ocrText: string): Promise<ExtractedDocumentData> {
    this.logger.log('[SCAN] JSON extraction started');
    const raw = safeParseJsonObject(ocrText);
    const mapped = mapVisionJsonToExtractedData(raw);
    const validated = validateExtractedDocumentData(mapped);
    this.logger.log('[SCAN] Validation completed');
    return validated;
  }
}

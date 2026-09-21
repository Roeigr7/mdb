import { Injectable } from '@nestjs/common';
import type { OcrInput, OcrResult, OcrService } from './ocr.interface.js';

/**
 * Development/testing OCR stub. Returns deterministic sample text.
 * Runtime uses OllamaVisionService when OCR_PROVIDER / DOCUMENT_AI_PROVIDER is ollama.
 */
@Injectable()
export class MockOcrService implements OcrService {
  async extractText(input: OcrInput): Promise<OcrResult> {
    if (!input.buffer?.length) {
      throw new Error('Empty file buffer');
    }

    const sample = [
      'TAX INVOICE / קבלה',
      'Supplier: ABC Ltd',
      'Invoice No: INV-12345',
      'Date: 2026-09-20',
      'Description: Purchase of materials',
      'Category: Materials',
      'Amount: 1250.00',
      'VAT: 212.50',
      'Currency: ILS',
      'Payment Method: Credit Card',
      `Source file: ${input.originalName}`,
    ].join('\n');

    return {
      text: sample,
      confidence: 0.92,
    };
  }
}

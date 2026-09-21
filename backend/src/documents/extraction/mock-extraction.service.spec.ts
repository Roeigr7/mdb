import { describe, expect, it } from 'vitest';
import { MockExtractionService } from './mock-extraction.service.js';

describe('MockExtractionService', () => {
  const service = new MockExtractionService();

  it('extracts labeled fields from OCR text', async () => {
    const text = [
      'TAX INVOICE',
      'Supplier: ABC Ltd',
      'Invoice No: INV-12345',
      'Date: 2026-09-20',
      'Description: Purchase of materials',
      'Category: Materials',
      'Amount: 1250.00',
      'VAT: 212.50',
      'Currency: ILS',
    ].join('\n');

    const result = await service.extract(text);

    expect(result.type).toBe('EXPENSE');
    expect(result.supplier).toBe('ABC Ltd');
    expect(result.amount).toBe(1250);
    expect(result.vatAmount).toBe(212.5);
    expect(result.date).toBe('2026-09-20');
    expect(result.documentNumber).toBe('INV-12345');
    expect(result.category).toBe('Materials');
    expect(result.description).toBe('Purchase of materials');
    expect(result.currency).toBe('ILS');
  });

  it('returns null for fields that are not present', async () => {
    const result = await service.extract('Hello world with no invoice fields');

    expect(result.amount).toBeNull();
    expect(result.supplier).toBeNull();
    expect(result.vatAmount).toBeNull();
    expect(result.date).toBeNull();
  });
});

import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { validateExtractedDocumentData } from './validate-extracted-data.js';

describe('validateExtractedDocumentData', () => {
  it('accepts a complete valid payload', () => {
    const result = validateExtractedDocumentData({
      type: 'EXPENSE',
      supplier: 'ABC Ltd',
      amount: 1250,
      vatAmount: 212.5,
      date: '2026-09-20',
      documentNumber: 'INV-12345',
      category: 'Materials',
      description: 'Purchase of materials',
      currency: 'ILS',
      paymentMethod: 'Credit Card',
      fieldConfidence: { amount: 0.9, date: 0.8 },
    });

    expect(result.amount).toBe(1250);
    expect(result.supplier).toBe('ABC Ltd');
    expect(result.fieldConfidence.amount).toBe(0.9);
  });

  it('keeps missing fields as null (does not invent values)', () => {
    const result = validateExtractedDocumentData({
      type: null,
      supplier: null,
      amount: 100,
      vatAmount: null,
      date: null,
      documentNumber: null,
      category: null,
      description: null,
      currency: null,
      paymentMethod: null,
    });

    expect(result.vatAmount).toBeNull();
    expect(result.date).toBeNull();
    expect(result.supplier).toBeNull();
  });

  it('rejects invalid type values', () => {
    expect(() =>
      validateExtractedDocumentData({
        type: 'OTHER',
        supplier: null,
        amount: 10,
        vatAmount: null,
        date: null,
        documentNumber: null,
        category: null,
        description: null,
        currency: null,
        paymentMethod: null,
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects non-positive amounts when present', () => {
    expect(() =>
      validateExtractedDocumentData({
        type: 'EXPENSE',
        supplier: null,
        amount: 0,
        vatAmount: null,
        date: null,
        documentNumber: null,
        category: null,
        description: null,
        currency: null,
        paymentMethod: null,
      }),
    ).toThrow(/amount/i);
  });

  it('rejects invalid date format', () => {
    expect(() =>
      validateExtractedDocumentData({
        type: 'EXPENSE',
        supplier: null,
        amount: 10,
        vatAmount: null,
        date: '20/09/2026',
        documentNumber: null,
        category: null,
        description: null,
        currency: null,
        paymentMethod: null,
      }),
    ).toThrow(/date/i);
  });
});

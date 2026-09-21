import { describe, expect, it } from 'vitest';
import {
  isLowConfidence,
  validateReviewForm,
  validateScanFile,
} from './scanDocumentHelpers';

describe('validateScanFile', () => {
  it('accepts jpeg under size limit', () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'a.jpg', {
      type: 'image/jpeg',
    });
    expect(validateScanFile(file)).toBeNull();
  });

  it('rejects missing file', () => {
    expect(validateScanFile(null)).toBe('missing');
  });

  it('rejects unsupported types', () => {
    const file = new File(['x'], 'a.exe', { type: 'application/octet-stream' });
    expect(validateScanFile(file)).toBe('unsupported');
  });

  it('rejects oversized files', () => {
    const big = new File([new Uint8Array(11 * 1024 * 1024)], 'big.pdf', {
      type: 'application/pdf',
    });
    expect(validateScanFile(big)).toBe('tooLarge');
  });
});

describe('validateReviewForm', () => {
  it('requires description, amount and date', () => {
    expect(
      validateReviewForm({
        type: 'EXPENSE',
        supplier: '',
        amount: '',
        vatAmount: '',
        date: '',
        documentNumber: '',
        category: '',
        description: '',
      }),
    ).toBe('descriptionRequired');

    expect(
      validateReviewForm({
        type: 'EXPENSE',
        supplier: '',
        amount: '0',
        vatAmount: '',
        date: '2026-09-20',
        documentNumber: '',
        category: '',
        description: 'Ok',
      }),
    ).toBe('amountInvalid');
  });

  it('accepts a valid review payload', () => {
    expect(
      validateReviewForm({
        type: 'EXPENSE',
        supplier: 'ABC',
        amount: '1250',
        vatAmount: '212.5',
        date: '2026-09-20',
        documentNumber: 'INV-1',
        category: 'Materials',
        description: 'Purchase',
      }),
    ).toBeNull();
  });
});

describe('isLowConfidence', () => {
  it('flags values below threshold', () => {
    expect(isLowConfidence(0.5)).toBe(true);
    expect(isLowConfidence(0.9)).toBe(false);
    expect(isLowConfidence(undefined)).toBe(false);
  });
});

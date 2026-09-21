import { BadRequestException } from '@nestjs/common';
import type {
  ExtractedDocumentData,
  ExtractedTransactionType,
  FieldConfidenceMap,
} from './extraction.interface.js';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== 'string') {
    throw new BadRequestException('Invalid extracted data: expected string or null');
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function optionalNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new BadRequestException('Invalid extracted data: expected number or null');
  }
  return value;
}

function optionalType(value: unknown): ExtractedTransactionType | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (value === 'EXPENSE' || value === 'INCOME') {
    return value;
  }
  throw new BadRequestException(
    'Invalid extracted data: type must be EXPENSE, INCOME, or null',
  );
}

function optionalConfidence(value: unknown): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) {
    throw new BadRequestException(
      'Invalid extracted data: confidence must be a number between 0 and 1',
    );
  }
  return value;
}

function validateFieldConfidence(value: unknown): FieldConfidenceMap {
  if (value === undefined || value === null) {
    return {};
  }
  if (!isPlainObject(value)) {
    throw new BadRequestException('Invalid extracted data: fieldConfidence');
  }

  const keys = [
    'type',
    'supplier',
    'amount',
    'vatAmount',
    'date',
    'documentNumber',
    'category',
    'description',
    'currency',
    'paymentMethod',
  ] as const;

  const result: FieldConfidenceMap = {};
  for (const key of keys) {
    const conf = optionalConfidence(value[key]);
    if (conf !== undefined) {
      result[key] = conf;
    }
  }
  return result;
}

/**
 * Validates AI/OCR extraction output. Never invents missing values —
 * missing fields must be null.
 */
export function validateExtractedDocumentData(
  raw: unknown,
): ExtractedDocumentData {
  if (!isPlainObject(raw)) {
    throw new BadRequestException('Invalid extracted data payload');
  }

  const date = optionalString(raw.date);
  if (date !== null && !ISO_DATE_RE.test(date)) {
    throw new BadRequestException(
      'Invalid extracted data: date must be YYYY-MM-DD or null',
    );
  }

  const amount = optionalNumber(raw.amount);
  if (amount !== null && amount <= 0) {
    throw new BadRequestException(
      'Invalid extracted data: amount must be greater than 0 when present',
    );
  }

  const vatAmount = optionalNumber(raw.vatAmount);
  if (vatAmount !== null && vatAmount < 0) {
    throw new BadRequestException(
      'Invalid extracted data: vatAmount cannot be negative',
    );
  }

  return {
    type: optionalType(raw.type),
    supplier: optionalString(raw.supplier),
    amount,
    vatAmount,
    date,
    documentNumber: optionalString(raw.documentNumber),
    category: optionalString(raw.category),
    description: optionalString(raw.description),
    currency: optionalString(raw.currency),
    paymentMethod: optionalString(raw.paymentMethod),
    fieldConfidence: validateFieldConfidence(raw.fieldConfidence),
  };
}

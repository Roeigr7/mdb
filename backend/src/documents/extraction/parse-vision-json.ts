import { BadGatewayException } from '@nestjs/common';
import { OllamaErrorCode } from '../ocr/ollama-error-codes.js';
import type {
  ExtractedDocumentData,
  ExtractedTransactionType,
  FieldConfidenceMap,
} from './extraction.interface.js';

/**
 * Strip markdown fences and extract the first JSON object from model output.
 */
export function extractJsonObjectText(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new BadGatewayException(OllamaErrorCode.EMPTY_RESPONSE);
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? trimmed).trim();

  if (candidate.startsWith('{') && candidate.endsWith('}')) {
    return candidate;
  }

  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return candidate.slice(start, end + 1);
  }

  throw new BadGatewayException(OllamaErrorCode.INVALID_JSON);
}

export function safeParseJsonObject(raw: string): Record<string, unknown> {
  let text: string;
  try {
    text = extractJsonObjectText(raw);
  } catch (error) {
    if (
      error instanceof BadGatewayException &&
      error.message === OllamaErrorCode.EMPTY_RESPONSE
    ) {
      throw error;
    }
    throw new BadGatewayException(OllamaErrorCode.INVALID_JSON);
  }

  try {
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new BadGatewayException(OllamaErrorCode.INVALID_JSON);
    }
    return parsed as Record<string, unknown>;
  } catch (error) {
    if (error instanceof BadGatewayException) {
      throw error;
    }
    throw new BadGatewayException(OllamaErrorCode.INVALID_JSON);
  }
}

function normalizeType(value: unknown): ExtractedTransactionType | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim().toUpperCase();
  if (
    normalized === 'EXPENSE' ||
    normalized === 'INVOICE' ||
    normalized === 'RECEIPT'
  ) {
    return 'EXPENSE';
  }
  if (
    normalized === 'INCOME' ||
    normalized === 'REVENUE' ||
    normalized === 'PAYMENT'
  ) {
    return 'INCOME';
  }
  // Common lowercase from models
  const lower = value.trim().toLowerCase();
  if (lower === 'expense' || lower === 'invoice' || lower === 'receipt') {
    return 'EXPENSE';
  }
  if (lower === 'income' || lower === 'revenue' || lower === 'payment') {
    return 'INCOME';
  }
  return null;
}

function normalizeNullableString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed || /^null$/i.test(trimmed) || trimmed === 'N/A') {
    return null;
  }
  return trimmed;
}

function normalizeNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.,-]/g, '').replace(/,/g, '');
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeDate(value: unknown): string | null {
  const asString = normalizeNullableString(value);
  if (!asString) return null;

  const iso = asString.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1] ?? null;

  const dmy = asString.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (dmy) {
    const day = dmy[1]!.padStart(2, '0');
    const month = dmy[2]!.padStart(2, '0');
    const year = dmy[3]!;
    return `${year}-${month}-${day}`;
  }

  return null;
}

function normalizeFieldConfidence(value: unknown): FieldConfidenceMap {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {};
  }
  const source = value as Record<string, unknown>;
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
    const conf = source[key];
    if (typeof conf === 'number' && Number.isFinite(conf) && conf >= 0 && conf <= 1) {
      result[key] = conf;
    }
  }
  return result;
}

/**
 * Map raw vision/LLM JSON into ExtractedDocumentData shape (pre-validation).
 * Missing / inventable fields become null — never invented.
 */
export function mapVisionJsonToExtractedData(
  raw: Record<string, unknown>,
): Omit<ExtractedDocumentData, never> {
  // Prefer supplier; fall back to customer for income docs without inventing.
  const supplier =
    normalizeNullableString(raw.supplier) ??
    normalizeNullableString(raw.customer);

  return {
    type: normalizeType(raw.type),
    supplier,
    amount: normalizeNullableNumber(raw.amount),
    vatAmount: normalizeNullableNumber(raw.vatAmount),
    date: normalizeDate(raw.date),
    documentNumber: normalizeNullableString(raw.documentNumber),
    category: normalizeNullableString(raw.category),
    description: normalizeNullableString(raw.description),
    currency: normalizeNullableString(raw.currency),
    paymentMethod: normalizeNullableString(raw.paymentMethod),
    fieldConfidence: normalizeFieldConfidence(raw.fieldConfidence),
  };
}

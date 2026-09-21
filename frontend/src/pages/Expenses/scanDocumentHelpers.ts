export const ALLOWED_SCAN_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'application/pdf',
]);

export const ALLOWED_SCAN_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.pdf',
]);

export const MAX_SCAN_FILE_BYTES = 10 * 1024 * 1024;

export type ScanClientErrorCode =
  | 'missing'
  | 'tooLarge'
  | 'unsupported'
  | 'invalidName';

export function getFileExtension(fileName: string): string {
  const idx = fileName.lastIndexOf('.');
  if (idx < 0) return '';
  return fileName.slice(idx).toLowerCase();
}

export function validateScanFile(file: File | null | undefined): ScanClientErrorCode | null {
  if (!file) return 'missing';
  if (file.size <= 0) return 'unsupported';
  if (file.size > MAX_SCAN_FILE_BYTES) return 'tooLarge';

  const name = file.name || '';
  if (name.includes('..') || name.includes('/') || name.includes('\\')) {
    return 'invalidName';
  }

  const extension = getFileExtension(name);
  if (!ALLOWED_SCAN_EXTENSIONS.has(extension)) {
    return 'unsupported';
  }

  if (file.type && !ALLOWED_SCAN_MIME_TYPES.has(file.type)) {
    return 'unsupported';
  }

  return null;
}

export const LOW_CONFIDENCE_THRESHOLD = 0.7;

export function isLowConfidence(value: number | undefined): boolean {
  if (value === undefined) return false;
  return value < LOW_CONFIDENCE_THRESHOLD;
}

export type ReviewFormValues = {
  type: 'EXPENSE' | 'INCOME';
  supplier: string;
  amount: string;
  vatAmount: string;
  date: string;
  documentNumber: string;
  category: string;
  description: string;
};

export function toDateInputValue(isoOrDate: string | null | undefined): string {
  if (!isoOrDate) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrDate)) return isoOrDate;
  const date = new Date(isoOrDate);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function toIsoDate(dateInput: string): string {
  return new Date(`${dateInput}T00:00:00.000Z`).toISOString();
}

export type ReviewValidationError =
  | 'descriptionRequired'
  | 'amountInvalid'
  | 'vatInvalid'
  | 'dateRequired';

export function validateReviewForm(
  values: ReviewFormValues,
): ReviewValidationError | null {
  if (!values.description.trim()) {
    return 'descriptionRequired';
  }
  const amount = Number(values.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return 'amountInvalid';
  }
  if (values.vatAmount.trim()) {
    const vat = Number(values.vatAmount);
    if (!Number.isFinite(vat) || vat < 0) {
      return 'vatInvalid';
    }
  }
  if (!values.date) {
    return 'dateRequired';
  }
  return null;
}

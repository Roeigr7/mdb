import { Injectable } from '@nestjs/common';
import type {
  DocumentExtractionService,
  ExtractedDocumentData,
  ExtractedTransactionType,
} from './extraction.interface.js';
import { validateExtractedDocumentData } from './validate-extracted-data.js';

function matchLabel(text: string, labels: string[]): string | null {
  for (const label of labels) {
    const re = new RegExp(`${label}\\s*[:：]\\s*(.+)`, 'i');
    const match = text.match(re);
    if (match?.[1]) {
      return match[1].trim().split('\n')[0]?.trim() ?? null;
    }
  }
  return null;
}

function parseAmount(raw: string | null): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d.,-]/g, '').replace(',', '');
  const value = Number(cleaned);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function parseDate(raw: string | null): string | null {
  if (!raw) return null;
  const iso = raw.match(/(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1] ?? null;
  const dmy = raw.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/);
  if (dmy) {
    const day = dmy[1]!.padStart(2, '0');
    const month = dmy[2]!.padStart(2, '0');
    const year = dmy[3]!;
    return `${year}-${month}-${day}`;
  }
  return null;
}

function inferType(text: string): ExtractedTransactionType | null {
  const lower = text.toLowerCase();
  if (
    lower.includes('income') ||
    lower.includes('הכנסה') ||
    lower.includes('תשלום מלקוח')
  ) {
    return 'INCOME';
  }
  if (
    lower.includes('expense') ||
    lower.includes('invoice') ||
    lower.includes('קבלה') ||
    lower.includes('חשבונית') ||
    lower.includes('הוצאה')
  ) {
    return 'EXPENSE';
  }
  return null;
}

/**
 * Development/testing extraction stub.
 * Parses labeled fields from OCR text; missing labels stay null.
 */
@Injectable()
export class MockExtractionService implements DocumentExtractionService {
  async extract(ocrText: string): Promise<ExtractedDocumentData> {
    const supplier = matchLabel(ocrText, [
      'Supplier',
      'Vendor',
      'ספק',
      'Customer',
      'לקוח',
    ]);
    const amount = parseAmount(
      matchLabel(ocrText, ['Amount', 'Total', 'סכום', 'סה"כ', 'סה״כ']),
    );
    const vatAmount = parseAmount(
      matchLabel(ocrText, ['VAT', 'Vat', 'מע"מ', 'מע״מ']),
    );
    const date = parseDate(
      matchLabel(ocrText, ['Date', 'תאריך']),
    );
    const documentNumber = matchLabel(ocrText, [
      'Invoice No',
      'Invoice Number',
      'Document Number',
      'מספר חשבונית',
      'מספר מסמך',
    ]);
    const category = matchLabel(ocrText, ['Category', 'קטגוריה']);
    const description = matchLabel(ocrText, [
      'Description',
      'תיאור',
    ]);
    const currency = matchLabel(ocrText, ['Currency', 'מטבע']);
    const paymentMethod = matchLabel(ocrText, [
      'Payment Method',
      'אמצעי תשלום',
    ]);

    const candidate = {
      type: inferType(ocrText),
      supplier,
      amount,
      vatAmount,
      date,
      documentNumber,
      category,
      description,
      currency,
      paymentMethod,
      fieldConfidence: {
        type: inferType(ocrText) ? 0.7 : undefined,
        supplier: supplier ? 0.85 : undefined,
        amount: amount ? 0.9 : undefined,
        vatAmount: vatAmount ? 0.8 : undefined,
        date: date ? 0.88 : undefined,
        documentNumber: documentNumber ? 0.86 : undefined,
        category: category ? 0.75 : undefined,
        description: description ? 0.8 : undefined,
        currency: currency ? 0.9 : undefined,
        paymentMethod: paymentMethod ? 0.7 : undefined,
      },
    };

    return validateExtractedDocumentData(candidate);
  }
}

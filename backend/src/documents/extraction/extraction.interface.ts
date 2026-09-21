export const DOCUMENT_EXTRACTION = Symbol('DOCUMENT_EXTRACTION');

export type ExtractedTransactionType = 'EXPENSE' | 'INCOME';

export type FieldConfidenceMap = {
  type?: number;
  supplier?: number;
  amount?: number;
  vatAmount?: number;
  date?: number;
  documentNumber?: number;
  category?: number;
  description?: number;
  currency?: number;
  paymentMethod?: number;
};

export type ExtractedDocumentData = {
  type: ExtractedTransactionType | null;
  supplier: string | null;
  amount: number | null;
  vatAmount: number | null;
  date: string | null;
  documentNumber: string | null;
  category: string | null;
  description: string | null;
  currency: string | null;
  paymentMethod: string | null;
  fieldConfidence: FieldConfidenceMap;
};

export interface DocumentExtractionService {
  extract(ocrText: string): Promise<ExtractedDocumentData>;
}

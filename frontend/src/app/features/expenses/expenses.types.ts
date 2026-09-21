export type TransactionSource = 'MANUAL' | 'SCANNED' | 'IMPORTED';

export type Expense = {
  id: number;
  description: string;
  category: string | null;
  amount: number;
  vatAmount: number | null;
  date: string;
  supplier: string | null;
  documentNumber: string | null;
  documentUrl: string | null;
  currency: string | null;
  paymentMethod: string | null;
  source: TransactionSource;
  projectId: number;
  documentId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AmountListSummary = {
  count: number;
  totalAmount: number;
  thisMonthAmount: number;
};

export type PaginatedExpenses = {
  data: Expense[];
  meta: PaginationMeta;
  summary: AmountListSummary;
};

export const EXPENSES_PAGE_SIZE = 10;

export type CreateExpenseRequest = {
  description: string;
  category?: string;
  amount: number;
  vatAmount?: number | null;
  date: string;
  supplier?: string | null;
  documentNumber?: string | null;
  documentUrl?: string | null;
  currency?: string | null;
  paymentMethod?: string | null;
  source?: TransactionSource;
  documentId?: number | null;
};

export type UpdateExpenseRequest = {
  description?: string;
  category?: string | null;
  amount?: number;
  vatAmount?: number | null;
  date?: string;
  supplier?: string | null;
  documentNumber?: string | null;
  documentUrl?: string | null;
  currency?: string | null;
  paymentMethod?: string | null;
  source?: TransactionSource;
  documentId?: number | null;
};

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

export type DocumentScanResult = {
  documentId: number;
  documentUrl: string;
  extractedData: ExtractedDocumentData;
  ocrConfidence?: number;
};

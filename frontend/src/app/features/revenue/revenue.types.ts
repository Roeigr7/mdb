export type RevenueStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export type TransactionSource = 'MANUAL' | 'SCANNED' | 'IMPORTED';

export type Revenue = {
  id: number;
  description: string;
  customer: string | null;
  amount: number;
  vatAmount: number | null;
  date: string;
  status: RevenueStatus;
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

export type PaginatedRevenue = {
  data: Revenue[];
  meta: PaginationMeta;
  summary: AmountListSummary;
};

export const REVENUE_PAGE_SIZE = 10;

export type CreateRevenueRequest = {
  description: string;
  customer?: string;
  amount: number;
  vatAmount?: number | null;
  date: string;
  status: RevenueStatus;
  documentNumber?: string | null;
  documentUrl?: string | null;
  currency?: string | null;
  paymentMethod?: string | null;
  source?: TransactionSource;
  documentId?: number | null;
};

export type UpdateRevenueRequest = {
  description?: string;
  customer?: string | null;
  amount?: number;
  vatAmount?: number | null;
  date?: string;
  status?: RevenueStatus;
  documentNumber?: string | null;
  documentUrl?: string | null;
  currency?: string | null;
  paymentMethod?: string | null;
  source?: TransactionSource;
  documentId?: number | null;
};

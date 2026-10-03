export type Supplier = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedSuppliersResponse = {
  data: Supplier[];
  meta: PaginationMeta;
};

export type GetSuppliersQuery = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
};

export type CreateSupplierRequest = {
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
};

export type UpdateSupplierRequest = {
  name?: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
};

export type MessageResponse = {
  message: string;
};

export type Material = {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  supplier: string | null;
  projectId: number;
  cost: number;
  createdAt: string;
  updatedAt: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type MaterialsListSummary = {
  count: number;
  totalCost: number;
};

export type PaginatedMaterials = {
  data: Material[];
  meta: PaginationMeta;
  summary: MaterialsListSummary;
};

export const MATERIALS_PAGE_SIZE = 10;

export type CreateMaterialRequest = {
  name: string;
  quantity: number;
  unitPrice: number;
  supplier?: string;
};

export type UpdateMaterialRequest = {
  name?: string;
  quantity?: number;
  unitPrice?: number;
  supplier?: string | null;
};

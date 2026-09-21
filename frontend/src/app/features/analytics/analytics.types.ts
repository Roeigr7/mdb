export type AnalyticsSummary = {
  totalExpenses: number;
  totalRevenue: number;
  totalMaterialsCost: number;
  netProfit: number;
  expenseCount: number;
  revenueCount: number;
  materialsCount: number;
};

export type MonthlyCashflowPoint = {
  month: string;
  expenses: number;
  revenue: number;
};

export type NamedAmount = {
  label: string;
  amount: number;
};

export type ProjectBreakdown = {
  projectId: number;
  projectName: string;
  expenses: number;
  revenue: number;
  materialsCost: number;
};

export type AnalyticsOverview = {
  summary: AnalyticsSummary;
  monthlyCashflow: MonthlyCashflowPoint[];
  expensesByCategory: NamedAmount[];
  revenueByStatus: NamedAmount[];
  topMaterials: NamedAmount[];
  projectBreakdown: ProjectBreakdown[];
};

import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

type MonthBucket = {
  month: string;
  expenses: number;
  revenue: number;
};

type NamedAmount = {
  label: string;
  amount: number;
};

type ProjectBreakdown = {
  projectId: number;
  projectName: string;
  expenses: number;
  revenue: number;
  materialsCost: number;
};

function emptyOverview() {
  return {
    summary: {
      totalExpenses: 0,
      totalRevenue: 0,
      totalMaterialsCost: 0,
      netProfit: 0,
      expenseCount: 0,
      revenueCount: 0,
      materialsCount: 0,
    },
    monthlyCashflow: buildEmptyMonths(12),
    expensesByCategory: [] as NamedAmount[],
    revenueByStatus: [] as NamedAmount[],
    topMaterials: [] as NamedAmount[],
    projectBreakdown: [] as ProjectBreakdown[],
  };
}

function buildEmptyMonths(count: number, now = new Date()): MonthBucket[] {
  const months: MonthBucket[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months.push({ month, expenses: 0, revenue: 0 });
  }
  return months;
}

function toNumber(value: unknown): number {
  if (value == null) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: number, projectId?: number) {
    const projects = await this.prisma.project.findMany({
      where: {
        userId,
        ...(projectId != null ? { id: projectId } : {}),
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    if (projectId != null && projects.length === 0) {
      throw new NotFoundException(`Project with id ${projectId} not found`);
    }

    if (projects.length === 0) {
      return emptyOverview();
    }

    const projectIds = projects.map((project) => project.id);
    const months = buildEmptyMonths(12);
    const rangeStart = new Date(
      Number(months[0].month.slice(0, 4)),
      Number(months[0].month.slice(5, 7)) - 1,
      1,
    );

    const [
      expenseSum,
      revenueSum,
      expenseCount,
      revenueCount,
      materialsCount,
      materialsCostRows,
      monthlyExpenses,
      monthlyRevenue,
      categoryRows,
      statusRows,
      topMaterialRows,
      projectExpenseRows,
      projectRevenueRows,
      projectMaterialRows,
    ] = await Promise.all([
      this.prisma.expense.aggregate({
        where: { projectId: { in: projectIds } },
        _sum: { amount: true },
      }),
      this.prisma.revenue.aggregate({
        where: { projectId: { in: projectIds } },
        _sum: { amount: true },
      }),
      this.prisma.expense.count({
        where: { projectId: { in: projectIds } },
      }),
      this.prisma.revenue.count({
        where: { projectId: { in: projectIds } },
      }),
      this.prisma.material.count({
        where: { projectId: { in: projectIds } },
      }),
      this.prisma.$queryRaw<Array<{ total: number }>>(
        Prisma.sql`
          SELECT COALESCE(SUM(quantity * "unitPrice"), 0)::float AS total
          FROM "Material"
          WHERE "projectId" IN (${Prisma.join(projectIds)})
        `,
      ),
      this.prisma.$queryRaw<Array<{ month: string; total: number }>>(
        Prisma.sql`
          SELECT to_char(date_trunc('month', date), 'YYYY-MM') AS month,
                 COALESCE(SUM(amount), 0)::float AS total
          FROM "Expense"
          WHERE "projectId" IN (${Prisma.join(projectIds)})
            AND date >= ${rangeStart}
          GROUP BY 1
          ORDER BY 1
        `,
      ),
      this.prisma.$queryRaw<Array<{ month: string; total: number }>>(
        Prisma.sql`
          SELECT to_char(date_trunc('month', date), 'YYYY-MM') AS month,
                 COALESCE(SUM(amount), 0)::float AS total
          FROM "Revenue"
          WHERE "projectId" IN (${Prisma.join(projectIds)})
            AND date >= ${rangeStart}
          GROUP BY 1
          ORDER BY 1
        `,
      ),
      this.prisma.$queryRaw<Array<{ label: string; amount: number }>>(
        Prisma.sql`
          SELECT COALESCE(NULLIF(TRIM(category), ''), 'Uncategorized') AS label,
                 COALESCE(SUM(amount), 0)::float AS amount
          FROM "Expense"
          WHERE "projectId" IN (${Prisma.join(projectIds)})
          GROUP BY 1
          ORDER BY amount DESC
          LIMIT 8
        `,
      ),
      this.prisma.$queryRaw<Array<{ label: string; amount: number }>>(
        Prisma.sql`
          SELECT status::text AS label,
                 COALESCE(SUM(amount), 0)::float AS amount
          FROM "Revenue"
          WHERE "projectId" IN (${Prisma.join(projectIds)})
          GROUP BY 1
          ORDER BY amount DESC
        `,
      ),
      this.prisma.$queryRaw<Array<{ label: string; amount: number }>>(
        Prisma.sql`
          SELECT name AS label,
                 COALESCE(SUM(quantity * "unitPrice"), 0)::float AS amount
          FROM "Material"
          WHERE "projectId" IN (${Prisma.join(projectIds)})
          GROUP BY 1
          ORDER BY amount DESC
          LIMIT 8
        `,
      ),
      this.prisma.$queryRaw<Array<{ projectId: number; amount: number }>>(
        Prisma.sql`
          SELECT "projectId", COALESCE(SUM(amount), 0)::float AS amount
          FROM "Expense"
          WHERE "projectId" IN (${Prisma.join(projectIds)})
          GROUP BY 1
        `,
      ),
      this.prisma.$queryRaw<Array<{ projectId: number; amount: number }>>(
        Prisma.sql`
          SELECT "projectId", COALESCE(SUM(amount), 0)::float AS amount
          FROM "Revenue"
          WHERE "projectId" IN (${Prisma.join(projectIds)})
          GROUP BY 1
        `,
      ),
      this.prisma.$queryRaw<Array<{ projectId: number; amount: number }>>(
        Prisma.sql`
          SELECT "projectId",
                 COALESCE(SUM(quantity * "unitPrice"), 0)::float AS amount
          FROM "Material"
          WHERE "projectId" IN (${Prisma.join(projectIds)})
          GROUP BY 1
        `,
      ),
    ]);

    const expenseByMonth = new Map(
      monthlyExpenses.map((row) => [row.month, toNumber(row.total)]),
    );
    const revenueByMonth = new Map(
      monthlyRevenue.map((row) => [row.month, toNumber(row.total)]),
    );

    const monthlyCashflow = months.map((bucket) => ({
      month: bucket.month,
      expenses: expenseByMonth.get(bucket.month) ?? 0,
      revenue: revenueByMonth.get(bucket.month) ?? 0,
    }));

    const expenseMap = new Map(
      projectExpenseRows.map((row) => [row.projectId, toNumber(row.amount)]),
    );
    const revenueMap = new Map(
      projectRevenueRows.map((row) => [row.projectId, toNumber(row.amount)]),
    );
    const materialMap = new Map(
      projectMaterialRows.map((row) => [row.projectId, toNumber(row.amount)]),
    );

    const totalExpenses = toNumber(expenseSum._sum.amount);
    const totalRevenue = toNumber(revenueSum._sum.amount);
    const totalMaterialsCost = toNumber(materialsCostRows[0]?.total);

    return {
      summary: {
        totalExpenses,
        totalRevenue,
        totalMaterialsCost,
        netProfit: totalRevenue - totalExpenses,
        expenseCount,
        revenueCount,
        materialsCount,
      },
      monthlyCashflow,
      expensesByCategory: categoryRows.map((row) => ({
        label: row.label,
        amount: toNumber(row.amount),
      })),
      revenueByStatus: statusRows.map((row) => ({
        label: row.label,
        amount: toNumber(row.amount),
      })),
      topMaterials: topMaterialRows.map((row) => ({
        label: row.label,
        amount: toNumber(row.amount),
      })),
      projectBreakdown: projects.map((project) => ({
        projectId: project.id,
        projectName: project.name,
        expenses: expenseMap.get(project.id) ?? 0,
        revenue: revenueMap.get(project.id) ?? 0,
        materialsCost: materialMap.get(project.id) ?? 0,
      })),
    };
  }
}

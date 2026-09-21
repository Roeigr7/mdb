import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { AnalyticsService } from './analytics.service.js';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: {
    project: { findMany: ReturnType<typeof vi.fn> };
    expense: {
      aggregate: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
    };
    revenue: {
      aggregate: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
    };
    material: { count: ReturnType<typeof vi.fn> };
    $queryRaw: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    prisma = {
      project: { findMany: vi.fn() },
      expense: { aggregate: vi.fn(), count: vi.fn() },
      revenue: { aggregate: vi.fn(), count: vi.fn() },
      material: { count: vi.fn() },
      $queryRaw: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(AnalyticsService);
  });

  it('returns empty overview when user has no projects', async () => {
    prisma.project.findMany.mockResolvedValue([]);

    const result = await service.getOverview(1);

    expect(result.summary.totalExpenses).toBe(0);
    expect(result.monthlyCashflow).toHaveLength(12);
    expect(prisma.expense.aggregate).not.toHaveBeenCalled();
  });

  it('throws when a specific project is not owned', async () => {
    prisma.project.findMany.mockResolvedValue([]);

    await expect(service.getOverview(1, 99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('aggregates owned project analytics', async () => {
    prisma.project.findMany.mockResolvedValue([
      { id: 6, name: 'פרויקט1' },
    ]);
    prisma.expense.aggregate.mockResolvedValue({ _sum: { amount: 1000 } });
    prisma.revenue.aggregate.mockResolvedValue({ _sum: { amount: 2500 } });
    prisma.expense.count.mockResolvedValue(4);
    prisma.revenue.count.mockResolvedValue(2);
    prisma.material.count.mockResolvedValue(3);
    prisma.$queryRaw
      .mockResolvedValueOnce([{ total: 400 }])
      .mockResolvedValueOnce([{ month: '2026-09', total: 1000 }])
      .mockResolvedValueOnce([{ month: '2026-09', total: 2500 }])
      .mockResolvedValueOnce([{ label: 'Materials', amount: 1000 }])
      .mockResolvedValueOnce([{ label: 'PAID', amount: 2500 }])
      .mockResolvedValueOnce([{ label: 'ברזל', amount: 400 }])
      .mockResolvedValueOnce([{ projectId: 6, amount: 1000 }])
      .mockResolvedValueOnce([{ projectId: 6, amount: 2500 }])
      .mockResolvedValueOnce([{ projectId: 6, amount: 400 }]);

    const result = await service.getOverview(1, 6);

    expect(result.summary).toEqual({
      totalExpenses: 1000,
      totalRevenue: 2500,
      totalMaterialsCost: 400,
      netProfit: 1500,
      expenseCount: 4,
      revenueCount: 2,
      materialsCount: 3,
    });
    expect(result.expensesByCategory[0]).toEqual({
      label: 'Materials',
      amount: 1000,
    });
    expect(result.projectBreakdown).toEqual([
      {
        projectId: 6,
        projectName: 'פרויקט1',
        expenses: 1000,
        revenue: 2500,
        materialsCost: 400,
      },
    ]);
  });
});

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RevenueStatus } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RevenueService } from './revenue.service.js';

describe('RevenueService', () => {
  let service: RevenueService;
  let prisma: {
    project: {
      findFirst: ReturnType<typeof vi.fn>;
    };
    revenue: {
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      deleteMany: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
      aggregate: ReturnType<typeof vi.fn>;
    };
  };

  const userId = 1;
  const otherUserId = 2;
  const projectId = 10;

  const revenue = {
    id: 5,
    description: 'תשלום פרויקט',
    customer: 'לאסם',
    amount: 8500,
    vatAmount: null,
    date: new Date('2026-09-18T00:00:00.000Z'),
    status: RevenueStatus.PAID,
    documentNumber: null,
    documentUrl: null,
    currency: null,
    paymentMethod: null,
    source: 'MANUAL',
    projectId,
    documentId: null,
    createdAt: new Date('2026-09-18T00:00:00.000Z'),
    updatedAt: new Date('2026-09-18T00:00:00.000Z'),
  };

  beforeEach(async () => {
    prisma = {
      project: {
        findFirst: vi.fn(),
      },
      revenue: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        deleteMany: vi.fn(),
        count: vi.fn(),
        aggregate: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevenueService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(RevenueService);
  });

  describe('createRevenue', () => {
    it('creates a revenue record on a project owned by the user', async () => {
      prisma.project.findFirst.mockResolvedValue({ id: projectId });
      prisma.revenue.create.mockResolvedValue(revenue);

      const result = await service.createRevenue(
        projectId,
        {
          description: 'תשלום פרויקט',
          customer: 'לאסם',
          amount: 8500,
          date: '2026-09-18T00:00:00.000Z',
          status: RevenueStatus.PAID,
        },
        userId,
      );

      expect(prisma.revenue.create).toHaveBeenCalledWith({
        data: {
          description: 'תשלום פרויקט',
          customer: 'לאסם',
          amount: 8500,
          vatAmount: null,
          date: new Date('2026-09-18T00:00:00.000Z'),
          status: RevenueStatus.PAID,
          documentNumber: null,
          documentUrl: null,
          currency: null,
          paymentMethod: null,
          source: 'MANUAL',
          documentId: null,
          projectId,
        },
        select: expect.any(Object),
      });
      expect(result).toEqual(revenue);
    });

    it('throws NotFoundException when the project belongs to another user', async () => {
      prisma.project.findFirst.mockResolvedValue(null);

      await expect(
        service.createRevenue(
          projectId,
          {
            description: 'X',
            amount: 1,
            date: '2026-09-18T00:00:00.000Z',
            status: RevenueStatus.PENDING,
          },
          otherUserId,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.revenue.create).not.toHaveBeenCalled();
    });
  });

  describe('getRevenues', () => {
    it('lists only revenue for an owned project', async () => {
      prisma.project.findFirst.mockResolvedValue({ id: projectId });
      prisma.revenue.findMany.mockResolvedValue([revenue]);
      prisma.revenue.count.mockResolvedValue(1);
      prisma.revenue.aggregate.mockResolvedValue({ _sum: { amount: 8500 } });

      const result = await service.getRevenues(projectId, userId);

      expect(prisma.revenue.findMany).toHaveBeenCalledWith({
        where: { projectId },
        orderBy: { date: 'desc' },
        skip: 0,
        take: 10,
        select: expect.any(Object),
      });
      expect(result).toEqual({
        data: [revenue],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
        summary: {
          count: 1,
          totalAmount: 8500,
          thisMonthAmount: 8500,
        },
      });
    });
  });

  describe('getRevenue', () => {
    it('returns a revenue record scoped to the owned project', async () => {
      prisma.project.findFirst.mockResolvedValue({ id: projectId });
      prisma.revenue.findFirst.mockResolvedValue(revenue);

      await expect(
        service.getRevenue(projectId, revenue.id, userId),
      ).resolves.toEqual(revenue);
    });

    it('throws NotFoundException when the revenue is on another project', async () => {
      prisma.project.findFirst.mockResolvedValue({ id: projectId });
      prisma.revenue.findFirst.mockResolvedValue(null);

      await expect(
        service.getRevenue(projectId, 99, userId),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('updateRevenue', () => {
    it('updates a revenue record that belongs to the owned project', async () => {
      const updated = { ...revenue, status: RevenueStatus.PENDING };
      prisma.project.findFirst.mockResolvedValue({ id: projectId });
      prisma.revenue.findFirst.mockResolvedValue(revenue);
      prisma.revenue.update.mockResolvedValue(updated);

      const result = await service.updateRevenue(
        projectId,
        revenue.id,
        { status: RevenueStatus.PENDING },
        userId,
      );

      expect(result.status).toBe(RevenueStatus.PENDING);
    });

    it('throws NotFoundException when the revenue is not on the project', async () => {
      prisma.project.findFirst.mockResolvedValue({ id: projectId });
      prisma.revenue.findFirst.mockResolvedValue(null);

      await expect(
        service.updateRevenue(projectId, 99, { description: 'X' }, userId),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.revenue.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteRevenue', () => {
    it('deletes a revenue record scoped to the owned project', async () => {
      prisma.project.findFirst.mockResolvedValue({ id: projectId });
      prisma.revenue.deleteMany.mockResolvedValue({ count: 1 });

      await expect(
        service.deleteRevenue(projectId, revenue.id, userId),
      ).resolves.toEqual({ message: 'Revenue deleted successfully' });
    });

    it('throws NotFoundException when the revenue is missing', async () => {
      prisma.project.findFirst.mockResolvedValue({ id: projectId });
      prisma.revenue.deleteMany.mockResolvedValue({ count: 0 });

      await expect(
        service.deleteRevenue(projectId, 99, userId),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});

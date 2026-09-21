import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { ExpensesService } from './expenses.service.js';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let prisma: {
    project: {
      findFirst: ReturnType<typeof vi.fn>;
    };
    expense: {
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

  const expense = {
    id: 5,
    description: 'חומרי גלם',
    category: 'Materials',
    amount: 2500,
    vatAmount: null,
    date: new Date('2026-09-18T00:00:00.000Z'),
    supplier: null,
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
      expense: {
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
        ExpensesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ExpensesService);
  });

  describe('createExpense', () => {
    it('creates an expense on a project owned by the user', async () => {
      prisma.project.findFirst.mockResolvedValue({ id: projectId });
      prisma.expense.create.mockResolvedValue(expense);

      const result = await service.createExpense(
        projectId,
        {
          description: 'חומרי גלם',
          category: 'Materials',
          amount: 2500,
          date: '2026-09-18T00:00:00.000Z',
        },
        userId,
      );

      expect(prisma.project.findFirst).toHaveBeenCalledWith({
        where: { id: projectId, userId },
        select: { id: true },
      });
      expect(prisma.expense.create).toHaveBeenCalledWith({
        data: {
          description: 'חומרי גלם',
          category: 'Materials',
          amount: 2500,
          vatAmount: null,
          date: new Date('2026-09-18T00:00:00.000Z'),
          supplier: null,
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
      expect(result).toEqual(expense);
    });

    it('stores a null category when omitted', async () => {
      prisma.project.findFirst.mockResolvedValue({ id: projectId });
      prisma.expense.create.mockResolvedValue({ ...expense, category: null });

      await service.createExpense(
        projectId,
        {
          description: 'חומרי גלם',
          amount: 100,
          date: '2026-09-18T00:00:00.000Z',
        },
        userId,
      );

      expect(prisma.expense.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ category: null, projectId }),
        }),
      );
    });

    it('throws NotFoundException when the project belongs to another user', async () => {
      prisma.project.findFirst.mockResolvedValue(null);

      await expect(
        service.createExpense(
          projectId,
          {
            description: 'X',
            amount: 1,
            date: '2026-09-18T00:00:00.000Z',
          },
          otherUserId,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.expense.create).not.toHaveBeenCalled();
    });
  });

  describe('getExpenses', () => {
    it('lists only expenses for an owned project', async () => {
      prisma.project.findFirst.mockResolvedValue({ id: projectId });
      prisma.expense.findMany.mockResolvedValue([expense]);
      prisma.expense.count.mockResolvedValue(1);
      prisma.expense.aggregate.mockResolvedValue({ _sum: { amount: 2500 } });

      const result = await service.getExpenses(projectId, userId);

      expect(prisma.expense.findMany).toHaveBeenCalledWith({
        where: { projectId },
        orderBy: { date: 'desc' },
        skip: 0,
        take: 10,
        select: expect.any(Object),
      });
      expect(result).toEqual({
        data: [expense],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
        summary: {
          count: 1,
          totalAmount: 2500,
          thisMonthAmount: 2500,
        },
      });
    });

    it('throws NotFoundException for another user project', async () => {
      prisma.project.findFirst.mockResolvedValue(null);

      await expect(
        service.getExpenses(projectId, otherUserId),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.expense.findMany).not.toHaveBeenCalled();
    });
  });

  describe('getExpense', () => {
    it('returns an expense scoped to the owned project', async () => {
      prisma.project.findFirst.mockResolvedValue({ id: projectId });
      prisma.expense.findFirst.mockResolvedValue(expense);

      await expect(
        service.getExpense(projectId, expense.id, userId),
      ).resolves.toEqual(expense);

      expect(prisma.expense.findFirst).toHaveBeenCalledWith({
        where: { id: expense.id, projectId },
        select: expect.any(Object),
      });
    });

    it('throws NotFoundException when the expense is on another project', async () => {
      prisma.project.findFirst.mockResolvedValue({ id: projectId });
      prisma.expense.findFirst.mockResolvedValue(null);

      await expect(
        service.getExpense(projectId, 99, userId),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('updateExpense', () => {
    it('updates an expense that belongs to the owned project', async () => {
      const updated = { ...expense, amount: 3000 };
      prisma.project.findFirst.mockResolvedValue({ id: projectId });
      prisma.expense.findFirst.mockResolvedValue(expense);
      prisma.expense.update.mockResolvedValue(updated);

      const result = await service.updateExpense(
        projectId,
        expense.id,
        { amount: 3000 },
        userId,
      );

      expect(prisma.expense.findFirst).toHaveBeenCalledWith({
        where: { id: expense.id, projectId },
        select: expect.any(Object),
      });
      expect(result.amount).toBe(3000);
    });

    it('throws NotFoundException when the expense is not on the project', async () => {
      prisma.project.findFirst.mockResolvedValue({ id: projectId });
      prisma.expense.findFirst.mockResolvedValue(null);

      await expect(
        service.updateExpense(projectId, 99, { description: 'X' }, userId),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.expense.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteExpense', () => {
    it('deletes an expense scoped to the owned project', async () => {
      prisma.project.findFirst.mockResolvedValue({ id: projectId });
      prisma.expense.deleteMany.mockResolvedValue({ count: 1 });

      await expect(
        service.deleteExpense(projectId, expense.id, userId),
      ).resolves.toEqual({ message: 'Expense deleted successfully' });

      expect(prisma.expense.deleteMany).toHaveBeenCalledWith({
        where: { id: expense.id, projectId },
      });
    });

    it('throws NotFoundException when the expense is missing', async () => {
      prisma.project.findFirst.mockResolvedValue({ id: projectId });
      prisma.expense.deleteMany.mockResolvedValue({ count: 0 });

      await expect(
        service.deleteExpense(projectId, 99, userId),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request.js';
import { DocumentProcessingService } from '../documents/document-processing.service.js';
import { UserRole } from '../generated/prisma/client.js';
import { ExpensesController } from './expenses.controller.js';
import { ExpensesService } from './expenses.service.js';

describe('ExpensesController', () => {
  let controller: ExpensesController;
  let expensesService: {
    getExpenses: ReturnType<typeof vi.fn>;
    getExpense: ReturnType<typeof vi.fn>;
    createExpense: ReturnType<typeof vi.fn>;
    updateExpense: ReturnType<typeof vi.fn>;
    deleteExpense: ReturnType<typeof vi.fn>;
  };

  const req = {
    user: {
      sub: 7,
      email: 'roei@example.com',
      role: UserRole.USER,
    },
  } as AuthenticatedRequest;

  beforeEach(async () => {
    expensesService = {
      getExpenses: vi.fn(),
      getExpense: vi.fn(),
      createExpense: vi.fn(),
      updateExpense: vi.fn(),
      deleteExpense: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [
        { provide: ExpensesService, useValue: expensesService },
        {
          provide: DocumentProcessingService,
          useValue: { scanDocument: vi.fn() },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(ExpensesController);
  });

  it('getExpenses passes route projectId and req.user.sub', async () => {
    const response = {
      data: [{ id: 1, amount: 100 }],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      summary: { count: 1, totalAmount: 100, thisMonthAmount: 100 },
    };
    expensesService.getExpenses.mockResolvedValue(response);

    await expect(
      controller.getExpenses(4, { page: 1, limit: 10 }, req),
    ).resolves.toEqual(response);
    expect(expensesService.getExpenses).toHaveBeenCalledWith(4, 7, 1, 10);
  });

  it('getExpense passes projectId, expenseId, and req.user.sub', async () => {
    const response = { id: 3, amount: 100 };
    expensesService.getExpense.mockResolvedValue(response);

    await expect(controller.getExpense(4, 3, req)).resolves.toEqual(response);
    expect(expensesService.getExpense).toHaveBeenCalledWith(4, 3, 7);
  });

  it('createExpense uses the route projectId', async () => {
    const dto = {
      description: 'חומרי גלם',
      amount: 2500,
      date: '2026-09-18T00:00:00.000Z',
    };
    const created = { id: 1, ...dto, projectId: 4 };
    expensesService.createExpense.mockResolvedValue(created);

    await expect(controller.createExpense(4, dto, req)).resolves.toEqual(
      created,
    );
    expect(expensesService.createExpense).toHaveBeenCalledWith(4, dto, 7);
  });

  it('updateExpense passes projectId, expenseId, dto, and req.user.sub', async () => {
    const dto = { amount: 10 };
    expensesService.updateExpense.mockResolvedValue({ id: 3, amount: 10 });

    await expect(controller.updateExpense(4, 3, dto, req)).resolves.toEqual({
      id: 3,
      amount: 10,
    });
    expect(expensesService.updateExpense).toHaveBeenCalledWith(4, 3, dto, 7);
  });

  it('deleteExpense passes projectId, expenseId, and req.user.sub', async () => {
    expensesService.deleteExpense.mockResolvedValue({
      message: 'Expense deleted successfully',
    });

    await expect(controller.deleteExpense(4, 3, req)).resolves.toEqual({
      message: 'Expense deleted successfully',
    });
    expect(expensesService.deleteExpense).toHaveBeenCalledWith(4, 3, 7);
  });
});

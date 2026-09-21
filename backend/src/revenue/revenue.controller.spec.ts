import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request.js';
import { RevenueStatus, UserRole } from '../generated/prisma/client.js';
import { RevenueController } from './revenue.controller.js';
import { RevenueService } from './revenue.service.js';

describe('RevenueController', () => {
  let controller: RevenueController;
  let revenueService: {
    getRevenues: ReturnType<typeof vi.fn>;
    getRevenue: ReturnType<typeof vi.fn>;
    createRevenue: ReturnType<typeof vi.fn>;
    updateRevenue: ReturnType<typeof vi.fn>;
    deleteRevenue: ReturnType<typeof vi.fn>;
  };

  const req = {
    user: {
      sub: 7,
      email: 'roei@example.com',
      role: UserRole.USER,
    },
  } as AuthenticatedRequest;

  beforeEach(async () => {
    revenueService = {
      getRevenues: vi.fn(),
      getRevenue: vi.fn(),
      createRevenue: vi.fn(),
      updateRevenue: vi.fn(),
      deleteRevenue: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RevenueController],
      providers: [{ provide: RevenueService, useValue: revenueService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(RevenueController);
  });

  it('getRevenues passes route projectId and req.user.sub', async () => {
    const response = {
      data: [{ id: 1, amount: 100 }],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      summary: { count: 1, totalAmount: 100, thisMonthAmount: 100 },
    };
    revenueService.getRevenues.mockResolvedValue(response);

    await expect(
      controller.getRevenues(4, { page: 1, limit: 10 }, req),
    ).resolves.toEqual(response);
    expect(revenueService.getRevenues).toHaveBeenCalledWith(4, 7, 1, 10);
  });

  it('getRevenue passes projectId, revenueId, and req.user.sub', async () => {
    const response = { id: 3, amount: 100 };
    revenueService.getRevenue.mockResolvedValue(response);

    await expect(controller.getRevenue(4, 3, req)).resolves.toEqual(response);
    expect(revenueService.getRevenue).toHaveBeenCalledWith(4, 3, 7);
  });

  it('createRevenue uses the route projectId', async () => {
    const dto = {
      description: 'תשלום',
      amount: 8500,
      date: '2026-09-18T00:00:00.000Z',
      status: RevenueStatus.PAID,
    };
    const created = { id: 1, ...dto, projectId: 4 };
    revenueService.createRevenue.mockResolvedValue(created);

    await expect(controller.createRevenue(4, dto, req)).resolves.toEqual(
      created,
    );
    expect(revenueService.createRevenue).toHaveBeenCalledWith(4, dto, 7);
  });

  it('updateRevenue passes projectId, revenueId, dto, and req.user.sub', async () => {
    const dto = { amount: 10 };
    revenueService.updateRevenue.mockResolvedValue({ id: 3, amount: 10 });

    await expect(controller.updateRevenue(4, 3, dto, req)).resolves.toEqual({
      id: 3,
      amount: 10,
    });
    expect(revenueService.updateRevenue).toHaveBeenCalledWith(4, 3, dto, 7);
  });

  it('deleteRevenue passes projectId, revenueId, and req.user.sub', async () => {
    revenueService.deleteRevenue.mockResolvedValue({
      message: 'Revenue deleted successfully',
    });

    await expect(controller.deleteRevenue(4, 3, req)).resolves.toEqual({
      message: 'Revenue deleted successfully',
    });
    expect(revenueService.deleteRevenue).toHaveBeenCalledWith(4, 3, 7);
  });
});

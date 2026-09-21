import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request.js';
import { UserRole } from '../generated/prisma/client.js';
import { MaterialsController } from './materials.controller.js';
import { MaterialsService } from './materials.service.js';

describe('MaterialsController', () => {
  let controller: MaterialsController;
  let materialsService: {
    getMaterials: ReturnType<typeof vi.fn>;
    createMaterial: ReturnType<typeof vi.fn>;
    updateMaterial: ReturnType<typeof vi.fn>;
    deleteMaterial: ReturnType<typeof vi.fn>;
  };

  const req = {
    user: {
      sub: 7,
      email: 'roei@example.com',
      role: UserRole.USER,
    },
  } as AuthenticatedRequest;

  beforeEach(async () => {
    materialsService = {
      getMaterials: vi.fn(),
      createMaterial: vi.fn(),
      updateMaterial: vi.fn(),
      deleteMaterial: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterialsController],
      providers: [{ provide: MaterialsService, useValue: materialsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(MaterialsController);
  });

  it('getMaterials passes route projectId and req.user.sub', async () => {
    const response = {
      data: [{ id: 1, cost: 12 }],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      summary: { count: 1, totalCost: 12 },
    };
    materialsService.getMaterials.mockResolvedValue(response);

    await expect(
      controller.getMaterials(4, { page: 1, limit: 10 }, req),
    ).resolves.toEqual(response);
    expect(materialsService.getMaterials).toHaveBeenCalledWith(4, 7, 1, 10);
  });

  it('createMaterial uses the route projectId and ignores body project assignment', async () => {
    const dto = { name: 'ברזל', quantity: 500, unitPrice: 12 };
    const created = { id: 1, ...dto, projectId: 4, cost: 6000 };
    materialsService.createMaterial.mockResolvedValue(created);

    await expect(controller.createMaterial(4, dto, req)).resolves.toEqual(
      created,
    );
    expect(materialsService.createMaterial).toHaveBeenCalledWith(4, dto, 7);
  });

  it('updateMaterial passes projectId, materialId, dto, and req.user.sub', async () => {
    const dto = { quantity: 10 };
    materialsService.updateMaterial.mockResolvedValue({ id: 3, cost: 120 });

    await expect(controller.updateMaterial(4, 3, dto, req)).resolves.toEqual({
      id: 3,
      cost: 120,
    });
    expect(materialsService.updateMaterial).toHaveBeenCalledWith(4, 3, dto, 7);
  });

  it('deleteMaterial passes projectId, materialId, and req.user.sub', async () => {
    materialsService.deleteMaterial.mockResolvedValue({
      message: 'Material deleted successfully',
    });

    await expect(controller.deleteMaterial(4, 3, req)).resolves.toEqual({
      message: 'Material deleted successfully',
    });
    expect(materialsService.deleteMaterial).toHaveBeenCalledWith(4, 3, 7);
  });
});

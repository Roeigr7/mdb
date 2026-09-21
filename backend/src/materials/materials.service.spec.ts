import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { MaterialsService } from './materials.service.js';

describe('MaterialsService', () => {
  let service: MaterialsService;
  let prisma: {
    project: {
      findFirst: ReturnType<typeof vi.fn>;
    };
    material: {
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      deleteMany: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
    };
    $queryRaw: ReturnType<typeof vi.fn>;
  };

  const userId = 1;
  const otherUserId = 2;
  const projectId = 10;

  const material = {
    id: 5,
    name: 'ברזל',
    quantity: 500,
    unitPrice: 12,
    supplier: 'ספק א',
    projectId,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
  };

  beforeEach(async () => {
    prisma = {
      project: {
        findFirst: vi.fn(),
      },
      material: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        deleteMany: vi.fn(),
        count: vi.fn(),
      },
      $queryRaw: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(MaterialsService);
  });

  describe('createMaterial', () => {
    it('creates a material on a project owned by the user and calculates cost', async () => {
      prisma.project.findFirst.mockResolvedValue({ id: projectId });
      prisma.material.create.mockResolvedValue(material);

      const result = await service.createMaterial(
        projectId,
        {
          name: 'ברזל',
          quantity: 500,
          unitPrice: 12,
          supplier: 'ספק א',
        },
        userId,
      );

      expect(prisma.project.findFirst).toHaveBeenCalledWith({
        where: { id: projectId, userId },
        select: { id: true },
      });
      expect(prisma.material.create).toHaveBeenCalledWith({
        data: {
          name: 'ברזל',
          quantity: 500,
          unitPrice: 12,
          supplier: 'ספק א',
          projectId,
        },
        select: expect.any(Object),
      });
      expect(result.cost).toBe(6000);
      expect(result).not.toHaveProperty('totalPrice');
    });

    it('stores a null supplier when omitted', async () => {
      prisma.project.findFirst.mockResolvedValue({ id: projectId });
      prisma.material.create.mockResolvedValue({ ...material, supplier: null });

      await service.createMaterial(
        projectId,
        { name: 'ברזל', quantity: 1, unitPrice: 0 },
        userId,
      );

      expect(prisma.material.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ supplier: null, projectId }),
        }),
      );
    });

    it('throws NotFoundException when the project belongs to another user', async () => {
      prisma.project.findFirst.mockResolvedValue(null);

      await expect(
        service.createMaterial(
          projectId,
          { name: 'ברזל', quantity: 1, unitPrice: 1 },
          otherUserId,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.material.create).not.toHaveBeenCalled();
      expect(prisma.project.findFirst).toHaveBeenCalledWith({
        where: { id: projectId, userId: otherUserId },
        select: { id: true },
      });
    });
  });

  describe('getMaterials', () => {
    it('lists only materials for an owned project', async () => {
      prisma.project.findFirst.mockResolvedValue({ id: projectId });
      prisma.material.findMany.mockResolvedValue([material]);
      prisma.material.count.mockResolvedValue(1);
      prisma.$queryRaw.mockResolvedValue([{ total: 6000 }]);

      const result = await service.getMaterials(projectId, userId);

      expect(prisma.material.findMany).toHaveBeenCalledWith({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
        select: expect.any(Object),
      });
      expect(result).toEqual({
        data: [{ ...material, cost: 6000 }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
        summary: { count: 1, totalCost: 6000 },
      });
    });

    it('throws NotFoundException for another user project', async () => {
      prisma.project.findFirst.mockResolvedValue(null);

      await expect(
        service.getMaterials(projectId, otherUserId),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.material.findMany).not.toHaveBeenCalled();
    });
  });

  describe('updateMaterial', () => {
    it('updates a material that belongs to the owned project', async () => {
      const updated = { ...material, quantity: 100, unitPrice: 30 };
      prisma.project.findFirst.mockResolvedValue({ id: projectId });
      prisma.material.findFirst.mockResolvedValue({ id: material.id });
      prisma.material.update.mockResolvedValue(updated);

      const result = await service.updateMaterial(
        projectId,
        material.id,
        { quantity: 100, unitPrice: 30 },
        userId,
      );

      expect(prisma.material.findFirst).toHaveBeenCalledWith({
        where: { id: material.id, projectId },
        select: { id: true },
      });
      expect(prisma.material.update).toHaveBeenCalledWith({
        where: { id: material.id },
        data: { quantity: 100, unitPrice: 30 },
        select: expect.any(Object),
      });
      expect(result.cost).toBe(3000);
    });

    it('throws NotFoundException when the material is not on the project', async () => {
      prisma.project.findFirst.mockResolvedValue({ id: projectId });
      prisma.material.findFirst.mockResolvedValue(null);

      await expect(
        service.updateMaterial(projectId, 99, { name: 'X' }, userId),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.material.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when updating another user project material', async () => {
      prisma.project.findFirst.mockResolvedValue(null);

      await expect(
        service.updateMaterial(projectId, material.id, { name: 'X' }, otherUserId),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.material.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteMaterial', () => {
    it('deletes a material scoped to the owned project', async () => {
      prisma.project.findFirst.mockResolvedValue({ id: projectId });
      prisma.material.deleteMany.mockResolvedValue({ count: 1 });

      await expect(
        service.deleteMaterial(projectId, material.id, userId),
      ).resolves.toEqual({ message: 'Material deleted successfully' });

      expect(prisma.material.deleteMany).toHaveBeenCalledWith({
        where: { id: material.id, projectId },
      });
    });

    it('throws NotFoundException when the material is missing', async () => {
      prisma.project.findFirst.mockResolvedValue({ id: projectId });
      prisma.material.deleteMany.mockResolvedValue({ count: 0 });

      await expect(
        service.deleteMaterial(projectId, 99, userId),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws NotFoundException when deleting from another user project', async () => {
      prisma.project.findFirst.mockResolvedValue(null);

      await expect(
        service.deleteMaterial(projectId, material.id, otherUserId),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.material.deleteMany).not.toHaveBeenCalled();
    });
  });
});

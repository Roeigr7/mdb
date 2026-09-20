import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProjectsService } from './projects.service.js';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: {
    project: {
      findMany: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      deleteMany: ReturnType<typeof vi.fn>;
      updateMany: ReturnType<typeof vi.fn>;
      findUniqueOrThrow: ReturnType<typeof vi.fn>;
    };
  };

  const userId = 1;
  const otherUserId = 2;

  const project = {
    id: 10,
    name: 'My Project',
    description: 'Desc',
    userId,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
  };

  beforeEach(async () => {
    prisma = {
      project: {
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        findFirst: vi.fn(),
        deleteMany: vi.fn(),
        updateMany: vi.fn(),
        findUniqueOrThrow: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ProjectsService);
  });

  describe('createProject', () => {
    it('creates a project owned by the authenticated user', async () => {
      prisma.project.create.mockResolvedValue(project);

      const result = await service.createProject(
        { name: 'My Project', description: 'Desc' },
        userId,
      );

      expect(prisma.project.create).toHaveBeenCalledWith({
        data: {
          name: 'My Project',
          description: 'Desc',
          userId,
        },
        select: {
          id: true,
          name: true,
          description: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result.userId).toBe(userId);
    });

    it('allows optional description', async () => {
      const withoutDescription = { ...project, description: null };
      prisma.project.create.mockResolvedValue(withoutDescription);

      await service.createProject({ name: 'My Project' }, userId);

      expect(prisma.project.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            name: 'My Project',
            description: undefined,
            userId,
          },
        }),
      );
    });
  });

  describe('getProjects', () => {
    it('returns only the authenticated user projects with defaults', async () => {
      prisma.project.findMany.mockResolvedValue([project]);
      prisma.project.count.mockResolvedValue(1);

      const result = await service.getProjects(userId, {});

      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
        select: {
          id: true,
          name: true,
          description: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(prisma.project.count).toHaveBeenCalledWith({ where: { userId } });
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('applies pagination, search, and sorting', async () => {
      prisma.project.findMany.mockResolvedValue([project]);
      prisma.project.count.mockResolvedValue(11);

      const result = await service.getProjects(userId, {
        page: 2,
        limit: 5,
        search: 'react',
        sortBy: 'name',
        sortOrder: 'asc',
      });

      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          OR: [
            { name: { contains: 'react', mode: 'insensitive' } },
            { description: { contains: 'react', mode: 'insensitive' } },
          ],
        },
        orderBy: { name: 'asc' },
        skip: 5,
        take: 5,
        select: expect.any(Object),
      });
      expect(result.meta).toEqual({
        page: 2,
        limit: 5,
        total: 11,
        totalPages: 3,
      });
    });
  });

  describe('getProjectById', () => {
    it('returns project when owned by the user', async () => {
      prisma.project.findFirst.mockResolvedValue(project);

      await expect(service.getProjectById(10, userId)).resolves.toEqual(
        project,
      );
      expect(prisma.project.findFirst).toHaveBeenCalledWith({
        where: { id: 10, userId },
        select: expect.any(Object),
      });
    });

    it('throws NotFoundException when project does not exist', async () => {
      prisma.project.findFirst.mockResolvedValue(null);

      await expect(service.getProjectById(99, userId)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws NotFoundException for another user project (ownership)', async () => {
      prisma.project.findFirst.mockResolvedValue(null);

      await expect(
        service.getProjectById(10, otherUserId),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.project.findFirst).toHaveBeenCalledWith({
        where: { id: 10, userId: otherUserId },
        select: expect.any(Object),
      });
    });
  });

  describe('updateProject', () => {
    it('updates own project', async () => {
      const updated = { ...project, name: 'Updated' };
      prisma.project.updateMany.mockResolvedValue({ count: 1 });
      prisma.project.findUniqueOrThrow.mockResolvedValue(updated);

      const result = await service.updateProject(
        10,
        { name: 'Updated' },
        userId,
      );

      expect(prisma.project.updateMany).toHaveBeenCalledWith({
        where: { id: 10, userId },
        data: { name: 'Updated' },
      });
      expect(result).toEqual(updated);
    });

    it('throws NotFoundException when project is missing', async () => {
      prisma.project.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        service.updateProject(99, { name: 'Updated' }, userId),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws NotFoundException when updating another user project', async () => {
      prisma.project.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        service.updateProject(10, { name: 'Hacked' }, otherUserId),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.project.updateMany).toHaveBeenCalledWith({
        where: { id: 10, userId: otherUserId },
        data: { name: 'Hacked' },
      });
    });
  });

  describe('deleteProject', () => {
    it('deletes own project', async () => {
      prisma.project.deleteMany.mockResolvedValue({ count: 1 });

      await expect(service.deleteProject(10, userId)).resolves.toEqual({
        message: 'Project deleted successfully',
      });
    });

    it('throws NotFoundException when project is missing', async () => {
      prisma.project.deleteMany.mockResolvedValue({ count: 0 });

      await expect(service.deleteProject(99, userId)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws NotFoundException when deleting another user project', async () => {
      prisma.project.deleteMany.mockResolvedValue({ count: 0 });

      await expect(
        service.deleteProject(10, otherUserId),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.project.deleteMany).toHaveBeenCalledWith({
        where: { id: 10, userId: otherUserId },
      });
    });
  });
});

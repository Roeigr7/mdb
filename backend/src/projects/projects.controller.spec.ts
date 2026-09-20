import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request.js';
import { UserRole } from '../generated/prisma/client.js';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let projectsService: {
    getProjects: ReturnType<typeof vi.fn>;
    createProject: ReturnType<typeof vi.fn>;
    getProjectById: ReturnType<typeof vi.fn>;
    updateProject: ReturnType<typeof vi.fn>;
    deleteProject: ReturnType<typeof vi.fn>;
  };

  const req = {
    user: {
      sub: 7,
      email: 'roei@example.com',
      role: UserRole.USER,
    },
  } as AuthenticatedRequest;

  beforeEach(async () => {
    projectsService = {
      getProjects: vi.fn(),
      createProject: vi.fn(),
      getProjectById: vi.fn(),
      updateProject: vi.fn(),
      deleteProject: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [{ provide: ProjectsService, useValue: projectsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(ProjectsController);
  });

  it('getProjects passes req.user.sub and query', async () => {
    const query = { page: 1, limit: 10 };
    const response = { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    projectsService.getProjects.mockResolvedValue(response);

    await expect(controller.getProjects(query, req)).resolves.toEqual(response);
    expect(projectsService.getProjects).toHaveBeenCalledWith(7, query);
  });

  it('createProject passes dto and req.user.sub', async () => {
    const dto = { name: 'Project' };
    const created = { id: 1, ...dto, userId: 7 };
    projectsService.createProject.mockResolvedValue(created);

    await expect(controller.createProject(dto, req)).resolves.toEqual(created);
    expect(projectsService.createProject).toHaveBeenCalledWith(dto, 7);
  });

  it('getProjectById passes id and req.user.sub', async () => {
    projectsService.getProjectById.mockResolvedValue({ id: 3 });

    await expect(controller.getProjectById(3, req)).resolves.toEqual({ id: 3 });
    expect(projectsService.getProjectById).toHaveBeenCalledWith(3, 7);
  });

  it('updateProject passes id, dto, and req.user.sub', async () => {
    const dto = { name: 'Updated' };
    projectsService.updateProject.mockResolvedValue({ id: 3, ...dto });

    await expect(controller.updateProject(3, dto, req)).resolves.toEqual({
      id: 3,
      ...dto,
    });
    expect(projectsService.updateProject).toHaveBeenCalledWith(3, dto, 7);
  });

  it('deleteProject passes id and req.user.sub', async () => {
    projectsService.deleteProject.mockResolvedValue({
      message: 'Project deleted successfully',
    });

    await expect(controller.deleteProject(3, req)).resolves.toEqual({
      message: 'Project deleted successfully',
    });
    expect(projectsService.deleteProject).toHaveBeenCalledWith(3, 7);
  });
});

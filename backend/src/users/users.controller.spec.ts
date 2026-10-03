import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request.js';
import { UserRole } from '../generated/prisma/client.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: {
    getUsers: ReturnType<typeof vi.fn>;
    getMe: ReturnType<typeof vi.fn>;
    getUserById: ReturnType<typeof vi.fn>;
    updateUser: ReturnType<typeof vi.fn>;
    deleteUser: ReturnType<typeof vi.fn>;
    changePassword: ReturnType<typeof vi.fn>;
  };

  const req = {
    user: {
      sub: 1,
      email: 'roei@example.com',
      role: UserRole.USER,
    },
  } as AuthenticatedRequest;

  beforeEach(async () => {
    usersService = {
      getUsers: vi.fn(),
      getMe: vi.fn(),
      getUserById: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
      changePassword: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(UsersController);
  });

  it('getUsers forwards query to UsersService', async () => {
    const query = { page: 1, limit: 10 };
    const response = {
      data: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
    usersService.getUsers.mockResolvedValue(response);

    await expect(controller.getUsers(query)).resolves.toEqual(response);
    expect(usersService.getUsers).toHaveBeenCalledWith(query);
  });

  it('getMe forwards req.user to UsersService', async () => {
    const profile = { id: 1, name: 'Roei', email: req.user.email };
    usersService.getMe.mockResolvedValue(profile);

    await expect(controller.getMe(req)).resolves.toEqual(profile);
    expect(usersService.getMe).toHaveBeenCalledWith(req.user);
  });

  it('getUserById forwards id to UsersService', async () => {
    usersService.getUserById.mockResolvedValue({ id: 2 });

    await expect(controller.getUserById(2)).resolves.toEqual({ id: 2 });
    expect(usersService.getUserById).toHaveBeenCalledWith(2);
  });

  it('updateUser forwards id, dto, and req.user', async () => {
    const dto = { name: 'David' };
    usersService.updateUser.mockResolvedValue({ id: 1, ...dto });

    await expect(controller.updateUser(1, dto, req)).resolves.toEqual({
      id: 1,
      ...dto,
    });
    expect(usersService.updateUser).toHaveBeenCalledWith(1, dto, req.user);
  });

  it('deleteUser forwards id and req.user', async () => {
    usersService.deleteUser.mockResolvedValue({
      message: 'User deleted successfully',
    });

    await expect(controller.deleteUser(1, req)).resolves.toEqual({
      message: 'User deleted successfully',
    });
    expect(usersService.deleteUser).toHaveBeenCalledWith(1, req.user);
  });
});

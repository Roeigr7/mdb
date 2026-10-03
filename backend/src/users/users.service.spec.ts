import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findMany: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  const currentUser = {
    sub: 1,
    email: 'roei@example.com',
    role: UserRole.USER,
  };

  const dbUser = {
    id: 1,
    name: 'Roei',
    email: 'roei@example.com',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    passwordHash: 'secret',
  };

  const publicUser = {
    id: 1,
    name: 'Roei',
    email: 'roei@example.com',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    hasPassword: true,
  };

  const userSelect = {
    id: true,
    name: true,
    email: true,
    createdAt: true,
    passwordHash: true,
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  describe('getUsers', () => {
    it('returns paginated users with defaults page=1 and limit=10', async () => {
      prisma.user.findMany.mockResolvedValue([dbUser]);
      prisma.user.count.mockResolvedValue(1);

      const result = await service.getUsers({});

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        select: userSelect,
      });
      expect(prisma.user.count).toHaveBeenCalledWith();
      expect(result).toEqual({
        data: [publicUser],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
    });

    it('applies custom pagination and computes totalPages', async () => {
      prisma.user.findMany.mockResolvedValue([dbUser]);
      prisma.user.count.mockResolvedValue(25);

      const result = await service.getUsers({ page: 2, limit: 10 });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
      expect(result.meta).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
    });
  });

  describe('getMe', () => {
    it('returns the authenticated user', async () => {
      prisma.user.findUnique.mockResolvedValue(dbUser);

      const result = await service.getMe(currentUser);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: currentUser.sub },
        select: userSelect,
      });
      expect(result).toEqual(publicUser);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('throws NotFoundException when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getMe(currentUser)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('getUserById', () => {
    it('returns a user when found', async () => {
      prisma.user.findUnique.mockResolvedValue(dbUser);

      await expect(service.getUserById(1)).resolves.toEqual(publicUser);
    });

    it('throws NotFoundException when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserById(99)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('updateUser', () => {
    it('updates own account and omits passwordHash', async () => {
      const updatedDb = { ...dbUser, name: 'David' };
      const updatedPublic = { ...publicUser, name: 'David' };
      prisma.user.findUnique.mockResolvedValue(dbUser);
      prisma.user.update.mockResolvedValue(updatedDb);

      const result = await service.updateUser(
        1,
        { name: 'David' },
        currentUser,
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'David' },
        select: userSelect,
      });
      expect(result).toEqual(updatedPublic);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('throws ForbiddenException when updating another user', async () => {
      await expect(
        service.updateUser(2, { name: 'Hacker' }, currentUser),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when own user record is missing', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateUser(1, { name: 'David' }, currentUser),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('propagates Prisma errors from update', async () => {
      const prismaError = new Error('Unique constraint failed');
      prisma.user.findUnique.mockResolvedValue(dbUser);
      prisma.user.update.mockRejectedValue(prismaError);

      await expect(
        service.updateUser(1, { email: 'taken@example.com' }, currentUser),
      ).rejects.toBe(prismaError);
    });
  });

  describe('deleteUser', () => {
    it('deletes own account', async () => {
      prisma.user.findUnique.mockResolvedValue(dbUser);
      prisma.user.delete.mockResolvedValue(dbUser);

      await expect(service.deleteUser(1, currentUser)).resolves.toEqual({
        message: 'User deleted successfully',
      });
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('throws ForbiddenException when deleting another user', async () => {
      await expect(service.deleteUser(2, currentUser)).rejects.toBeInstanceOf(
        ForbiddenException,
      );

      expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.deleteUser(1, currentUser)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('propagates Prisma errors from delete', async () => {
      const prismaError = new Error('Database delete failed');
      prisma.user.findUnique.mockResolvedValue(dbUser);
      prisma.user.delete.mockRejectedValue(prismaError);

      await expect(service.deleteUser(1, currentUser)).rejects.toBe(prismaError);
    });
  });
});

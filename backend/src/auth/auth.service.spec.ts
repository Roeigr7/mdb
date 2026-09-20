import {
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import bcrypt from 'bcrypt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
    refreshToken: {
      create: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
  };
  let jwtService: {
    signAsync: ReturnType<typeof vi.fn>;
    verifyAsync: ReturnType<typeof vi.fn>;
    decode: ReturnType<typeof vi.fn>;
  };

  const mockUser = {
    id: 1,
    name: 'Roei',
    email: 'roei@example.com',
    passwordHash: 'stored-password-hash',
    role: UserRole.USER,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    prisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      refreshToken: {
        create: vi.fn(),
        findUnique: vi.fn(),
        delete: vi.fn(),
      },
      $transaction: vi.fn(),
    };

    jwtService = {
      signAsync: vi.fn(),
      verifyAsync: vi.fn(),
      decode: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  function mockSuccessfulTokenIssuance() {
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
    jwtService.decode.mockReturnValue({
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    });
    vi.mocked(bcrypt.hash).mockResolvedValue('refresh-token-hash' as never);
    prisma.refreshToken.create.mockResolvedValue({ id: 1 });
  }

  describe('login', () => {
    it('returns tokens when credentials are valid', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      mockSuccessfulTokenIssuance();

      const result = await service.login({
        email: mockUser.email,
        password: 'correct-password',
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'correct-password',
        mockUser.passwordHash,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(result).not.toHaveProperty('passwordHash');
      expect(JSON.stringify(result)).not.toContain(mockUser.passwordHash);
    });

    it('throws UnauthorizedException when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'missing@example.com',
          password: 'any-password',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when password is invalid', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.login({
          email: mockUser.email,
          password: 'wrong-password',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrong-password',
        mockUser.passwordHash,
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('does not return passwordHash in the response', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      mockSuccessfulTokenIssuance();

      const result = await service.login({
        email: mockUser.email,
        password: 'correct-password',
      });

      expect(Object.keys(result)).toEqual(['accessToken', 'refreshToken']);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('propagates Prisma errors from user.findUnique', async () => {
      const prismaError = new Error('Database unavailable');
      prisma.user.findUnique.mockRejectedValue(prismaError);

      await expect(
        service.login({
          email: mockUser.email,
          password: 'any-password',
        }),
      ).rejects.toBe(prismaError);
    });
  });

  describe('register', () => {
    const registerDto = {
      name: 'Roei',
      email: 'roei@example.com',
      password: '12345678',
    };

    it('hashes the password, creates the user, and omits passwordHash', async () => {
      const createdUser = {
        id: 1,
        name: registerDto.name,
        email: registerDto.email,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      };

      prisma.user.findUnique.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
      prisma.user.create.mockResolvedValue(createdUser);

      const result = await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: registerDto.name,
          email: registerDto.email,
          passwordHash: 'hashed-password',
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(createdUser);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('throws ConflictException when email is already registered', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toBeInstanceOf(
        ConflictException,
      );

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('propagates Prisma errors from user.create (e.g. P2002 race)', async () => {
      const prismaError = Object.assign(new Error('Unique constraint failed'), {
        code: 'P2002',
      });

      prisma.user.findUnique.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
      prisma.user.create.mockRejectedValue(prismaError);

      await expect(service.register(registerDto)).rejects.toBe(prismaError);
    });
  });

  describe('refresh', () => {
    const refreshToken = 'valid-refresh-token';
    const storedToken = {
      id: 10,
      jti: 'token-jti',
      tokenHash: 'stored-refresh-hash',
      userId: mockUser.id,
      expiresAt: new Date(Date.now() + 60_000),
      user: mockUser,
    };

    function mockValidRefreshPayload() {
      jwtService.verifyAsync.mockResolvedValue({
        sub: mockUser.id,
        type: 'refresh',
        jti: storedToken.jti,
      });
    }

    it('rotates tokens when refresh token is valid', async () => {
      mockValidRefreshPayload();
      prisma.refreshToken.findUnique.mockResolvedValue(storedToken);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      jwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');
      jwtService.decode.mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      });
      vi.mocked(bcrypt.hash).mockResolvedValue('new-refresh-hash' as never);

      const txDelete = vi.fn().mockResolvedValue({});
      const txCreate = vi.fn().mockResolvedValue({});
      prisma.$transaction.mockImplementation(async (callback) =>
        callback({
          refreshToken: {
            delete: txDelete,
            create: txCreate,
          },
        }),
      );

      const result = await service.refresh(refreshToken);

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(txDelete).toHaveBeenCalledWith({ where: { id: storedToken.id } });
      expect(txCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: mockUser.id,
            tokenHash: 'new-refresh-hash',
          }),
        }),
      );
    });

    it('throws UnauthorizedException when refresh token verification fails', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(service.refresh(refreshToken)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when payload type is not refresh', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: mockUser.id,
        type: 'access',
        jti: storedToken.jti,
      });

      await expect(service.refresh(refreshToken)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when stored token is missing', async () => {
      mockValidRefreshPayload();
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refresh(refreshToken)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when stored token belongs to another user', async () => {
      mockValidRefreshPayload();
      prisma.refreshToken.findUnique.mockResolvedValue({
        ...storedToken,
        userId: 999,
      });

      await expect(service.refresh(refreshToken)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('deletes expired stored token and throws UnauthorizedException', async () => {
      mockValidRefreshPayload();
      prisma.refreshToken.findUnique.mockResolvedValue({
        ...storedToken,
        expiresAt: new Date(Date.now() - 1000),
      });
      prisma.refreshToken.delete.mockResolvedValue({});

      await expect(service.refresh(refreshToken)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(prisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: storedToken.id },
      });
    });

    it('throws UnauthorizedException when refresh token hash does not match', async () => {
      mockValidRefreshPayload();
      prisma.refreshToken.findUnique.mockResolvedValue(storedToken);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(service.refresh(refreshToken)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('propagates database failure during token rotation transaction', async () => {
      mockValidRefreshPayload();
      prisma.refreshToken.findUnique.mockResolvedValue(storedToken);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      jwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');
      jwtService.decode.mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      });
      vi.mocked(bcrypt.hash).mockResolvedValue('new-refresh-hash' as never);

      const txError = new Error('transaction failed');
      prisma.$transaction.mockRejectedValue(txError);

      await expect(service.refresh(refreshToken)).rejects.toBe(txError);
    });
  });
});

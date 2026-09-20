import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '../../generated/prisma/client.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import type { AuthenticatedRequest } from '../types/authenticated-request.js';
import type { JwtPayload } from '../types/jwt-payload.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { RolesGuard } from './roles.guard.js';

function createHttpContext(
  request: Partial<AuthenticatedRequest>,
  handler: object = {},
  controllerClass: object = class TestController {},
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
      getNext: () => undefined,
    }),
    getHandler: () => handler,
    getClass: () => controllerClass,
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: { verifyAsync: ReturnType<typeof vi.fn> };

  const payload: JwtPayload = {
    sub: 1,
    email: 'roei@example.com',
    role: UserRole.USER,
  };

  beforeEach(async () => {
    jwtService = {
      verifyAsync: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    guard = module.get(JwtAuthGuard);
  });

  it('throws 401 when Authorization header is missing', async () => {
    const context = createHttpContext({ headers: {} } as AuthenticatedRequest);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('throws 401 when Bearer token is missing', async () => {
    const context = createHttpContext({
      headers: { authorization: 'Basic abc' },
    } as AuthenticatedRequest);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('sets request.user when access token is valid', async () => {
    const request = {
      headers: { authorization: 'Bearer valid-token' },
    } as AuthenticatedRequest;
    jwtService.verifyAsync.mockResolvedValue(payload);

    await expect(guard.canActivate(createHttpContext(request))).resolves.toBe(
      true,
    );
    expect(request.user).toEqual(payload);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
  });

  it('throws 401 when token is invalid', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));
    const context = createHttpContext({
      headers: { authorization: 'Bearer bad-token' },
    } as AuthenticatedRequest);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('throws 401 when token is expired', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));
    const context = createHttpContext({
      headers: { authorization: 'Bearer expired-token' },
    } as AuthenticatedRequest);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('throws 401 when refresh token is used as access token', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      ...payload,
      type: 'refresh',
    });
    const context = createHttpContext({
      headers: { authorization: 'Bearer refresh-token' },
    } as AuthenticatedRequest);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get(RolesGuard);
    reflector = module.get(Reflector);
  });

  it('allows access when no @Roles metadata is set', () => {
    const getAllAndOverride = vi.spyOn(reflector, 'getAllAndOverride');
    getAllAndOverride.mockReturnValue(undefined);

    const context = createHttpContext({
      user: { sub: 1, email: 'a@b.com', role: UserRole.USER },
    } as AuthenticatedRequest);

    expect(guard.canActivate(context)).toBe(true);
    expect(getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  });

  it('allows access when user role matches required roles', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);

    const context = createHttpContext({
      user: { sub: 1, email: 'admin@example.com', role: UserRole.ADMIN },
    } as AuthenticatedRequest);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('throws 403 when user role does not match', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);

    const context = createHttpContext({
      user: { sub: 1, email: 'user@example.com', role: UserRole.USER },
    } as AuthenticatedRequest);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('throws 403 when authenticated user has no role', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);

    const context = createHttpContext({
      user: { sub: 1, email: 'user@example.com' },
    } as AuthenticatedRequest);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});

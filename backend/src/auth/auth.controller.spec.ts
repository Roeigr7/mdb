import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
    refresh: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authService = {
      register: vi.fn(),
      login: vi.fn(),
      refresh: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get(AuthController);
  });

  it('register forwards dto to AuthService', async () => {
    const dto = {
      name: 'Roei',
      email: 'roei@example.com',
      password: '12345678',
    };
    const created = { id: 1, ...dto, createdAt: new Date() };
    authService.register.mockResolvedValue(created);

    await expect(controller.register(dto)).resolves.toEqual(created);
    expect(authService.register).toHaveBeenCalledWith(dto);
  });

  it('login forwards dto to AuthService', async () => {
    const dto = { email: 'roei@example.com', password: '12345678' };
    const tokens = { accessToken: 'a', refreshToken: 'r' };
    authService.login.mockResolvedValue(tokens);

    await expect(controller.login(dto)).resolves.toEqual(tokens);
    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('refresh forwards refreshToken string to AuthService', async () => {
    const tokens = { accessToken: 'a', refreshToken: 'r' };
    authService.refresh.mockResolvedValue(tokens);

    await expect(
      controller.refresh({ refreshToken: 'refresh-token' }),
    ).resolves.toEqual(tokens);
    expect(authService.refresh).toHaveBeenCalledWith('refresh-token');
  });
});

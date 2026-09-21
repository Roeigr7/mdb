import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { FacebookAuthGuard } from './guards/facebook-auth.guard.js';
import { GoogleAuthGuard } from './guards/google-auth.guard.js';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
    refresh: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    exchangeOAuthCode: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authService = {
      register: vi.fn(),
      login: vi.fn(),
      refresh: vi.fn(),
      logout: vi.fn(),
      exchangeOAuthCode: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ session: false })],
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        GoogleAuthGuard,
        FacebookAuthGuard,
      ],
    }).compile();

    controller = module.get(AuthController);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
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

  it('logout forwards refreshToken string to AuthService', async () => {
    const result = { message: 'Logged out successfully' };
    authService.logout.mockResolvedValue(result);

    await expect(
      controller.logout({ refreshToken: 'refresh-token' }),
    ).resolves.toEqual(result);
    expect(authService.logout).toHaveBeenCalledWith('refresh-token');
  });

  it('exchangeOAuthCode forwards the one-time code to AuthService', async () => {
    const tokens = { accessToken: 'a', refreshToken: 'r' };
    authService.exchangeOAuthCode.mockResolvedValue(tokens);

    await expect(
      controller.exchangeOAuthCode({ code: 'one-time-code' }),
    ).resolves.toEqual(tokens);
    expect(authService.exchangeOAuthCode).toHaveBeenCalledWith('one-time-code');
  });

  it('providers reports both disabled when OAuth env is empty', () => {
    vi.stubEnv('GOOGLE_CLIENT_ID', '');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', '');
    vi.stubEnv('GOOGLE_CALLBACK_URL', '');
    vi.stubEnv('FACEBOOK_APP_ID', '');
    vi.stubEnv('FACEBOOK_APP_SECRET', '');
    vi.stubEnv('FACEBOOK_CALLBACK_URL', '');

    expect(controller.providers()).toEqual({
      google: false,
      facebook: false,
    });
  });

  it('login still forwards credentials after OAuth callback changes', async () => {
    const dto = { email: 'roei@example.com', password: '12345678' };
    const tokens = { accessToken: 'a', refreshToken: 'r' };
    authService.login.mockResolvedValue(tokens);

    await expect(controller.login(dto)).resolves.toEqual(tokens);
  });

  it('providers reports Google enabled when Google env is complete', () => {
    vi.stubEnv('GOOGLE_CLIENT_ID', 'google-client-id');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'google-client-secret');
    vi.stubEnv(
      'GOOGLE_CALLBACK_URL',
      'http://localhost:3000/auth/google/callback',
    );
    vi.stubEnv('FACEBOOK_APP_ID', '');
    vi.stubEnv('FACEBOOK_APP_SECRET', '');
    vi.stubEnv('FACEBOOK_CALLBACK_URL', '');

    expect(controller.providers()).toEqual({
      google: true,
      facebook: false,
    });
  });

  it('providers reports Facebook enabled when Facebook env is complete', () => {
    vi.stubEnv('GOOGLE_CLIENT_ID', '');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', '');
    vi.stubEnv('GOOGLE_CALLBACK_URL', '');
    vi.stubEnv('FACEBOOK_APP_ID', 'facebook-app-id');
    vi.stubEnv('FACEBOOK_APP_SECRET', 'facebook-app-secret');
    vi.stubEnv(
      'FACEBOOK_CALLBACK_URL',
      'http://localhost:3000/auth/facebook/callback',
    );

    expect(controller.providers()).toEqual({
      google: false,
      facebook: true,
    });
  });
});

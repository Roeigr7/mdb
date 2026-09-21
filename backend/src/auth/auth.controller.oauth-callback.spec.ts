import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { FacebookAuthGuard } from './guards/facebook-auth.guard.js';
import { GoogleAuthGuard } from './guards/google-auth.guard.js';

function createMockResponse(headersSent = false) {
  const res = {
    headersSent,
    redirect: vi.fn(function (this: { headersSent: boolean }) {
      this.headersSent = true;
    }),
  };
  return res as unknown as Response & {
    headersSent: boolean;
    redirect: ReturnType<typeof vi.fn>;
  };
}

describe('AuthController Google OAuth callback', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ session: false })],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: vi.fn(),
            login: vi.fn(),
            refresh: vi.fn(),
            logout: vi.fn(),
            exchangeOAuthCode: vi.fn(),
          },
        },
        GoogleAuthGuard,
        FacebookAuthGuard,
      ],
    }).compile();

    controller = module.get(AuthController);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('successful Google OAuth callback redirects once to the frontend with the exchange code', () => {
    vi.stubEnv('FRONTEND_URL', 'http://localhost:5173');
    const res = createMockResponse();
    const req = {
      user: { exchangeCode: 'exchange-abc' },
    } as unknown as Request;

    controller.googleAuthCallback(req, res);

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(
      'http://localhost:5173/auth/callback?code=exchange-abc',
    );
  });

  it('Google OAuth failure without exchange code redirects once to login', () => {
    vi.stubEnv('FRONTEND_URL', 'http://localhost:5173');
    const res = createMockResponse();
    const req = { user: { exchangeCode: '' } } as unknown as Request;

    controller.googleAuthCallback(req, res);

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(
      'http://localhost:5173/login?error=oauth_cancelled',
    );
  });

  it('does not send a second response when the guard already redirected', () => {
    vi.stubEnv('FRONTEND_URL', 'http://localhost:5173');
    const res = createMockResponse(true);
    const req = {
      user: { exchangeCode: 'should-not-matter' },
    } as unknown as Request;

    controller.googleAuthCallback(req, res);

    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('never issues two redirects for a single successful callback', () => {
    vi.stubEnv('FRONTEND_URL', 'http://localhost:5173');
    const res = createMockResponse();
    const req = {
      user: { exchangeCode: 'exchange-abc' },
    } as unknown as Request;

    controller.googleAuthCallback(req, res);
    // Simulate a mistaken second finish attempt (guards + controller).
    controller.googleAuthCallback(req, res);

    expect(res.redirect).toHaveBeenCalledTimes(1);
  });
});

import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../auth.service.js';
import { GoogleStrategy } from './google.strategy.js';

describe('GoogleStrategy validate', () => {
  let strategy: GoogleStrategy;
  let authService: { loginWithOAuthProfile: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.stubEnv('GOOGLE_CLIENT_ID', 'test-client-id');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'test-client-secret');
    vi.stubEnv(
      'GOOGLE_CALLBACK_URL',
      'http://localhost:3000/auth/google/callback',
    );

    authService = {
      loginWithOAuthProfile: vi.fn(),
    };

    strategy = new GoogleStrategy(authService as unknown as AuthService);
  });

  it('returns an exchange-code user object (NestJS calls done once)', async () => {
    authService.loginWithOAuthProfile.mockResolvedValue('exchange-xyz');

    const result = await strategy.validate('access', 'refresh', {
      id: 'google-user-1',
      displayName: 'Roei',
      emails: [{ value: 'roei@example.com', verified: true }],
      _json: { email_verified: true },
    } as never);

    expect(result).toEqual({ exchangeCode: 'exchange-xyz' });
    expect(authService.loginWithOAuthProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'google',
        providerUserId: 'google-user-1',
        email: 'roei@example.com',
        emailVerified: true,
      }),
    );
  });

  it('propagates verify errors so NestJS can invoke done(err) exactly once', async () => {
    authService.loginWithOAuthProfile.mockRejectedValue(
      new BadRequestException(
        'OAuth provider email is not verified. Use a verified account.',
      ),
    );

    await expect(
      strategy.validate('access', 'refresh', {
        id: 'google-user-1',
        displayName: 'Roei',
        emails: [{ value: 'roei@example.com', verified: false }],
        _json: { email_verified: false },
      } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

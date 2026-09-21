import {
  ExecutionContext,
  ServiceUnavailableException,
} from '@nestjs/common';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FacebookAuthGuard } from './facebook-auth.guard.js';
import { GoogleAuthGuard } from './google-auth.guard.js';

function createHttpContext(): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({}),
      getResponse: () => ({}),
      getNext: () => undefined,
    }),
    getHandler: () => ({}),
    getClass: () => class TestController {},
  } as unknown as ExecutionContext;
}

describe('OAuth auth guards', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('GoogleAuthGuard returns 503 when Google OAuth is not configured', async () => {
    vi.stubEnv('GOOGLE_CLIENT_ID', '');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', '');
    vi.stubEnv('GOOGLE_CALLBACK_URL', '');

    const guard = new GoogleAuthGuard();
    await expect(guard.canActivate(createHttpContext())).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('FacebookAuthGuard returns 503 when Facebook OAuth is not configured', async () => {
    vi.stubEnv('FACEBOOK_APP_ID', '');
    vi.stubEnv('FACEBOOK_APP_SECRET', '');
    vi.stubEnv('FACEBOOK_CALLBACK_URL', '');

    const guard = new FacebookAuthGuard();
    await expect(guard.canActivate(createHttpContext())).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});

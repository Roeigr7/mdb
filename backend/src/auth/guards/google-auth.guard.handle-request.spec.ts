import { BadRequestException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Response } from 'express';
import { GoogleAuthGuard } from './google-auth.guard.js';

function createHttpContext(res: Response): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({}),
      getResponse: () => res,
      getNext: () => undefined,
    }),
    getHandler: () => ({}),
    getClass: () => class TestController {},
  } as unknown as ExecutionContext;
}

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

describe('GoogleAuthGuard handleRequest', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns the Passport user on successful Google authentication', () => {
    const guard = new GoogleAuthGuard();
    const res = createMockResponse();
    const user = { exchangeCode: 'code-123' };

    const result = guard.handleRequest(
      null,
      user,
      undefined,
      createHttpContext(res),
    );

    expect(result).toEqual(user);
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('redirects once when Passport returns an error', () => {
    vi.stubEnv('FRONTEND_URL', 'http://localhost:5173');
    const guard = new GoogleAuthGuard();
    const res = createMockResponse();

    const result = guard.handleRequest(
      new BadRequestException('OAuth provider email is not verified'),
      false,
      undefined,
      createHttpContext(res),
    );

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(
      'http://localhost:5173/login?error=oauth_email_unverified',
    );
    expect(result).toEqual({ exchangeCode: '' });
  });

  it('redirects once when Passport returns no user (cancelled / failed)', () => {
    vi.stubEnv('FRONTEND_URL', 'http://localhost:5173');
    const guard = new GoogleAuthGuard();
    const res = createMockResponse();

    guard.handleRequest(null, false, undefined, createHttpContext(res));

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(
      'http://localhost:5173/login?error=oauth_cancelled',
    );
  });

  it('does not attempt a second redirect when headers were already sent', () => {
    vi.stubEnv('FRONTEND_URL', 'http://localhost:5173');
    const guard = new GoogleAuthGuard();
    const res = createMockResponse(true);

    guard.handleRequest(
      new Error('oauth failed'),
      false,
      undefined,
      createHttpContext(res),
    );

    expect(res.redirect).not.toHaveBeenCalled();
  });
});

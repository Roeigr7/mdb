import { describe, expect, it, vi } from 'vitest';
import type { Response } from 'express';
import {
  mapOAuthFailure,
  redirectOnce,
  redirectOAuthFailure,
  redirectOAuthSuccess,
} from './oauth-redirect.js';

function createMockResponse(headersSent = false) {
  const res = {
    headersSent,
    redirect: vi.fn(function (this: { headersSent: boolean }) {
      this.headersSent = true;
    }),
  };
  return res as unknown as Response & { redirect: ReturnType<typeof vi.fn> };
}

describe('oauth-redirect', () => {
  it('maps known OAuth failure messages to stable error codes', () => {
    expect(mapOAuthFailure(null)).toBe('oauth_cancelled');
    expect(mapOAuthFailure(new Error('email is not verified'))).toBe(
      'oauth_email_unverified',
    );
    expect(
      mapOAuthFailure(new Error('did not return a usable email address')),
    ).toBe('oauth_email_missing');
    expect(mapOAuthFailure(new Error('already linked to another'))).toBe(
      'oauth_link_conflict',
    );
    expect(mapOAuthFailure(new Error('boom'))).toBe('oauth_failed');
  });

  it('redirectOnce sends a single redirect', () => {
    const res = createMockResponse();
    redirectOnce(res, 'http://localhost:5173/auth/callback?code=abc');
    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(
      'http://localhost:5173/auth/callback?code=abc',
    );
  });

  it('redirectOnce does not send a second response when headers were sent', () => {
    const res = createMockResponse(true);
    redirectOnce(res, 'http://localhost:5173/login?error=oauth_failed');
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('redirectOAuthSuccess builds the frontend exchange URL once', () => {
    vi.stubEnv('FRONTEND_URL', 'http://localhost:5173');
    const res = createMockResponse();
    redirectOAuthSuccess(res, 'one-time-code');
    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(
      'http://localhost:5173/auth/callback?code=one-time-code',
    );
    vi.unstubAllEnvs();
  });

  it('redirectOAuthFailure redirects once with a mapped error code', () => {
    vi.stubEnv('FRONTEND_URL', 'http://localhost:5173');
    const res = createMockResponse();
    redirectOAuthFailure(res, new Error('email is not verified'));
    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(
      'http://localhost:5173/login?error=oauth_email_unverified',
    );
    vi.unstubAllEnvs();
  });
});

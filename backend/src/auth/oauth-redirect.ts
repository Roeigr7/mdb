import type { Response } from 'express';
import { getFrontendUrl } from './oauth-config.js';

export type OAuthPassportUser = {
  exchangeCode: string;
};

/**
 * Map Passport / Nest exceptions from OAuth verify into stable frontend error codes.
 */
export function mapOAuthFailure(err: Error | null | undefined): string {
  const message = err?.message?.toLowerCase() ?? '';

  if (!err) {
    return 'oauth_cancelled';
  }
  if (message.includes('not verified')) {
    return 'oauth_email_unverified';
  }
  if (message.includes('usable email') || message.includes('email address')) {
    return 'oauth_email_missing';
  }
  if (message.includes('already linked')) {
    return 'oauth_link_conflict';
  }
  if (message.includes('already registered') || message.includes('unique')) {
    return 'oauth_email_exists';
  }
  if (message.includes('invalid oauth')) {
    return 'oauth_invalid';
  }
  return 'oauth_failed';
}

/**
 * Send exactly one redirect. Safe to call if headers were already sent.
 */
export function redirectOnce(res: Response, location: string): void {
  if (res.headersSent) {
    return;
  }
  res.redirect(location);
}

export function redirectOAuthFailure(
  res: Response,
  err?: Error | null,
): void {
  const frontend = getFrontendUrl();
  redirectOnce(res, `${frontend}/login?error=${mapOAuthFailure(err)}`);
}

export function redirectOAuthSuccess(
  res: Response,
  exchangeCode: string,
): void {
  const frontend = getFrontendUrl();
  const url = new URL('/auth/callback', frontend);
  url.searchParams.set('code', exchangeCode);
  redirectOnce(res, url.toString());
}

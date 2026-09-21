import { describe, expect, it } from 'vitest';
import {
  getFrontendUrl,
  isFacebookOAuthConfigured,
  isGoogleOAuthConfigured,
} from './oauth-config.js';

describe('oauth-config', () => {
  it('treats Google as disabled when env vars are missing or empty', () => {
    expect(isGoogleOAuthConfigured({})).toBe(false);
    expect(
      isGoogleOAuthConfigured({
        GOOGLE_CLIENT_ID: '',
        GOOGLE_CLIENT_SECRET: '',
        GOOGLE_CALLBACK_URL: '',
      }),
    ).toBe(false);
    expect(
      isGoogleOAuthConfigured({
        GOOGLE_CLIENT_ID: '   ',
        GOOGLE_CLIENT_SECRET: 'secret',
        GOOGLE_CALLBACK_URL: 'http://localhost:3000/auth/google/callback',
      }),
    ).toBe(false);
  });

  it('detects Google configuration only when all values are set', () => {
    expect(
      isGoogleOAuthConfigured({
        GOOGLE_CLIENT_ID: 'id',
        GOOGLE_CLIENT_SECRET: 'secret',
        GOOGLE_CALLBACK_URL: 'http://localhost:3000/auth/google/callback',
      }),
    ).toBe(true);

    expect(
      isGoogleOAuthConfigured({
        GOOGLE_CLIENT_ID: 'id',
        GOOGLE_CLIENT_SECRET: '',
        GOOGLE_CALLBACK_URL: 'http://localhost:3000/auth/google/callback',
      }),
    ).toBe(false);
  });

  it('treats Facebook as disabled when env vars are missing or empty', () => {
    expect(isFacebookOAuthConfigured({})).toBe(false);
    expect(
      isFacebookOAuthConfigured({
        FACEBOOK_APP_ID: '',
        FACEBOOK_APP_SECRET: 'secret',
        FACEBOOK_CALLBACK_URL: 'http://localhost:3000/auth/facebook/callback',
      }),
    ).toBe(false);
  });

  it('detects Facebook configuration only when all values are set', () => {
    expect(
      isFacebookOAuthConfigured({
        FACEBOOK_APP_ID: 'id',
        FACEBOOK_APP_SECRET: 'secret',
        FACEBOOK_CALLBACK_URL: 'http://localhost:3000/auth/facebook/callback',
      }),
    ).toBe(true);
  });

  it('defaults FRONTEND_URL to the Vite development origin', () => {
    expect(getFrontendUrl({})).toBe('http://localhost:5173');
    expect(getFrontendUrl({ FRONTEND_URL: 'https://app.example.com/' })).toBe(
      'https://app.example.com',
    );
  });
});

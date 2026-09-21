import { describe, expect, it } from 'vitest';
import { resolveAuthGate } from './authGate';

describe('resolveAuthGate', () => {
  it('returns loading while authentication is initializing', () => {
    expect(
      resolveAuthGate({
        status: 'initializing',
        isAuthenticated: false,
        mode: 'protected',
      }),
    ).toBe('loading');
    expect(
      resolveAuthGate({
        status: 'initializing',
        isAuthenticated: true,
        mode: 'guest-only',
      }),
    ).toBe('loading');
  });

  it('redirects unauthenticated users away from protected routes', () => {
    expect(
      resolveAuthGate({
        status: 'ready',
        isAuthenticated: false,
        mode: 'protected',
      }),
    ).toBe('redirect-login');
  });

  it('allows authenticated users into protected routes', () => {
    expect(
      resolveAuthGate({
        status: 'ready',
        isAuthenticated: true,
        mode: 'protected',
      }),
    ).toBe('allow');
  });

  it('redirects authenticated users away from /login and /register', () => {
    expect(
      resolveAuthGate({
        status: 'ready',
        isAuthenticated: true,
        mode: 'guest-only',
      }),
    ).toBe('redirect-dashboard');
  });

  it('allows unauthenticated users on guest-only routes', () => {
    expect(
      resolveAuthGate({
        status: 'ready',
        isAuthenticated: false,
        mode: 'guest-only',
      }),
    ).toBe('allow');
  });
});

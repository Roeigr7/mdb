import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bootstrapAuth } from './authBootstrap';
import type { AuthUser } from './auth.types';

const user: AuthUser = {
  id: 1,
  name: 'Roei',
  email: 'roei@example.com',
  createdAt: '2026-01-01T00:00:00.000Z',
};

function createDispatchMock(unwrapImpl: () => Promise<unknown>) {
  return vi.fn((action: unknown) => {
    if (
      action &&
      typeof action === 'object' &&
      'type' in action &&
      typeof (action as { type: unknown }).type === 'string' &&
      (action as { type: string }).type.startsWith('auth/')
    ) {
      return action;
    }

    return {
      unwrap: unwrapImpl,
    };
  });
}

describe('bootstrapAuth', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('marks auth ready when no access token exists', async () => {
    const dispatch = createDispatchMock(async () => user);
    const getState = vi.fn(() => ({
      auth: {
        accessToken: null,
        refreshToken: null,
        user: null,
        status: 'ready' as const,
      },
    }));

    await bootstrapAuth(dispatch as never, getState as never);

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'auth/setAuthReady' }),
    );
  });

  it('restores the current user from /users/me on page refresh', async () => {
    const dispatch = createDispatchMock(async () => user);
    const getState = vi.fn(() => ({
      auth: {
        accessToken: 'access',
        refreshToken: 'refresh',
        user: null,
        status: 'initializing' as const,
      },
    }));

    await bootstrapAuth(dispatch as never, getState as never);

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'auth/setUser', payload: user }),
    );
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'auth/setAuthReady' }),
    );
  });

  it('clears credentials when /users/me and refresh both fail', async () => {
    const getState = vi.fn(() => ({
      auth: {
        accessToken: 'access',
        refreshToken: 'refresh',
        user: null,
        status: 'initializing' as const,
      },
    }));

    const authError = { status: 401, data: { message: 'Unauthorized' } };
    const dispatch = createDispatchMock(async () => {
      throw authError;
    });

    await bootstrapAuth(dispatch as never, getState as never);

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'auth/clearCredentials' }),
    );
  });
});

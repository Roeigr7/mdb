import { beforeEach, describe, expect, it, vi } from 'vitest';
import { establishSession } from './establishSession';
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

describe('establishSession', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('stores tokens and loads /users/me for login and OAuth', async () => {
    const dispatch = createDispatchMock(async () => user);

    const result = await establishSession(dispatch as never, {
      accessToken: 'access',
      refreshToken: 'refresh',
    });

    expect(result).toEqual(user);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'auth/setCredentials',
        payload: { accessToken: 'access', refreshToken: 'refresh' },
      }),
    );
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'auth/setUser', payload: user }),
    );
  });

  it('clears credentials when /users/me fails after token storage', async () => {
    const dispatch = createDispatchMock(async () => {
      throw { status: 401 };
    });

    await expect(
      establishSession(dispatch as never, {
        accessToken: 'access',
        refreshToken: 'refresh',
      }),
    ).rejects.toEqual({ status: 401 });

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'auth/clearCredentials' }),
    );
  });
});

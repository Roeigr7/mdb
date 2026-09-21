import { beforeEach, describe, expect, it } from 'vitest';
import {
  authReducer,
  clearCredentials,
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAuthInitializing,
  setAuthReady,
  setCredentials,
  setUser,
} from './authSlice';
import type { AuthUser } from './auth.types';

const user: AuthUser = {
  id: 1,
  name: 'Roei',
  email: 'roei@example.com',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('authSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts ready and unauthenticated when reducer has empty credentials', () => {
    const state = authReducer(
      {
        accessToken: null,
        refreshToken: null,
        user: null,
        status: 'ready',
      },
      { type: 'unknown' },
    );
    expect(state.status).toBe('ready');
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
    expect(selectIsAuthenticated({ auth: state })).toBe(false);
    expect(selectIsAuthInitializing({ auth: state })).toBe(false);
  });

  it('stores credentials and user for a completed login session', () => {
    let state = authReducer(
      {
        accessToken: null,
        refreshToken: null,
        user: null,
        status: 'ready',
      },
      setCredentials({ accessToken: 'access', refreshToken: 'refresh' }),
    );
    state = authReducer(state, setUser(user));
    state = authReducer(state, setAuthReady());

    expect(selectIsAuthenticated({ auth: state })).toBe(true);
    expect(selectCurrentUser({ auth: state })).toEqual(user);
    expect(localStorage.getItem('mbd_access_token')).toBe('access');
    expect(localStorage.getItem('mbd_refresh_token')).toBe('refresh');
  });

  it('clears tokens and user on logout', () => {
    let state = authReducer(
      {
        accessToken: 'access',
        refreshToken: 'refresh',
        user,
        status: 'ready',
      },
      clearCredentials(),
    );

    expect(selectIsAuthenticated({ auth: state })).toBe(false);
    expect(selectCurrentUser({ auth: state })).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(localStorage.getItem('mbd_access_token')).toBeNull();
    expect(localStorage.getItem('mbd_refresh_token')).toBeNull();
  });

  it('does not treat token-only state as authenticated until user is restored', () => {
    const state = authReducer(
      {
        accessToken: null,
        refreshToken: null,
        user: null,
        status: 'initializing',
      },
      setCredentials({ accessToken: 'access', refreshToken: 'refresh' }),
    );
    expect(selectIsAuthenticated({ auth: state })).toBe(false);
    expect(selectIsAuthInitializing({ auth: state })).toBe(true);
  });
});

describe('login and register session shape', () => {
  it('uses the same authenticated shape for email/password login', () => {
    let state = authReducer(
      {
        accessToken: null,
        refreshToken: null,
        user: null,
        status: 'ready',
      },
      setCredentials({ accessToken: 'a', refreshToken: 'r' }),
    );
    state = authReducer(state, setUser(user));
    expect(selectIsAuthenticated({ auth: state })).toBe(true);
    expect(selectCurrentUser({ auth: state })?.email).toBe('roei@example.com');
  });

  it('uses the same authenticated shape after register-then-login', () => {
    let state = authReducer(
      {
        accessToken: null,
        refreshToken: null,
        user: null,
        status: 'ready',
      },
      setCredentials({ accessToken: 'a', refreshToken: 'r' }),
    );
    state = authReducer(state, setUser({ ...user, name: 'New User' }));
    expect(selectIsAuthenticated({ auth: state })).toBe(true);
    expect(selectCurrentUser({ auth: state })?.name).toBe('New User');
  });
});

describe('OAuth authenticated flows', () => {
  it('Google OAuth uses the same user session as password login', () => {
    let state = authReducer(
      {
        accessToken: null,
        refreshToken: null,
        user: null,
        status: 'ready',
      },
      setCredentials({
        accessToken: 'google-access',
        refreshToken: 'google-refresh',
      }),
    );
    state = authReducer(state, setUser(user));
    expect(selectIsAuthenticated({ auth: state })).toBe(true);
    expect(selectCurrentUser({ auth: state })).toEqual(user);
  });

  it('Facebook OAuth uses the same user session as password login', () => {
    let state = authReducer(
      {
        accessToken: null,
        refreshToken: null,
        user: null,
        status: 'ready',
      },
      setCredentials({
        accessToken: 'facebook-access',
        refreshToken: 'facebook-refresh',
      }),
    );
    state = authReducer(state, setUser(user));
    expect(selectIsAuthenticated({ auth: state })).toBe(true);
    expect(selectCurrentUser({ auth: state })).toEqual(user);
  });
});

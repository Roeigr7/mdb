import type { AppDispatch, RootState } from '../../store';
import { authApi } from './authApi';
import {
  clearCredentials,
  setAuthReady,
  setCredentials,
  setUser,
} from './authSlice';

function isAuthFailure(error: unknown): boolean {
  if (!error || typeof error !== 'object' || !('status' in error)) {
    return false;
  }
  const status = (error as { status: unknown }).status;
  return status === 401 || status === 403 || status === 404;
}

/**
 * Restore the authenticated user on app startup / refresh.
 * Uses the access token when valid; otherwise rotates via refresh token.
 */
export async function bootstrapAuth(
  dispatch: AppDispatch,
  getState: () => RootState,
): Promise<void> {
  const { accessToken, refreshToken } = getState().auth;

  if (!accessToken) {
    dispatch(setAuthReady());
    return;
  }

  try {
    const user = await dispatch(
      authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }),
    ).unwrap();
    dispatch(setUser(user));
    dispatch(setAuthReady());
    return;
  } catch (error) {
    if (!isAuthFailure(error)) {
      // Keep tokens on transient errors; user can retry on the next refresh.
      dispatch(setAuthReady());
      return;
    }
  }

  const latestRefresh = getState().auth.refreshToken ?? refreshToken;
  if (!latestRefresh) {
    dispatch(clearCredentials());
    return;
  }

  try {
    const tokens = await dispatch(
      authApi.endpoints.refresh.initiate({ refreshToken: latestRefresh }),
    ).unwrap();
    dispatch(setCredentials(tokens));

    const user = await dispatch(
      authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }),
    ).unwrap();
    dispatch(setUser(user));
    dispatch(setAuthReady());
  } catch {
    dispatch(clearCredentials());
  }
}

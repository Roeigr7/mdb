import type { AppDispatch } from '../../store';
import { authApi } from './authApi';
import type { AuthTokens, AuthUser } from './auth.types';
import { clearCredentials, setCredentials, setUser } from './authSlice';

/**
 * Shared session establishment for password login and OAuth exchange.
 * Stores tokens, loads `/users/me`, and keeps a single user state shape.
 */
export async function establishSession(
  dispatch: AppDispatch,
  tokens: AuthTokens,
): Promise<AuthUser> {
  dispatch(setCredentials(tokens));

  try {
    const user = await dispatch(
      authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }),
    ).unwrap();
    dispatch(setUser(user));
    return user;
  } catch (error) {
    dispatch(clearCredentials());
    throw error;
  }
}

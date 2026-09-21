import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from './auth.types';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from './tokenStorage';

export type AuthStatus = 'initializing' | 'ready';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  status: AuthStatus;
};

const initialState: AuthState = {
  accessToken: getAccessToken(),
  refreshToken: getRefreshToken(),
  user: null,
  // Tokens in storage still need /users/me validation before routes decide.
  status: getAccessToken() ? 'initializing' : 'ready',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>,
    ) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      setTokens(action.payload.accessToken, action.payload.refreshToken);
    },
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
    },
    clearCredentials(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.status = 'ready';
      clearTokens();
    },
    setAuthReady(state) {
      state.status = 'ready';
    },
  },
});

export const { setCredentials, setUser, clearCredentials, setAuthReady } =
  authSlice.actions;
export const authReducer = authSlice.reducer;

export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  Boolean(state.auth.accessToken && state.auth.user);
export const selectIsAuthInitializing = (state: { auth: AuthState }) =>
  state.auth.status === 'initializing';

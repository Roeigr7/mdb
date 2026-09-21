import type { AuthStatus } from './authSlice';

export type AuthGateMode = 'protected' | 'guest-only';

export type AuthGateDecision =
  | 'loading'
  | 'allow'
  | 'redirect-login'
  | 'redirect-dashboard';

/**
 * Pure route-gate decision used by ProtectedRoute / LoginPage.
 * Keeps redirects stable while auth bootstrap is still running.
 */
export function resolveAuthGate(options: {
  status: AuthStatus;
  isAuthenticated: boolean;
  mode: AuthGateMode;
}): AuthGateDecision {
  if (options.status === 'initializing') {
    return 'loading';
  }

  if (options.mode === 'protected') {
    return options.isAuthenticated ? 'allow' : 'redirect-login';
  }

  return options.isAuthenticated ? 'redirect-dashboard' : 'allow';
}

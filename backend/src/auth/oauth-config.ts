/**
 * Helpers for optional Google / Facebook OAuth configuration.
 * Secrets are never logged — only presence checks.
 */

export function isGoogleOAuthConfigured(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return Boolean(
    env.GOOGLE_CLIENT_ID?.trim() &&
      env.GOOGLE_CLIENT_SECRET?.trim() &&
      env.GOOGLE_CALLBACK_URL?.trim(),
  );
}

export function isFacebookOAuthConfigured(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return Boolean(
    env.FACEBOOK_APP_ID?.trim() &&
      env.FACEBOOK_APP_SECRET?.trim() &&
      env.FACEBOOK_CALLBACK_URL?.trim(),
  );
}

export function getFrontendUrl(env: NodeJS.ProcessEnv = process.env): string {
  const configured = env.FRONTEND_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, '');
  }
  return 'http://localhost:5173';
}

import type { OAuthProviders } from '../../app/features/auth/auth.types';

export type OAuthProvidersQueryStatus = 'pending' | 'error' | 'success';

export type OAuthButtonVisibility = {
  showGoogle: boolean;
  showFacebook: boolean;
};

/**
 * Decide which OAuth buttons to render from /auth/providers.
 * While loading or on error, hide all OAuth UI so email/password stays primary
 * and disabled providers never get navigated to.
 */
export function resolveOAuthButtonVisibility(
  providers: OAuthProviders | undefined,
  status: OAuthProvidersQueryStatus,
): OAuthButtonVisibility {
  if (status !== 'success' || !providers) {
    return { showGoogle: false, showFacebook: false };
  }

  return {
    showGoogle: providers.google === true,
    showFacebook: providers.facebook === true,
  };
}

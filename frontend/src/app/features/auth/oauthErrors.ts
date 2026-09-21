export type OAuthErrorTranslationKey =
  | 'auth.oauthCancelled'
  | 'auth.oauthNotConfigured'
  | 'auth.oauthEmailUnverified'
  | 'auth.oauthEmailMissing'
  | 'auth.oauthLinkConflict'
  | 'auth.oauthEmailExists'
  | 'auth.oauthInvalid'
  | 'auth.oauthFailed';

type TranslateFn = (key: OAuthErrorTranslationKey) => string;

export function mapOAuthErrorCode(
  code: string | null,
  t: TranslateFn,
): string | null {
  if (!code) return null;
  switch (code) {
    case 'oauth_cancelled':
      return t('auth.oauthCancelled');
    case 'oauth_not_configured':
      return t('auth.oauthNotConfigured');
    case 'oauth_email_unverified':
      return t('auth.oauthEmailUnverified');
    case 'oauth_email_missing':
      return t('auth.oauthEmailMissing');
    case 'oauth_link_conflict':
      return t('auth.oauthLinkConflict');
    case 'oauth_email_exists':
      return t('auth.oauthEmailExists');
    case 'oauth_invalid':
      return t('auth.oauthInvalid');
    case 'oauth_failed':
    default:
      return t('auth.oauthFailed');
  }
}

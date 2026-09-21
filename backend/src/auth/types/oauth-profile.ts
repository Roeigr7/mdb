export type OAuthProvider = 'google' | 'facebook';

export type OAuthProfileInput = {
  provider: OAuthProvider;
  providerUserId: string;
  email: string;
  emailVerified: boolean;
  name: string;
};

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile } from 'passport-google-oauth20';
import { AuthService } from '../auth.service.js';
import type { OAuthPassportUser } from '../oauth-redirect.js';
import type { OAuthProfileInput } from '../types/oauth-profile.js';

/**
 * NestJS PassportStrategy always invokes Passport's `done` after `validate`
 * resolves or rejects. Do not call `done` yourself — that causes a second
 * authenticate callback and a double `res.redirect` (ERR_HTTP_HEADERS_SENT).
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<OAuthPassportUser> {
    const primaryEmail = profile.emails?.[0];
    const email = primaryEmail?.value?.trim().toLowerCase() ?? '';
    const raw = profile._json as {
      email_verified?: boolean | string;
      verified_email?: boolean | string;
    };
    const emailVerified =
      raw.email_verified === true ||
      raw.email_verified === 'true' ||
      raw.verified_email === true ||
      raw.verified_email === 'true' ||
      (primaryEmail as { verified?: boolean } | undefined)?.verified === true;

    const input: OAuthProfileInput = {
      provider: 'google',
      providerUserId: profile.id,
      email,
      emailVerified: Boolean(email) && emailVerified,
      name: profile.displayName?.trim() || email.split('@')[0] || 'User',
    };

    const exchangeCode = await this.authService.loginWithOAuthProfile(input);
    return { exchangeCode };
  }
}

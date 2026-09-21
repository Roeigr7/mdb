import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile } from 'passport-facebook';
import { AuthService } from '../auth.service.js';
import type { OAuthPassportUser } from '../oauth-redirect.js';
import type { OAuthProfileInput } from '../types/oauth-profile.js';

/**
 * NestJS PassportStrategy always invokes Passport's `done` after `validate`
 * resolves or rejects. Do not call `done` yourself — that causes a second
 * authenticate callback and a double `res.redirect` (ERR_HTTP_HEADERS_SENT).
 */
@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
      scope: ['email', 'public_profile'],
      profileFields: ['id', 'displayName', 'emails', 'name'],
      enableProof: true,
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<OAuthPassportUser> {
    const email = profile.emails?.[0]?.value?.trim().toLowerCase() ?? '';

    // Facebook only returns email when the user granted the email permission.
    // Treat a returned email as usable for account linking (provider-controlled).
    const input: OAuthProfileInput = {
      provider: 'facebook',
      providerUserId: profile.id,
      email,
      emailVerified: Boolean(email),
      name: profile.displayName?.trim() || email.split('@')[0] || 'User',
    };

    const exchangeCode = await this.authService.loginWithOAuthProfile(input);
    return { exchangeCode };
  }
}

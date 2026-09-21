import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { isFacebookOAuthConfigured } from '../oauth-config.js';
import {
  redirectOAuthFailure,
  type OAuthPassportUser,
} from '../oauth-redirect.js';

@Injectable()
export class FacebookAuthGuard
  extends AuthGuard('facebook')
  implements CanActivate
{
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!isFacebookOAuthConfigured()) {
      throw new ServiceUnavailableException(
        'Facebook sign-in is not configured on this server',
      );
    }
    return (await super.canActivate(context)) as boolean;
  }

  /**
   * On callback failure, redirect once to the frontend.
   * Do not throw after redirecting — Nest's exception filter would send a
   * second response and trigger ERR_HTTP_HEADERS_SENT.
   */
  override handleRequest<TUser = OAuthPassportUser>(
    err: Error | null,
    user: TUser | false,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      const res = context.switchToHttp().getResponse<Response>();
      redirectOAuthFailure(res, err instanceof Error ? err : null);
      return { exchangeCode: '' } as TUser;
    }
    return user;
  }
}

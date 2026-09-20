import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthenticatedRequest } from '../types/authenticated-request.js';
import type { JwtPayload } from '../types/jwt-payload.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Missing or invalid authorization token');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      if (
        'type' in payload &&
        (payload as JwtPayload & { type?: string }).type === 'refresh'
      ) {
        throw new UnauthorizedException(
          'Missing or invalid authorization token',
        );
      }

      request.user = payload;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Missing or invalid authorization token');
    }
  }

  private extractBearerToken(authorization?: string): string | undefined {
    if (!authorization) {
      return undefined;
    }

    const [type, token] = authorization.split(' ');
    return type === 'Bearer' && token ? token : undefined;
  }
}

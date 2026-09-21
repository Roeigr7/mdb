import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'node:crypto';
import type { StringValue } from 'ms';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import type { JwtPayload } from './types/jwt-payload.js';
import type { OAuthProfileInput } from './types/oauth-profile.js';
import type { RefreshTokenPayload } from './types/refresh-token-payload.js';

type TokenUser = {
  id: number;
  email: string;
  role: JwtPayload['role'];
};

type CreatedRefreshToken = {
  refreshToken: string;
  jti: string;
  tokenHash: string;
  expiresAt: Date;
};

const OAUTH_EXCHANGE_TTL_MS = 2 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  /**
   * Best-effort session revoke: delete the refresh-token row when the JWT is
   * valid. Always succeeds so clients can clear local state safely.
   */
  async logout(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
      );

      if (payload.type === 'refresh' && payload.jti) {
        await this.prisma.refreshToken.deleteMany({
          where: { jti: payload.jti },
        });
      }
    } catch {
      // Invalid/expired tokens are treated as already logged out.
    }

    return { message: 'Logged out successfully' };
  }

  async refresh(refreshToken: string) {
    let payload: RefreshTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh' || !payload.jti || !payload.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { jti: payload.jti },
      include: {
        user: true,
      },
    });

    if (!storedToken || storedToken.userId !== payload.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.expiresAt.getTime() <= Date.now()) {
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isTokenValid = await bcrypt.compare(
      refreshToken,
      storedToken.tokenHash,
    );

    if (!isTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user: TokenUser = {
      id: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    };

    // JWT/bcrypt work stays outside the DB transaction
    const accessToken = await this.createAccessToken(user);
    const nextRefreshToken = await this.createRefreshToken(user);

    // Only refresh-token DB rotation is transactional
    await this.prisma.$transaction(async (tx) => {
      await tx.refreshToken.delete({
        where: { id: storedToken.id },
      });

      await tx.refreshToken.create({
        data: {
          jti: nextRefreshToken.jti,
          tokenHash: nextRefreshToken.tokenHash,
          userId: user.id,
          expiresAt: nextRefreshToken.expiresAt,
        },
      });
    });

    return {
      accessToken,
      refreshToken: nextRefreshToken.refreshToken,
    };
  }

  /**
   * Find or create a user from a verified OAuth provider profile,
   * then return a short-lived one-time exchange code (not JWT).
   */
  async loginWithOAuthProfile(profile: OAuthProfileInput): Promise<string> {
    const user = await this.resolveOAuthUser(profile);
    return this.createOAuthExchangeCode(user.id);
  }

  async exchangeOAuthCode(code: string) {
    const codeHash = this.hashOAuthExchangeCode(code);
    const stored = await this.prisma.oAuthExchangeCode.findUnique({
      where: { codeHash },
      include: { user: true },
    });

    if (!stored || stored.usedAt || stored.expiresAt.getTime() <= Date.now()) {
      if (stored && !stored.usedAt) {
        await this.prisma.oAuthExchangeCode.delete({ where: { id: stored.id } });
      }
      throw new UnauthorizedException('Invalid or expired OAuth code');
    }

    await this.prisma.oAuthExchangeCode.update({
      where: { id: stored.id },
      data: { usedAt: new Date() },
    });

    return this.issueTokenPair({
      id: stored.user.id,
      email: stored.user.email,
      role: stored.user.role,
    });
  }

  async resolveOAuthUser(profile: OAuthProfileInput) {
    const email = profile.email.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      throw new BadRequestException(
        'OAuth provider did not return a usable email address',
      );
    }

    if (!profile.emailVerified) {
      throw new BadRequestException(
        'OAuth provider email is not verified. Use a verified account.',
      );
    }

    if (!profile.providerUserId?.trim()) {
      throw new BadRequestException('Invalid OAuth provider response');
    }

    const providerIdField =
      profile.provider === 'google' ? 'googleId' : 'facebookId';

    const byProvider = await this.prisma.user.findUnique({
      where: { [providerIdField]: profile.providerUserId } as
        | { googleId: string }
        | { facebookId: string },
    });

    if (byProvider) {
      return byProvider;
    }

    const byEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (byEmail) {
      const existingProviderId =
        profile.provider === 'google' ? byEmail.googleId : byEmail.facebookId;

      if (existingProviderId && existingProviderId !== profile.providerUserId) {
        throw new ConflictException(
          'This email is already linked to a different OAuth account',
        );
      }

      return this.prisma.user.update({
        where: { id: byEmail.id },
        data: {
          [providerIdField]: profile.providerUserId,
          ...(byEmail.name?.trim()
            ? {}
            : { name: profile.name.trim() || email }),
        },
      });
    }

    const name = profile.name.trim() || email.split('@')[0] || 'User';

    return this.prisma.user.create({
      data: {
        name,
        email,
        passwordHash: null,
        [providerIdField]: profile.providerUserId,
      },
    });
  }

  private async createOAuthExchangeCode(userId: number): Promise<string> {
    const code = randomUUID();
    const codeHash = this.hashOAuthExchangeCode(code);

    await this.prisma.oAuthExchangeCode.create({
      data: {
        codeHash,
        userId,
        expiresAt: new Date(Date.now() + OAUTH_EXCHANGE_TTL_MS),
      },
    });

    return code;
  }

  private hashOAuthExchangeCode(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }

  private async issueTokenPair(user: TokenUser) {
    const accessToken = await this.createAccessToken(user);
    const refreshToken = await this.createRefreshToken(user);

    await this.prisma.refreshToken.create({
      data: {
        jti: refreshToken.jti,
        tokenHash: refreshToken.tokenHash,
        userId: user.id,
        expiresAt: refreshToken.expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: refreshToken.refreshToken,
    };
  }

  private async createAccessToken(user: TokenUser) {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private async createRefreshToken(user: TokenUser): Promise<CreatedRefreshToken> {
    const jti = randomUUID();
    const refreshExpiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ??
      '7d') as StringValue;

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        type: 'refresh',
        jti,
      } satisfies RefreshTokenPayload,
      {
        expiresIn: refreshExpiresIn,
      },
    );

    const decoded = this.jwtService.decode<{ exp: number }>(refreshToken);
    if (!decoded?.exp) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenHash = await bcrypt.hash(refreshToken, 10);

    return {
      refreshToken,
      jti,
      tokenHash,
      expiresAt: new Date(decoded.exp * 1000),
    };
  }
}

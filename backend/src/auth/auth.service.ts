import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import type { StringValue } from 'ms';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import type { JwtPayload } from './types/jwt-payload.js';
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

    if (!user) {
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

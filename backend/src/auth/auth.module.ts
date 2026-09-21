import 'dotenv/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { FacebookAuthGuard } from './guards/facebook-auth.guard.js';
import { GoogleAuthGuard } from './guards/google-auth.guard.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import {
  isFacebookOAuthConfigured,
  isGoogleOAuthConfigured,
} from './oauth-config.js';
import { FacebookStrategy } from './strategies/facebook.strategy.js';
import { GoogleStrategy } from './strategies/google.strategy.js';

const oauthProviders = [
  ...(isGoogleOAuthConfigured() ? [GoogleStrategy] : []),
  ...(isFacebookOAuthConfigured() ? [FacebookStrategy] : []),
];

@Module({
  imports: [
    PassportModule.register({ session: false }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as StringValue,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    GoogleAuthGuard,
    FacebookAuthGuard,
    ...oauthProviders,
  ],
  exports: [JwtModule, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}

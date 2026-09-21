import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import {
  AuthTokensResponseDto,
  AuthUserResponseDto,
  MessageResponseDto,
  OAuthProvidersResponseDto,
} from '../common/swagger/api-responses.dto.js';
import { AuthService } from './auth.service.js';
import { ExchangeOAuthCodeDto } from './dto/exchange-oauth-code.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { FacebookAuthGuard } from './guards/facebook-auth.guard.js';
import { GoogleAuthGuard } from './guards/google-auth.guard.js';
import {
  isFacebookOAuthConfigured,
  isGoogleOAuthConfigured,
} from './oauth-config.js';
import {
  redirectOAuthFailure,
  redirectOAuthSuccess,
  type OAuthPassportUser,
} from './oauth-redirect.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('providers')
  @ApiOperation({
    summary: 'Which OAuth providers are configured on this server',
  })
  @ApiResponse({ status: 200, type: OAuthProvidersResponseDto })
  providers(): OAuthProvidersResponseDto {
    return {
      google: isGoogleOAuthConfigured(),
      facebook: isFacebookOAuthConfigured(),
    };
  }

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, type: AuthUserResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  @ApiTooManyRequestsResponse({ description: 'Rate limit exceeded' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Login and receive access + refresh tokens' })
  @ApiResponse({ status: 200, type: AuthTokensResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiTooManyRequestsResponse({ description: 'Rate limit exceeded' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Rotate refresh token and issue a new access token pair',
  })
  @ApiResponse({ status: 200, type: AuthTokensResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  @ApiTooManyRequestsResponse({ description: 'Rate limit exceeded' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Revoke a refresh token and end the session',
    description:
      'Deletes the refresh-token row when valid. Always returns success so clients can clear local state.',
  })
  @ApiResponse({ status: 200, type: MessageResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiTooManyRequestsResponse({ description: 'Rate limit exceeded' })
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Post('oauth/exchange')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Exchange a one-time OAuth code for access + refresh tokens',
    description:
      'Used after Google/Facebook callback redirects to the frontend with ?code=…',
  })
  @ApiResponse({ status: 200, type: AuthTokensResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired OAuth code' })
  @ApiTooManyRequestsResponse({ description: 'Rate limit exceeded' })
  exchangeOAuthCode(@Body() dto: ExchangeOAuthCodeDto) {
    return this.authService.exchangeOAuthCode(dto.code);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Start Google OAuth (browser redirect)' })
  googleAuth() {
    // Passport redirects to Google.
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback (browser redirect)' })
  googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    this.finishOAuthLogin(req, res);
  }

  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: 'Start Facebook OAuth (browser redirect)' })
  facebookAuth() {
    // Passport redirects to Facebook.
  }

  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: 'Facebook OAuth callback (browser redirect)' })
  facebookAuthCallback(@Req() req: Request, @Res() res: Response) {
    this.finishOAuthLogin(req, res);
  }

  /**
   * Exactly one response: success redirect with exchange code, or a failure
   * redirect if the guard already handled the error / headers were sent.
   */
  private finishOAuthLogin(req: Request, res: Response): void {
    if (res.headersSent) {
      return;
    }

    const passportUser = req.user as OAuthPassportUser | undefined;
    if (!passportUser?.exchangeCode) {
      redirectOAuthFailure(res, null);
      return;
    }

    redirectOAuthSuccess(res, passportUser.exchangeCode);
  }
}

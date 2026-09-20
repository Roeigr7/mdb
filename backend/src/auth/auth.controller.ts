import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  AuthTokensResponseDto,
  AuthUserResponseDto,
} from '../common/swagger/api-responses.dto.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}

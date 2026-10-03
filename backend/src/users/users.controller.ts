import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request.js';
import {
  MessageResponseDto,
  PaginatedUsersResponseDto,
  UserResponseDto,
} from '../common/swagger/api-responses.dto.js';
import { UserRole } from '../generated/prisma/client.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { GetUsersDto } from './dto/get-users.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'List users (ADMIN only)',
    description: 'Requires JWT authentication and ADMIN role.',
  })
  @ApiOkResponse({ type: PaginatedUsersResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions (ADMIN required)',
  })
  getUsers(@Query() query: GetUsersDto) {
    return this.usersService.getUsers(query);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Authenticated user not found' })
  getMe(@Req() req: AuthenticatedRequest) {
    return this.usersService.getMe(req.user);
  }

  @Post('me/password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Change or set password for the authenticated user',
    description:
      'If the account already has a password, currentPassword is required. OAuth-only accounts can set a password without currentPassword.',
  })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token / wrong current password',
  })
  changePassword(
    @Body() dto: ChangePasswordDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usersService.changePassword(dto, req.user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'User not found' })
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update own user profile',
    description: 'Users may only update their own account (ownership check).',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Cannot update another user' })
  @ApiNotFoundResponse({ description: 'User not found' })
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usersService.updateUser(id, dto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete own user account',
    description: 'Users may only delete their own account (ownership check).',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Cannot delete another user' })
  @ApiNotFoundResponse({ description: 'User not found' })
  deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usersService.deleteUser(id, req.user);
  }
}

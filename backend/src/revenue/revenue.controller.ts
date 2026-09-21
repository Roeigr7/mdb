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
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request.js';
import { ListPaginationQueryDto } from '../common/dto/list-pagination-query.dto.js';
import {
  MessageResponseDto,
  RevenueResponseDto,
} from '../common/swagger/api-responses.dto.js';
import { CreateRevenueDto } from './dto/create-revenue.dto.js';
import { UpdateRevenueDto } from './dto/update-revenue.dto.js';
import { RevenueService } from './revenue.service.js';

@ApiTags('revenue')
@ApiBearerAuth('access-token')
@ApiParam({ name: 'projectId', type: Number })
@Controller('projects/:projectId/revenue')
@UseGuards(JwtAuthGuard)
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  @Get()
  @ApiOperation({
    summary: 'List revenue records for an owned project',
    description:
      'Returns 404 if the project does not exist or belongs to another user.',
  })
  @ApiOkResponse({ type: [RevenueResponseDto] })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  getRevenues(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query() query: ListPaginationQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.revenueService.getRevenues(
      projectId,
      req.user.sub,
      query.page ?? 1,
      query.limit ?? 10,
    );
  }

  @Get(':revenueId')
  @ApiOperation({
    summary: 'Get a single revenue record on an owned project',
    description:
      'Returns 404 if the project is not owned or the revenue is not on that project.',
  })
  @ApiParam({ name: 'revenueId', type: Number })
  @ApiOkResponse({ type: RevenueResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Project or revenue not found' })
  getRevenue(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('revenueId', ParseIntPipe) revenueId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.revenueService.getRevenue(projectId, revenueId, req.user.sub);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a revenue record on an owned project',
    description:
      'projectId is taken from the route. A projectId in the body is rejected.',
  })
  @ApiCreatedResponse({ type: RevenueResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  createRevenue(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreateRevenueDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.revenueService.createRevenue(projectId, dto, req.user.sub);
  }

  @Patch(':revenueId')
  @ApiOperation({
    summary: 'Update a revenue record on an owned project',
    description:
      'Returns 404 if the project is not owned or the revenue is not on that project.',
  })
  @ApiParam({ name: 'revenueId', type: Number })
  @ApiOkResponse({ type: RevenueResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Project or revenue not found' })
  updateRevenue(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('revenueId', ParseIntPipe) revenueId: number,
    @Body() dto: UpdateRevenueDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.revenueService.updateRevenue(
      projectId,
      revenueId,
      dto,
      req.user.sub,
    );
  }

  @Delete(':revenueId')
  @ApiOperation({
    summary: 'Delete a revenue record on an owned project',
    description:
      'Returns 404 if the project is not owned or the revenue is not on that project.',
  })
  @ApiParam({ name: 'revenueId', type: Number })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Project or revenue not found' })
  deleteRevenue(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('revenueId', ParseIntPipe) revenueId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.revenueService.deleteRevenue(
      projectId,
      revenueId,
      req.user.sub,
    );
  }
}

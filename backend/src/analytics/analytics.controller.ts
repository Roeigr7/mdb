import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request.js';
import { AnalyticsService } from './analytics.service.js';
import { GetAnalyticsQueryDto } from './dto/get-analytics-query.dto.js';

@ApiTags('analytics')
@ApiBearerAuth('access-token')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @ApiOperation({
    summary: 'Financial analytics overview for charts',
    description:
      'Aggregates expenses, revenue, and materials across owned projects. Optional projectId scopes to one project.',
  })
  @ApiOkResponse({ description: 'Analytics payload for dashboard charts' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  getOverview(
    @Query() query: GetAnalyticsQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.analyticsService.getOverview(req.user.sub, query.projectId);
  }
}

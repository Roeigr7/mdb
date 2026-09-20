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
import {
  MessageResponseDto,
  PaginatedProjectsResponseDto,
  ProjectResponseDto,
} from '../common/swagger/api-responses.dto.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { GetProjectsDto } from './dto/get-projects.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { ProjectsService } from './projects.service.js';

@ApiTags('projects')
@ApiBearerAuth('access-token')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'List authenticated user projects',
    description:
      'Returns only projects owned by the current user. Supports pagination, search, and sorting.',
  })
  @ApiOkResponse({ type: PaginatedProjectsResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  getProjects(
    @Query() query: GetProjectsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.projectsService.getProjects(req.user.sub, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a project for the authenticated user' })
  @ApiCreatedResponse({ type: ProjectResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  createProject(
    @Body() dto: CreateProjectDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.projectsService.createProject(dto, req.user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get a project by ID',
    description:
      'Returns 404 if the project does not exist or belongs to another user.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: ProjectResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  getProjectById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.projectsService.getProjectById(id, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete own project',
    description:
      'Returns 404 if the project does not exist or belongs to another user.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  deleteProject(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.projectsService.deleteProject(id, req.user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update own project',
    description:
      'Partial update. Returns 404 if the project does not exist or belongs to another user.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: ProjectResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  updateProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.projectsService.updateProject(id, dto, req.user.sub);
  }
}

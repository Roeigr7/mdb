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
  MaterialResponseDto,
  MessageResponseDto,
} from '../common/swagger/api-responses.dto.js';
import { CreateMaterialDto } from './dto/create-material.dto.js';
import { UpdateMaterialDto } from './dto/update-material.dto.js';
import { MaterialsService } from './materials.service.js';

@ApiTags('materials')
@ApiBearerAuth('access-token')
@ApiParam({ name: 'projectId', type: Number })
@Controller('projects/:projectId/materials')
@UseGuards(JwtAuthGuard)
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  @ApiOperation({
    summary: 'List materials for an owned project',
    description:
      'Returns 404 if the project does not exist or belongs to another user. Cost is quantity × unitPrice.',
  })
  @ApiOkResponse({ type: [MaterialResponseDto] })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  getMaterials(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query() query: ListPaginationQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.materialsService.getMaterials(
      projectId,
      req.user.sub,
      query.page ?? 1,
      query.limit ?? 10,
    );
  }

  @Post()
  @ApiOperation({
    summary: 'Create a material on an owned project',
    description:
      'projectId is taken from the route. A projectId in the body is rejected.',
  })
  @ApiCreatedResponse({ type: MaterialResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  createMaterial(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreateMaterialDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.materialsService.createMaterial(projectId, dto, req.user.sub);
  }

  @Patch(':materialId')
  @ApiOperation({
    summary: 'Update a material on an owned project',
    description:
      'Returns 404 if the project is not owned by the user or the material is not on that project.',
  })
  @ApiParam({ name: 'materialId', type: Number })
  @ApiOkResponse({ type: MaterialResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Project or material not found' })
  updateMaterial(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('materialId', ParseIntPipe) materialId: number,
    @Body() dto: UpdateMaterialDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.materialsService.updateMaterial(
      projectId,
      materialId,
      dto,
      req.user.sub,
    );
  }

  @Delete(':materialId')
  @ApiOperation({
    summary: 'Delete a material on an owned project',
    description:
      'Returns 404 if the project is not owned by the user or the material is not on that project.',
  })
  @ApiParam({ name: 'materialId', type: Number })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Project or material not found' })
  deleteMaterial(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('materialId', ParseIntPipe) materialId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.materialsService.deleteMaterial(
      projectId,
      materialId,
      req.user.sub,
    );
  }
}

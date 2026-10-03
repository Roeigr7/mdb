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
  PaginatedSuppliersResponseDto,
  SupplierResponseDto,
} from '../common/swagger/api-responses.dto.js';
import { CreateSupplierDto } from './dto/create-supplier.dto.js';
import { GetSuppliersDto } from './dto/get-suppliers.dto.js';
import { UpdateSupplierDto } from './dto/update-supplier.dto.js';
import { SuppliersService } from './suppliers.service.js';

@ApiTags('suppliers')
@ApiBearerAuth('access-token')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'List authenticated user suppliers',
    description:
      'Returns only suppliers owned by the current user. Supports pagination, search, and sorting.',
  })
  @ApiOkResponse({ type: PaginatedSuppliersResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  getSuppliers(
    @Query() query: GetSuppliersDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.suppliersService.getSuppliers(req.user.sub, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a supplier for the authenticated user' })
  @ApiCreatedResponse({ type: SupplierResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  createSupplier(
    @Body() dto: CreateSupplierDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.suppliersService.createSupplier(dto, req.user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get a supplier by ID',
    description:
      'Returns 404 if the supplier does not exist or belongs to another user.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: SupplierResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Supplier not found' })
  getSupplierById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.suppliersService.getSupplierById(id, req.user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update own supplier',
    description:
      'Partial update. Returns 404 if the supplier does not exist or belongs to another user.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: SupplierResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Supplier not found' })
  updateSupplier(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSupplierDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.suppliersService.updateSupplier(id, dto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete own supplier',
    description:
      'Returns 404 if the supplier does not exist or belongs to another user.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Supplier not found' })
  deleteSupplier(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.suppliersService.deleteSupplier(id, req.user.sub);
  }
}

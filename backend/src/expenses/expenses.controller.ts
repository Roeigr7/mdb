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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request.js';
import { ListPaginationQueryDto } from '../common/dto/list-pagination-query.dto.js';
import {
  DocumentScanResponseDto,
  ExpenseResponseDto,
  MessageResponseDto,
} from '../common/swagger/api-responses.dto.js';
import { MAX_DOCUMENT_BYTES } from '../documents/document-file.validation.js';
import { DocumentProcessingService } from '../documents/document-processing.service.js';
import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { UpdateExpenseDto } from './dto/update-expense.dto.js';
import { ExpensesService } from './expenses.service.js';

@ApiTags('expenses')
@ApiBearerAuth('access-token')
@ApiParam({ name: 'projectId', type: Number })
@Controller('projects/:projectId/expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(
    private readonly expensesService: ExpensesService,
    private readonly documentProcessingService: DocumentProcessingService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List expenses for an owned project',
    description:
      'Paginated list (default 10 per page) with project-wide summary totals. Returns 404 if the project does not exist or belongs to another user.',
  })
  @ApiOkResponse({ type: ExpenseResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  getExpenses(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query() query: ListPaginationQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.expensesService.getExpenses(
      projectId,
      req.user.sub,
      query.page ?? 1,
      query.limit ?? 10,
    );
  }

  @Post('scan')
  @ApiOperation({
    summary: 'Scan a receipt/invoice for expense review (does not save)',
    description:
      'Upload → OCR → extraction → validation. Returns structured data for user confirmation. Does not create an expense.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiCreatedResponse({ type: DocumentScanResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_DOCUMENT_BYTES, files: 1 },
    }),
  )
  scanExpense(
    @Param('projectId', ParseIntPipe) projectId: number,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.documentProcessingService.scanDocument(
      projectId,
      req.user.sub,
      file,
    );
  }

  @Get(':expenseId')
  @ApiOperation({
    summary: 'Get a single expense on an owned project',
    description:
      'Returns 404 if the project is not owned or the expense is not on that project.',
  })
  @ApiParam({ name: 'expenseId', type: Number })
  @ApiOkResponse({ type: ExpenseResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Project or expense not found' })
  getExpense(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('expenseId', ParseIntPipe) expenseId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.expensesService.getExpense(projectId, expenseId, req.user.sub);
  }

  @Post()
  @ApiOperation({
    summary: 'Create an expense on an owned project',
    description:
      'projectId is taken from the route. A projectId in the body is rejected. Use after manual entry or scan confirmation.',
  })
  @ApiCreatedResponse({ type: ExpenseResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  createExpense(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreateExpenseDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.expensesService.createExpense(projectId, dto, req.user.sub);
  }

  @Patch(':expenseId')
  @ApiOperation({
    summary: 'Update an expense on an owned project',
    description:
      'Returns 404 if the project is not owned or the expense is not on that project.',
  })
  @ApiParam({ name: 'expenseId', type: Number })
  @ApiOkResponse({ type: ExpenseResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Project or expense not found' })
  updateExpense(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('expenseId', ParseIntPipe) expenseId: number,
    @Body() dto: UpdateExpenseDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.expensesService.updateExpense(
      projectId,
      expenseId,
      dto,
      req.user.sub,
    );
  }

  @Delete(':expenseId')
  @ApiOperation({
    summary: 'Delete an expense on an owned project',
    description:
      'Returns 404 if the project is not owned or the expense is not on that project.',
  })
  @ApiParam({ name: 'expenseId', type: Number })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Project or expense not found' })
  deleteExpense(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('expenseId', ParseIntPipe) expenseId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.expensesService.deleteExpense(
      projectId,
      expenseId,
      req.user.sub,
    );
  }
}

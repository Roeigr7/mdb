import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
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
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request.js';
import { DocumentScanResponseDto } from '../common/swagger/api-responses.dto.js';
import { MAX_DOCUMENT_BYTES } from './document-file.validation.js';
import { DocumentProcessingService } from './document-processing.service.js';

@ApiTags('documents')
@ApiBearerAuth('access-token')
@ApiParam({ name: 'projectId', type: Number })
@Controller('projects/:projectId/documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(
    private readonly documentProcessingService: DocumentProcessingService,
  ) {}

  @Post('scan')
  @ApiOperation({
    summary: 'Upload and scan a receipt/invoice (does not save a transaction)',
    description:
      'Stores the file, runs OCR + extraction, validates structured data, and returns it for user review. Does not create Expense/Revenue rows.',
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
          description: 'JPG, JPEG, PNG, or PDF (max 10 MB)',
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
  scanDocument(
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
}

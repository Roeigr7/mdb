import {
  BadGatewayException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { validateUploadedDocumentFile } from './document-file.validation.js';
import {
  DOCUMENT_EXTRACTION,
  type DocumentExtractionService,
  type ExtractedDocumentData,
} from './extraction/extraction.interface.js';
import { validateExtractedDocumentData } from './extraction/validate-extracted-data.js';
import { OCR_SERVICE, type OcrService } from './ocr/ocr.interface.js';
import {
  DOCUMENT_STORAGE,
  type DocumentStorageProvider,
} from './storage/document-storage.interface.js';

function isHttpException(error: unknown): error is HttpException {
  return error instanceof HttpException;
}

export type ScanDocumentResult = {
  documentId: number;
  documentUrl: string;
  extractedData: ExtractedDocumentData;
  ocrConfidence?: number;
};

@Injectable()
export class DocumentProcessingService {
  private readonly logger = new Logger(DocumentProcessingService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(DOCUMENT_STORAGE)
    private readonly storage: DocumentStorageProvider,
    @Inject(OCR_SERVICE)
    private readonly ocr: OcrService,
    @Inject(DOCUMENT_EXTRACTION)
    private readonly extraction: DocumentExtractionService,
  ) {}

  async scanDocument(
    projectId: number,
    userId: number,
    file: Express.Multer.File | undefined,
  ): Promise<ScanDocumentResult> {
    this.logger.log(
      `[SCAN] Upload started projectId=${projectId} userId=${userId}`,
    );

    await this.assertOwnedProject(projectId, userId);

    if (file) {
      this.logger.log(
        `[SCAN] file received name=${file.originalname} mime=${file.mimetype} size=${file.size} bufferLength=${file.buffer?.length ?? 0}`,
      );
    } else {
      this.logger.warn('[SCAN] file missing from multipart request');
    }

    const uploaded = file
      ? {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        }
      : undefined;

    validateUploadedDocumentFile(uploaded);
    this.logger.log('[SCAN] file validation passed');

    const originalName = uploaded.originalname;
    let storedKey: string | null = null;

    try {
      const stored = await this.storage.upload({
        buffer: uploaded.buffer,
        originalName,
        mimeType: uploaded.mimetype,
        projectId,
      });
      storedKey = stored.storageKey;
      this.logger.log(`[SCAN] File stored key=${stored.storageKey}`);

      if (!this.ocr?.extractText) {
        this.logger.error(
          `[SCAN] OCR provider missing extractText; provider=${this.ocr?.constructor?.name ?? 'undefined'}`,
        );
        throw new BadGatewayException(
          'OCR provider is not configured correctly.',
        );
      }

      this.logger.log(
        `[SCAN] OCR started provider=${this.ocr.constructor?.name ?? 'unknown'}`,
      );

      let ocrText: string;
      let ocrConfidence: number | undefined;
      try {
        const ocrResult = await this.ocr.extractText({
          buffer: uploaded.buffer,
          mimeType: uploaded.mimetype,
          originalName,
        });
        ocrText = ocrResult?.text?.trim() ?? '';
        ocrConfidence = ocrResult?.confidence;
        this.logger.log(
          `[SCAN] OCR completed textLength=${ocrText.length} confidence=${ocrConfidence ?? 'n/a'}`,
        );
      } catch (error) {
        this.logger.error(
          '[SCAN] OCR failed',
          error instanceof Error ? error.stack : String(error),
        );
        if (isHttpException(error)) {
          throw error;
        }
        throw new BadGatewayException(
          'Failed to read the document. Try uploading a clearer image.',
        );
      }

      if (!ocrText) {
        this.logger.error('[SCAN] OCR returned empty text');
        throw new BadGatewayException(
          'Failed to read the document. Try uploading a clearer image.',
        );
      }

      if (!this.extraction?.extract) {
        this.logger.error(
          `[SCAN] Extraction provider missing extract; provider=${this.extraction?.constructor?.name ?? 'undefined'}`,
        );
        throw new BadGatewayException(
          'Document extraction provider is not configured correctly.',
        );
      }

      this.logger.log(
        `[SCAN] extraction started provider=${this.extraction.constructor?.name ?? 'unknown'}`,
      );

      let extractedRaw: ExtractedDocumentData;
      try {
        extractedRaw = await this.extraction.extract(ocrText);
        this.logger.log('[SCAN] extraction completed');
      } catch (error) {
        this.logger.error(
          '[SCAN] extraction failed',
          error instanceof Error ? error.stack : String(error),
        );
        if (isHttpException(error)) {
          throw error;
        }
        throw new BadGatewayException(
          'Failed to extract information from the document.',
        );
      }

      const extractedData = validateExtractedDocumentData(extractedRaw);
      this.logger.log('[SCAN] Validation completed');

      const document = await this.prisma.document.create({
        data: {
          name: originalName,
          originalName,
          url: stored.url,
          storageKey: stored.storageKey,
          mimeType: stored.mimeType,
          size: stored.size,
          projectId,
        },
        select: {
          id: true,
          url: true,
        },
      });
      this.logger.log(`[SCAN] document row created id=${document.id}`);

      // Successful path — keep stored file; clear cleanup marker.
      storedKey = null;

      this.logger.log('[SCAN] Review data returned');
      return {
        documentId: document.id,
        documentUrl: document.url,
        extractedData,
        ...(ocrConfidence !== undefined ? { ocrConfidence } : {}),
      };
    } catch (error) {
      this.logger.error(
        '[SCAN] pipeline failed',
        error instanceof Error ? error.stack : String(error),
      );
      if (storedKey) {
        try {
          await this.storage.delete(storedKey);
        } catch (cleanupError) {
          this.logger.warn(
            `[SCAN] storage cleanup failed key=${storedKey}: ${
              cleanupError instanceof Error
                ? cleanupError.message
                : String(cleanupError)
            }`,
          );
        }
      }
      throw error;
    }
  }

  private async assertOwnedProject(projectId: number, userId: number) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException(`Project with id ${projectId} not found`);
    }
  }
}

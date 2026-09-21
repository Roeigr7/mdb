import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DocumentProcessingService } from './document-processing.service.js';
import { DocumentsController } from './documents.controller.js';
import { DOCUMENT_EXTRACTION } from './extraction/extraction.interface.js';
import { JsonExtractionService } from './extraction/json-extraction.service.js';
import { MockExtractionService } from './extraction/mock-extraction.service.js';
import { resolveDocumentProviders } from './ocr/ollama-config.js';
import { MockOcrService } from './ocr/mock-ocr.service.js';
import { OCR_SERVICE } from './ocr/ocr.interface.js';
import { OllamaVisionService } from './ocr/ollama-vision.service.js';
import { DOCUMENT_STORAGE } from './storage/document-storage.interface.js';
import { LocalDocumentStorageProvider } from './storage/local-document-storage.provider.js';

const providers = resolveDocumentProviders();

/**
 * Document scan providers.
 * DOCUMENT_AI_PROVIDER / OCR_PROVIDER / EXTRACTION_PROVIDER select implementations.
 * Default remains mock so tests and offline dev keep working.
 */
@Module({
  imports: [AuthModule],
  controllers: [DocumentsController],
  providers: [
    DocumentProcessingService,
    LocalDocumentStorageProvider,
    MockOcrService,
    MockExtractionService,
    OllamaVisionService,
    JsonExtractionService,
    {
      provide: DOCUMENT_STORAGE,
      useExisting: LocalDocumentStorageProvider,
    },
    {
      provide: OCR_SERVICE,
      useExisting:
        providers.ocr === 'ollama' ? OllamaVisionService : MockOcrService,
    },
    {
      provide: DOCUMENT_EXTRACTION,
      useExisting:
        providers.extraction === 'json'
          ? JsonExtractionService
          : MockExtractionService,
    },
  ],
  exports: [DocumentProcessingService],
})
export class DocumentsModule {}

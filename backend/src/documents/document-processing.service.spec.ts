import {
  BadGatewayException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { DocumentProcessingService } from './document-processing.service.js';
import { DOCUMENT_EXTRACTION } from './extraction/extraction.interface.js';
import { OCR_SERVICE } from './ocr/ocr.interface.js';
import { DOCUMENT_STORAGE } from './storage/document-storage.interface.js';

function jpegFile(overrides?: Partial<Express.Multer.File>): Express.Multer.File {
  const buffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
  return {
    fieldname: 'file',
    originalname: 'receipt.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: buffer.length,
    buffer,
    destination: '',
    filename: '',
    path: '',
    stream: undefined as never,
    ...overrides,
  };
}

describe('DocumentProcessingService', () => {
  let service: DocumentProcessingService;
  let prisma: {
    project: { findFirst: ReturnType<typeof vi.fn> };
    document: { create: ReturnType<typeof vi.fn> };
  };
  let storage: {
    upload: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    getUrl: ReturnType<typeof vi.fn>;
  };
  let ocr: { extractText: ReturnType<typeof vi.fn> };
  let extraction: { extract: ReturnType<typeof vi.fn> };

  const userId = 1;
  const projectId = 10;

  beforeEach(async () => {
    prisma = {
      project: { findFirst: vi.fn() },
      document: { create: vi.fn() },
    };
    storage = {
      upload: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
      getUrl: vi.fn(),
    };
    ocr = { extractText: vi.fn() };
    extraction = { extract: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentProcessingService,
        { provide: PrismaService, useValue: prisma },
        { provide: DOCUMENT_STORAGE, useValue: storage },
        { provide: OCR_SERVICE, useValue: ocr },
        { provide: DOCUMENT_EXTRACTION, useValue: extraction },
      ],
    }).compile();

    service = module.get(DocumentProcessingService);
  });

  it('scans a document without creating an expense', async () => {
    prisma.project.findFirst.mockResolvedValue({ id: projectId });
    storage.upload.mockResolvedValue({
      storageKey: '10/uuid.jpg',
      url: 'local://10/uuid.jpg',
      size: 8,
      mimeType: 'image/jpeg',
    });
    prisma.document.create.mockResolvedValue({
      id: 42,
      url: 'local://10/uuid.jpg',
    });
    ocr.extractText.mockResolvedValue({
      text: 'Supplier: ABC\nAmount: 100',
      confidence: 0.9,
    });
    extraction.extract.mockResolvedValue({
      type: 'EXPENSE',
      supplier: 'ABC',
      amount: 100,
      vatAmount: null,
      date: '2026-09-20',
      documentNumber: null,
      category: null,
      description: null,
      currency: null,
      paymentMethod: null,
      fieldConfidence: { amount: 0.9 },
    });

    const result = await service.scanDocument(
      projectId,
      userId,
      jpegFile(),
    );

    expect(result.documentId).toBe(42);
    expect(result.extractedData.amount).toBe(100);
    expect(result.extractedData.supplier).toBe('ABC');
    expect(prisma.document.create).toHaveBeenCalled();
    expect(storage.delete).not.toHaveBeenCalled();
  });

  it('rejects invalid files before OCR', async () => {
    prisma.project.findFirst.mockResolvedValue({ id: projectId });

    await expect(
      service.scanDocument(projectId, userId, jpegFile({ mimetype: 'text/plain', originalname: 'a.txt' })),
    ).rejects.toThrow(BadRequestException);

    expect(storage.upload).not.toHaveBeenCalled();
    expect(ocr.extractText).not.toHaveBeenCalled();
  });

  it('returns 404 for non-owned projects', async () => {
    prisma.project.findFirst.mockResolvedValue(null);

    await expect(
      service.scanDocument(projectId, userId, jpegFile()),
    ).rejects.toThrow(NotFoundException);
  });

  it('maps OCR failures to BadGatewayException', async () => {
    prisma.project.findFirst.mockResolvedValue({ id: projectId });
    storage.upload.mockResolvedValue({
      storageKey: '10/uuid.jpg',
      url: 'local://10/uuid.jpg',
      size: 8,
      mimeType: 'image/jpeg',
    });
    prisma.document.create.mockResolvedValue({
      id: 42,
      url: 'local://10/uuid.jpg',
    });
    ocr.extractText.mockRejectedValue(new Error('OCR down'));

    await expect(
      service.scanDocument(projectId, userId, jpegFile()),
    ).rejects.toThrow(BadGatewayException);

    expect(storage.delete).toHaveBeenCalledWith('10/uuid.jpg');
  });

  it('preserves HttpException codes from OCR providers', async () => {
    prisma.project.findFirst.mockResolvedValue({ id: projectId });
    storage.upload.mockResolvedValue({
      storageKey: '10/uuid.jpg',
      url: 'local://10/uuid.jpg',
      size: 8,
      mimeType: 'image/jpeg',
    });
    ocr.extractText.mockRejectedValue(
      new BadGatewayException('OLLAMA_NOT_RUNNING'),
    );

    await expect(
      service.scanDocument(projectId, userId, jpegFile()),
    ).rejects.toMatchObject({
      response: { message: 'OLLAMA_NOT_RUNNING' },
    });

    expect(storage.delete).toHaveBeenCalledWith('10/uuid.jpg');
  });

  it('maps extraction failures to BadGatewayException', async () => {
    prisma.project.findFirst.mockResolvedValue({ id: projectId });
    storage.upload.mockResolvedValue({
      storageKey: '10/uuid.jpg',
      url: 'local://10/uuid.jpg',
      size: 8,
      mimeType: 'image/jpeg',
    });
    prisma.document.create.mockResolvedValue({
      id: 42,
      url: 'local://10/uuid.jpg',
    });
    ocr.extractText.mockResolvedValue({ text: 'some text', confidence: 0.5 });
    extraction.extract.mockRejectedValue(new Error('AI down'));

    await expect(
      service.scanDocument(projectId, userId, jpegFile()),
    ).rejects.toThrow(BadGatewayException);
  });
});

import { BadRequestException } from '@nestjs/common';
import path from 'node:path';

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'application/pdf',
]);

export const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.pdf',
]);

const EXECUTABLE_EXTENSIONS = new Set([
  '.exe',
  '.bat',
  '.cmd',
  '.com',
  '.msi',
  '.sh',
  '.ps1',
  '.js',
  '.mjs',
  '.cjs',
  '.dll',
  '.so',
]);

export type UploadedDocumentFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};

function looksLikePdf(buffer: Buffer): boolean {
  return buffer.length >= 4 && buffer.subarray(0, 4).toString('ascii') === '%PDF';
}

function looksLikeJpeg(buffer: Buffer): boolean {
  return (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  );
}

function looksLikePng(buffer: Buffer): boolean {
  return (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  );
}

function magicMatchesMime(buffer: Buffer, mimeType: string): boolean {
  if (mimeType === 'application/pdf') return looksLikePdf(buffer);
  if (mimeType === 'image/jpeg') return looksLikeJpeg(buffer);
  if (mimeType === 'image/png') return looksLikePng(buffer);
  return false;
}

function detectMimeFromMagic(buffer: Buffer): string | null {
  if (looksLikeJpeg(buffer)) return 'image/jpeg';
  if (looksLikePng(buffer)) return 'image/png';
  if (looksLikePdf(buffer)) return 'application/pdf';
  return null;
}

function normalizeMimeType(mimeType: string): string {
  const normalized = mimeType.toLowerCase().trim();
  if (normalized === 'image/jpg') return 'image/jpeg';
  return normalized;
}

/**
 * Validates uploaded receipt/invoice files before storage or OCR.
 */
export function validateUploadedDocumentFile(
  file: UploadedDocumentFile | undefined,
): asserts file is UploadedDocumentFile {
  if (!file) {
    throw new BadRequestException('A file is required');
  }

  if (!file.buffer?.length || file.size <= 0) {
    throw new BadRequestException('The uploaded file is empty or corrupted');
  }

  if (file.size > MAX_DOCUMENT_BYTES) {
    throw new BadRequestException(
      `File is too large. Maximum size is ${MAX_DOCUMENT_BYTES / (1024 * 1024)} MB`,
    );
  }

  const rawName = file.originalname || 'upload';
  if (
    rawName.includes('..') ||
    rawName.includes('/') ||
    rawName.includes('\\') ||
    rawName.includes('\0')
  ) {
    throw new BadRequestException('Invalid file name');
  }
  const originalName = path.basename(rawName);

  const extension = path.extname(originalName).toLowerCase();
  if (EXECUTABLE_EXTENSIONS.has(extension)) {
    throw new BadRequestException('Executable files are not allowed');
  }

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new BadRequestException(
      'Unsupported file type. Allowed: JPG, JPEG, PNG, PDF',
    );
  }

  let mimeType = normalizeMimeType(file.mimetype || '');
  // Some browsers/OS send empty or generic MIME; infer from magic bytes.
  if (
    !mimeType ||
    mimeType === 'application/octet-stream' ||
    mimeType === 'binary/octet-stream'
  ) {
    const detected = detectMimeFromMagic(file.buffer);
    if (detected) {
      mimeType = detected;
      file.mimetype = detected;
    }
  }

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new BadRequestException(
      'Unsupported MIME type. Allowed: image/jpeg, image/png, application/pdf',
    );
  }

  // Extension ↔ MIME consistency
  if (
    (extension === '.pdf' && mimeType !== 'application/pdf') ||
    ((extension === '.jpg' || extension === '.jpeg') &&
      mimeType !== 'image/jpeg') ||
    (extension === '.png' && mimeType !== 'image/png')
  ) {
    throw new BadRequestException(
      'File extension does not match the declared MIME type',
    );
  }

  if (!magicMatchesMime(file.buffer, mimeType)) {
    throw new BadRequestException(
      'The uploaded file appears corrupted or does not match its type',
    );
  }
}

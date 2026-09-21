import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import {
  MAX_DOCUMENT_BYTES,
  validateUploadedDocumentFile,
} from './document-file.validation.js';

function jpegBuffer(): Buffer {
  return Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
}

function pngBuffer(): Buffer {
  return Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
}

function pdfBuffer(): Buffer {
  return Buffer.from('%PDF-1.4 mock content');
}

describe('validateUploadedDocumentFile', () => {
  it('accepts a valid JPEG', () => {
    const buffer = jpegBuffer();
    expect(() =>
      validateUploadedDocumentFile({
        buffer,
        originalname: 'receipt.jpg',
        mimetype: 'image/jpeg',
        size: buffer.length,
      }),
    ).not.toThrow();
  });

  it('accepts a valid PNG', () => {
    const buffer = pngBuffer();
    expect(() =>
      validateUploadedDocumentFile({
        buffer,
        originalname: 'receipt.png',
        mimetype: 'image/png',
        size: buffer.length,
      }),
    ).not.toThrow();
  });

  it('accepts a valid PDF', () => {
    const buffer = pdfBuffer();
    expect(() =>
      validateUploadedDocumentFile({
        buffer,
        originalname: 'invoice.pdf',
        mimetype: 'application/pdf',
        size: buffer.length,
      }),
    ).not.toThrow();
  });

  it('rejects missing file', () => {
    expect(() => validateUploadedDocumentFile(undefined)).toThrow(
      BadRequestException,
    );
  });

  it('rejects unsupported MIME', () => {
    const buffer = Buffer.from('MZ');
    expect(() =>
      validateUploadedDocumentFile({
        buffer,
        originalname: 'virus.exe',
        mimetype: 'application/x-msdownload',
        size: buffer.length,
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects oversized files', () => {
    const buffer = jpegBuffer();
    expect(() =>
      validateUploadedDocumentFile({
        buffer,
        originalname: 'big.jpg',
        mimetype: 'image/jpeg',
        size: MAX_DOCUMENT_BYTES + 1,
      }),
    ).toThrow(/too large/i);
  });

  it('rejects path traversal in file name', () => {
    const buffer = jpegBuffer();
    expect(() =>
      validateUploadedDocumentFile({
        buffer,
        originalname: '../etc/passwd.jpg',
        mimetype: 'image/jpeg',
        size: buffer.length,
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects corrupted content that does not match MIME', () => {
    const buffer = Buffer.from('not-a-pdf');
    expect(() =>
      validateUploadedDocumentFile({
        buffer,
        originalname: 'fake.pdf',
        mimetype: 'application/pdf',
        size: buffer.length,
      }),
    ).toThrow(/corrupted/i);
  });

  it('infers MIME from magic bytes when client sends octet-stream', () => {
    const buffer = jpegBuffer();
    const file = {
      buffer,
      originalname: 'receipt.jpg',
      mimetype: 'application/octet-stream',
      size: buffer.length,
    };
    expect(() => validateUploadedDocumentFile(file)).not.toThrow();
    expect(file.mimetype).toBe('image/jpeg');
  });

  it('accepts image/jpg as an alias for image/jpeg', () => {
    const buffer = jpegBuffer();
    expect(() =>
      validateUploadedDocumentFile({
        buffer,
        originalname: 'receipt.jpg',
        mimetype: 'image/jpg',
        size: buffer.length,
      }),
    ).not.toThrow();
  });
});

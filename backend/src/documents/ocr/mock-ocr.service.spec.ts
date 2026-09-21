import { describe, expect, it } from 'vitest';
import { MockOcrService } from './mock-ocr.service.js';

describe('MockOcrService', () => {
  it('returns sample text with confidence', async () => {
    const service = new MockOcrService();
    const result = await service.extractText({
      buffer: Buffer.from('%PDF-1.4'),
      mimeType: 'application/pdf',
      originalName: 'receipt.pdf',
    });

    expect(result.text).toContain('ABC Ltd');
    expect(result.text).toContain('INV-12345');
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('fails on empty buffer', async () => {
    const service = new MockOcrService();
    await expect(
      service.extractText({
        buffer: Buffer.alloc(0),
        mimeType: 'application/pdf',
        originalName: 'empty.pdf',
      }),
    ).rejects.toThrow(/empty/i);
  });
});

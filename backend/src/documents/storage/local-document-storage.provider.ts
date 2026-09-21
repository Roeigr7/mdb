import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type {
  DocumentStorageProvider,
  StoredDocument,
  UploadDocumentInput,
} from './document-storage.interface.js';

const UPLOAD_ROOT =
  process.env.DOCUMENT_STORAGE_PATH?.trim() ||
  path.join(process.cwd(), 'uploads');

function sanitizeExtension(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.pdf'].includes(ext)) {
    return ext;
  }
  return '';
}

@Injectable()
export class LocalDocumentStorageProvider implements DocumentStorageProvider {
  async upload(input: UploadDocumentInput): Promise<StoredDocument> {
    const extension = sanitizeExtension(input.originalName);
    const fileName = `${randomUUID()}${extension}`;
    const relativeKey = path.posix.join(String(input.projectId), fileName);
    const absolutePath = path.join(
      UPLOAD_ROOT,
      String(input.projectId),
      fileName,
    );

    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, input.buffer);

    return {
      storageKey: relativeKey,
      url: `local://${relativeKey}`,
      size: input.buffer.byteLength,
      mimeType: input.mimeType,
    };
  }

  async getUrl(storageKey: string): Promise<string> {
    this.assertSafeKey(storageKey);
    return `local://${storageKey}`;
  }

  async delete(storageKey: string): Promise<void> {
    this.assertSafeKey(storageKey);
    const absolutePath = path.join(UPLOAD_ROOT, ...storageKey.split('/'));
    try {
      await unlink(absolutePath);
    } catch (error) {
      const code =
        error && typeof error === 'object' && 'code' in error
          ? (error as { code?: string }).code
          : undefined;
      if (code !== 'ENOENT') {
        throw error;
      }
    }
  }

  private assertSafeKey(storageKey: string): void {
    if (
      !storageKey ||
      storageKey.includes('..') ||
      path.isAbsolute(storageKey) ||
      storageKey.includes('\\')
    ) {
      throw new Error('Invalid storage key');
    }
  }
}

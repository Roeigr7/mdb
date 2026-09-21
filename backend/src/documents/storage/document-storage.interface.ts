export const DOCUMENT_STORAGE = Symbol('DOCUMENT_STORAGE');

export type StoredDocument = {
  storageKey: string;
  url: string;
  size: number;
  mimeType: string;
};

export type UploadDocumentInput = {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  projectId: number;
};

export interface DocumentStorageProvider {
  upload(input: UploadDocumentInput): Promise<StoredDocument>;
  getUrl(storageKey: string): Promise<string>;
  delete(storageKey: string): Promise<void>;
}

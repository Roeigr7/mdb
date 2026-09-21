export const OCR_SERVICE = Symbol('OCR_SERVICE');

export type OcrResult = {
  text: string;
  confidence?: number;
};

export type OcrInput = {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
};

export interface OcrService {
  extractText(input: OcrInput): Promise<OcrResult>;
}

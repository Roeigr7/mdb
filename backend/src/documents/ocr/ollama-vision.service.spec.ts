import { BadGatewayException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { OllamaErrorCode } from './ollama-error-codes.js';
import { OllamaVisionService } from './ollama-vision.service.js';

function jpegInput(overrides?: Partial<{ mimeType: string; originalName: string }>) {
  return {
    buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]),
    mimeType: overrides?.mimeType ?? 'image/jpeg',
    originalName: overrides?.originalName ?? 'receipt.jpg',
  };
}

describe('OllamaVisionService', () => {
  it('returns model JSON text on success', async () => {
    const json = JSON.stringify({
      type: 'EXPENSE',
      amount: 99.5,
      vatAmount: null,
      date: '2026-09-21',
      supplier: 'Local Store',
      customer: null,
      documentNumber: 'R-9',
      category: null,
      description: 'Office supplies',
      currency: 'ILS',
      paymentMethod: null,
    });

    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: { content: json } }),
    });

    const service = OllamaVisionService.create(
      {
        baseUrl: 'http://ollama.test',
        model: 'qwen2.5vl:3b',
        timeoutMs: 5_000,
      },
      fetchImpl as unknown as typeof fetch,
    );

    const result = await service.extractText(jpegInput());

    expect(result.text).toBe(json);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as {
      model: string;
      messages: Array<{ images: string[] }>;
    };
    expect(body.model).toBe('qwen2.5vl:3b');
    expect(body.messages[0]?.images?.[0]).toBeTruthy();
  });

  it('maps connection failures to OLLAMA_NOT_RUNNING', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));
    const service = OllamaVisionService.create(
      { baseUrl: 'http://ollama.test', model: 'qwen2.5vl:3b', timeoutMs: 1_000 },
      fetchImpl as unknown as typeof fetch,
    );

    await expect(service.extractText(jpegInput())).rejects.toMatchObject({
      response: { message: OllamaErrorCode.NOT_RUNNING },
    });
  });

  it('maps model-not-found HTTP responses', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => 'model "missing" not found',
    });
    const service = OllamaVisionService.create(
      { baseUrl: 'http://ollama.test', model: 'missing', timeoutMs: 1_000 },
      fetchImpl as unknown as typeof fetch,
    );

    await expect(service.extractText(jpegInput())).rejects.toBeInstanceOf(
      BadGatewayException,
    );
    await expect(service.extractText(jpegInput())).rejects.toMatchObject({
      response: { message: OllamaErrorCode.MODEL_NOT_INSTALLED },
    });
  });

  it('rejects PDF uploads with a clear code', async () => {
    const service = OllamaVisionService.create({
      baseUrl: 'http://ollama.test',
      model: 'qwen2.5vl:3b',
      timeoutMs: 1_000,
    });

    await expect(
      service.extractText(
        jpegInput({ mimeType: 'application/pdf', originalName: 'doc.pdf' }),
      ),
    ).rejects.toMatchObject({
      response: { message: OllamaErrorCode.PDF_UNSUPPORTED },
    });
  });

  it('maps aborted requests to OLLAMA_TIMEOUT', async () => {
    const abortError = new Error('This operation was aborted');
    abortError.name = 'AbortError';
    const fetchImpl = vi.fn().mockRejectedValue(abortError);
    const service = OllamaVisionService.create(
      { baseUrl: 'http://ollama.test', model: 'qwen2.5vl:3b', timeoutMs: 1_000 },
      fetchImpl as unknown as typeof fetch,
    );

    await expect(service.extractText(jpegInput())).rejects.toMatchObject({
      response: { message: OllamaErrorCode.TIMEOUT },
    });
  });

  it('maps empty model content', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: { content: '   ' } }),
    });
    const service = OllamaVisionService.create(
      { baseUrl: 'http://ollama.test', model: 'qwen2.5vl:3b', timeoutMs: 1_000 },
      fetchImpl as unknown as typeof fetch,
    );

    await expect(service.extractText(jpegInput())).rejects.toMatchObject({
      response: { message: OllamaErrorCode.EMPTY_RESPONSE },
    });
  });
});

import { BadGatewayException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { OllamaErrorCode } from '../ocr/ollama-error-codes.js';
import {
  extractJsonObjectText,
  mapVisionJsonToExtractedData,
  safeParseJsonObject,
} from './parse-vision-json.js';
import { JsonExtractionService } from './json-extraction.service.js';

describe('parse-vision-json', () => {
  it('parses raw JSON objects', () => {
    const raw = safeParseJsonObject(
      '{"type":"EXPENSE","amount":10,"supplier":"A","vatAmount":null,"date":null,"documentNumber":null,"category":null,"description":null,"currency":null,"paymentMethod":null}',
    );
    expect(raw.amount).toBe(10);
    expect(raw.supplier).toBe('A');
  });

  it('strips markdown fences', () => {
    const text = extractJsonObjectText('```json\n{"amount":1}\n```');
    expect(text).toBe('{"amount":1}');
  });

  it('rejects invalid JSON', () => {
    expect(() => safeParseJsonObject('not json at all')).toThrow(
      BadGatewayException,
    );
    try {
      safeParseJsonObject('{broken');
    } catch (error) {
      expect(error).toBeInstanceOf(BadGatewayException);
      expect((error as BadGatewayException).getResponse()).toMatchObject({
        message: OllamaErrorCode.INVALID_JSON,
      });
    }
  });

  it('maps missing fields to null without inventing values', () => {
    const mapped = mapVisionJsonToExtractedData({ type: 'expense' });
    expect(mapped).toEqual({
      type: 'EXPENSE',
      supplier: null,
      amount: null,
      vatAmount: null,
      date: null,
      documentNumber: null,
      category: null,
      description: null,
      currency: null,
      paymentMethod: null,
      fieldConfidence: {},
    });
  });

  it('normalizes customer into supplier when supplier is absent', () => {
    const mapped = mapVisionJsonToExtractedData({
      type: 'INCOME',
      customer: 'Client Co',
    });
    expect(mapped.supplier).toBe('Client Co');
    expect(mapped.type).toBe('INCOME');
  });

  it('normalizes numeric strings and DMY dates', () => {
    const mapped = mapVisionJsonToExtractedData({
      amount: '1,250.50',
      vatAmount: '212.5',
      date: '21/09/2026',
    });
    expect(mapped.amount).toBe(1250.5);
    expect(mapped.vatAmount).toBe(212.5);
    expect(mapped.date).toBe('2026-09-21');
  });
});

describe('JsonExtractionService', () => {
  const service = new JsonExtractionService();

  it('extracts a successful payload', async () => {
    const result = await service.extract(
      JSON.stringify({
        type: 'EXPENSE',
        amount: 50,
        vatAmount: null,
        date: '2026-01-02',
        supplier: 'Shop',
        documentNumber: null,
        category: null,
        description: 'Parts',
        currency: 'ILS',
        paymentMethod: null,
      }),
    );

    expect(result.amount).toBe(50);
    expect(result.supplier).toBe('Shop');
    expect(result.description).toBe('Parts');
    expect(result.fieldConfidence).toEqual({});
  });

  it('rejects invalid JSON without inventing mock demo data', async () => {
    await expect(service.extract('definitely not json')).rejects.toMatchObject({
      response: { message: OllamaErrorCode.INVALID_JSON },
    });
  });

  it('keeps null fields when the model omits them', async () => {
    const result = await service.extract(
      JSON.stringify({
        type: null,
        amount: 12,
        vatAmount: null,
        date: null,
        supplier: null,
        documentNumber: null,
        category: null,
        description: null,
        currency: null,
        paymentMethod: null,
      }),
    );

    expect(result.amount).toBe(12);
    expect(result.supplier).toBeNull();
    expect(result.date).toBeNull();
    expect(result.description).toBeNull();
  });
});

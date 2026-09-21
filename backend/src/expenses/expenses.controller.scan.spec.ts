import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request.js';
import { DocumentProcessingService } from '../documents/document-processing.service.js';
import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { ExpensesController } from './expenses.controller.js';
import { ExpensesService } from './expenses.service.js';

describe('ExpensesController scan + create', () => {
  let controller: ExpensesController;
  let expensesService: {
    createExpense: ReturnType<typeof vi.fn>;
    getExpenses: ReturnType<typeof vi.fn>;
  };
  let documentProcessing: {
    scanDocument: ReturnType<typeof vi.fn>;
  };

  const req = {
    user: { sub: 1, email: 'a@b.com', role: 'USER' },
  } as AuthenticatedRequest;

  beforeEach(async () => {
    expensesService = {
      createExpense: vi.fn(),
      getExpenses: vi.fn(),
    };
    documentProcessing = {
      scanDocument: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [
        { provide: ExpensesService, useValue: expensesService },
        {
          provide: DocumentProcessingService,
          useValue: documentProcessing,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(ExpensesController);
  });

  it('POST scan delegates to DocumentProcessingService and does not create expense', async () => {
    const scanResult = {
      documentId: 9,
      documentUrl: 'local://10/a.pdf',
      extractedData: {
        type: 'EXPENSE',
        supplier: 'ABC',
        amount: 1250,
        vatAmount: 212.5,
        date: '2026-09-20',
        documentNumber: 'INV-1',
        category: 'Materials',
        description: 'Purchase',
        currency: 'ILS',
        paymentMethod: null,
        fieldConfidence: {},
      },
    };
    documentProcessing.scanDocument.mockResolvedValue(scanResult);

    const file = {
      originalname: 'a.jpg',
      mimetype: 'image/jpeg',
      size: 10,
      buffer: Buffer.from([0xff, 0xd8, 0xff]),
    } as Express.Multer.File;

    const result = await controller.scanExpense(10, file, req);

    expect(documentProcessing.scanDocument).toHaveBeenCalledWith(10, 1, file);
    expect(expensesService.createExpense).not.toHaveBeenCalled();
    expect(result).toEqual(scanResult);
  });

  it('POST create saves confirmed expense including scan metadata', async () => {
    const dto = {
      description: 'Purchase',
      amount: 1250,
      date: '2026-09-20T00:00:00.000Z',
      category: 'Materials',
      vatAmount: 212.5,
      supplier: 'ABC',
      documentNumber: 'INV-1',
      documentUrl: 'local://10/a.pdf',
      source: 'SCANNED',
      documentId: 9,
    } as CreateExpenseDto;

    const created = { id: 1, ...dto, projectId: 10 };
    expensesService.createExpense.mockResolvedValue(created);

    const result = await controller.createExpense(10, dto, req);

    expect(expensesService.createExpense).toHaveBeenCalledWith(10, dto, 1);
    expect(result).toEqual(created);
  });
});

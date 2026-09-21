import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { LoginDto } from '../../auth/dto/login.dto.js';
import { RegisterDto } from '../../auth/dto/register.dto.js';
import { CreateProjectDto } from '../../projects/dto/create-project.dto.js';
import { GetProjectsDto } from '../../projects/dto/get-projects.dto.js';
import { GetUsersDto } from '../../users/dto/get-users.dto.js';
import { CreateMaterialDto } from '../../materials/dto/create-material.dto.js';
import { UpdateMaterialDto } from '../../materials/dto/update-material.dto.js';
import { CreateExpenseDto } from '../../expenses/dto/create-expense.dto.js';
import { UpdateExpenseDto } from '../../expenses/dto/update-expense.dto.js';
import { CreateRevenueDto } from '../../revenue/dto/create-revenue.dto.js';
import { UpdateRevenueDto } from '../../revenue/dto/update-revenue.dto.js';
import { RevenueStatus } from '../../generated/prisma/client.js';

const pipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
});

async function transform<T>(value: unknown, metatype: new () => T) {
  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype,
    data: '',
  };
  return pipe.transform(value, metadata);
}

describe('DTO validation (ValidationPipe)', () => {
  describe('RegisterDto', () => {
    it('accepts a valid payload', async () => {
      await expect(
        transform(
          {
            name: 'Roei',
            email: 'roei@example.com',
            password: '12345678',
          },
          RegisterDto,
        ),
      ).resolves.toEqual({
        name: 'Roei',
        email: 'roei@example.com',
        password: '12345678',
      });
    });

    it('rejects missing required fields', async () => {
      await expect(transform({}, RegisterDto)).rejects.toThrow();
    });

    it('rejects invalid email', async () => {
      await expect(
        transform(
          {
            name: 'Roei',
            email: 'not-an-email',
            password: '12345678',
          },
          RegisterDto,
        ),
      ).rejects.toThrow();
    });

    it('rejects password shorter than 8 characters', async () => {
      await expect(
        transform(
          {
            name: 'Roei',
            email: 'roei@example.com',
            password: 'short',
          },
          RegisterDto,
        ),
      ).rejects.toThrow();
    });

    it('rejects unknown properties', async () => {
      await expect(
        transform(
          {
            name: 'Roei',
            email: 'roei@example.com',
            password: '12345678',
            role: 'ADMIN',
          },
          RegisterDto,
        ),
      ).rejects.toThrow();
    });
  });

  describe('LoginDto', () => {
    it('rejects invalid email', async () => {
      await expect(
        transform(
          {
            email: 'bad',
            password: 'anything',
          },
          LoginDto,
        ),
      ).rejects.toThrow();
    });
  });

  describe('GetUsersDto / GetProjectsDto pagination', () => {
    it('transforms page and limit to numbers', async () => {
      const result = await transform(
        { page: '2', limit: '20' },
        GetUsersDto,
      );

      expect(result).toEqual(
        expect.objectContaining({
          page: 2,
          limit: 20,
        }),
      );
    });

    it('rejects page below 1', async () => {
      await expect(
        transform({ page: 0, limit: 10 }, GetUsersDto),
      ).rejects.toThrow();
    });

    it('rejects limit above 100', async () => {
      await expect(
        transform({ page: 1, limit: 101 }, GetUsersDto),
      ).rejects.toThrow();
    });

    it('rejects invalid sortBy', async () => {
      await expect(
        transform({ sortBy: 'price' }, GetProjectsDto),
      ).rejects.toThrow();
    });

    it('rejects invalid sortOrder', async () => {
      await expect(
        transform({ sortOrder: 'sideways' }, GetProjectsDto),
      ).rejects.toThrow();
    });
  });

  describe('CreateProjectDto', () => {
    it('rejects missing name', async () => {
      await expect(
        transform({ description: 'only desc' }, CreateProjectDto),
      ).rejects.toThrow();
    });

    it('rejects unknown properties', async () => {
      await expect(
        transform(
          {
            name: 'Project',
            userId: 99,
          },
          CreateProjectDto,
        ),
      ).rejects.toThrow();
    });
  });

  describe('CreateMaterialDto', () => {
    it('accepts a valid payload and trims name', async () => {
      await expect(
        transform(
          {
            name: '  ברזל  ',
            quantity: 500,
            unitPrice: 12,
            supplier: ' ספק א ',
          },
          CreateMaterialDto,
        ),
      ).resolves.toEqual({
        name: 'ברזל',
        quantity: 500,
        unitPrice: 12,
        supplier: 'ספק א',
      });
    });

    it('rejects an empty name', async () => {
      await expect(
        transform(
          { name: '   ', quantity: 1, unitPrice: 1 },
          CreateMaterialDto,
        ),
      ).rejects.toThrow();
    });

    it('rejects quantity that is not greater than 0', async () => {
      await expect(
        transform(
          { name: 'ברזל', quantity: 0, unitPrice: 12 },
          CreateMaterialDto,
        ),
      ).rejects.toThrow();
    });

    it('rejects a negative unit price', async () => {
      await expect(
        transform(
          { name: 'ברזל', quantity: 1, unitPrice: -1 },
          CreateMaterialDto,
        ),
      ).rejects.toThrow();
    });

    it('accepts a zero unit price and omits supplier', async () => {
      await expect(
        transform({ name: 'ברזל', quantity: 2, unitPrice: 0 }, CreateMaterialDto),
      ).resolves.toEqual({
        name: 'ברזל',
        quantity: 2,
        unitPrice: 0,
      });
    });

    it('rejects a client-supplied projectId', async () => {
      await expect(
        transform(
          {
            name: 'ברזל',
            quantity: 1,
            unitPrice: 1,
            projectId: 99,
          },
          CreateMaterialDto,
        ),
      ).rejects.toThrow();
    });
  });

  describe('UpdateMaterialDto', () => {
    it('rejects a non-positive quantity', async () => {
      await expect(
        transform({ quantity: -5 }, UpdateMaterialDto),
      ).rejects.toThrow();
    });
  });

  describe('CreateExpenseDto', () => {
    it('accepts a valid payload and trims fields', async () => {
      await expect(
        transform(
          {
            description: '  חומרי גלם  ',
            category: ' Materials ',
            amount: 2500,
            date: '2026-09-18T00:00:00.000Z',
          },
          CreateExpenseDto,
        ),
      ).resolves.toEqual({
        description: 'חומרי גלם',
        category: 'Materials',
        amount: 2500,
        date: '2026-09-18T00:00:00.000Z',
      });
    });

    it('rejects a non-positive amount', async () => {
      await expect(
        transform(
          {
            description: 'X',
            amount: 0,
            date: '2026-09-18T00:00:00.000Z',
          },
          CreateExpenseDto,
        ),
      ).rejects.toThrow();
    });

    it('rejects an invalid date', async () => {
      await expect(
        transform(
          {
            description: 'X',
            amount: 10,
            date: 'not-a-date',
          },
          CreateExpenseDto,
        ),
      ).rejects.toThrow();
    });

    it('rejects a client-supplied projectId', async () => {
      await expect(
        transform(
          {
            description: 'X',
            amount: 10,
            date: '2026-09-18T00:00:00.000Z',
            projectId: 99,
          },
          CreateExpenseDto,
        ),
      ).rejects.toThrow();
    });
  });

  describe('UpdateExpenseDto', () => {
    it('rejects a non-positive amount', async () => {
      await expect(
        transform({ amount: -1 }, UpdateExpenseDto),
      ).rejects.toThrow();
    });
  });

  describe('CreateRevenueDto', () => {
    it('accepts a valid payload and trims fields', async () => {
      await expect(
        transform(
          {
            description: '  תשלום  ',
            customer: ' לאסם ',
            amount: 8500,
            date: '2026-09-18T00:00:00.000Z',
            status: RevenueStatus.PAID,
          },
          CreateRevenueDto,
        ),
      ).resolves.toEqual({
        description: 'תשלום',
        customer: 'לאסם',
        amount: 8500,
        date: '2026-09-18T00:00:00.000Z',
        status: RevenueStatus.PAID,
      });
    });

    it('rejects an invalid status', async () => {
      await expect(
        transform(
          {
            description: 'X',
            amount: 10,
            date: '2026-09-18T00:00:00.000Z',
            status: 'DONE',
          },
          CreateRevenueDto,
        ),
      ).rejects.toThrow();
    });

    it('rejects a client-supplied projectId', async () => {
      await expect(
        transform(
          {
            description: 'X',
            amount: 10,
            date: '2026-09-18T00:00:00.000Z',
            status: RevenueStatus.PENDING,
            projectId: 99,
          },
          CreateRevenueDto,
        ),
      ).rejects.toThrow();
    });
  });

  describe('UpdateRevenueDto', () => {
    it('rejects an invalid status', async () => {
      await expect(
        transform({ status: 'DONE' }, UpdateRevenueDto),
      ).rejects.toThrow();
    });
  });
});

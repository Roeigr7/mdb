import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { LoginDto } from '../../auth/dto/login.dto.js';
import { RegisterDto } from '../../auth/dto/register.dto.js';
import { CreateProjectDto } from '../../projects/dto/create-project.dto.js';
import { GetProjectsDto } from '../../projects/dto/get-projects.dto.js';
import { GetUsersDto } from '../../users/dto/get-users.dto.js';

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
});

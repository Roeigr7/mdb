import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppModule } from '../../src/app.module.js';
import { GlobalHttpExceptionFilter } from '../../src/common/filters/global-http-exception.filter.js';
import { PrismaExceptionFilter } from '../../src/common/filters/prisma-exception.filter.js';

/**
 * Mirrors `main.ts` bootstrap (pipes + filters) so E2E behavior matches production.
 *
 * DATABASE_URL is forced to E2E_DATABASE_URL in `test/setup-e2e.ts` before this
 * module loads, so Prisma connects only to the dedicated test database.
 *
 * ThrottlerGuard is disabled on the shared app so auth/user/project flows are
 * not flaky under Nest's per-route limits. Rate limiting is covered by a
 * dedicated mini-app in the E2E suite.
 */
export async function createE2eApp(): Promise<INestApplication> {
  if (!process.env.E2E_DATABASE_URL) {
    throw new Error('E2E_DATABASE_URL must be set before creating the E2E app');
  }

  process.env.DATABASE_URL = process.env.E2E_DATABASE_URL;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideGuard(ThrottlerGuard)
    .useValue({ canActivate: () => true })
    .compile();

  const app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(
    new PrismaExceptionFilter(),
    new GlobalHttpExceptionFilter(),
  );

  await app.init();
  return app;
}

/** Real throttling for the dedicated rate-limit E2E case. */
export async function createThrottledE2eApp(): Promise<INestApplication> {
  if (!process.env.E2E_DATABASE_URL) {
    throw new Error('E2E_DATABASE_URL must be set before creating the E2E app');
  }

  process.env.DATABASE_URL = process.env.E2E_DATABASE_URL;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(
    new PrismaExceptionFilter(),
    new GlobalHttpExceptionFilter(),
  );

  await app.init();
  return app;
}

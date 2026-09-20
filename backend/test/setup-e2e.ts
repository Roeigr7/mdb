import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';

/**
 * Load E2E env first, then development `.env` for shared secrets (JWT_*),
 * without allowing `.env` to override an already-set E2E_DATABASE_URL /
 * DATABASE_URL.
 */
loadEnv({ path: resolve(process.cwd(), '.env.e2e') });
loadEnv({ path: resolve(process.cwd(), '.env') });

const e2eDatabaseUrl = process.env.E2E_DATABASE_URL?.trim();

if (!e2eDatabaseUrl) {
  throw new Error(
    [
      'E2E_DATABASE_URL is required for E2E tests.',
      'Copy .env.example → .env.e2e (or set the variable), then start the test DB:',
      '  docker compose -f docker-compose.e2e.yml up -d',
      '  npm.cmd run test:e2e:migrate',
    ].join('\n'),
  );
}

// Isolate Prisma/Nest from the development database for the entire E2E process.
process.env.DATABASE_URL = e2eDatabaseUrl;
process.env.E2E_DATABASE_URL = e2eDatabaseUrl;

if (!process.env.JWT_SECRET) {
  // Deterministic local-only fallback so E2E can run without depending on .env
  process.env.JWT_SECRET = 'e2e-test-jwt-secret-do-not-use-in-production';
}

process.env.JWT_ACCESS_EXPIRES_IN ??= '15m';
process.env.JWT_REFRESH_EXPIRES_IN ??= '7d';

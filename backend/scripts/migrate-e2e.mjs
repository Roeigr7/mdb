import { config as loadEnv } from 'dotenv';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

loadEnv({ path: resolve(process.cwd(), '.env.e2e') });
loadEnv({ path: resolve(process.cwd(), '.env') });

const e2eDatabaseUrl = process.env.E2E_DATABASE_URL?.trim();

if (!e2eDatabaseUrl) {
  console.error(
    'E2E_DATABASE_URL is missing. Set it in .env.e2e (see .env.example).',
  );
  process.exit(1);
}

const result = spawnSync(
  'npx.cmd',
  ['prisma', 'migrate', 'deploy'],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      // Force Prisma CLI onto the E2E database only — never the development URL.
      DATABASE_URL: e2eDatabaseUrl,
    },
    shell: true,
  },
);

process.exit(result.status ?? 1);

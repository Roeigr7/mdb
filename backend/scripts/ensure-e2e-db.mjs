/**
 * Ensures the isolated E2E database exists on a running PostgreSQL instance.
 * Connects via E2E_DATABASE_URL (preferred) or falls back to creating
 * `mbd_dashboard_test` using the development server credentials — without
 * touching the development database contents.
 *
 * Usage: node ./scripts/ensure-e2e-db.mjs
 */
import { config as loadEnv } from 'dotenv';
import pg from 'pg';
import { resolve } from 'node:path';

loadEnv({ path: resolve(process.cwd(), '.env.e2e') });
loadEnv({ path: resolve(process.cwd(), '.env') });

const e2eUrl = process.env.E2E_DATABASE_URL?.trim();
if (!e2eUrl) {
  console.error('E2E_DATABASE_URL is required');
  process.exit(1);
}

const target = new URL(e2eUrl);
const dbName = decodeURIComponent(target.pathname.replace(/^\//, ''));

async function tryConnect(connectionString) {
  const client = new pg.Client({ connectionString });
  await client.connect();
  await client.query('SELECT 1');
  await client.end();
}

async function createDatabaseFromDevCredentials() {
  const devUrl = process.env.DATABASE_URL?.trim();
  if (!devUrl) {
    throw new Error(
      'Cannot create E2E database: development DATABASE_URL is unavailable and E2E Postgres is not reachable.',
    );
  }

  const adminUrl = new URL(devUrl);
  adminUrl.pathname = '/postgres';

  const client = new pg.Client({ connectionString: adminUrl.toString() });
  await client.connect();

  const existing = await client.query(
    'SELECT 1 FROM pg_database WHERE datname = $1',
    [dbName],
  );

  if (existing.rowCount === 0) {
    // Database names cannot be parameterized; dbName comes from our E2E config only.
    if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
      throw new Error(`Refusing to create unsafe database name: ${dbName}`);
    }
    await client.query(`CREATE DATABASE ${dbName}`);
    console.log(`Created database "${dbName}" on the local PostgreSQL server.`);
  } else {
    console.log(`Database "${dbName}" already exists.`);
  }

  await client.end();
}

try {
  await tryConnect(e2eUrl);
  console.log(`E2E database is reachable at ${target.hostname}:${target.port}${target.pathname}`);
} catch (error) {
  console.warn(
    `E2E database not reachable (${error.message}). Attempting to create "${dbName}" using local Postgres credentials…`,
  );

  // If compose URL uses a dedicated user/port, rewrite E2E URL temporarily is not done here —
  // this helper only creates the DB name when the same server credentials can connect.
  const rewritten = new URL(process.env.DATABASE_URL);
  rewritten.pathname = `/${dbName}`;

  try {
    await createDatabaseFromDevCredentials();
    await tryConnect(rewritten.toString());
    console.log(
      [
        `Isolated database "${dbName}" is ready.`,
        `Update .env.e2e E2E_DATABASE_URL to:`,
        `  ${rewritten.protocol}//${rewritten.username}:***@${rewritten.hostname}:${rewritten.port || '5432'}/${dbName}`,
        'Or start Docker Compose and keep the 5433 URL from .env.example.',
      ].join('\n'),
    );
  } catch (createError) {
    console.error(createError.message);
    process.exit(1);
  }
}

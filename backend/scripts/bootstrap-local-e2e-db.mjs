import { config } from 'dotenv';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';

config();

const devUrl = process.env.DATABASE_URL;
if (!devUrl) {
  throw new Error('DATABASE_URL missing');
}

const dbName = 'mbd_dashboard_test';
const admin = new URL(devUrl);
admin.pathname = '/postgres';

const client = new pg.Client({ connectionString: admin.toString() });
await client.connect();

const exists = await client.query(
  'SELECT 1 FROM pg_database WHERE datname = $1',
  [dbName],
);

if (exists.rowCount === 0) {
  if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
    throw new Error(`Unsafe database name: ${dbName}`);
  }
  await client.query(`CREATE DATABASE ${dbName}`);
  console.log('CREATED_DB');
} else {
  console.log('DB_EXISTS');
}

await client.end();

const e2e = new URL(devUrl);
e2e.pathname = `/${dbName}`;

writeFileSync(
  resolve('.env.e2e'),
  [
    '# Local E2E database (gitignored). Isolated DB name — not the development database.',
    `# Preferred Docker URL (when Docker is available):`,
    `# E2E_DATABASE_URL=postgresql://mbd_test:mbd_test@localhost:5433/mbd_dashboard_test`,
    `E2E_DATABASE_URL=${e2e.toString()}`,
    '',
  ].join('\n'),
);

console.log(
  JSON.stringify({
    host: e2e.hostname,
    port: e2e.port || '5432',
    database: dbName,
    wroteEnvE2e: true,
  }),
);

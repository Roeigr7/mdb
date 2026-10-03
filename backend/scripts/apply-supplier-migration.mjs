import { config } from 'dotenv';
import pg from 'pg';

config();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const client = new pg.Client({ connectionString });
  await client.connect();

  try {
    await client.query('DELETE FROM "Supplier"');

    await client.query(
      'ALTER TABLE "Supplier" ADD COLUMN IF NOT EXISTS "notes" TEXT',
    );

    const cols = await client.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_name = 'Supplier'`,
    );
    const names = cols.rows.map((row) => row.column_name);

    if (!names.includes('userId')) {
      await client.query('ALTER TABLE "Supplier" ADD COLUMN "userId" INTEGER');
      await client.query(`
        UPDATE "Supplier"
        SET "userId" = (SELECT id FROM "User" ORDER BY id LIMIT 1)
        WHERE "userId" IS NULL
      `);
      await client.query('DELETE FROM "Supplier" WHERE "userId" IS NULL');
      await client.query(
        'ALTER TABLE "Supplier" ALTER COLUMN "userId" SET NOT NULL',
      );
      await client.query(`
        ALTER TABLE "Supplier"
        ADD CONSTRAINT "Supplier_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
      `);
      await client.query(
        'CREATE INDEX IF NOT EXISTS "Supplier_userId_idx" ON "Supplier"("userId")',
      );
    }

    await client.query(`
      INSERT INTO "_prisma_migrations" (
        id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count
      )
      SELECT
        gen_random_uuid()::text,
        'manual',
        NOW(),
        '20260922100000_supplier_user_ownership',
        NULL,
        NULL,
        NOW(),
        1
      WHERE NOT EXISTS (
        SELECT 1 FROM "_prisma_migrations"
        WHERE migration_name = '20260922100000_supplier_user_ownership'
      )
    `);

    console.log('Supplier ownership migration applied');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

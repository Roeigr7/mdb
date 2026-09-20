import bcrypt from 'bcrypt';
import pg from 'pg';

export const E2E_ADMIN = {
  name: 'E2E Admin',
  email: 'e2e-admin@example.com',
  password: 'AdminPass123!',
} as const;

function getE2eConnectionString() {
  const connectionString =
    process.env.E2E_DATABASE_URL ?? process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('E2E_DATABASE_URL is not set');
  }

  return connectionString;
}

/**
 * Wipe all application tables in the E2E database only.
 * Uses TRUNCATE … CASCADE + RESTART IDENTITY for deterministic re-runs.
 */
export async function resetE2eDatabase() {
  const client = new pg.Client({ connectionString: getE2eConnectionString() });
  await client.connect();

  try {
    await client.query(`
      TRUNCATE TABLE
        "RefreshToken",
        "Document",
        "Expense",
        "Revenue",
        "Project",
        "Material",
        "Supplier",
        "User"
      RESTART IDENTITY CASCADE;
    `);
  } finally {
    await client.end();
  }
}

export async function seedE2eAdmin() {
  const passwordHash = await bcrypt.hash(E2E_ADMIN.password, 10);
  const client = new pg.Client({ connectionString: getE2eConnectionString() });
  await client.connect();

  try {
    const result = await client.query<{
      id: number;
      email: string;
      role: string;
    }>(
      `
        INSERT INTO "User" (name, email, "passwordHash", role, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, 'ADMIN'::"UserRole", NOW(), NOW())
        ON CONFLICT (email)
        DO UPDATE SET
          name = EXCLUDED.name,
          "passwordHash" = EXCLUDED."passwordHash",
          role = 'ADMIN'::"UserRole",
          "updatedAt" = NOW()
        RETURNING id, email, role;
      `,
      [E2E_ADMIN.name, E2E_ADMIN.email, passwordHash],
    );

    return result.rows[0];
  } finally {
    await client.end();
  }
}

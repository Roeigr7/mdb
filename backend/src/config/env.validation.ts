const REQUIRED_ENV_KEYS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_ACCESS_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
] as const;

/**
 * Fail fast when required configuration is missing.
 * Never logs secret values — only variable names.
 */
export function validateEnv(env: NodeJS.ProcessEnv = process.env): void {
  const missing = REQUIRED_ENV_KEYS.filter((key) => !env[key]?.trim());

  if (missing.length > 0) {
    throw new Error(
      [
        `Missing required environment variable(s): ${missing.join(', ')}.`,
        'Copy backend/.env.example (development) or backend/.env.production.example (production).',
        'Secret values are never printed.',
      ].join(' '),
    );
  }

  if (env.NODE_ENV === 'production') {
    assertProductionDatabaseUrl(env.DATABASE_URL!);
  }
}

function assertProductionDatabaseUrl(databaseUrl: string): void {
  let hostname = '';
  let database = '';

  try {
    const parsed = new URL(databaseUrl);
    hostname = parsed.hostname.toLowerCase();
    database = decodeURIComponent(parsed.pathname.replace(/^\//, '')).toLowerCase();
  } catch {
    throw new Error(
      'DATABASE_URL is not a valid URL. Check the production database connection string.',
    );
  }

  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1'
  ) {
    throw new Error(
      'DATABASE_URL must not point to localhost in production. Use a production PostgreSQL host.',
    );
  }

  if (database === 'mbd_dashboard_test') {
    throw new Error(
      'DATABASE_URL must not use the E2E/test database (mbd_dashboard_test) in production.',
    );
  }
}

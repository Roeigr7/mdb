import { describe, expect, it } from 'vitest';
import { validateEnv } from './env.validation.js';

function validEnv(
  overrides: Record<string, string | undefined> = {},
): NodeJS.ProcessEnv {
  return {
    DATABASE_URL: 'postgresql://user:pass@db.example.com:5432/mbd_dashboard',
    JWT_SECRET: 'test-secret',
    JWT_ACCESS_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
    ...overrides,
  };
}

describe('validateEnv', () => {
  it('accepts a complete configuration', () => {
    expect(() => validateEnv(validEnv())).not.toThrow();
  });

  it('fails when required variables are missing without exposing values', () => {
    expect(() =>
      validateEnv(
        validEnv({
          JWT_SECRET: undefined,
          DATABASE_URL: undefined,
        }),
      ),
    ).toThrow(/Missing required environment variable\(s\): DATABASE_URL, JWT_SECRET/);
  });

  it('rejects localhost DATABASE_URL when NODE_ENV=production', () => {
    expect(() =>
      validateEnv(
        validEnv({
          NODE_ENV: 'production',
          DATABASE_URL: 'postgresql://user:pass@localhost:5432/mbd_dashboard',
        }),
      ),
    ).toThrow(/must not point to localhost/);
  });

  it('rejects the E2E database name when NODE_ENV=production', () => {
    expect(() =>
      validateEnv(
        validEnv({
          NODE_ENV: 'production',
          DATABASE_URL:
            'postgresql://user:pass@db.example.com:5432/mbd_dashboard_test',
        }),
      ),
    ).toThrow(/mbd_dashboard_test/);
  });
});

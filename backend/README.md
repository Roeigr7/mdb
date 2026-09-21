# MBD Dashboard — Backend

NestJS + TypeScript + Prisma + PostgreSQL API for the MBD Dashboard.

## Project setup

```bash
npm install
```

Copy environment templates (never commit real secrets):

```bash
cp .env.example .env
# edit .env with local development values

# optional E2E file (or use bootstrap-local / Docker Compose)
cp .env.example .env.e2e
# keep only E2E_DATABASE_URL in .env.e2e, pointing at mbd_dashboard_test
```

## Environments

### Development

| Item | Value |
|------|--------|
| File | `.env` (gitignored) |
| Database | `mbd_dashboard` on `localhost:5432` |
| Template | `.env.example` |

Required variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`

Optional: `PORT` (default `3000`).

### E2E / Test

| Item | Value |
|------|--------|
| File | `.env.e2e` (gitignored) and/or CI env |
| Database | **only** `mbd_dashboard_test` |
| Template notes | `.env.example` (E2E section) |

`test/setup-e2e.ts` always sets `DATABASE_URL = E2E_DATABASE_URL`, so E2E never uses the development database.

Local options:

1. Docker Compose: `npm run test:e2e:db:up` then `npm run test:e2e:migrate`
2. Fallback on local Postgres: `npm run test:e2e:db:bootstrap-local` then `npm run test:e2e:migrate`

CI uses a disposable PostgreSQL 16 service with the same isolated DB name.

### Production

| Item | Value |
|------|--------|
| Template | `.env.production.example` (committed placeholders only) |
| Secrets | Deployment platform / GitHub Environment `production` — **not Git** |

Production `DATABASE_URL` must point at a production PostgreSQL host — never `localhost` and never `mbd_dashboard_test`.

Startup validation (`src/config/env.validation.ts`) fails fast if required variables are missing, without printing secret values. With `NODE_ENV=production`, it also rejects localhost / test DB URLs.

Configure future secrets under:

**GitHub → Settings → Environments → production → Secrets / Variables**

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`

## Compile and run

```bash
npm run start:dev    # watch mode
npm run start        # once
npm run build
npm run start:prod   # node dist/main (requires env)
```

Swagger UI: `http://localhost:3000/api`

## Tests

```bash
npm test             # unit
npm run test:e2e     # E2E (requires E2E_DATABASE_URL)
npm run test:cov
```

## CI / CD

- **CI** — `.github/workflows/ci.yml` (push / PR): Postgres service → migrate → unit → E2E → build
- **CD** — `.github/workflows/cd.yml` (after CI succeeds on `main`, or manual): build + placeholder deploy step — **no cloud provider wired yet**

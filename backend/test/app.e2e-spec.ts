import type { INestApplication } from '@nestjs/common';
import pg from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createE2eApp,
  createThrottledE2eApp,
} from './helpers/create-e2e-app.js';
import {
  E2E_ADMIN,
  resetE2eDatabase,
  seedE2eAdmin,
} from './helpers/e2e-db.js';

describe('API (e2e)', () => {
  let app: INestApplication;
  const suffix = Date.now();
  const password = '12345678';

  const userA = {
    name: 'User A',
    email: `user-a-${suffix}@example.com`,
    password,
  };
  const userB = {
    name: 'User B',
    email: `user-b-${suffix}@example.com`,
    password,
  };

  let userATokens: { accessToken: string; refreshToken: string };
  let userBTokens: { accessToken: string; refreshToken: string };
  let adminTokens: { accessToken: string; refreshToken: string };
  let userAId: number;
  let projectId: number;

  beforeAll(async () => {
    await resetE2eDatabase();
    await seedE2eAdmin();
    app = await createE2eApp();
  }, 60_000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Auth', () => {
    it('registers a user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userA)
        .expect(201);

      expect(res.body).toMatchObject({
        name: userA.name,
        email: userA.email,
      });
      expect(res.body).not.toHaveProperty('passwordHash');
      userAId = res.body.id;
    });

    it('logs in with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: userA.email, password })
        .expect(201);

      expect(res.body.accessToken).toEqual(expect.any(String));
      expect(res.body.refreshToken).toEqual(expect.any(String));
      userATokens = res.body;
    });

    it('rejects invalid login', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: userA.email, password: 'wrong-password' })
        .expect(401);
    });

    it('refreshes tokens', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: userATokens.refreshToken })
        .expect(201);

      expect(res.body.accessToken).toEqual(expect.any(String));
      expect(res.body.refreshToken).toEqual(expect.any(String));
      userATokens = res.body;
    });

    it('logs out and rejects the revoked refresh token', async () => {
      const logoutRes = await request(app.getHttpServer())
        .post('/auth/logout')
        .send({ refreshToken: userATokens.refreshToken })
        .expect(201);

      expect(logoutRes.body).toEqual({ message: 'Logged out successfully' });

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: userATokens.refreshToken })
        .expect(401);

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: userA.email, password })
        .expect(201);

      userATokens = loginRes.body;
    });

    it('registers and logs in a second user for ownership checks', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userB)
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: userB.email, password })
        .expect(201);

      userBTokens = res.body;
    });

    it('logs in the seeded ADMIN user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: E2E_ADMIN.email, password: E2E_ADMIN.password })
        .expect(201);

      adminTokens = res.body;
    });
  });

  describe('Validation', () => {
    it('rejects invalid DTO with 400', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'X', email: 'bad', password: '123' })
        .expect(400);
    });

    it('rejects unknown properties with 400', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'X',
          email: `unknown-${suffix}@example.com`,
          password,
          role: 'ADMIN',
        })
        .expect(400);
    });
  });

  describe('Users', () => {
    it('returns 401 without authorization', async () => {
      await request(app.getHttpServer()).get('/users/me').expect(401);
    });

    it('returns 403 for USER on GET /users', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .expect(403);
    });

    it('returns 200 for ADMIN on GET /users', async () => {
      const res = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminTokens.accessToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toEqual(
        expect.objectContaining({
          page: expect.any(Number),
          limit: expect.any(Number),
          total: expect.any(Number),
          totalPages: expect.any(Number),
        }),
      );
    });

    it('returns profile on /users/me', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .expect(200);

      expect(res.body.email).toBe(userA.email);
    });

    it('blocks user A from updating user B', async () => {
      const meB = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${userBTokens.accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/users/${meB.body.id}`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .send({ name: 'Hacked' })
        .expect(403);
    });

    it('blocks user A from deleting user B', async () => {
      const meB = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${userBTokens.accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/users/${meB.body.id}`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .expect(403);
    });
  });

  describe('Projects', () => {
    it('returns 401 without authorization', async () => {
      await request(app.getHttpServer()).get('/projects').expect(401);
    });

    it('creates a project for the authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .send({ name: 'Owned Project', description: 'mine' })
        .expect(201);

      expect(res.body.userId).toBe(userAId);
      projectId = res.body.id;
    });

    it('lists only own projects', async () => {
      const res = await request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .expect(200);

      expect(
        res.body.data.every((p: { userId: number }) => p.userId === userAId),
      ).toBe(true);
    });

    it('gets own project by id', async () => {
      await request(app.getHttpServer())
        .get(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .expect(200);
    });

    it('returns 404 when user B accesses user A project', async () => {
      await request(app.getHttpServer())
        .get(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${userBTokens.accessToken}`)
        .expect(404);
    });

    it('returns 404 when user B updates user A project', async () => {
      await request(app.getHttpServer())
        .patch(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${userBTokens.accessToken}`)
        .send({ name: 'Hacked' })
        .expect(404);
    });

    it('updates own project', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .send({ name: 'Updated Project' })
        .expect(200);

      expect(res.body.name).toBe('Updated Project');
    });

    it('returns 401 for materials without authorization', async () => {
      await request(app.getHttpServer())
        .get(`/projects/${projectId}/materials`)
        .expect(401);
    });

    it('creates a material for the authenticated user project', async () => {
      const res = await request(app.getHttpServer())
        .post(`/projects/${projectId}/materials`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .send({
          name: 'ברזל',
          quantity: 500,
          unitPrice: 12,
          supplier: 'ספק א',
        })
        .expect(201);

      expect(res.body).toMatchObject({
        name: 'ברזל',
        quantity: 500,
        unitPrice: 12,
        supplier: 'ספק א',
        projectId,
        cost: 6000,
      });
      expect(res.body).not.toHaveProperty('totalPrice');
    });

    it('lists project materials with calculated cost', async () => {
      const res = await request(app.getHttpServer())
        .get(`/projects/${projectId}/materials`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .expect(200);

      expect(res.body).toEqual({
        data: [
          expect.objectContaining({
            name: 'ברזל',
            projectId,
            cost: 6000,
          }),
        ],
        meta: expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
        }),
        summary: expect.objectContaining({
          count: 1,
          totalCost: 6000,
        }),
      });
    });

    it('updates own project material', async () => {
      const listed = await request(app.getHttpServer())
        .get(`/projects/${projectId}/materials`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .expect(200);

      const materialId = listed.body.data[0].id as number;

      const res = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/materials/${materialId}`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .send({ quantity: 100, unitPrice: 30, name: 'אלומיניום' })
        .expect(200);

      expect(res.body).toMatchObject({
        id: materialId,
        name: 'אלומיניום',
        quantity: 100,
        unitPrice: 30,
        cost: 3000,
        projectId,
      });
    });

    it('rejects invalid material data', async () => {
      await request(app.getHttpServer())
        .post(`/projects/${projectId}/materials`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .send({ name: '', quantity: 0, unitPrice: -1 })
        .expect(400);

      await request(app.getHttpServer())
        .post(`/projects/${projectId}/materials`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .send({
          name: 'ברזל',
          quantity: 1,
          unitPrice: 1,
          projectId: 999,
        })
        .expect(400);
    });

    it('returns 404 when user B lists user A project materials', async () => {
      await request(app.getHttpServer())
        .get(`/projects/${projectId}/materials`)
        .set('Authorization', `Bearer ${userBTokens.accessToken}`)
        .expect(404);
    });

    it('returns 404 when user B creates a material on user A project', async () => {
      await request(app.getHttpServer())
        .post(`/projects/${projectId}/materials`)
        .set('Authorization', `Bearer ${userBTokens.accessToken}`)
        .send({ name: 'גניבה', quantity: 1, unitPrice: 1 })
        .expect(404);
    });

    it('returns 404 when user B updates or deletes user A material', async () => {
      const listed = await request(app.getHttpServer())
        .get(`/projects/${projectId}/materials`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .expect(200);

      const materialId = listed.body.data[0].id as number;

      await request(app.getHttpServer())
        .patch(`/projects/${projectId}/materials/${materialId}`)
        .set('Authorization', `Bearer ${userBTokens.accessToken}`)
        .send({ name: 'Hacked' })
        .expect(404);

      await request(app.getHttpServer())
        .delete(`/projects/${projectId}/materials/${materialId}`)
        .set('Authorization', `Bearer ${userBTokens.accessToken}`)
        .expect(404);
    });

    it('deletes own project material', async () => {
      const listed = await request(app.getHttpServer())
        .get(`/projects/${projectId}/materials`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .expect(200);

      const materialId = listed.body.data[0].id as number;

      await request(app.getHttpServer())
        .delete(`/projects/${projectId}/materials/${materialId}`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .expect(200);

      const after = await request(app.getHttpServer())
        .get(`/projects/${projectId}/materials`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .expect(200);

      expect(after.body).toEqual(
        expect.objectContaining({
          data: [],
          meta: expect.objectContaining({ total: 0 }),
        }),
      );
    });

    it('deletes project materials when the project is deleted', async () => {
      const created = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .send({ name: 'Cascade Project' })
        .expect(201);

      const cascadeProjectId = created.body.id as number;

      const material = await request(app.getHttpServer())
        .post(`/projects/${cascadeProjectId}/materials`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .send({ name: 'ברזל', quantity: 2, unitPrice: 5 })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/projects/${cascadeProjectId}`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .expect(200);

      const client = new pg.Client({
        connectionString:
          process.env.E2E_DATABASE_URL ?? process.env.DATABASE_URL,
      });
      await client.connect();
      try {
        const count = await client.query<{ count: string }>(
          'SELECT COUNT(*)::text AS count FROM "Material" WHERE id = $1',
          [material.body.id],
        );
        expect(count.rows[0]?.count).toBe('0');
      } finally {
        await client.end();
      }

      await request(app.getHttpServer())
        .get(`/projects/${cascadeProjectId}/materials`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .expect(404);
    });

    it('returns 401 for expenses without authorization', async () => {
      await request(app.getHttpServer())
        .get(`/projects/${projectId}/expenses`)
        .expect(401);
    });

    it('creates and lists expenses for an owned project', async () => {
      const created = await request(app.getHttpServer())
        .post(`/projects/${projectId}/expenses`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .send({
          description: 'חומרי גלם',
          category: 'Materials',
          amount: 2500,
          date: '2026-09-18T00:00:00.000Z',
        })
        .expect(201);

      expect(created.body).toMatchObject({
        description: 'חומרי גלם',
        category: 'Materials',
        amount: 2500,
        projectId,
      });

      const listed = await request(app.getHttpServer())
        .get(`/projects/${projectId}/expenses`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .expect(200);

      expect(listed.body.data).toEqual([
        expect.objectContaining({
          id: created.body.id,
          description: 'חומרי גלם',
          projectId,
        }),
      ]);
      expect(listed.body.meta).toMatchObject({ total: 1, page: 1 });

      const single = await request(app.getHttpServer())
        .get(`/projects/${projectId}/expenses/${created.body.id}`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .expect(200);

      expect(single.body.id).toBe(created.body.id);
    });

    it('updates and deletes own expenses with ownership checks', async () => {
      const created = await request(app.getHttpServer())
        .post(`/projects/${projectId}/expenses`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .send({
          description: 'הובלה',
          amount: 850,
          date: '2026-09-17T00:00:00.000Z',
        })
        .expect(201);

      const expenseId = created.body.id as number;

      const updated = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .send({ amount: 900, category: 'Transportation' })
        .expect(200);

      expect(updated.body).toMatchObject({
        id: expenseId,
        amount: 900,
        category: 'Transportation',
      });

      await request(app.getHttpServer())
        .get(`/projects/${projectId}/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${userBTokens.accessToken}`)
        .expect(404);

      await request(app.getHttpServer())
        .patch(`/projects/${projectId}/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${userBTokens.accessToken}`)
        .send({ amount: 1 })
        .expect(404);

      await request(app.getHttpServer())
        .delete(`/projects/${projectId}/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${userBTokens.accessToken}`)
        .expect(404);

      await request(app.getHttpServer())
        .delete(`/projects/${projectId}/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/projects/${projectId}/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .expect(404);
    });

    it('rejects invalid expense data', async () => {
      await request(app.getHttpServer())
        .post(`/projects/${projectId}/expenses`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .send({
          description: '',
          amount: 0,
          date: 'bad',
        })
        .expect(400);

      await request(app.getHttpServer())
        .post(`/projects/${projectId}/expenses`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .send({
          description: 'X',
          amount: 10,
          date: '2026-09-18T00:00:00.000Z',
          projectId: 999,
        })
        .expect(400);
    });

    it('returns 401 for revenue without authorization', async () => {
      await request(app.getHttpServer())
        .get(`/projects/${projectId}/revenue`)
        .expect(401);
    });

    it('creates and lists revenue for an owned project', async () => {
      const created = await request(app.getHttpServer())
        .post(`/projects/${projectId}/revenue`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .send({
          description: 'תשלום פרויקט',
          customer: 'לאסם',
          amount: 8500,
          date: '2026-09-18T00:00:00.000Z',
          status: 'PAID',
        })
        .expect(201);

      expect(created.body).toMatchObject({
        description: 'תשלום פרויקט',
        customer: 'לאסם',
        amount: 8500,
        status: 'PAID',
        projectId,
      });

      const listed = await request(app.getHttpServer())
        .get(`/projects/${projectId}/revenue`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .expect(200);

      expect(listed.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: created.body.id,
            status: 'PAID',
            projectId,
          }),
        ]),
      );
      expect(listed.body.meta.total).toBeGreaterThanOrEqual(1);

      const single = await request(app.getHttpServer())
        .get(`/projects/${projectId}/revenue/${created.body.id}`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .expect(200);

      expect(single.body.id).toBe(created.body.id);
    });

    it('updates and deletes own revenue with ownership checks', async () => {
      const created = await request(app.getHttpServer())
        .post(`/projects/${projectId}/revenue`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .send({
          description: 'מקדמה',
          amount: 5000,
          date: '2026-09-15T00:00:00.000Z',
          status: 'PENDING',
        })
        .expect(201);

      const revenueId = created.body.id as number;

      const updated = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/revenue/${revenueId}`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .send({ status: 'PAID', customer: 'לקוח ב' })
        .expect(200);

      expect(updated.body).toMatchObject({
        id: revenueId,
        status: 'PAID',
        customer: 'לקוח ב',
      });

      await request(app.getHttpServer())
        .get(`/projects/${projectId}/revenue/${revenueId}`)
        .set('Authorization', `Bearer ${userBTokens.accessToken}`)
        .expect(404);

      await request(app.getHttpServer())
        .patch(`/projects/${projectId}/revenue/${revenueId}`)
        .set('Authorization', `Bearer ${userBTokens.accessToken}`)
        .send({ amount: 1 })
        .expect(404);

      await request(app.getHttpServer())
        .delete(`/projects/${projectId}/revenue/${revenueId}`)
        .set('Authorization', `Bearer ${userBTokens.accessToken}`)
        .expect(404);

      await request(app.getHttpServer())
        .delete(`/projects/${projectId}/revenue/${revenueId}`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/projects/${projectId}/revenue/${revenueId}`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .expect(404);
    });

    it('rejects invalid revenue data', async () => {
      await request(app.getHttpServer())
        .post(`/projects/${projectId}/revenue`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .send({
          description: '',
          amount: 0,
          date: 'bad',
          status: 'DONE',
        })
        .expect(400);
    });

    it('deletes expenses and revenue when the project is deleted', async () => {
      const created = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .send({ name: 'Finance Cascade Project' })
        .expect(201);

      const cascadeProjectId = created.body.id as number;

      const expense = await request(app.getHttpServer())
        .post(`/projects/${cascadeProjectId}/expenses`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .send({
          description: 'ציוד',
          amount: 450,
          date: '2026-09-12T00:00:00.000Z',
        })
        .expect(201);

      const revenue = await request(app.getHttpServer())
        .post(`/projects/${cascadeProjectId}/revenue`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .send({
          description: 'תשלום',
          amount: 1000,
          date: '2026-09-12T00:00:00.000Z',
          status: 'PAID',
        })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/projects/${cascadeProjectId}`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .expect(200);

      const client = new pg.Client({
        connectionString:
          process.env.E2E_DATABASE_URL ?? process.env.DATABASE_URL,
      });
      await client.connect();
      try {
        const expenseCount = await client.query<{ count: string }>(
          'SELECT COUNT(*)::text AS count FROM "Expense" WHERE id = $1',
          [expense.body.id],
        );
        const revenueCount = await client.query<{ count: string }>(
          'SELECT COUNT(*)::text AS count FROM "Revenue" WHERE id = $1',
          [revenue.body.id],
        );
        expect(expenseCount.rows[0]?.count).toBe('0');
        expect(revenueCount.rows[0]?.count).toBe('0');
      } finally {
        await client.end();
      }
    });

    it('returns 404 when user B deletes user A project', async () => {
      await request(app.getHttpServer())
        .delete(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${userBTokens.accessToken}`)
        .expect(404);
    });

    it('deletes own project', async () => {
      await request(app.getHttpServer())
        .delete(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .expect(200);
    });
  });

  describe('OAuth exchange', () => {
    it('rejects an invalid OAuth exchange code', async () => {
      await request(app.getHttpServer())
        .post('/auth/oauth/exchange')
        .send({ code: 'not-a-real-code' })
        .expect(401);
    });

    it('Google OAuth exchange issues tokens that work with /users/me', async () => {
      const { AuthService } = await import('../src/auth/auth.service.js');
      const authService = app.get(AuthService);
      const email = `google-oauth-${suffix}@example.com`;

      const code = await authService.loginWithOAuthProfile({
        provider: 'google',
        providerUserId: `google-${suffix}`,
        email,
        emailVerified: true,
        name: 'Google User',
      });

      const exchangeRes = await request(app.getHttpServer())
        .post('/auth/oauth/exchange')
        .send({ code })
        .expect(201);

      expect(exchangeRes.body.accessToken).toEqual(expect.any(String));
      expect(exchangeRes.body.refreshToken).toEqual(expect.any(String));

      const meRes = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${exchangeRes.body.accessToken}`)
        .expect(200);

      expect(meRes.body).toMatchObject({
        email,
        name: 'Google User',
      });
    });

    it('Facebook OAuth exchange issues tokens that work with /users/me', async () => {
      const { AuthService } = await import('../src/auth/auth.service.js');
      const authService = app.get(AuthService);
      const email = `facebook-oauth-${suffix}@example.com`;

      const code = await authService.loginWithOAuthProfile({
        provider: 'facebook',
        providerUserId: `facebook-${suffix}`,
        email,
        emailVerified: true,
        name: 'Facebook User',
      });

      const exchangeRes = await request(app.getHttpServer())
        .post('/auth/oauth/exchange')
        .send({ code })
        .expect(201);

      expect(exchangeRes.body.accessToken).toEqual(expect.any(String));
      expect(exchangeRes.body.refreshToken).toEqual(expect.any(String));

      const meRes = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${exchangeRes.body.accessToken}`)
        .expect(200);

      expect(meRes.body).toMatchObject({
        email,
        name: 'Facebook User',
      });
    });

    it('reports OAuth providers as disabled when not configured', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/providers')
        .expect(200);
      expect(res.body).toEqual({ google: false, facebook: false });
    });

    it('returns 503 for Google when OAuth is not configured', async () => {
      await request(app.getHttpServer()).get('/auth/google').expect(503);
    });

    it('returns 503 for Facebook when OAuth is not configured', async () => {
      await request(app.getHttpServer()).get('/auth/facebook').expect(503);
    });
  });
});

describe('Rate limiting (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createThrottledE2eApp();
  }, 60_000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('returns 429 after exceeding auth login limit', async () => {
    const email = `throttle-${Date.now()}@example.com`;

    let sawTooManyRequests = false;
    for (let i = 0; i < 8; i += 1) {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'wrong-password' });

      if (res.status === 429) {
        sawTooManyRequests = true;
        break;
      }
    }

    expect(sawTooManyRequests).toBe(true);
  });
});

import type { INestApplication } from '@nestjs/common';
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

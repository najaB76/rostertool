import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import authRoutes from '../../src/server/routes/auth.js';
import adminUsersRoutes from '../../src/server/routes/admin-users.js';

describe('Admin Authentication & User Management API', () => {
  let fastify: FastifyInstance;
  let adminToken: string;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(authRoutes, { prefix: '/api/auth' });
    await fastify.register(adminUsersRoutes, { prefix: '/api/admin/users' });
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('POST /api/auth/login - rejects invalid credentials', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'admin', pin: 'wrong' }
    });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/auth/login - succeeds with default username and pin', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'admin', pin: '1234' }
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.token).toBeDefined();
    adminToken = body.token;
  });

  it('POST /api/auth/change-pin - updates current admin PIN', async () => {
    // 1. Attempt with incorrect current PIN
    const failRes = await fastify.inject({
      method: 'POST',
      url: '/api/auth/change-pin',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { currentPin: '0000', newPin: '5678' }
    });
    expect(failRes.statusCode).toBe(400);

    // 2. Success with correct current PIN
    const successRes = await fastify.inject({
      method: 'POST',
      url: '/api/auth/change-pin',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { currentPin: '1234', newPin: '5678' }
    });
    expect(successRes.statusCode).toBe(200);

    // 3. Login with new PIN succeeds
    const loginNew = await fastify.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'admin', pin: '5678' }
    });
    expect(loginNew.statusCode).toBe(200);
    adminToken = JSON.parse(loginNew.payload).token;

    // Reset back to 1234 for test consistency
    await fastify.inject({
      method: 'POST',
      url: '/api/auth/change-pin',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { currentPin: '5678', newPin: '1234' }
    });
  });

  it('GET /api/admin/users - lists admin accounts', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/api/admin/users',
      headers: { authorization: `Bearer ${adminToken}` }
    });
    expect(res.statusCode).toBe(200);
    const list = JSON.parse(res.payload);
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].username).toBeDefined();
    expect(list[0].pin).toBeUndefined(); // PINs should not be exposed in list
  });

  it('POST /api/admin/users - creates a new admin user', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/admin/users',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { username: 'sarah_admin', pin: '9999' }
    });
    expect(res.statusCode).toBe(201);
    const user = JSON.parse(res.payload);
    expect(user.username).toBe('sarah_admin');

    // Test login with new admin
    const loginRes = await fastify.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'sarah_admin', pin: '9999' }
    });
    expect(loginRes.statusCode).toBe(200);

    // Delete created admin
    const delRes = await fastify.inject({
      method: 'DELETE',
      url: `/api/admin/users/${user.id}`,
      headers: { authorization: `Bearer ${adminToken}` }
    });
    expect(delRes.statusCode).toBe(200);
  });
});

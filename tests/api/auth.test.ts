import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import authRoutes from '../../src/server/routes/auth.js';

describe('Admin Authentication API', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(authRoutes, { prefix: '/api/auth' });
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

    // Verify token
    const verifyRes = await fastify.inject({
      method: 'GET',
      url: '/api/auth/verify',
      headers: {
        authorization: `Bearer ${body.token}`
      }
    });
    expect(verifyRes.statusCode).toBe(200);
    expect(JSON.parse(verifyRes.payload).valid).toBe(true);

    // Logout
    const logoutRes = await fastify.inject({
      method: 'POST',
      url: '/api/auth/logout',
      headers: {
        authorization: `Bearer ${body.token}`
      }
    });
    expect(logoutRes.statusCode).toBe(200);

    // Verify after logout
    const verifyAfter = await fastify.inject({
      method: 'GET',
      url: '/api/auth/verify',
      headers: {
        authorization: `Bearer ${body.token}`
      }
    });
    expect(verifyAfter.statusCode).toBe(401);
  });
});

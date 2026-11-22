import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import authRoutes, { requireAdminAuth } from '../../src/server/routes/auth.js';
import adminBackupRoutes from '../../src/server/routes/admin-backup.js';

describe('Admin Backup Export API', () => {
  let fastify: FastifyInstance;
  let adminToken: string;

  beforeAll(async () => {
    fastify = Fastify();

    // Centralized authentication guard for /api/admin/*
    fastify.addHook('preHandler', async (request, reply) => {
      if (request.url.startsWith('/api/admin')) {
        return requireAdminAuth(request, reply);
      }
    });

    await fastify.register(authRoutes, { prefix: '/api/auth' });
    await fastify.register(adminBackupRoutes, { prefix: '/api/admin/backup' });
    await fastify.ready();

    // Log in to get token
    const loginRes = await fastify.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'admin', pin: '1234' }
    });
    const body = JSON.parse(loginRes.payload);
    adminToken = body.token;
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('GET /api/admin/backup/export - rejects unauthenticated requests with 401', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/api/admin/backup/export'
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body.error).toBe('Unauthorized: Session expired or invalid');
  });

  it('GET /api/admin/backup/export - streams valid SQLite database file when authenticated with Bearer token', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/api/admin/backup/export',
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('application/octet-stream');
    expect(res.headers['content-disposition']).toMatch(/attachment; filename="rostertool-backup-.*\.sqlite"/);

    // Verify first 16 bytes of buffer correspond to SQLite 3 header ("SQLite format 3\0")
    const buffer = res.rawPayload;
    expect(buffer.length).toBeGreaterThan(100);
    const headerStr = buffer.subarray(0, 15).toString('ascii');
    expect(headerStr).toBe('SQLite format 3');
  });
});

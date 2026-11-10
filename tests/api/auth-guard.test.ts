import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import authRoutes, { activeSessions, requireAdminAuth, SESSION_INACTIVITY_TIMEOUT_MS } from '../../src/server/routes/auth.js';
import adminUsersRoutes from '../../src/server/routes/admin-users.js';
import adminVolunteersRoutes from '../../src/server/routes/admin-volunteers.js';
import adminHeadcountRoutes from '../../src/server/routes/admin-headcount.js';
import adminTimelineRoutes from '../../src/server/routes/admin-timeline.js';
import adminSettingsRoutes from '../../src/server/routes/admin-settings.js';
import { db } from '../../src/server/db/client.js';
import { adminUsers } from '../../src/server/db/schema.js';
import { eq } from 'drizzle-orm';

describe('Admin Authentication Guard & Inactivity Session Timeout', () => {
  let fastify: FastifyInstance;
  const testUsername = 'authtestuser';
  const testPin = '9876';

  beforeAll(async () => {
    fastify = Fastify();

    // Centralized preHandler hook like in index.ts
    fastify.addHook('preHandler', async (request, reply) => {
      if (request.url.startsWith('/api/admin')) {
        return requireAdminAuth(request, reply);
      }
    });

    await fastify.register(authRoutes, { prefix: '/api/auth' });
    await fastify.register(adminUsersRoutes, { prefix: '/api/admin/users' });
    await fastify.register(adminVolunteersRoutes, { prefix: '/api/admin/volunteers' });
    await fastify.register(adminHeadcountRoutes, { prefix: '/api/admin/headcount' });
    await fastify.register(adminTimelineRoutes, { prefix: '/api/admin/timeline' });
    await fastify.register(adminSettingsRoutes, { prefix: '/api/admin/settings' });
    await fastify.ready();

    // Ensure test user exists
    await db.delete(adminUsers).where(eq(adminUsers.username, testUsername));
    await db.insert(adminUsers).values({
      username: testUsername,
      pin: testPin
    });
  });

  afterAll(async () => {
    await db.delete(adminUsers).where(eq(adminUsers.username, testUsername));
    await fastify.close();
  });

  it('rejects unauthenticated requests to all /api/admin/* endpoints with 401', async () => {
    const endpoints = [
      '/api/admin/volunteers',
      '/api/admin/headcount?startDate=2026-11-01&endDate=2026-11-07',
      '/api/admin/timeline',
      '/api/admin/settings',
      '/api/admin/users'
    ];

    for (const url of endpoints) {
      const res = await fastify.inject({ method: 'GET', url });
      expect(res.statusCode).toBe(401);
      const body = JSON.parse(res.payload);
      expect(body.error).toContain('Unauthorized');
    }
  });

  it('allows access with a valid token and refreshes sliding activity timestamp', async () => {
    // 1. Log in to get token
    const loginRes = await fastify.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: testUsername, pin: testPin }
    });
    expect(loginRes.statusCode).toBe(200);
    const { token } = JSON.parse(loginRes.payload);
    expect(token).toBeDefined();

    // 2. Call /api/admin/settings with valid Bearer token
    const settingsRes = await fastify.inject({
      method: 'GET',
      url: '/api/admin/settings',
      headers: { authorization: `Bearer ${token}` }
    });
    expect(settingsRes.statusCode).toBe(200);

    // 3. Verify session was updated with recent timestamp
    const session = activeSessions.get(token);
    expect(session).toBeDefined();
    expect(Date.now() - session!.lastActiveAt).toBeLessThan(1000);
  });

  it('expires session after 30 minutes of inactivity and rejects with 401', async () => {
    // 1. Log in
    const loginRes = await fastify.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: testUsername, pin: testPin }
    });
    const { token } = JSON.parse(loginRes.payload);

    // 2. Artificially advance inactivity beyond 30 minutes
    const session = activeSessions.get(token)!;
    session.lastActiveAt = Date.now() - (SESSION_INACTIVITY_TIMEOUT_MS + 1000);

    // 3. Verify /api/auth/verify returns 401
    const verifyRes = await fastify.inject({
      method: 'GET',
      url: '/api/auth/verify',
      headers: { authorization: `Bearer ${token}` }
    });
    expect(verifyRes.statusCode).toBe(401);

    // 4. Verify admin endpoint rejects expired session
    const adminRes = await fastify.inject({
      method: 'GET',
      url: '/api/admin/volunteers',
      headers: { authorization: `Bearer ${token}` }
    });
    expect(adminRes.statusCode).toBe(401);
    expect(activeSessions.has(token)).toBe(false);
  });
});

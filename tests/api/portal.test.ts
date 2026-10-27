import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import portalRoutes from '../../src/server/routes/portal.js';
import adminTimeOffRoutes from '../../src/server/routes/admin-timeoff.js';
import { db } from '../../src/server/db/client.js';
import { volunteers, timeOffRequests } from '../../src/server/db/schema.js';

describe('Volunteer Portal API', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(portalRoutes, { prefix: '/api/portal' });
    await fastify.register(adminTimeOffRoutes, { prefix: '/api/admin/time-off' });
    await fastify.ready();

    await db.delete(timeOffRequests);
    await db.delete(volunteers);
    
    await db.insert(volunteers).values([
      { id: 'v-portal-1', fullName: 'Portal User', nationality: 'BR', magicLinkToken: 'super-secret-token', status: 'Active' },
    ]);
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('GET /api/portal/me - returns volunteer data for valid token', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/portal/me',
      query: { token: 'super-secret-token' }
    });
    
    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(response.payload);
    expect(payload.volunteer.fullName).toBe('Portal User');
  });

  it('GET /api/portal/me - returns 401 for invalid token', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/portal/me',
      query: { token: 'bad-token' }
    });
    expect(response.statusCode).toBe(401);
  });

  it('POST /api/portal/time-off - submits a request', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/portal/time-off?token=super-secret-token',
      payload: {
        date: '2026-11-01',
        reason: 'Rest'
      }
    });
    expect(response.statusCode).toBe(201);
  });

  it('GET /api/admin/time-off - lists requests', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/admin/time-off'
    });
    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(response.payload);
    expect(payload.length).toBeGreaterThan(0);
    expect(payload[0].status).toBe('Pending');
  });
});

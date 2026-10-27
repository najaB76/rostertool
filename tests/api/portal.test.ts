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

  it('POST /api/portal/time-off - submits multi-day date range request', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/portal/time-off?token=super-secret-token',
      payload: {
        startDate: '2026-11-06',
        endDate: '2026-11-08',
        reason: 'Weekend trip'
      }
    });
    expect(response.statusCode).toBe(201);
    const payload = JSON.parse(response.payload);
    expect(payload.datesCreated).toEqual(['2026-11-06', '2026-11-07', '2026-11-08']);

    const listRes = await fastify.inject({
      method: 'GET',
      url: '/api/admin/time-off'
    });
    const allRequests = JSON.parse(listRes.payload);
    const tripRequests = allRequests.filter((r: any) => r.reason === 'Weekend trip');
    expect(tripRequests.length).toBe(3);
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

  it('POST /api/portal/time-off/:id/cancel - cancels a time off request by the volunteer', async () => {
    const createRes = await fastify.inject({
      method: 'POST',
      url: '/api/portal/time-off?token=super-secret-token',
      payload: {
        date: '2026-11-20',
        reason: 'To be cancelled'
      }
    });
    expect(createRes.statusCode).toBe(201);

    const meRes = await fastify.inject({
      method: 'GET',
      url: '/api/portal/me',
      query: { token: 'super-secret-token' }
    });
    const myData = JSON.parse(meRes.payload);
    const toCancel = myData.myTimeOffRequests.find((r: any) => r.reason === 'To be cancelled');
    expect(toCancel).toBeDefined();

    const cancelRes = await fastify.inject({
      method: 'POST',
      url: `/api/portal/time-off/${toCancel.id}/cancel?token=super-secret-token`
    });
    expect(cancelRes.statusCode).toBe(200);

    const meResAfter = await fastify.inject({
      method: 'GET',
      url: '/api/portal/me',
      query: { token: 'super-secret-token' }
    });
    const afterData = JSON.parse(meResAfter.payload);
    const cancelledItem = afterData.myTimeOffRequests.find((r: any) => r.id === toCancel.id);
    expect(cancelledItem.status).toBe('Cancelled');
  });
});

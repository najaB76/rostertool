import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import adminHeadcountRoutes from '../../src/server/routes/admin-headcount.js';
import { db } from '../../src/server/db/client.js';
import { volunteers } from '../../src/server/db/schema.js';

describe('Admin Headcount API', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(adminHeadcountRoutes, { prefix: '/api/admin/headcount' });
    await fastify.ready();

    await db.delete(volunteers);
    
    // Seed some active volunteers
    await db.insert(volunteers).values([
      { id: 'hc-v1', fullName: 'V1', nationality: 'US', status: 'Active', arrivalDate: '2026-10-01', departureDate: '2026-10-15', magicLinkToken: 'tk1' },
      { id: 'hc-v2', fullName: 'V2', nationality: 'UK', status: 'Active', arrivalDate: '2026-10-10', departureDate: '2026-10-20', magicLinkToken: 'tk2' },
    ]);
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('GET /api/admin/headcount - returns daily counts', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/admin/headcount',
      query: { startDate: '2026-10-09', endDate: '2026-10-11' }
    });
    
    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(response.payload);
    expect(payload.length).toBe(3);
    
    // 2026-10-09: only V1 is active
    const day1 = payload.find((p: any) => p.date === '2026-10-09');
    expect(day1.count).toBe(1);
    
    // 2026-10-10: V1 and V2 are active
    const day2 = payload.find((p: any) => p.date === '2026-10-10');
    expect(day2.count).toBe(2);
  });
});

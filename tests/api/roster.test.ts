import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import adminRosterRoutes from '../../src/server/routes/admin-roster.js';
import { db } from '../../src/server/db/client.js';
import { shiftDefinitions, shiftAssignments, volunteers } from '../../src/server/db/schema.js';

describe('Admin Roster API', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(adminRosterRoutes, { prefix: '/api/admin/roster' });
    await fastify.ready();

    // Clean up
    await db.delete(shiftAssignments);
    await db.delete(shiftDefinitions);
    await db.delete(volunteers);

    // Seed dummy definitions
    await db.insert(shiftDefinitions).values({
      id: 'def-1',
      name: 'Housekeeping',
      startTime: '10:00',
      endTime: '14:00',
      durationHours: 4.0,
      minStaff: 3,
    });
    
    // Seed dummy volunteer
    await db.insert(volunteers).values({
      id: 'vol-1',
      fullName: 'Test Vol',
      nationality: 'US',
      magicLinkToken: 'token-123',
    });
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('GET /api/admin/roster - should return weekly roster grid', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/admin/roster',
      query: { weekStartDate: '2026-10-26' } // A Monday
    });
    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(response.payload);
    expect(payload.weekStartDate).toBe('2026-10-26');
    expect(payload.days.length).toBe(7); // Mon-Sun
    expect(payload.days[0].date).toBe('2026-10-26');
    expect(payload.days[0].shifts.length).toBeGreaterThan(0);
  });

  it('POST /api/admin/roster/assign - should assign and then unassign a volunteer', async () => {
    // 1. Assign
    const assignResp = await fastify.inject({
      method: 'POST',
      url: '/api/admin/roster/assign',
      payload: {
        shiftDefinitionId: 'def-1',
        date: '2026-10-26',
        volunteerId: 'vol-1'
      }
    });
    expect(assignResp.statusCode).toBe(200);
    
    // 2. Unassign
    const unassignResp = await fastify.inject({
      method: 'POST',
      url: '/api/admin/roster/assign',
      payload: {
        shiftDefinitionId: 'def-1',
        date: '2026-10-26',
        volunteerId: null // removing assignment
      }
    });
    expect(unassignResp.statusCode).toBe(200);
  });
});

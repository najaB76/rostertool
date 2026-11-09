import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import adminRosterRoutes from '../../src/server/routes/admin-roster.js';
import { db } from '../../src/server/db/client.js';
import { shiftDefinitions, shiftAssignments, volunteers } from '../../src/server/db/schema.js';
import { eq } from 'drizzle-orm';

describe('Roster Assignment Guards', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(adminRosterRoutes, { prefix: '/api/admin/roster' });
    await fastify.ready();

    // Clean up
    await db.delete(shiftAssignments);
    await db.delete(shiftDefinitions).where(eq(shiftDefinitions.id, 'guard-def-hk'));
    await db.delete(shiftDefinitions).where(eq(shiftDefinitions.id, 'guard-def-rec'));
    await db.delete(volunteers).where(eq(volunteers.id, 'guard-vol-1'));
    await db.delete(volunteers).where(eq(volunteers.id, 'guard-vol-non-rec'));

    // Create shift definitions
    await db.insert(shiftDefinitions).values([
      {
        id: 'guard-def-hk',
        name: 'Housekeeping',
        startTime: '10:00',
        endTime: '14:00',
        durationHours: 4.0,
        minStaff: 3,
        isActive: 1
      },
      {
        id: 'guard-def-rec',
        name: 'Reception Day',
        startTime: '08:00',
        endTime: '18:00',
        durationHours: 10.0,
        minStaff: 1,
        isActive: 1
      }
    ]);

    // Create test volunteers
    await db.insert(volunteers).values([
      {
        id: 'guard-vol-1',
        fullName: 'Guard Test Volunteer',
        nationality: 'FR',
        arrivalDate: '2026-11-10',
        departureDate: '2026-11-20',
        noEndDate: false,
        isReceptionQualified: true,
        primaryRole: 'Reception',
        magicLinkToken: 'token-guard-1'
      },
      {
        id: 'guard-vol-non-rec',
        fullName: 'Housekeeping Only Volunteer',
        nationality: 'ES',
        arrivalDate: '2026-11-01',
        departureDate: '2026-11-30',
        noEndDate: false,
        isReceptionQualified: false,
        primaryRole: 'Housekeeping',
        magicLinkToken: 'token-guard-non-rec'
      }
    ]);
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('rejects shift assignment before volunteer arrival date', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/admin/roster/assign',
      payload: {
        shiftDefinitionId: 'guard-def-hk',
        date: '2026-11-05', // Before arrival 2026-11-10
        volunteerId: 'guard-vol-1'
      }
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.error).toMatch(/before.*arrival/i);
  });

  it('rejects shift assignment after volunteer departure date', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/admin/roster/assign',
      payload: {
        shiftDefinitionId: 'guard-def-hk',
        date: '2026-11-25', // After departure 2026-11-20
        volunteerId: 'guard-vol-1'
      }
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.error).toMatch(/after.*departure/i);
  });

  it('rejects assigning non-reception trained volunteer to reception shift', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/admin/roster/assign',
      payload: {
        shiftDefinitionId: 'guard-def-rec',
        date: '2026-11-15',
        volunteerId: 'guard-vol-non-rec'
      }
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.error).toMatch(/reception qualified/i);
  });

  it('allows valid assignment within stay dates for qualified volunteer', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/admin/roster/assign',
      payload: {
        shiftDefinitionId: 'guard-def-rec',
        date: '2026-11-15', // Within stay 2026-11-10 to 2026-11-20
        volunteerId: 'guard-vol-1'
      }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
  });
});

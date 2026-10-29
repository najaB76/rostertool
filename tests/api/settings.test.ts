import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import adminSettingsRoutes from '../../src/server/routes/admin-settings.js';
import { db } from '../../src/server/db/client.js';
import { shiftDefinitions, systemSettings } from '../../src/server/db/schema.js';
import { eq } from 'drizzle-orm';

describe('Admin Settings API', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(adminSettingsRoutes, { prefix: '/api/admin/settings' });
    await fastify.ready();

    // Ensure Housekeeping shift definition exists
    await db.delete(shiftDefinitions).where(eq(shiftDefinitions.id, 'test-hk-def'));
    await db.insert(shiftDefinitions).values({
      id: 'test-hk-def',
      name: 'Housekeeping',
      startTime: '10:00',
      endTime: '14:00',
      durationHours: 4.0,
      minStaff: 3,
      eligibleRoles: 'Housekeeping',
      isActive: 1
    });
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('GET /api/admin/settings - returns default settings', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/api/admin/settings'
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.housekeepersPerDay).toBeGreaterThanOrEqual(1);
    expect(body.housekeepingShiftsPerWeek).toBeGreaterThanOrEqual(1);
    expect(body.housekeepingStartTime).toBeDefined();
    expect(body.housekeepingEndTime).toBeDefined();
  });

  it('POST /api/admin/settings - updates settings and syncs shift definition', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/admin/settings',
      payload: {
        housekeepersPerDay: 5,
        housekeepingShiftsPerWeek: 4,
        housekeepingStartTime: '09:00',
        housekeepingEndTime: '13:00'
      }
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.housekeepersPerDay).toBe(5);
    expect(body.housekeepingStartTime).toBe('09:00');
    expect(body.housekeepingEndTime).toBe('13:00');

    // Verify shiftDefinitions was updated
    const hkDef = await db.select().from(shiftDefinitions).where(eq(shiftDefinitions.id, 'test-hk-def')).get();
    expect(hkDef?.minStaff).toBe(5);
    expect(hkDef?.startTime).toBe('09:00');
    expect(hkDef?.endTime).toBe('13:00');
    expect(hkDef?.durationHours).toBe(4.0);

    // Reset back to 3
    await fastify.inject({
      method: 'POST',
      url: '/api/admin/settings',
      payload: {
        housekeepersPerDay: 3,
        housekeepingShiftsPerWeek: 4,
        housekeepingStartTime: '10:00',
        housekeepingEndTime: '14:00'
      }
    });
  });
});

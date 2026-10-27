import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import adminStaffRoutes from '../../src/server/routes/admin-staff.js';
import { db } from '../../src/server/db/client.js';
import { staffUsers, staffPto } from '../../src/server/db/schema.js';

describe('Admin Staff & PTO API', () => {
  let fastify: FastifyInstance;
  let staffId: string;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(adminStaffRoutes, { prefix: '/api/admin/staff' });
    await fastify.ready();

    await db.delete(staffPto);
    await db.delete(staffUsers);
    
    // Seed staff
    const sId = 'staff-test-1';
    await db.insert(staffUsers).values([
      { id: sId, fullName: 'Test Staff', role: 'Receptionist' }
    ]);
    staffId = sId;
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('GET /api/admin/staff - returns list of staff', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/admin/staff'
    });
    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(response.payload);
    expect(payload.length).toBeGreaterThan(0);
    expect(payload[0].fullName).toBe('Test Staff');
  });

  it('POST /api/admin/staff/:id/pto - creates PTO record', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: `/api/admin/staff/${staffId}/pto`,
      payload: {
        startDate: '2026-12-01',
        endDate: '2026-12-07',
        notes: 'Annual leave'
      }
    });
    expect(response.statusCode).toBe(201);
  });

  it('GET /api/admin/staff/pto - lists PTO records', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/admin/staff/pto'
    });
    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(response.payload);
    expect(payload.length).toBeGreaterThan(0);
    expect(payload[0].staffId).toBe(staffId);
  });
});

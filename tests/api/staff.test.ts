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

  it('POST /api/admin/staff - creates a staff member with nationality', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/admin/staff',
      payload: {
        fullName: 'Hervé Blanc',
        nationality: 'FR',
        role: 'Receptionist'
      }
    });
    expect(response.statusCode).toBe(201);
    const payload = JSON.parse(response.payload);
    expect(payload.fullName).toBe('Hervé Blanc');
    expect(payload.nationality).toBe('FR');
    expect(payload.role).toBe('Receptionist');
  });

  it('PUT /api/admin/staff/:id - updates staff details', async () => {
    const response = await fastify.inject({
      method: 'PUT',
      url: `/api/admin/staff/${staffId}`,
      payload: {
        fullName: 'Test Staff Updated',
        nationality: 'IT',
        role: 'Shift Manager'
      }
    });
    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(response.payload);
    expect(payload.fullName).toBe('Test Staff Updated');
    expect(payload.nationality).toBe('IT');
    expect(payload.role).toBe('Shift Manager');
  });

  it('DELETE /api/admin/staff/:id - deletes a staff member', async () => {
    // 1. Create temporary staff member
    const createRes = await fastify.inject({
      method: 'POST',
      url: '/api/admin/staff',
      payload: { fullName: 'Temp Staff', nationality: 'DE' }
    });
    const tempId = JSON.parse(createRes.payload).id;

    // 2. Delete it
    const delRes = await fastify.inject({
      method: 'DELETE',
      url: `/api/admin/staff/${tempId}`
    });
    expect(delRes.statusCode).toBe(200);

    // 3. Verify it is gone from list
    const listRes = await fastify.inject({ method: 'GET', url: '/api/admin/staff' });
    const list = JSON.parse(listRes.payload);
    expect(list.some((s: any) => s.id === tempId)).toBe(false);
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

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import adminVolunteersRoutes from '../../src/server/routes/admin-volunteers.js';
import { db } from '../../src/server/db/client.js';
import { volunteers, stayReviews } from '../../src/server/db/schema.js';

describe('Admin Volunteers API', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(adminVolunteersRoutes, { prefix: '/api/admin/volunteers' });
    await fastify.ready();

    await db.delete(stayReviews);
    await db.delete(volunteers);
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('POST /api/admin/volunteers - creates a new volunteer', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/admin/volunteers',
      payload: {
        fullName: 'New Applicant',
        nationality: 'FR',
        applicationSourceName: 'WorkAway'
      }
    });
    
    expect(response.statusCode).toBe(201);
    const payload = JSON.parse(response.payload);
    expect(payload.fullName).toBe('New Applicant');
    expect(payload.status).toBe('Applied');
    expect(payload.magicLinkToken).toBeDefined();
  });

  it('POST /api/admin/volunteers - creates volunteer with preferredName and dateOfBirth', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/admin/volunteers',
      payload: {
        fullName: 'Guilherme Silveira',
        preferredName: 'Gui',
        dateOfBirth: '1998-11-03',
        nationality: 'BR'
      }
    });
    expect(response.statusCode).toBe(201);
    const payload = JSON.parse(response.payload);
    expect(payload.fullName).toBe('Guilherme Silveira');
    expect(payload.preferredName).toBe('Gui');
    expect(payload.dateOfBirth).toBe('1998-11-03');
  });

  it('GET /api/admin/volunteers - lists volunteers', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/admin/volunteers',
    });
    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(response.payload);
    expect(payload.length).toBeGreaterThan(0);
    expect(payload[0].fullName).toBe('New Applicant');
  });

  it('POST /api/admin/volunteers - creates volunteer with email and phone and retrieves them', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/admin/volunteers',
      payload: {
        fullName: 'Contact User',
        nationality: 'ES',
        email: 'contact@example.com',
        phone: '+34 600 123 456'
      }
    });
    expect(response.statusCode).toBe(201);
    const created = JSON.parse(response.payload);
    expect(created.email).toBe('contact@example.com');
    expect(created.phone).toBe('+34 600 123 456');

    const listRes = await fastify.inject({ method: 'GET', url: '/api/admin/volunteers' });
    const list = JSON.parse(listRes.payload);
    const found = list.find((v: any) => v.id === created.id);
    expect(found.email).toBe('contact@example.com');
    expect(found.phone).toBe('+34 600 123 456');
  });

  it('POST /api/admin/volunteers/:id/accept - advances applicant to Accepted', async () => {
    // 1. Create applicant
    const createRes = await fastify.inject({
      method: 'POST',
      url: '/api/admin/volunteers',
      payload: {
        fullName: 'Lifecycle Test',
        nationality: 'DE',
      }
    });
    const vol = JSON.parse(createRes.payload);

    // 2. Accept
    const acceptRes = await fastify.inject({
      method: 'POST',
      url: `/api/admin/volunteers/${vol.id}/accept`,
      payload: {
        arrivalDate: '2026-11-01',
        departureDate: '2026-11-28',
        primaryRole: 'Reception',
        notes: 'Accepted after video interview'
      }
    });
    expect(acceptRes.statusCode).toBe(200);
    const acceptedVol = JSON.parse(acceptRes.payload);
    expect(acceptedVol.status).toBe('Accepted');
    expect(acceptedVol.arrivalDate).toBe('2026-11-01');
    expect(acceptedVol.departureDate).toBe('2026-11-28');
    expect(acceptedVol.primaryRole).toBe('Reception');
    expect(acceptedVol.notes).toBe('Accepted after video interview');

    // 3. Activate
    const activateRes = await fastify.inject({
      method: 'POST',
      url: `/api/admin/volunteers/${vol.id}/activate`
    });
    expect(activateRes.statusCode).toBe(200);
    const activeVol = JSON.parse(activateRes.payload);
    expect(activeVol.status).toBe('Active');

    // 4. Cancel
    const cancelRes = await fastify.inject({
      method: 'POST',
      url: `/api/admin/volunteers/${vol.id}/cancel`
    });
    expect(cancelRes.statusCode).toBe(200);
    const cancelledVol = JSON.parse(cancelRes.payload);
    expect(cancelledVol.status).toBe('Cancelled');
  });
});

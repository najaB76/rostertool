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
});

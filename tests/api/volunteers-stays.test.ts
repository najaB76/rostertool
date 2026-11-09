import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import adminVolunteersRoutes from '../../src/server/routes/admin-volunteers.js';
import { db } from '../../src/server/db/client.js';
import { volunteers, volunteerStays } from '../../src/server/db/schema.js';
import { eq } from 'drizzle-orm';

describe('Volunteer Multi-Stay & Lifecycle API', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(adminVolunteersRoutes, { prefix: '/api/admin/volunteers' });
    await fastify.ready();

    // Clean up
    await db.delete(volunteerStays).where(eq(volunteerStays.volunteerId, 'stay-test-vol'));
    await db.delete(volunteers).where(eq(volunteers.id, 'stay-test-vol'));

    // Create an active volunteer
    await db.insert(volunteers).values({
      id: 'stay-test-vol',
      fullName: 'Repeat Volunteer Test',
      preferredName: 'Rep',
      nationality: 'GB',
      gender: 'Male',
      source: 'HelpX',
      status: 'Active',
      arrivalDate: '2026-06-01',
      departureDate: '2026-08-31',
      noEndDate: false,
      isReceptionQualified: true,
      magicLinkToken: 'token-stay-test'
    });

    // Create initial stay
    await db.insert(volunteerStays).values({
      id: 'stay-1',
      volunteerId: 'stay-test-vol',
      arrivalDate: '2026-06-01',
      departureDate: '2026-08-31',
      noEndDate: false
    });
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('POST /:id/depart - records 5-star rating, comments, and 3-way rehire status', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/admin/volunteers/stay-test-vol/depart',
      payload: {
        departureRating: 5,
        departureNotes: 'Outstanding team member!',
        rehireStatus: 'Accept'
      }
    });

    expect(res.statusCode).toBe(200);

    // Verify volunteer status is now Departed
    const vol = await db.select().from(volunteers).where(eq(volunteers.id, 'stay-test-vol')).get();
    expect(vol?.status).toBe('Departed');
    expect(vol?.futureAcceptance).toBe('Accept');

    // Verify stay record was updated with rating and rehire status
    const stays = await db.select().from(volunteerStays).where(eq(volunteerStays.volunteerId, 'stay-test-vol'));
    expect(stays.length).toBe(1);
    expect(stays[0].departureRating).toBe(5);
    expect(stays[0].rehireStatus).toBe('Accept');
    expect(stays[0].departureNotes).toBe('Outstanding team member!');
  });

  it('GET /:id/stays - returns full stay history', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/api/admin/volunteers/stay-test-vol/stays'
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1);
    expect(body[0].departureRating).toBe(5);
    expect(body[0].rehireStatus).toBe('Accept');
  });

  it('POST /:id/reactivate - creates new stay and transitions volunteer back to Active', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/admin/volunteers/stay-test-vol/reactivate',
      payload: {
        arrivalDate: '2026-11-01',
        departureDate: '2027-01-15',
        noEndDate: false
      }
    });

    expect(res.statusCode).toBe(200);

    // Verify volunteer is active with new dates
    const vol = await db.select().from(volunteers).where(eq(volunteers.id, 'stay-test-vol')).get();
    expect(vol?.status).toBe('Active');
    expect(vol?.arrivalDate).toBe('2026-11-01');
    expect(vol?.departureDate).toBe('2027-01-15');

    // Verify volunteer has 2 stays in history now
    const stays = await db.select().from(volunteerStays).where(eq(volunteerStays.volunteerId, 'stay-test-vol'));
    expect(stays.length).toBe(2);
  });
});

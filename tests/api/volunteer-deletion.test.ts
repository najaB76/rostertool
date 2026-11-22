import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import adminVolunteersRoutes from '../../src/server/routes/admin-volunteers.js';
import { db } from '../../src/server/db/client.js';
import { volunteers, volunteerStays, stayReviews, shiftAssignments, timeOffRequests, shiftDefinitions } from '../../src/server/db/schema.js';
import { eq } from 'drizzle-orm';

describe('Volunteer & Stay Deletion API', () => {
  let fastify: FastifyInstance;
  const testVolId = 'del-test-vol';

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(adminVolunteersRoutes, { prefix: '/api/admin/volunteers' });
    await fastify.ready();

    // Clean up
    await db.delete(shiftAssignments).where(eq(shiftAssignments.volunteerId, testVolId));
    await db.delete(timeOffRequests).where(eq(timeOffRequests.volunteerId, testVolId));
    await db.delete(stayReviews).where(eq(stayReviews.volunteerId, testVolId));
    await db.delete(volunteerStays).where(eq(volunteerStays.volunteerId, testVolId));
    await db.delete(volunteers).where(eq(volunteers.id, testVolId));

    // Ensure a test shift definition exists
    await db.insert(shiftDefinitions).values({
      id: 'shift-del-def',
      name: 'Morning Reception',
      startTime: '08:00',
      endTime: '14:00',
      durationHours: 6,
      minStaff: 1
    }).onConflictDoNothing();

    // Seed a volunteer with full child relations
    await db.insert(volunteers).values({
      id: testVolId,
      fullName: 'Deletion Test Volunteer',
      preferredName: 'Del',
      nationality: 'AR',
      gender: 'Male',
      source: 'Direct',
      status: 'Active',
      primaryRole: 'Reception',
      arrivalDate: '2026-11-01',
      departureDate: '2026-12-01',
      noEndDate: false,
      magicLinkToken: 'token-del-test'
    });

    await db.insert(volunteerStays).values([
      {
        id: 'stay-del-1',
        volunteerId: testVolId,
        arrivalDate: '2026-11-01',
        departureDate: '2026-11-15',
        noEndDate: false,
        departureRating: 5
      },
      {
        id: 'stay-del-2',
        volunteerId: testVolId,
        arrivalDate: '2026-11-16',
        departureDate: '2026-12-01',
        noEndDate: false,
        departureRating: 4
      }
    ]);

    await db.insert(stayReviews).values({
      id: 'review-del-1',
      volunteerId: testVolId,
      rating: 5,
      reviewNotes: 'Great stay'
    });

    await db.insert(shiftAssignments).values({
      id: 'assign-del-1',
      shiftDefinitionId: 'shift-del-def',
      date: '2026-11-20',
      volunteerId: testVolId
    });

    await db.insert(timeOffRequests).values({
      id: 'timeoff-del-1',
      volunteerId: testVolId,
      date: '2026-11-12',
      status: 'Approved'
    });
  });

  afterAll(async () => {
    await db.delete(shiftAssignments).where(eq(shiftAssignments.volunteerId, testVolId));
    await db.delete(timeOffRequests).where(eq(timeOffRequests.volunteerId, testVolId));
    await db.delete(stayReviews).where(eq(stayReviews.volunteerId, testVolId));
    await db.delete(volunteerStays).where(eq(volunteerStays.volunteerId, testVolId));
    await db.delete(volunteers).where(eq(volunteers.id, testVolId));
    await db.delete(shiftDefinitions).where(eq(shiftDefinitions.id, 'shift-del-def'));
    await fastify.close();
  });

  it('DELETE /api/admin/volunteers/:id/stays/:stayId - deletes individual stay without deleting volunteer', async () => {
    const res = await fastify.inject({
      method: 'DELETE',
      url: `/api/admin/volunteers/${testVolId}/stays/stay-del-1`
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);

    // Verify stay-del-1 is deleted
    const stay1 = await db.select().from(volunteerStays).where(eq(volunteerStays.id, 'stay-del-1')).get();
    expect(stay1).toBeUndefined();

    // Verify stay-del-2 still exists
    const stay2 = await db.select().from(volunteerStays).where(eq(volunteerStays.id, 'stay-del-2')).get();
    expect(stay2).toBeDefined();

    // Verify volunteer still exists
    const vol = await db.select().from(volunteers).where(eq(volunteers.id, testVolId)).get();
    expect(vol).toBeDefined();
  });

  it('DELETE /api/admin/volunteers/:id - deletes volunteer and all cascading child records (zero orphans)', async () => {
    const res = await fastify.inject({
      method: 'DELETE',
      url: `/api/admin/volunteers/${testVolId}`
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);

    // Verify volunteer is deleted
    const vol = await db.select().from(volunteers).where(eq(volunteers.id, testVolId)).get();
    expect(vol).toBeUndefined();

    // Verify all child records were deleted (zero orphans)
    const stays = await db.select().from(volunteerStays).where(eq(volunteerStays.volunteerId, testVolId));
    expect(stays.length).toBe(0);

    const reviews = await db.select().from(stayReviews).where(eq(stayReviews.volunteerId, testVolId));
    expect(reviews.length).toBe(0);

    const assignments = await db.select().from(shiftAssignments).where(eq(shiftAssignments.volunteerId, testVolId));
    expect(assignments.length).toBe(0);

    const timeOff = await db.select().from(timeOffRequests).where(eq(timeOffRequests.volunteerId, testVolId));
    expect(timeOff.length).toBe(0);
  });
});

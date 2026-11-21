import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import adminTimelineRoutes from '../../src/server/routes/admin-timeline.js';
import { db } from '../../src/server/db/client.js';
import { volunteers, staffUsers, volunteerStays } from '../../src/server/db/schema.js';
import { eq } from 'drizzle-orm';

describe('Admin Staffing Timeline API', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(adminTimelineRoutes, { prefix: '/api/admin/timeline' });
    await fastify.ready();

    // Clean up
    await db.delete(volunteers);
    await db.delete(staffUsers).where(eq(staffUsers.id, 'tl-staff-1'));

    // Seed reception staff
    await db.insert(staffUsers).values({
      id: 'tl-staff-1',
      fullName: 'Steven Staff',
      nationality: 'GB',
      role: 'Receptionist',
      isActive: 1
    });

    // Seed reception volunteer (Active)
    await db.insert(volunteers).values({
      id: 'tl-vol-rec',
      fullName: 'Sarah Receptionist',
      preferredName: 'Sarah',
      nationality: 'CH',
      gender: 'Female',
      source: 'HelpX',
      status: 'Active',
      primaryRole: 'Reception',
      arrivalDate: '2026-11-01',
      departureDate: '2026-11-30',
      noEndDate: false,
      magicLinkToken: 'token-tl-rec'
    });

    // Seed housekeeping volunteer (Active)
    await db.insert(volunteers).values({
      id: 'tl-vol-hk',
      fullName: 'Thijs Housekeeper',
      preferredName: 'Thijs',
      nationality: 'NL',
      gender: 'Male',
      source: 'Email',
      status: 'Active',
      primaryRole: 'Housekeeping',
      arrivalDate: '2026-11-01',
      departureDate: '2026-11-07',
      noEndDate: false,
      magicLinkToken: 'token-tl-hk'
    });

    // Seed applied volunteer (Applied - Unconfirmed)
    await db.insert(volunteers).values({
      id: 'tl-vol-app',
      fullName: 'Alba Applicant',
      preferredName: 'Alba',
      nationality: 'ES',
      gender: 'Female',
      source: 'Worldpackers',
      status: 'Applied',
      primaryRole: 'Housekeeping',
      arrivalDate: '2026-11-14',
      departureDate: '2026-12-14',
      noEndDate: false,
      magicLinkToken: 'token-tl-app'
    });
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('GET /api/admin/timeline - returns segregated tiers, calendar days, and daily confirmed counts', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/api/admin/timeline',
      query: {
        startDate: '2026-11-02',
        weeks: '5'
      }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);

    // Verify timeline days (5 weeks = 35 days)
    expect(body.days).toBeDefined();
    expect(body.days.length).toBe(35);
    expect(body.days[0].date).toBe('2026-11-02');

    // Verify 3 segregated sections
    expect(body.reception).toBeDefined();
    expect(body.housekeeping).toBeDefined();
    expect(body.applied).toBeDefined();

    // Verify members in reception (volunteers only, NO paid staff)
    const recIds = body.reception.map((r: any) => r.id);
    expect(recIds).not.toContain('tl-staff-1');
    expect(recIds).toContain('tl-vol-rec');

    // Verify no section contains paid staff
    const allTimelineIds = [
      ...body.reception.map((r: any) => r.id),
      ...body.housekeeping.map((h: any) => h.id),
      ...body.applied.map((a: any) => a.id)
    ];
    expect(allTimelineIds).not.toContain('tl-staff-1');

    // Verify members in housekeeping (active housekeeping vol)
    const hkIds = body.housekeeping.map((h: any) => h.id);
    expect(hkIds).toContain('tl-vol-hk');

    // Verify members in applied (applied unconfirmed candidate)
    const appIds = body.applied.map((a: any) => a.id);
    expect(appIds).toContain('tl-vol-app');

    // Verify daily confirmed counts (only confirmed volunteers, excludes paid staff)
    expect(body.dailyConfirmedCounts).toBeDefined();
    // On 2026-11-03, Sarah (rec) and Thijs (hk) are on site, staff is excluded
    expect(body.dailyConfirmedCounts['2026-11-03']).toBe(2);

    // On 2026-11-07 (Thijs departure day), Thijs vacates bed and does not stay overnight
    expect(body.dailyConfirmedCounts['2026-11-07']).toBe(1);

    // Verify headcount thresholds are provided
    expect(body.headcountThresholds).toBeDefined();
    expect(body.headcountThresholds.baseline).toBeGreaterThanOrEqual(8);
  });

  it('GET /api/admin/timeline - includes historical departed volunteers when querying past dates and provides dailyAppliedCounts', async () => {
    // Seed a departed volunteer who stayed from 2026-07-01 to 2026-07-31
    await db.insert(volunteers).values({
      id: 'tl-vol-past',
      fullName: 'Past Alum',
      preferredName: 'Alum',
      nationality: 'IT',
      gender: 'Male',
      source: 'HelpX',
      status: 'Departed',
      primaryRole: 'Reception',
      arrivalDate: '2026-07-01',
      departureDate: '2026-07-31',
      noEndDate: false,
      magicLinkToken: 'token-tl-past'
    });

    const res = await fastify.inject({
      method: 'GET',
      url: '/api/admin/timeline',
      query: {
        startDate: '2026-07-06',
        weeks: '4'
      }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.reception.map((r: any) => r.id)).toContain('tl-vol-past');
    expect(body.dailyConfirmedCounts['2026-07-10']).toBe(1);
    expect(body.dailyAppliedCounts).toBeDefined();

    await db.delete(volunteers).where(eq(volunteers.id, 'tl-vol-past'));
  });

  it('GET /api/admin/timeline - populates accepted volunteers in operational tiers and applied in candidate pool', async () => {
    // Seed an accepted volunteer (moved past Applied)
    await db.insert(volunteers).values({
      id: 'tl-vol-acc',
      fullName: 'Lucas Accepted',
      preferredName: 'Lucas',
      nationality: 'BR',
      gender: 'Male',
      source: 'WorkAway',
      status: 'Accepted',
      primaryRole: 'Housekeeping',
      arrivalDate: '2026-11-20',
      departureDate: '2026-11-28',
      noEndDate: false,
      magicLinkToken: 'token-tl-acc'
    });

    const res = await fastify.inject({
      method: 'GET',
      url: '/api/admin/timeline',
      query: {
        startDate: '2026-11-02',
        weeks: '5'
      }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);

    // Verify Lucas (Accepted) appears in housekeeping operational tier
    const hkIds = body.housekeeping.map((h: any) => h.id);
    expect(hkIds).toContain('tl-vol-acc');

    // Verify Alba (Applied) appears in applied candidate pool
    const appIds = body.applied.map((a: any) => a.id);
    expect(appIds).toContain('tl-vol-app');
    expect(appIds).not.toContain('tl-vol-acc');

    // Verify confirmed counts include Lucas on 2026-11-22
    expect(body.dailyConfirmedCounts['2026-11-22']).toBeGreaterThanOrEqual(1);

    // Verify applied counts include Alba on 2026-11-22
    expect(body.dailyAppliedCounts['2026-11-22']).toBeGreaterThanOrEqual(1);

    await db.delete(volunteers).where(eq(volunteers.id, 'tl-vol-acc'));
  });

  it('GET /api/admin/timeline - does not let un-synchronized null stays in volunteer_stays overwrite authoritative departure dates when scrolling forward', async () => {
    const testVolId = 'tl-vol-wy';
    await db.insert(volunteers).values({
      id: testVolId,
      fullName: 'William Yang',
      preferredName: 'William',
      nationality: 'US',
      gender: 'Male',
      source: 'Worldpackers',
      status: 'Active',
      primaryRole: 'Housekeeping',
      arrivalDate: '2026-11-06',
      departureDate: '2026-12-05',
      noEndDate: false,
      magicLinkToken: 'token-tl-wy'
    });

    await db.insert(volunteerStays).values({
      id: 'stay-wy-old',
      volunteerId: testVolId,
      arrivalDate: '2026-11-06',
      departureDate: null,
      noEndDate: false
    });

    // Call 0: Within stay window (2026-11-16 to 2026-12-20)
    const res0 = await fastify.inject({
      method: 'GET',
      url: '/api/admin/timeline',
      query: { startDate: '2026-11-16', weeks: '5' }
    });
    expect(res0.statusCode).toBe(200);
    const body0 = JSON.parse(res0.payload);
    const wy0 = body0.housekeeping.find((h: any) => h.id === testVolId);
    expect(wy0).toBeDefined();
    expect(wy0.departureDate).toBe('2026-12-05');

    // Call 1: Scrolled forward past departure (2026-12-21 to 2027-01-24)
    const res1 = await fastify.inject({
      method: 'GET',
      url: '/api/admin/timeline',
      query: { startDate: '2026-12-21', weeks: '5' }
    });
    expect(res1.statusCode).toBe(200);
    const body1 = JSON.parse(res1.payload);
    const wy1 = body1.housekeeping.find((h: any) => h.id === testVolId);
    // William Yang departed on 2026-12-05, so he MUST NOT appear in the window starting 2026-12-21!
    expect(wy1).toBeUndefined();

    await db.delete(volunteerStays).where(eq(volunteerStays.volunteerId, testVolId));
    await db.delete(volunteers).where(eq(volunteers.id, testVolId));
  });
});

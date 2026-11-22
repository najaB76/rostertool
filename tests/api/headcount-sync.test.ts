import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import adminHeadcountRoutes from '../../src/server/routes/admin-headcount.js';
import adminTimelineRoutes from '../../src/server/routes/admin-timeline.js';
import { db } from '../../src/server/db/client.js';
import { volunteers, volunteerStays } from '../../src/server/db/schema.js';
import { eq, inArray } from 'drizzle-orm';

describe('Headcount & Timeline Count Parity', () => {
  let fastify: FastifyInstance;

  const testIds = ['hc-vol-1', 'hc-vol-2', 'hc-vol-3', 'hc-vol-4'];

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(adminHeadcountRoutes, { prefix: '/api/admin/headcount' });
    await fastify.register(adminTimelineRoutes, { prefix: '/api/admin/timeline' });
    await fastify.ready();

    // Clean up
    await db.delete(volunteerStays).where(inArray(volunteerStays.volunteerId, testIds));
    await db.delete(volunteers).where(inArray(volunteers.id, testIds));

    // 1. Volunteer with no end date (open-ended stay)
    await db.insert(volunteers).values({
      id: 'hc-vol-1',
      fullName: 'Open Ended Volunteer',
      preferredName: 'OpenEnded',
      nationality: 'ES',
      gender: 'Female',
      source: 'Direct',
      status: 'Active',
      primaryRole: 'Housekeeping',
      arrivalDate: '2026-11-01',
      departureDate: null,
      noEndDate: true,
      magicLinkToken: 'tok-hc-1'
    });

    // 2. Active volunteer with departure on 2026-11-27 (departs on the 27th, so vacates bed for the night of 27th)
    await db.insert(volunteers).values({
      id: 'hc-vol-2',
      fullName: 'Departing On 27th',
      preferredName: 'Departing',
      nationality: 'FR',
      gender: 'Male',
      source: 'WorkAway',
      status: 'Active',
      primaryRole: 'Reception',
      arrivalDate: '2026-11-10',
      departureDate: '2026-11-27',
      noEndDate: false,
      magicLinkToken: 'tok-hc-2'
    });

    // 3. Accepted upcoming volunteer staying through 2026-11-30
    await db.insert(volunteers).values({
      id: 'hc-vol-3',
      fullName: 'Accepted In House',
      preferredName: 'Accepted',
      nationality: 'DE',
      gender: 'Female',
      source: 'HelpX',
      status: 'Accepted',
      primaryRole: 'Reception',
      arrivalDate: '2026-11-20',
      departureDate: '2026-11-30',
      noEndDate: false,
      magicLinkToken: 'tok-hc-3'
    });

    // 4. Departed volunteer who was active during a past historical stay
    await db.insert(volunteers).values({
      id: 'hc-vol-4',
      fullName: 'Past Departed Volunteer',
      preferredName: 'Past',
      nationality: 'IT',
      gender: 'Male',
      source: 'Direct',
      status: 'Departed',
      primaryRole: 'Housekeeping',
      arrivalDate: '2026-11-15',
      departureDate: '2026-11-28',
      noEndDate: false,
      magicLinkToken: 'tok-hc-4'
    });

    await db.insert(volunteerStays).values({
      id: 'stay-hc-4',
      volunteerId: 'hc-vol-4',
      arrivalDate: '2026-11-15',
      departureDate: '2026-11-28',
      noEndDate: false
    });
  });

  afterAll(async () => {
    await db.delete(volunteerStays).where(inArray(volunteerStays.volunteerId, testIds));
    await db.delete(volunteers).where(inArray(volunteers.id, testIds));
    await fastify.close();
  });

  it('GET /api/admin/headcount matches timeline confirmed count on 2026-11-27', async () => {
    // Query timeline for the week
    const timelineRes = await fastify.inject({
      method: 'GET',
      url: '/api/admin/timeline',
      query: {
        startDate: '2026-11-23',
        weeks: '2'
      }
    });
    expect(timelineRes.statusCode).toBe(200);
    const timelineBody = JSON.parse(timelineRes.payload);
    const timelineCount27 = timelineBody.dailyConfirmedCounts['2026-11-27'];

    // Query headcount for the same date range
    const headcountRes = await fastify.inject({
      method: 'GET',
      url: '/api/admin/headcount',
      query: {
        startDate: '2026-11-23',
        endDate: '2026-12-06'
      }
    });
    expect(headcountRes.statusCode).toBe(200);
    const headcountBody = JSON.parse(headcountRes.payload);

    const day27 = headcountBody.find((d: any) => d.date === '2026-11-27');
    expect(day27).toBeDefined();

    // Count on headcount page MUST match timeline count exactly!
    expect(day27.count).toBe(timelineCount27);

    // Verify hc-vol-1 (noEndDate) IS included
    const volIds27 = day27.volunteers.map((v: any) => v.id);
    expect(volIds27).toContain('hc-vol-1');

    // Verify hc-vol-2 (departing on 27th) is NOT counted for overnight stay on 27th
    expect(volIds27).not.toContain('hc-vol-2');

    // Verify hc-vol-3 (accepted staying through 30th) IS included
    expect(volIds27).toContain('hc-vol-3');

    // Verify hc-vol-4 (departed but on site on 27th) IS included
    expect(volIds27).toContain('hc-vol-4');
  });
});

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import adminReportsRoutes from '../../src/server/routes/admin-reports.js';
import { db } from '../../src/server/db/client.js';
import { volunteers, volunteerStays } from '../../src/server/db/schema.js';
import { eq, inArray } from 'drizzle-orm';
import { getContinent, getAgeBracket } from '../../src/server/services/reporting-service.js';

describe('Volunteer Analytics & Reports API', () => {
  let fastify: FastifyInstance;
  const testIds = ['rep-vol-1', 'rep-vol-2'];

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(adminReportsRoutes, { prefix: '/api/admin/reports' });
    await fastify.ready();

    await db.delete(volunteerStays).where(inArray(volunteerStays.volunteerId, testIds));
    await db.delete(volunteers).where(inArray(volunteers.id, testIds));

    await db.insert(volunteers).values([
      {
        id: 'rep-vol-1',
        fullName: 'Spanish Reporter',
        preferredName: 'Spain',
        nationality: 'ES',
        gender: 'Female',
        dateOfBirth: '2000-01-01',
        status: 'Active',
        primaryRole: 'Housekeeping',
        arrivalDate: '2026-11-01',
        departureDate: '2026-12-01',
        magicLinkToken: 'tok-rep-1'
      },
      {
        id: 'rep-vol-2',
        fullName: 'Scottish Reporter',
        preferredName: 'Scot',
        nationality: 'GB-SCT',
        gender: 'Male',
        dateOfBirth: '1995-01-01',
        status: 'Departed',
        primaryRole: 'Reception',
        arrivalDate: '2025-01-01',
        departureDate: '2025-03-01',
        magicLinkToken: 'tok-rep-2'
      }
    ]);

    await db.insert(volunteerStays).values([
      {
        id: 'stay-rep-1',
        volunteerId: 'rep-vol-1',
        arrivalDate: '2026-11-01',
        departureDate: '2026-12-01',
        noEndDate: false,
        departureRating: 5,
        rehireStatus: 'Accept'
      },
      {
        id: 'stay-rep-2',
        volunteerId: 'rep-vol-2',
        arrivalDate: '2025-01-01',
        departureDate: '2025-03-01',
        noEndDate: false,
        departureRating: 4,
        rehireStatus: 'Accept'
      }
    ]);
  });

  afterAll(async () => {
    await db.delete(volunteerStays).where(inArray(volunteerStays.volunteerId, testIds));
    await db.delete(volunteers).where(inArray(volunteers.id, testIds));
    await fastify.close();
  });

  it('correctly maps continent and age brackets', () => {
    expect(getContinent('ES')).toBe('Europe');
    expect(getContinent('GB-SCT')).toBe('Europe');
    expect(getContinent('US')).toBe('North America');
    expect(getContinent('BR')).toBe('South America');
    expect(getContinent('AU')).toBe('Oceania');
    expect(getContinent('JP')).toBe('Asia');
    expect(getContinent('ZA')).toBe('Africa');

    expect(getAgeBracket('2005-01-01')).toBe('<22');
    expect(getAgeBracket('1995-01-01')).toBe('31-40');
    expect(getAgeBracket(null)).toBe('Unknown');
  });

  it('GET /api/admin/reports - aggregates KPIs and crosstabulations', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/api/admin/reports'
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);

    expect(body.kpis).toBeDefined();
    expect(body.kpis.totalVolunteers).toBeGreaterThanOrEqual(2);
    expect(body.kpis.totalStays).toBeGreaterThanOrEqual(2);
    expect(body.kpis.averageRating).toBeGreaterThan(0);

    // Verify byCountry
    expect(Array.isArray(body.byCountry)).toBe(true);
    const es = body.byCountry.find((c: any) => c.country === 'ES');
    expect(es).toBeDefined();
    expect(es.volunteerCount).toBeGreaterThanOrEqual(1);

    // Verify byContinent
    expect(Array.isArray(body.byContinent)).toBe(true);
    const europe = body.byContinent.find((c: any) => c.continent === 'Europe');
    expect(europe).toBeDefined();

    // Verify byAgeBracket
    expect(Array.isArray(body.byAgeBracket)).toBe(true);
    expect(body.byAgeBracket.some((b: any) => b.volunteerCount > 0)).toBe(true);

    // Verify byGender
    expect(Array.isArray(body.byGender)).toBe(true);
    const female = body.byGender.find((g: any) => g.gender === 'Female');
    expect(female.volunteerCount).toBeGreaterThanOrEqual(1);

    // Verify rehireRatiosByCountry
    expect(Array.isArray(body.rehireRatiosByCountry)).toBe(true);
  });
});

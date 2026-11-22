import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../../src/server/db/client.js';
import { volunteers, volunteerStays } from '../../src/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { parseResidentStatus, mapGender, mapFutureAcceptance, mapRehireStatus, importResidents } from '../../scripts/import-residents.js';
import fs from 'fs';
import path from 'path';

describe('Volunteer JSON Import CLI Tool', () => {
  const testJsonPath = path.resolve(process.cwd(), 'tests/engine/test-residents-sample.json');
  const today = '2026-11-20';

  const sampleData = [
    {
      given_names: "Test Past",
      family_name: "Departed",
      preferred_name: "Pastie",
      date_of_birth: "1995-05-10",
      gender: "M",
      country: "GB-SCT",
      arrival_date: "2025-01-01",
      departure_date: "2025-03-01",
      primary_role: "Reception",
      reception_qualified: true,
      star_rating: 5,
      accept_new_application: "Yes",
      notes: "Excellent receptionist"
    },
    {
      given_names: "Test Active",
      family_name: "InHouse",
      preferred_name: null,
      date_of_birth: "2000-08-20",
      gender: "F",
      country: "ES",
      arrival_date: "2026-11-01",
      departure_date: "2026-12-31",
      primary_role: "Housekeeping",
      reception_qualified: false,
      star_rating: 4,
      accept_new_application: "Up to you",
      notes: "Currently on site"
    },
    {
      given_names: "Test Never",
      family_name: "Arrived",
      preferred_name: null,
      date_of_birth: "1998-12-12",
      gender: "M",
      country: "FR",
      arrival_date: null,
      departure_date: null,
      primary_role: "Housekeeping",
      reception_qualified: false,
      star_rating: 1,
      accept_new_application: "No",
      notes: "Cancelled prior to arrival"
    }
  ];

  beforeAll(() => {
    fs.writeFileSync(testJsonPath, JSON.stringify(sampleData, null, 2));
  });

  afterAll(async () => {
    if (fs.existsSync(testJsonPath)) {
      fs.unlinkSync(testJsonPath);
    }
    await db.delete(volunteers).where(eq(volunteers.fullName, 'Test Past Departed'));
    await db.delete(volunteers).where(eq(volunteers.fullName, 'Test Active InHouse'));
    await db.delete(volunteers).where(eq(volunteers.fullName, 'Test Never Arrived'));
  });

  it('correctly maps status based on dates', () => {
    expect(parseResidentStatus(null, null, today)).toBe('Cancelled');
    expect(parseResidentStatus('2026-12-01', '2027-01-01', today)).toBe('Accepted');
    expect(parseResidentStatus('2026-11-01', '2026-12-01', today)).toBe('Active');
    expect(parseResidentStatus('2026-11-01', null, today)).toBe('Active');
    expect(parseResidentStatus('2025-01-01', '2025-03-01', today)).toBe('Departed');
  });

  it('correctly maps gender and future acceptance', () => {
    expect(mapGender('M')).toBe('Male');
    expect(mapGender('F')).toBe('Female');
    expect(mapGender('Other')).toBe('Unspecified');

    expect(mapFutureAcceptance('Yes')).toBe('YES');
    expect(mapFutureAcceptance('No')).toBe('NO');
    expect(mapFutureAcceptance('Up to you')).toBe('CONDITIONAL');

    expect(mapRehireStatus('Yes')).toBe('Accept');
    expect(mapRehireStatus('No')).toBe("Don't Accept");
    expect(mapRehireStatus('Up to you')).toBe('Possible');
  });

  it('--dry-run produces 0 database writes', async () => {
    const summary = await importResidents(testJsonPath, { dryRun: true, today });
    expect(summary.total).toBe(3);
    expect(summary.departed).toBe(1);
    expect(summary.active).toBe(1);
    expect(summary.cancelled).toBe(1);

    const check = await db.select().from(volunteers).where(eq(volunteers.fullName, 'Test Past Departed')).get();
    expect(check).toBeUndefined();
  });

  it('imports records and stays into database and is idempotent', async () => {
    // 1st run: Imports data
    const summary1 = await importResidents(testJsonPath, { dryRun: false, today });
    expect(summary1.created).toBe(3);
    expect(summary1.updated).toBe(0);

    const pastVol = await db.select().from(volunteers).where(eq(volunteers.fullName, 'Test Past Departed')).get();
    expect(pastVol).toBeDefined();
    expect(pastVol?.status).toBe('Departed');
    expect(pastVol?.primaryRole).toBe('Reception');
    expect(pastVol?.gender).toBe('Male');
    expect(pastVol?.nationality).toBe('GB-SCT');
    expect(pastVol?.futureAcceptance).toBe('YES');

    const pastStays = await db.select().from(volunteerStays).where(eq(volunteerStays.volunteerId, pastVol!.id));
    expect(pastStays.length).toBe(1);
    expect(pastStays[0].departureRating).toBe(5);
    expect(pastStays[0].rehireStatus).toBe('Accept');

    const activeVol = await db.select().from(volunteers).where(eq(volunteers.fullName, 'Test Active InHouse')).get();
    expect(activeVol?.status).toBe('Active');

    const neverVol = await db.select().from(volunteers).where(eq(volunteers.fullName, 'Test Never Arrived')).get();
    expect(neverVol?.status).toBe('Cancelled');

    // 2nd run: Idempotent (updates, does not duplicate)
    const summary2 = await importResidents(testJsonPath, { dryRun: false, today });
    expect(summary2.created).toBe(0);
    expect(summary2.updated).toBe(3);

    const allPast = await db.select().from(volunteers).where(eq(volunteers.fullName, 'Test Past Departed'));
    expect(allPast.length).toBe(1);
  });
});

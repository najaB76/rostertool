import { db } from '../db/client.js';
import { volunteers, systemSettings, volunteerStays } from '../db/schema.js';

export class HeadcountService {
  async getDailyHeadcounts(startDate: string, endDate: string) {
    const settingsRows = await db.select().from(systemSettings);
    const settingsMap = new Map(settingsRows.map(s => [s.key, s.value]));

    const baseline = parseInt(settingsMap.get('headcount_baseline') || '11', 10);
    const lowMin = parseInt(settingsMap.get('headcount_low_min') || '8', 10);
    const lowMax = parseInt(settingsMap.get('headcount_low_max') || '10', 10);
    const critical = parseInt(settingsMap.get('headcount_critical') || '8', 10);
    const overbooked = parseInt(settingsMap.get('headcount_overbooked') || '11', 10);

    // Fetch all volunteers and their stays (same consolidated logic as timeline)
    const allVols = await db.select().from(volunteers);
    const allStays = await db.select().from(volunteerStays);

    const staysByVol = new Map<string, typeof allStays>();
    for (const s of allStays) {
      if (!staysByVol.has(s.volunteerId)) {
        staysByVol.set(s.volunteerId, []);
      }
      staysByVol.get(s.volunteerId)!.push(s);
    }

    // Build confirmed candidates pool (Active, Accepted, or historical stays)
    const confirmedVolsWithStays: Array<{
      id: string;
      fullName: string;
      preferredName: string | null;
      nationality: string;
      primaryRole: string;
      status: string;
      arrivalDate: string | null;
      departureDate: string | null;
      noEndDate: boolean;
    }> = [];

    for (const v of allVols) {
      if (v.status === 'Applied' || v.status === 'Cancelled') continue;

      const stays: Array<{ arrivalDate: string | null; departureDate: string | null; noEndDate: boolean }> = [];
      if (v.arrivalDate) {
        stays.push({
          arrivalDate: v.arrivalDate,
          departureDate: v.departureDate,
          noEndDate: Boolean(v.noEndDate)
        });
      }

      for (const s of staysByVol.get(v.id) || []) {
        if (v.arrivalDate && s.arrivalDate === v.arrivalDate) continue;
        if (!stays.some(st => st.arrivalDate === s.arrivalDate && st.departureDate === s.departureDate)) {
          stays.push({
            arrivalDate: s.arrivalDate,
            departureDate: s.departureDate,
            noEndDate: Boolean(s.noEndDate)
          });
        }
      }

      for (const stay of stays) {
        confirmedVolsWithStays.push({
          id: v.id,
          fullName: v.fullName,
          preferredName: v.preferredName,
          nationality: v.nationality,
          primaryRole: v.primaryRole,
          status: v.status,
          arrivalDate: stay.arrivalDate,
          departureDate: stay.departureDate,
          noEndDate: stay.noEndDate
        });
      }
    }

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const days = [];

    for (let current = start; current <= end; current += 86400000) {
      const dateStr = new Date(current).toISOString().split('T')[0];

      // Volunteers active/in-house on dateStr (matching timeline overnight bed demand rule:
      // arrivalDate <= dateStr and (noEndDate || departureDate > dateStr))
      const activeVolsMap = new Map<string, any>();
      for (const cv of confirmedVolsWithStays) {
        if (cv.arrivalDate && cv.arrivalDate <= dateStr && (cv.noEndDate || !cv.departureDate || cv.departureDate > dateStr)) {
          if (!activeVolsMap.has(cv.id)) {
            activeVolsMap.set(cv.id, {
              id: cv.id,
              fullName: cv.fullName,
              preferredName: cv.preferredName,
              nationality: cv.nationality,
              arrivalDate: cv.arrivalDate,
              departureDate: cv.departureDate,
              primaryRole: cv.primaryRole,
              status: cv.status
            });
          }
        }
      }

      const activeVols = Array.from(activeVolsMap.values());
      const count = activeVols.length;

      let status = 'OPTIMAL';
      if (count < critical) {
        status = 'CRITICAL_LOW';
      } else if (count >= lowMin && count <= lowMax) {
        status = 'LOW_WARNING';
      } else if (count > overbooked) {
        status = 'CRITICAL_HIGH';
      } else {
        status = 'OPTIMAL';
      }

      days.push({
        date: dateStr,
        count,
        status,
        volunteers: activeVols
      });
    }

    return days;
  }
}

export const headcountService = new HeadcountService();

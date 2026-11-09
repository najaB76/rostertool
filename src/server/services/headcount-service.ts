import { db } from '../db/client.js';
import { volunteers, systemSettings } from '../db/schema.js';
import { inArray, lte, gte, and, isNotNull } from 'drizzle-orm';

export class HeadcountService {
  async getDailyHeadcounts(startDate: string, endDate: string) {
    const settingsRows = await db.select().from(systemSettings);
    const settingsMap = new Map(settingsRows.map(s => [s.key, s.value]));

    const baseline = parseInt(settingsMap.get('headcount_baseline') || '11', 10);
    const lowMin = parseInt(settingsMap.get('headcount_low_min') || '8', 10);
    const lowMax = parseInt(settingsMap.get('headcount_low_max') || '10', 10);
    const critical = parseInt(settingsMap.get('headcount_critical') || '8', 10);
    const overbooked = parseInt(settingsMap.get('headcount_overbooked') || '11', 10);

    // We only care about volunteers who are Accepted or Active and have dates
    const vols = await db.select({
      id: volunteers.id,
      fullName: volunteers.fullName,
      nationality: volunteers.nationality,
      arrivalDate: volunteers.arrivalDate,
      departureDate: volunteers.departureDate,
    }).from(volunteers)
      .where(
        and(
          inArray(volunteers.status, ['Accepted', 'Active']),
          isNotNull(volunteers.arrivalDate),
          isNotNull(volunteers.departureDate),
          lte(volunteers.arrivalDate, endDate),
          gte(volunteers.departureDate, startDate)
        )
      );

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const days = [];

    for (let current = start; current <= end; current += 86400000) {
      const dateStr = new Date(current).toISOString().split('T')[0];
      
      const activeVols = vols.filter(v => 
        v.arrivalDate! <= dateStr && v.departureDate! >= dateStr
      );

      let status = 'OPTIMAL';
      const count = activeVols.length;
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

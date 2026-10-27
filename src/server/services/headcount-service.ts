import { db } from '../db/client.js';
import { volunteers } from '../db/schema.js';
import { inArray, lte, gte, and, isNotNull } from 'drizzle-orm';

export class HeadcountService {
  async getDailyHeadcounts(startDate: string, endDate: string) {
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
      if (count < 10) status = 'CRITICAL_LOW';
      else if (count >= 10 && count <= 11) status = 'LOW_WARNING';
      else if (count >= 13 && count <= 15) status = 'OVERLAP_WARNING';
      else if (count > 15) status = 'CRITICAL_HIGH';

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

import { db } from '../db/client.js';
import { volunteers, volunteerStays } from '../db/schema.js';

const CONTINENT_BY_COUNTRY: Record<string, string> = {
  // Europe
  ES: 'Europe', FR: 'Europe', DE: 'Europe', IT: 'Europe', GB: 'Europe', 'GB-SCT': 'Europe', 'GB-ENG': 'Europe',
  PT: 'Europe', IE: 'Europe', NL: 'Europe', BE: 'Europe', CH: 'Europe', AT: 'Europe', PL: 'Europe',
  CZ: 'Europe', HU: 'Europe', NO: 'Europe', SE: 'Europe', FI: 'Europe', UA: 'Europe', RU: 'Europe',
  RO: 'Europe', GR: 'Europe', DK: 'Europe', HR: 'Europe', SK: 'Europe', BG: 'Europe', RS: 'Europe',
  // North America
  US: 'North America', CA: 'North America', MX: 'North America', PR: 'North America',
  // South America
  BR: 'South America', AR: 'South America', CL: 'South America', CO: 'South America', PE: 'South America',
  UY: 'South America', VE: 'South America', BO: 'South America', EC: 'South America', PY: 'South America',
  // Asia
  JP: 'Asia', CN: 'Asia', KR: 'Asia', IN: 'Asia', TW: 'Asia', SG: 'Asia', TH: 'Asia', MY: 'Asia',
  HK: 'Asia', IL: 'Asia', PH: 'Asia', ID: 'Asia', VN: 'Asia', TR: 'Asia',
  // Oceania
  AU: 'Oceania', NZ: 'Oceania',
  // Africa
  ZA: 'Africa', MA: 'Africa', EG: 'Africa', NG: 'Africa', KE: 'Africa'
};

export function getContinent(countryCode: string): string {
  if (!countryCode) return 'Other';
  const upper = countryCode.toUpperCase();
  return CONTINENT_BY_COUNTRY[upper] || 'Other';
}

export function getAgeBracket(dateOfBirth: string | null): '<22' | '22-25' | '26-30' | '31-40' | '41+' | 'Unknown' {
  if (!dateOfBirth) return 'Unknown';
  const birthYear = new Date(dateOfBirth).getFullYear();
  if (isNaN(birthYear)) return 'Unknown';
  const age = new Date().getFullYear() - birthYear;
  if (age < 22) return '<22';
  if (age <= 25) return '22-25';
  if (age <= 30) return '26-30';
  if (age <= 40) return '31-40';
  return '41+';
}

export class ReportingService {
  async getReports(startDate?: string, endDate?: string) {
    const rawVols = await db.select().from(volunteers);
    const rawStays = await db.select().from(volunteerStays);

    // Filter stays if date range is specified
    const allStays = (startDate || endDate)
      ? rawStays.filter(s => {
          if (startDate && s.departureDate && s.departureDate < startDate) return false;
          if (endDate && s.arrivalDate && s.arrivalDate > endDate) return false;
          return true;
        })
      : rawStays;

    // Filter volunteers who were active or had stays in the date range
    const activeStayVolIds = new Set(allStays.map(s => s.volunteerId));
    const allVols = (startDate || endDate)
      ? rawVols.filter(v => {
          if (activeStayVolIds.has(v.id)) return true;
          if (startDate && v.departureDate && v.departureDate < startDate) return false;
          if (endDate && v.arrivalDate && v.arrivalDate > endDate) return false;
          return true;
        })
      : rawVols;

    // Map stays by volunteerId
    const staysByVol = new Map<string, typeof allStays>();
    for (const s of allStays) {
      if (!staysByVol.has(s.volunteerId)) {
        staysByVol.set(s.volunteerId, []);
      }
      staysByVol.get(s.volunteerId)!.push(s);
    }

    // 1. Overall KPIs
    let totalRatingsSum = 0;
    let totalRatingsCount = 0;
    let totalRehireReviews = 0;
    let totalRehireAcceptCount = 0;

    for (const s of allStays) {
      if (typeof s.departureRating === 'number' && s.departureRating > 0) {
        totalRatingsSum += s.departureRating;
        totalRatingsCount++;
      }
      if (s.rehireStatus) {
        totalRehireReviews++;
        if (s.rehireStatus === 'Accept' || s.rehireStatus === 'YES') {
          totalRehireAcceptCount++;
        }
      }
    }

    const overallAverageRating = totalRatingsCount > 0 
      ? Math.round((totalRatingsSum / totalRatingsCount) * 100) / 100 
      : 0;

    const rehireAcceptPercent = totalRehireReviews > 0
      ? Math.round((totalRehireAcceptCount / totalRehireReviews) * 1000) / 10
      : 0;

    const totalVolunteers = allVols.length;

    // 2. By Country
    const countryMap = new Map<string, {
      count: number;
      ratingSum: number;
      ratingCount: number;
      rehireAcceptCount: number;
      rehireTotal: number;
    }>();

    for (const v of allVols) {
      const country = v.nationality || 'Other';
      if (!countryMap.has(country)) {
        countryMap.set(country, { count: 0, ratingSum: 0, ratingCount: 0, rehireAcceptCount: 0, rehireTotal: 0 });
      }
      const cData = countryMap.get(country)!;
      cData.count++;

      const vStays = staysByVol.get(v.id) || [];
      for (const s of vStays) {
        if (typeof s.departureRating === 'number' && s.departureRating > 0) {
          cData.ratingSum += s.departureRating;
          cData.ratingCount++;
        }
        if (s.rehireStatus) {
          cData.rehireTotal++;
          if (s.rehireStatus === 'Accept' || s.rehireStatus === 'YES') {
            cData.rehireAcceptCount++;
          }
        }
      }
    }

    const byCountry = Array.from(countryMap.entries())
      .map(([country, data]) => ({
        country,
        volunteerCount: data.count,
        sharePercent: totalVolunteers > 0 ? Math.round((data.count / totalVolunteers) * 1000) / 10 : 0,
        averageRating: data.ratingCount > 0 ? Math.round((data.ratingSum / data.ratingCount) * 100) / 100 : null,
        ratingCount: data.ratingCount,
        rehireAcceptRate: data.rehireTotal > 0 ? Math.round((data.rehireAcceptCount / data.rehireTotal) * 1000) / 10 : null
      }))
      .sort((a, b) => b.volunteerCount - a.volunteerCount);

    // 3. By Continent
    const continentMap = new Map<string, { count: number; ratingSum: number; ratingCount: number }>();
    for (const v of allVols) {
      const cont = getContinent(v.nationality);
      if (!continentMap.has(cont)) {
        continentMap.set(cont, { count: 0, ratingSum: 0, ratingCount: 0 });
      }
      const cData = continentMap.get(cont)!;
      cData.count++;

      const vStays = staysByVol.get(v.id) || [];
      for (const s of vStays) {
        if (typeof s.departureRating === 'number' && s.departureRating > 0) {
          cData.ratingSum += s.departureRating;
          cData.ratingCount++;
        }
      }
    }

    const byContinent = Array.from(continentMap.entries())
      .map(([continent, data]) => ({
        continent,
        volunteerCount: data.count,
        sharePercent: totalVolunteers > 0 ? Math.round((data.count / totalVolunteers) * 1000) / 10 : 0,
        averageRating: data.ratingCount > 0 ? Math.round((data.ratingSum / data.ratingCount) * 100) / 100 : null,
        ratingCount: data.ratingCount
      }))
      .sort((a, b) => b.volunteerCount - a.volunteerCount);

    // 4. By Age Bracket
    const ageBrackets = ['<22', '22-25', '26-30', '31-40', '41+', 'Unknown'] as const;
    const ageMap = new Map<string, { count: number; ratingSum: number; ratingCount: number }>();
    ageBrackets.forEach(b => ageMap.set(b, { count: 0, ratingSum: 0, ratingCount: 0 }));

    for (const v of allVols) {
      const b = getAgeBracket(v.dateOfBirth);
      const bData = ageMap.get(b)!;
      bData.count++;

      const vStays = staysByVol.get(v.id) || [];
      for (const s of vStays) {
        if (typeof s.departureRating === 'number' && s.departureRating > 0) {
          bData.ratingSum += s.departureRating;
          bData.ratingCount++;
        }
      }
    }

    const byAgeBracket = ageBrackets.map(bracket => {
      const data = ageMap.get(bracket)!;
      return {
        bracket,
        volunteerCount: data.count,
        averageRating: data.ratingCount > 0 ? Math.round((data.ratingSum / data.ratingCount) * 100) / 100 : null,
        ratingCount: data.ratingCount
      };
    });

    // 5. By Gender
    const genders = ['Male', 'Female', 'Neutral', 'Unspecified'] as const;
    const genderMap = new Map<string, { count: number; ratingSum: number; ratingCount: number }>();
    genders.forEach(g => genderMap.set(g, { count: 0, ratingSum: 0, ratingCount: 0 }));

    for (const v of allVols) {
      const g = genders.includes(v.gender as any) ? v.gender : 'Unspecified';
      const gData = genderMap.get(g)!;
      gData.count++;

      const vStays = staysByVol.get(v.id) || [];
      for (const s of vStays) {
        if (typeof s.departureRating === 'number' && s.departureRating > 0) {
          gData.ratingSum += s.departureRating;
          gData.ratingCount++;
        }
      }
    }

    const byGender = genders.map(gender => {
      const data = genderMap.get(gender)!;
      return {
        gender,
        volunteerCount: data.count,
        sharePercent: totalVolunteers > 0 ? Math.round((data.count / totalVolunteers) * 1000) / 10 : 0,
        averageRating: data.ratingCount > 0 ? Math.round((data.ratingSum / data.ratingCount) * 100) / 100 : null,
        ratingCount: data.ratingCount
      };
    });

    // 6. Rehire Ratios By Country (where totalReviews > 0)
    const rehireCountryMap = new Map<string, { accept: number; possible: number; doNotAccept: number; total: number }>();

    for (const v of allVols) {
      const country = v.nationality || 'Other';
      const vStays = staysByVol.get(v.id) || [];
      for (const s of vStays) {
        if (!s.rehireStatus) continue;
        if (!rehireCountryMap.has(country)) {
          rehireCountryMap.set(country, { accept: 0, possible: 0, doNotAccept: 0, total: 0 });
        }
        const rData = rehireCountryMap.get(country)!;
        rData.total++;
        if (s.rehireStatus === 'Accept' || s.rehireStatus === 'YES') {
          rData.accept++;
        } else if (s.rehireStatus === 'Possible' || s.rehireStatus === 'CONDITIONAL') {
          rData.possible++;
        } else {
          rData.doNotAccept++;
        }
      }
    }

    const rehireRatiosByCountry = Array.from(rehireCountryMap.entries())
      .map(([country, data]) => ({
        country,
        totalReviews: data.total,
        acceptCount: data.accept,
        possibleCount: data.possible,
        doNotAcceptCount: data.doNotAccept,
        acceptPercent: Math.round((data.accept / data.total) * 1000) / 10,
        possiblePercent: Math.round((data.possible / data.total) * 1000) / 10,
        doNotAcceptPercent: Math.round((data.doNotAccept / data.total) * 1000) / 10
      }))
      .sort((a, b) => b.totalReviews - a.totalReviews);

    return {
      kpis: {
        totalVolunteers,
        totalStays: allStays.length,
        averageRating: overallAverageRating,
        rehireAcceptPercent
      },
      byCountry,
      byContinent,
      byAgeBracket,
      byGender,
      rehireRatiosByCountry
    };
  }
}

export const reportingService = new ReportingService();

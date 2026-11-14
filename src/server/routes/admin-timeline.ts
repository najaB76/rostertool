import { FastifyInstance } from 'fastify';
import { db } from '../db/client.js';
import { volunteers, systemSettings, applicationSources, volunteerStays } from '../db/schema.js';
import { inArray, eq } from 'drizzle-orm';

function calculateAge(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const parts = dob.split('-');
  if (parts.length < 3) return null;
  const birthYear = parseInt(parts[0], 10);
  const birthMonth = parseInt(parts[1], 10) - 1;
  const birthDay = parseInt(parts[2], 10);
  if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) return null;

  const birthDate = new Date(birthYear, birthMonth, birthDay);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

export default async function adminTimelineRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: { startDate?: string; weeks?: string } }>(
    '/',
    async (request, _reply) => {
      const weeksCount = parseInt(request.query.weeks || '5', 10) || 5;
      const totalDays = weeksCount * 7;

      let start = request.query.startDate ? new Date(request.query.startDate) : new Date();
      // Snap to Monday
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(start.setDate(diff));

      const days: { date: string; dayOfWeek: number; dayName: string; dayOfMonth: number; monthName: string }[] = [];
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      for (let i = 0; i < totalDays; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const iso = d.toISOString().split('T')[0];
        days.push({
          date: iso,
          dayOfWeek: d.getDay(),
          dayName: dayNames[d.getDay()],
          dayOfMonth: d.getDate(),
          monthName: monthNames[d.getMonth()]
        });
      }

      const timelineStart = days[0].date;
      const timelineEnd = days[days.length - 1].date;
      const todayIso = new Date().toISOString().split('T')[0];

      // Fetch Volunteers: Active, Accepted, Applied, and Departed (Paid staff are excluded)
      const volRows = await db
        .select({
          volunteer: volunteers,
          sourceName: applicationSources.name
        })
        .from(volunteers)
        .leftJoin(applicationSources, eq(volunteers.applicationSourceId, applicationSources.id))
        .where(inArray(volunteers.status, ['Active', 'Accepted', 'Applied', 'Departed']));

      // Fetch volunteer_stays to find past stays for departed / multi-stay volunteers
      const allStays = await db.select().from(volunteerStays);
      const staysByVol = new Map<string, any[]>();
      for (const s of allStays) {
        if (!staysByVol.has(s.volunteerId)) {
          staysByVol.set(s.volunteerId, []);
        }
        staysByVol.get(s.volunteerId)!.push(s);
      }

      // Fetch System Settings for headcount thresholds
      const settingsRows = await db.select().from(systemSettings);
      const settingsMap = new Map(settingsRows.map(s => [s.key, s.value]));

      const headcountThresholds = {
        baseline: parseInt(settingsMap.get('headcount_baseline') || '11', 10),
        lowMin: parseInt(settingsMap.get('headcount_low_min') || '8', 10),
        lowMax: parseInt(settingsMap.get('headcount_low_max') || '10', 10),
        critical: parseInt(settingsMap.get('headcount_critical') || '8', 10),
        overbooked: parseInt(settingsMap.get('headcount_overbooked') || '11', 10)
      };

      // Helper to compute stay days for a volunteer
      const getActiveDates = (arrDate: string | null, depDate: string | null, noEnd: boolean) => {
        const activeDates: string[] = [];
        if (!arrDate) return activeDates;
        for (const day of days) {
          const d = day.date;
          if (arrDate <= d && (noEnd || !depDate || depDate >= d)) {
            activeDates.push(d);
          }
        }
        return activeDates;
      };

      const receptionEntries: any[] = [];
      const housekeepingEntries: any[] = [];
      const appliedEntries: any[] = [];
      const processedVolKeys = new Set<string>();

      for (const r of volRows) {
        const v = r.volunteer;
        const resolvedSource = r.sourceName || (v.source && v.source !== 'Other' ? v.source : (r.sourceName || v.source || 'Other'));

        // Collect all potential stays for this volunteer (current dates + volunteer_stays)
        const stays: { arrivalDate: string | null; departureDate: string | null; noEndDate: boolean }[] = [];
        if (v.arrivalDate) {
          stays.push({
            arrivalDate: v.arrivalDate,
            departureDate: v.departureDate,
            noEndDate: Boolean(v.noEndDate)
          });
        }
        for (const s of staysByVol.get(v.id) || []) {
          if (!stays.some(st => st.arrivalDate === s.arrivalDate && st.departureDate === s.departureDate)) {
            stays.push({
              arrivalDate: s.arrivalDate,
              departureDate: s.departureDate,
              noEndDate: Boolean(s.noEndDate)
            });
          }
        }

        // If no stay records exist at all, skip
        if (stays.length === 0) continue;

        for (const stay of stays) {
          // Check overlap with timeline window
          if (stay.arrivalDate && stay.arrivalDate > timelineEnd) continue;
          if (!stay.noEndDate && stay.departureDate && stay.departureDate < timelineStart) continue;

          const activeDates = getActiveDates(stay.arrivalDate, stay.departureDate, stay.noEndDate);
          if (activeDates.length === 0) continue;

          // Prevent duplicate entries for the exact same volunteer and arrival date
          const entryKey = `${v.id}_${stay.arrivalDate}`;
          if (processedVolKeys.has(entryKey)) continue;
          processedVolKeys.add(entryKey);

          // Calculate point-in-time status at this timeline window
          let effectiveStatus = v.status;
          if (v.status === 'Applied') {
            effectiveStatus = 'Applied';
          } else if (v.status === 'Accepted' && stay.arrivalDate && stay.arrivalDate > timelineEnd) {
            effectiveStatus = 'Accepted';
          } else if (v.status === 'Departed') {
            // For historical stays that occurred in this window, point-in-time they were on staff
            if (stay.arrivalDate && stay.arrivalDate <= timelineEnd && (!stay.departureDate || stay.departureDate >= timelineStart)) {
              effectiveStatus = (stay.departureDate && stay.departureDate < todayIso && stay.departureDate <= timelineEnd)
                ? 'Departed'
                : 'Active';
            }
          }

          const entry = {
            id: v.id,
            isStaff: false,
            gender: v.gender || 'Unspecified',
            preferredName: v.preferredName || v.fullName,
            fullName: v.fullName,
            nationality: v.nationality,
            age: calculateAge(v.dateOfBirth),
            source: resolvedSource,
            status: effectiveStatus,
            currentStatus: v.status,
            role: v.primaryRole as 'Reception' | 'Housekeeping',
            arrivalDate: stay.arrivalDate,
            departureDate: stay.departureDate,
            noEndDate: stay.noEndDate,
            activeDates
          };

          if (v.status === 'Applied') {
            appliedEntries.push(entry);
          } else if (v.primaryRole === 'Reception') {
            receptionEntries.push(entry);
          } else {
            housekeepingEntries.push(entry);
          }
        }
      }

      // Calculate Daily Confirmed Counts (overnight bed demand for confirmed volunteers)
      // Volunteers departing on day.date do not need a bed for that night, so they are excluded on their departure date
      const dailyConfirmedCounts: Record<string, number> = {};
      const confirmedEntries = [...receptionEntries, ...housekeepingEntries];

      for (const day of days) {
        let count = 0;
        for (const v of confirmedEntries) {
          if (v.arrivalDate && v.arrivalDate <= day.date && (v.noEndDate || !v.departureDate || v.departureDate > day.date)) {
            count++;
          }
        }
        dailyConfirmedCounts[day.date] = count;
      }

      // Calculate Daily Applied Counts (candidates in applied section)
      const dailyAppliedCounts: Record<string, number> = {};
      for (const day of days) {
        let count = 0;
        for (const app of appliedEntries) {
          if (app.activeDates.includes(day.date)) {
            count++;
          }
        }
        dailyAppliedCounts[day.date] = count;
      }

      return {
        days,
        reception: receptionEntries,
        housekeeping: housekeepingEntries,
        applied: appliedEntries,
        dailyConfirmedCounts,
        dailyAppliedCounts,
        headcountThresholds
      };
    }
  );
}

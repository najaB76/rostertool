import { FastifyInstance } from 'fastify';
import { db } from '../db/client.js';
import { volunteers, staffUsers, systemSettings } from '../db/schema.js';
import { eq, inArray } from 'drizzle-orm';

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

      // 1. Fetch Staff
      const staffList = await db.select().from(staffUsers).where(eq(staffUsers.isActive, 1));

      // 2. Fetch Volunteers: Active, Accepted, and Applied
      const volList = await db.select().from(volunteers).where(
        inArray(volunteers.status, ['Active', 'Accepted', 'Applied'])
      );

      // 3. Fetch System Settings for headcount thresholds
      const settingsRows = await db.select().from(systemSettings);
      const settingsMap = new Map(settingsRows.map(s => [s.key, s.value]));

      const headcountThresholds = {
        baseline: parseInt(settingsMap.get('headcount_baseline') || '11', 10),
        lowMin: parseInt(settingsMap.get('headcount_low_min') || '8', 10),
        lowMax: parseInt(settingsMap.get('headcount_low_max') || '10', 10),
        critical: parseInt(settingsMap.get('headcount_critical') || '8', 10),
        overbooked: parseInt(settingsMap.get('headcount_overbooked') || '11', 10)
      };

      // Helper to compute stay days for a person
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

      for (const s of staffList) {
        const activeDates = days.map(d => d.date);
        const entry = {
          id: s.id,
          isStaff: true,
          gender: 'Unspecified',
          preferredName: s.fullName,
          fullName: s.fullName,
          nationality: s.nationality,
          age: null,
          source: 'Permanent staff',
          status: 'Active',
          role: s.role.toLowerCase().includes('reception') ? 'Reception' : 'Housekeeping',
          arrivalDate: null,
          departureDate: null,
          noEndDate: true,
          activeDates
        };
        if (entry.role === 'Reception') {
          receptionEntries.push(entry);
        } else {
          housekeepingEntries.push(entry);
        }
      }

      for (const v of volList) {
        const activeDates = getActiveDates(v.arrivalDate, v.departureDate, v.noEndDate);

        // Filter out volunteers whose entire stay is outside the timeline
        if (v.arrivalDate && v.arrivalDate > timelineEnd) continue;
        if (!v.noEndDate && v.departureDate && v.departureDate < timelineStart) continue;

        const entry = {
          id: v.id,
          isStaff: false,
          gender: v.gender || 'Unspecified',
          preferredName: v.preferredName || v.fullName,
          fullName: v.fullName,
          nationality: v.nationality,
          age: calculateAge(v.dateOfBirth),
          source: v.source || 'Other',
          status: v.status,
          role: v.primaryRole as 'Reception' | 'Housekeeping',
          arrivalDate: v.arrivalDate,
          departureDate: v.departureDate,
          noEndDate: v.noEndDate,
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

      // Calculate Daily Confirmed Counts (Active & Accepted staff/volunteers)
      const dailyConfirmedCounts: Record<string, number> = {};
      for (const day of days) {
        let count = 0;
        for (const _s of staffList) count++;
        for (const v of volList) {
          if (v.status === 'Active' || v.status === 'Accepted') {
            if (v.arrivalDate && v.arrivalDate <= day.date && (v.noEndDate || !v.departureDate || v.departureDate >= day.date)) {
              count++;
            }
          }
        }
        dailyConfirmedCounts[day.date] = count;
      }

      return {
        days,
        reception: receptionEntries,
        housekeeping: housekeepingEntries,
        applied: appliedEntries,
        dailyConfirmedCounts,
        headcountThresholds
      };
    }
  );
}

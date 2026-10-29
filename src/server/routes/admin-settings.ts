import { FastifyInstance } from 'fastify';
import { db } from '../db/client.js';
import { systemSettings, shiftDefinitions } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';

function calculateDuration(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const diff = (endMin - startMin) / 60;
  return diff > 0 ? diff : 4.0;
}

export default async function adminSettingsRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (_request, _reply) => {
    const rows = await db.select().from(systemSettings);
    const map = new Map(rows.map(r => [r.key, r.value]));

    return {
      housekeepersPerDay: parseInt(map.get('housekeepers_per_day') || '3', 10),
      housekeepingShiftsPerWeek: parseInt(map.get('housekeeping_shifts_per_week') || '4', 10),
      housekeepingStartTime: map.get('housekeeping_start_time') || '10:00',
      housekeepingEndTime: map.get('housekeeping_end_time') || '14:00'
    };
  });

  fastify.post<{ Body: {
    housekeepersPerDay?: number;
    housekeepingShiftsPerWeek?: number;
    housekeepingStartTime?: string;
    housekeepingEndTime?: string;
  } }>('/', async (request, reply) => {
    const { housekeepersPerDay, housekeepingShiftsPerWeek, housekeepingStartTime, housekeepingEndTime } = request.body || {};

    const updates: { key: string; value: string }[] = [];

    if (housekeepersPerDay !== undefined && housekeepersPerDay > 0) {
      updates.push({ key: 'housekeepers_per_day', value: String(housekeepersPerDay) });
    }
    if (housekeepingShiftsPerWeek !== undefined && housekeepingShiftsPerWeek > 0) {
      updates.push({ key: 'housekeeping_shifts_per_week', value: String(housekeepingShiftsPerWeek) });
    }
    if (housekeepingStartTime) {
      updates.push({ key: 'housekeeping_start_time', value: housekeepingStartTime });
    }
    if (housekeepingEndTime) {
      updates.push({ key: 'housekeeping_end_time', value: housekeepingEndTime });
    }

    for (const u of updates) {
      await db.insert(systemSettings)
        .values(u)
        .onConflictDoUpdate({
          target: systemSettings.key,
          set: { value: u.value }
        });
    }

    // Sync with shift_definitions for Housekeeping
    const currentRows = await db.select().from(systemSettings);
    const map = new Map(currentRows.map(r => [r.key, r.value]));

    const minStaff = parseInt(map.get('housekeepers_per_day') || '3', 10);
    const startTime = map.get('housekeeping_start_time') || '10:00';
    const endTime = map.get('housekeeping_end_time') || '14:00';
    const durationHours = calculateDuration(startTime, endTime);

    // Update all Housekeeping shift definitions
    await db.update(shiftDefinitions)
      .set({
        minStaff,
        startTime,
        endTime,
        durationHours
      })
      .where(sql`lower(${shiftDefinitions.name}) LIKE '%housekeeping%'`);

    return {
      housekeepersPerDay: minStaff,
      housekeepingShiftsPerWeek: parseInt(map.get('housekeeping_shifts_per_week') || '4', 10),
      housekeepingStartTime: startTime,
      housekeepingEndTime: endTime
    };
  });
}

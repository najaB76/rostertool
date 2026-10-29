import { FastifyInstance } from 'fastify';
import { rosterService, isShiftApplicableToDay } from '../services/roster-service.js';
import { autoPopulateRoster } from '../../engine/solver.js';
import { db } from '../db/client.js';
import { shiftDefinitions, volunteers, timeOffRequests, shiftAssignments, staffUsers, staffPto } from '../db/schema.js';
import { eq, and, gte, lte } from 'drizzle-orm';

export default async function adminRosterRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: { weekStartDate: string } }>('/', async (request, reply) => {
    const { weekStartDate } = request.query;
    if (!weekStartDate) {
      return reply.status(400).send({ error: 'weekStartDate is required' });
    }
    const roster = await rosterService.getWeeklyRoster(weekStartDate);
    return roster;
  });

  fastify.post<{ Body: { weekStartDate: string; overwriteManual?: boolean } }>(
    '/auto-populate',
    async (request, reply) => {
      const { weekStartDate } = request.body;
      if (!weekStartDate) return reply.status(400).send({ error: 'weekStartDate required' });
      
      const start = new Date(weekStartDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      const weekEndDate = end.toISOString().split('T')[0];

      // 1. RECEPTION SHIFTS COPY FORWARD: Copy forward previous week's reception shifts (both AM and PM)
      const prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - 7);
      const prevEnd = new Date(prevStart);
      prevEnd.setDate(prevEnd.getDate() + 6);
      const prevWeekStartDate = prevStart.toISOString().split('T')[0];
      const prevWeekEndDate = prevEnd.toISOString().split('T')[0];

      const prevAssignments = await db
        .select({
          shiftDefinitionId: shiftAssignments.shiftDefinitionId,
          date: shiftAssignments.date,
          volunteerId: shiftAssignments.volunteerId,
          staffId: shiftAssignments.staffId,
          shiftName: shiftDefinitions.name
        })
        .from(shiftAssignments)
        .innerJoin(shiftDefinitions, eq(shiftAssignments.shiftDefinitionId, shiftDefinitions.id))
        .where(and(gte(shiftAssignments.date, prevWeekStartDate), lte(shiftAssignments.date, prevWeekEndDate)));

      const prevReception = prevAssignments.filter(a => a.shiftName.toLowerCase().includes('reception'));

      for (const prev of prevReception) {
        const pDate = new Date(prev.date);
        const tDate = new Date(pDate);
        tDate.setDate(tDate.getDate() + 7);
        const targetDate = tDate.toISOString().split('T')[0];

        // Check if already assigned on targetDate
        const existingSlot = await db
          .select()
          .from(shiftAssignments)
          .where(and(
            eq(shiftAssignments.shiftDefinitionId, prev.shiftDefinitionId),
            eq(shiftAssignments.date, targetDate)
          ))
          .get();

        if (existingSlot) continue; // Already has an assignment

        if (prev.staffId) {
          // Check staff is active and not on PTO
          const staff = await db.select().from(staffUsers).where(and(eq(staffUsers.id, prev.staffId), eq(staffUsers.isActive, 1))).get();
          if (!staff) continue;

          const pto = await db.select().from(staffPto).where(and(
            eq(staffPto.staffId, prev.staffId),
            lte(staffPto.startDate, targetDate),
            gte(staffPto.endDate, targetDate)
          )).get();

          if (!pto) {
            await rosterService.assignShift(prev.shiftDefinitionId, targetDate, null, prev.staffId);
          }
        } else if (prev.volunteerId) {
          // Check volunteer is active, stay dates valid, and no approved time off
          const vol = await db.select().from(volunteers).where(and(eq(volunteers.id, prev.volunteerId), eq(volunteers.status, 'Active'))).get();
          if (!vol) continue;

          if (vol.arrivalDate && targetDate < vol.arrivalDate) continue;
          if (vol.departureDate && targetDate > vol.departureDate) continue;

          const timeOff = await db.select().from(timeOffRequests).where(and(
            eq(timeOffRequests.volunteerId, prev.volunteerId),
            eq(timeOffRequests.date, targetDate),
            eq(timeOffRequests.status, 'Approved')
          )).get();

          if (!timeOff) {
            await rosterService.assignShift(prev.shiftDefinitionId, targetDate, prev.volunteerId, null);
          }
        }
      }

      // 2. Build RosterEngineInput from DB for remaining slots & housekeeping
      const defs = await db.select().from(shiftDefinitions).where(eq(shiftDefinitions.isActive, 1));
      const activeVolunteers = await db.select().from(volunteers).where(eq(volunteers.status, 'Active'));
      
      const shifts = defs.flatMap(def => {
          return Array.from({ length: 7 }, (_, i) => {
             const d = new Date(start);
             d.setDate(d.getDate() + i);
             const dateStr = d.toISOString().split('T')[0];
             if (!isShiftApplicableToDay(def.name, def.dayOfWeek, d.getDay())) return null;
             return {
                 id: `${def.id}::${dateStr}`,
                 shiftDefinitionId: def.id,
                 name: def.name,
                 date: dateStr,
                 startTime: def.startTime,
                 endTime: def.endTime,
                 durationHours: def.durationHours,
                 minStaffRequired: def.minStaff,
                 eligibleRoles: def.eligibleRoles.split(',') as ('Housekeeping' | 'Reception')[]
             };
          }).filter(s => s !== null);
      }) as any[];

      const vols = activeVolunteers.map(v => ({
         id: v.id,
         fullName: v.preferredName || v.fullName,
         nationality: v.nationality,
         arrivalDate: v.arrivalDate || '2000-01-01',
         departureDate: v.departureDate || '2099-01-01',
         primaryRole: v.primaryRole as 'Housekeeping' | 'Reception',
         isReceptionQualified: v.isReceptionQualified,
         isTrainer: v.isTrainer,
         inTraining: v.inTraining,
         targetWeeklyHours: 16
      }));

      // Existing assignments now include the copied reception shifts
      const existingAsgns = await db.select().from(shiftAssignments).where(and(gte(shiftAssignments.date, weekStartDate), lte(shiftAssignments.date, weekEndDate)));
      const engineExisting = existingAsgns.filter(a => a.volunteerId).map(a => ({
         shiftSlotId: `${a.shiftDefinitionId}::${a.date}`,
         volunteerId: a.volunteerId!,
         date: a.date,
         durationHours: 4,
         isLocked: true
      }));

      const approvedTO = await db.select().from(timeOffRequests).where(and(eq(timeOffRequests.status, 'Approved'), gte(timeOffRequests.date, weekStartDate), lte(timeOffRequests.date, weekEndDate)));

      const output = autoPopulateRoster({
          weekStartDate,
          weekEndDate,
          shifts,
          volunteers: vols,
          existingAssignments: engineExisting,
          approvedTimeOff: approvedTO,
          historicalAssignments: []
      });

      // Save solver assignments to DB
      for (const a of output.assignments) {
          const [shiftDefId] = a.shiftSlotId.split('::');
          await rosterService.assignShift(
             shiftDefId,
             a.date,
             a.volunteerId,
             null
          );
      }

      return output;
    }
  );

  fastify.post<{ Body: { shiftDefinitionId: string; date: string; volunteerId?: string | null; staffId?: string | null } }>(
    '/assign',
    async (request, reply) => {
      const { shiftDefinitionId, date, volunteerId, staffId } = request.body;
      
      if (!shiftDefinitionId || !date) {
        return reply.status(400).send({ error: 'shiftDefinitionId and date are required' });
      }

      try {
        if (!volunteerId && !staffId) {
           await rosterService.unassignShift(shiftDefinitionId, date, null, null); 
        } else {
           await rosterService.assignShift(shiftDefinitionId, date, volunteerId || null, staffId || null);
        }
        return { success: true };
      } catch (error: any) {
        return reply.status(400).send({ error: error.message });
      }
    }
  );
}

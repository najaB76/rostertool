import { FastifyInstance } from 'fastify';
import { rosterService } from '../services/roster-service.js';
import { autoPopulateRoster } from '../../engine/solver.js';
import { db } from '../db/client.js';
import { shiftDefinitions, volunteers, timeOffRequests, shiftAssignments } from '../db/schema.js';
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

      // Build RosterEngineInput from DB
      const defs = await db.select().from(shiftDefinitions).where(eq(shiftDefinitions.isActive, 1));
      const activeVolunteers = await db.select().from(volunteers).where(eq(volunteers.status, 'Active'));
      
      const shifts = defs.flatMap(def => {
          return Array.from({ length: 7 }, (_, i) => {
             const d = new Date(start);
             d.setDate(d.getDate() + i);
             const dateStr = d.toISOString().split('T')[0];
             if (def.dayOfWeek !== null && def.dayOfWeek !== d.getDay()) return null;
             return {
                 id: `${def.id}-${dateStr}`,
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
         fullName: v.fullName,
         nationality: v.nationality,
         arrivalDate: v.arrivalDate || '2000-01-01',
         departureDate: v.departureDate || '2099-01-01',
         primaryRole: v.primaryRole as 'Housekeeping' | 'Reception',
         isReceptionQualified: v.isReceptionQualified,
         isTrainer: v.isTrainer,
         inTraining: v.inTraining,
         targetWeeklyHours: 16 // Could be pro-rated
      }));

      const existingAsgns = await db.select().from(shiftAssignments).where(and(gte(shiftAssignments.date, weekStartDate), lte(shiftAssignments.date, weekEndDate)));
      const engineExisting = existingAsgns.filter(a => a.volunteerId).map(a => ({
         shiftSlotId: `${a.shiftDefinitionId}-${a.date}`,
         volunteerId: a.volunteerId!,
         date: a.date,
         durationHours: 4, // simplistic
         isLocked: true // assume manually assigned are locked
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

      // Save assignments to DB
      for (const a of output.assignments) {
          const shiftDefId = a.shiftSlotId.split('-')[0] + '-' + a.shiftSlotId.split('-')[1] + '-' + a.shiftSlotId.split('-')[2] + '-' + a.shiftSlotId.split('-')[3] + '-' + a.shiftSlotId.split('-')[4]; // simple UUID split hack
          
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
        if (volunteerId === null || staffId === null) {
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

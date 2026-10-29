import { db } from '../db/client.js';
import { shiftDefinitions, shiftAssignments, volunteers, staffUsers } from '../db/schema.js';
import { eq, and, gte, lte } from 'drizzle-orm';

export function isShiftApplicableToDay(shiftName: string, defDayOfWeek: number | null, dayOfWeek: number): boolean {
  if (defDayOfWeek !== null) {
    return defDayOfWeek === dayOfWeek;
  }
  const name = shiftName.toLowerCase();
  if (name.includes('sun-thu') || name.includes('sun–thu')) {
    // Sunday (0) through Thursday (4)
    return dayOfWeek >= 0 && dayOfWeek <= 4;
  }
  if (name.includes('fri-sat') || name.includes('fri–sat')) {
    // Friday (5) and Saturday (6)
    return dayOfWeek === 5 || dayOfWeek === 6;
  }
  return true;
}

export class RosterService {
  /**
   * Retrieves the weekly roster grid for a given Monday-to-Sunday window.
   */
  async getWeeklyRoster(weekStartDate: string) {
    // Generate dates for the week
    const start = new Date(weekStartDate);
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    const weekEndDate = dates[6];

    // Fetch all active shift definitions
    const defs = await db.select().from(shiftDefinitions).where(eq(shiftDefinitions.isActive, 1));

    // Fetch assignments for this week
    const assignments = await db
      .select({
        assignment: shiftAssignments,
        volunteer: volunteers,
        staff: staffUsers,
      })
      .from(shiftAssignments)
      .leftJoin(volunteers, eq(shiftAssignments.volunteerId, volunteers.id))
      .leftJoin(staffUsers, eq(shiftAssignments.staffId, staffUsers.id))
      .where(and(
        gte(shiftAssignments.date, weekStartDate),
        lte(shiftAssignments.date, weekEndDate)
      ));

    // Construct the grid
    const days = dates.map(date => {
      const dayOfWeek = new Date(date).getDay(); // 0 = Sun, 1 = Mon, etc.
      
      const shiftsForDay = defs
        .filter(def => isShiftApplicableToDay(def.name, def.dayOfWeek, dayOfWeek))
        .map(def => {
          const slotAssignments = assignments
            .filter(a => a.assignment.shiftDefinitionId === def.id && a.assignment.date === date)
            .map(a => ({
              assignmentId: a.assignment.id,
              volunteer: a.volunteer ? {
                id: a.volunteer.id,
                fullName: a.volunteer.fullName,
                preferredName: a.volunteer.preferredName,
                nationality: a.volunteer.nationality,
                primaryRole: a.volunteer.primaryRole
              } : null,
              staff: a.staff ? {
                id: a.staff.id,
                fullName: a.staff.fullName,
                nationality: a.staff.nationality,
                role: a.staff.role
              } : null,
              isTrainingShift: a.assignment.isTrainingShift
            }));

          return {
            shiftDefinition: def,
            assignments: slotAssignments,
            isUnderstaffed: slotAssignments.length < def.minStaff
          };
        });

      const isDayUnderstaffed = shiftsForDay.some(s => s.isUnderstaffed);

      return {
        date,
        dayOfWeek,
        shifts: shiftsForDay,
        isUnderstaffed: isDayUnderstaffed
      };
    });

    return { weekStartDate, days };
  }

  /**
   * Manually assigns or removes a volunteer/staff from a shift slot.
   */
  async assignShift(shiftDefinitionId: string, date: string, volunteerId: string | null, staffId: string | null) {
    if (!volunteerId && !staffId) {
      throw new Error('Must provide either volunteerId or staffId to assign.');
    }

    if (volunteerId) {
      const existing = await db.select().from(shiftAssignments).where(and(
        eq(shiftAssignments.shiftDefinitionId, shiftDefinitionId),
        eq(shiftAssignments.date, date),
        eq(shiftAssignments.volunteerId, volunteerId)
      )).get();

      if (!existing) {
        await db.insert(shiftAssignments).values({
          id: crypto.randomUUID(),
          shiftDefinitionId,
          date,
          volunteerId,
        });
      }
    } else if (staffId) {
      const existing = await db.select().from(shiftAssignments).where(and(
        eq(shiftAssignments.shiftDefinitionId, shiftDefinitionId),
        eq(shiftAssignments.date, date),
        eq(shiftAssignments.staffId, staffId)
      )).get();

      if (!existing) {
        await db.insert(shiftAssignments).values({
          id: crypto.randomUUID(),
          shiftDefinitionId,
          date,
          staffId,
        });
      }
    }
  }

  async unassignShift(shiftDefinitionId: string, date: string, volunteerId: string | null, staffId: string | null) {
     if (volunteerId) {
        await db.delete(shiftAssignments)
          .where(and(
             eq(shiftAssignments.shiftDefinitionId, shiftDefinitionId),
             eq(shiftAssignments.date, date),
             eq(shiftAssignments.volunteerId, volunteerId)
          ));
     } else if (staffId) {
        await db.delete(shiftAssignments)
          .where(and(
             eq(shiftAssignments.shiftDefinitionId, shiftDefinitionId),
             eq(shiftAssignments.date, date),
             eq(shiftAssignments.staffId, staffId)
          ));
     } else {
        // Clear all assignments for this slot (used primarily for simple tests/overrides)
        await db.delete(shiftAssignments)
          .where(and(
             eq(shiftAssignments.shiftDefinitionId, shiftDefinitionId),
             eq(shiftAssignments.date, date)
          ));
     }
  }
}

export const rosterService = new RosterService();

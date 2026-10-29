import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import adminRosterRoutes from '../../src/server/routes/admin-roster.js';
import { db } from '../../src/server/db/client.js';
import { shiftDefinitions, shiftAssignments, volunteers, staffUsers } from '../../src/server/db/schema.js';

describe('Admin Roster API', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(adminRosterRoutes, { prefix: '/api/admin/roster' });
    await fastify.ready();

    // Clean up
    await db.delete(shiftAssignments);
    await db.delete(shiftDefinitions);
    await db.delete(volunteers);
    await db.delete(staffUsers);

    // Seed standard shift definitions matching hostel operations
    await db.insert(shiftDefinitions).values([
      {
        id: 'def-hk',
        name: 'Housekeeping',
        startTime: '10:00',
        endTime: '14:00',
        durationHours: 4.0,
        minStaff: 3,
      },
      {
        id: 'def-rec-day',
        name: 'Reception Day',
        startTime: '08:00',
        endTime: '18:00',
        durationHours: 10.0,
        minStaff: 1,
      },
      {
        id: 'def-rec-eve-sun-thu',
        name: 'Reception Evening (Sun-Thu)',
        startTime: '16:00',
        endTime: '00:00',
        durationHours: 8.0,
        minStaff: 1,
      },
      {
        id: 'def-rec-eve-fri-sat',
        name: 'Reception Evening (Fri-Sat)',
        startTime: '17:00',
        endTime: '01:00',
        durationHours: 8.0,
        minStaff: 1,
      }
    ]);
    
    // Seed dummy volunteer
    await db.insert(volunteers).values({
      id: 'vol-1',
      fullName: 'Test Vol',
      nationality: 'US',
      magicLinkToken: 'token-123',
    });

    // Seed dummy staff
    await db.insert(staffUsers).values({
      id: 'staff-1',
      fullName: 'Hervé Staff',
      nationality: 'FR',
      role: 'Receptionist',
    });
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('GET /api/admin/roster - should return exactly 3 shifts per day with correct evening shifts', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/admin/roster',
      query: { weekStartDate: '2026-10-26' } // Monday 2026-10-26 to Sunday 2026-11-01
    });
    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(response.payload);
    expect(payload.weekStartDate).toBe('2026-10-26');
    expect(payload.days.length).toBe(7);

    // Every day MUST have exactly 3 shifts
    for (const day of payload.days) {
      expect(day.shifts.length).toBe(3);
    }

    // Monday (2026-10-26) must have Housekeeping, Reception Day, and Reception Evening (Sun-Thu)
    const monday = payload.days.find((d: any) => d.date === '2026-10-26');
    const mondayShiftNames = monday.shifts.map((s: any) => s.shiftDefinition.name);
    expect(mondayShiftNames).toContain('Housekeeping');
    expect(mondayShiftNames).toContain('Reception Day');
    expect(mondayShiftNames).toContain('Reception Evening (Sun-Thu)');
    expect(mondayShiftNames).not.toContain('Reception Evening (Fri-Sat)');

    // Friday (2026-10-30) must have Housekeeping, Reception Day, and Reception Evening (Fri-Sat)
    const friday = payload.days.find((d: any) => d.date === '2026-10-30');
    const fridayShiftNames = friday.shifts.map((s: any) => s.shiftDefinition.name);
    expect(fridayShiftNames).toContain('Housekeeping');
    expect(fridayShiftNames).toContain('Reception Day');
    expect(fridayShiftNames).toContain('Reception Evening (Fri-Sat)');
    expect(fridayShiftNames).not.toContain('Reception Evening (Sun-Thu)');

    // Saturday (2026-10-31) must have Fri-Sat evening
    const saturday = payload.days.find((d: any) => d.date === '2026-10-31');
    const satShiftNames = saturday.shifts.map((s: any) => s.shiftDefinition.name);
    expect(satShiftNames).toContain('Reception Evening (Fri-Sat)');

    // Sunday (2026-11-01) must have Sun-Thu evening
    const sunday = payload.days.find((d: any) => d.date === '2026-11-01');
    const sunShiftNames = sunday.shifts.map((s: any) => s.shiftDefinition.name);
    expect(sunShiftNames).toContain('Reception Evening (Sun-Thu)');
  });

  it('POST /api/admin/roster/assign - should assign and then unassign a volunteer', async () => {
    // 1. Assign
    const assignResp = await fastify.inject({
      method: 'POST',
      url: '/api/admin/roster/assign',
      payload: {
        shiftDefinitionId: 'def-hk',
        date: '2026-10-26',
        volunteerId: 'vol-1'
      }
    });
    expect(assignResp.statusCode).toBe(200);
    
    // 2. Unassign
    const unassignResp = await fastify.inject({
      method: 'POST',
      url: '/api/admin/roster/assign',
      payload: {
        shiftDefinitionId: 'def-hk',
        date: '2026-10-26',
        volunteerId: null
      }
    });
    expect(unassignResp.statusCode).toBe(200);
  });

  it('POST /api/admin/roster/assign - should assign staff member to a shift and retrieve it', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/admin/roster/assign',
      payload: {
        shiftDefinitionId: 'def-rec-day',
        date: '2026-10-26',
        staffId: 'staff-1',
        volunteerId: null
      }
    });
    expect(res.statusCode).toBe(200);

    const rosterRes = await fastify.inject({
      method: 'GET',
      url: '/api/admin/roster',
      query: { weekStartDate: '2026-10-26' }
    });
    const roster = JSON.parse(rosterRes.payload);
    const monday = roster.days.find((d: any) => d.date === '2026-10-26');
    const recDay = monday.shifts.find((s: any) => s.shiftDefinition.id === 'def-rec-day');
    expect(recDay.assignments.length).toBe(1);
    expect(recDay.assignments[0].staff.id).toBe('staff-1');
    expect(recDay.assignments[0].staff.fullName).toBe('Hervé Staff');
  });

  it('POST /api/admin/roster/auto-populate - copies previous week reception shifts forward', async () => {
    const autoRes = await fastify.inject({
      method: 'POST',
      url: '/api/admin/roster/auto-populate',
      payload: { weekStartDate: '2026-11-02' }
    });
    expect(autoRes.statusCode).toBe(200);

    const rosterRes = await fastify.inject({
      method: 'GET',
      url: '/api/admin/roster',
      query: { weekStartDate: '2026-11-02' }
    });
    const roster = JSON.parse(rosterRes.payload);
    const nextMonday = roster.days.find((d: any) => d.date === '2026-11-02');
    const recDay = nextMonday.shifts.find((s: any) => s.shiftDefinition.id === 'def-rec-day');
    expect(recDay.assignments.length).toBe(1);
    expect(recDay.assignments[0].staff.id).toBe('staff-1');
  });
});

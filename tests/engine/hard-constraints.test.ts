import { describe, it, expect } from 'vitest';
import { evaluateHardConstraints } from '../../src/engine/hard-constraints.js';
import { EngineVolunteer, EngineShiftSlot, EngineAssignment, EngineTimeOff } from '../../src/engine/types.js';

describe('Hard Constraints Evaluator', () => {
  const defaultVolunteer: EngineVolunteer = {
    id: 'v1', fullName: 'Test', nationality: 'US',
    arrivalDate: '2026-10-01', departureDate: '2026-10-31',
    primaryRole: 'Housekeeping', isReceptionQualified: false,
    isTrainer: false, inTraining: false, targetWeeklyHours: 16
  };

  const defaultShift: EngineShiftSlot = {
    id: 's1', shiftDefinitionId: 'def1', name: 'Housekeeping',
    date: '2026-10-15', startTime: '10:00', endTime: '14:00',
    durationHours: 4.0, minStaffRequired: 1, eligibleRoles: ['Housekeeping']
  };

  it('allows valid assignment', () => {
    const result = evaluateHardConstraints(defaultVolunteer, defaultShift, [], [], [], { minimumTurnaroundHours: 9, targetConsecutiveDaysOff: 3, rollingWindowDays: 14 });
    expect(result.isValid).toBe(true);
  });

  it('rejects if outside stay dates', () => {
    const shift = { ...defaultShift, date: '2026-11-01' }; // after departure
    const result = evaluateHardConstraints(defaultVolunteer, shift, [], [], [], { minimumTurnaroundHours: 9, targetConsecutiveDaysOff: 3, rollingWindowDays: 14 });
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('stay window');
  });

  it('rejects if time-off approved', () => {
    const timeOff: EngineTimeOff[] = [{ volunteerId: 'v1', date: '2026-10-15' }];
    const result = evaluateHardConstraints(defaultVolunteer, defaultShift, [], timeOff, [], { minimumTurnaroundHours: 9, targetConsecutiveDaysOff: 3, rollingWindowDays: 14 });
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('time-off');
  });

  it('rejects if role not eligible', () => {
    const shift = { ...defaultShift, eligibleRoles: ['Reception'] as ('Housekeeping' | 'Reception')[] };
    const result = evaluateHardConstraints(defaultVolunteer, shift, [], [], [], { minimumTurnaroundHours: 9, targetConsecutiveDaysOff: 3, rollingWindowDays: 14 });
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('role');
  });

  it('rejects double booking on same day', () => {
    const existing: EngineAssignment[] = [{ shiftSlotId: 's2', volunteerId: 'v1', date: '2026-10-15', durationHours: 4.0, isLocked: false }];
    const result = evaluateHardConstraints(defaultVolunteer, defaultShift, existing, [], [], { minimumTurnaroundHours: 9, targetConsecutiveDaysOff: 3, rollingWindowDays: 14 });
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('Double-booking');
  });

  it('rejects if exceeding target hours', () => {
    const existing: EngineAssignment[] = [
      { shiftSlotId: 's2', volunteerId: 'v1', date: '2026-10-10', durationHours: 8.0, isLocked: false },
      { shiftSlotId: 's3', volunteerId: 'v1', date: '2026-10-11', durationHours: 8.0, isLocked: false }
    ];
    const result = evaluateHardConstraints(defaultVolunteer, defaultShift, existing, [], [], { minimumTurnaroundHours: 9, targetConsecutiveDaysOff: 3, rollingWindowDays: 14 });
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('Target hours');
  });
});

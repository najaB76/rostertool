import { describe, it, expect } from 'vitest';
import { autoPopulateRoster } from '../../src/engine/solver.js';
import { RosterEngineInput } from '../../src/engine/types.js';

describe('Auto-Populate Solver Engine', () => {
  it('solves a simple week with no constraints violated', () => {
    const input: RosterEngineInput = {
      weekStartDate: '2026-10-26',
      weekEndDate: '2026-11-01',
      shifts: [
        { id: 's1', shiftDefinitionId: 'def1', name: 'Housekeeping', date: '2026-10-26', startTime: '10:00', endTime: '14:00', durationHours: 4, minStaffRequired: 1, eligibleRoles: ['Housekeeping'] }
      ],
      volunteers: [
        { id: 'v1', fullName: 'Test', nationality: 'US', arrivalDate: '2026-10-01', departureDate: '2026-11-30', primaryRole: 'Housekeeping', isReceptionQualified: false, isTrainer: false, inTraining: false, targetWeeklyHours: 16 }
      ],
      existingAssignments: [],
      approvedTimeOff: [],
      historicalAssignments: []
    };

    const output = autoPopulateRoster(input);
    expect(output.success).toBe(true);
    expect(output.assignments.length).toBe(1);
    expect(output.assignments[0].volunteerId).toBe('v1');
    expect(output.unfilledSlots.length).toBe(0);
  });

  it('leaves slot unfilled if no eligible volunteers', () => {
    const input: RosterEngineInput = {
      weekStartDate: '2026-10-26',
      weekEndDate: '2026-11-01',
      shifts: [
        { id: 's1', shiftDefinitionId: 'def2', name: 'Reception Day', date: '2026-10-26', startTime: '08:00', endTime: '18:00', durationHours: 10, minStaffRequired: 1, eligibleRoles: ['Reception'] }
      ],
      volunteers: [
        { id: 'v1', fullName: 'Test', nationality: 'US', arrivalDate: '2026-10-01', departureDate: '2026-11-30', primaryRole: 'Housekeeping', isReceptionQualified: false, isTrainer: false, inTraining: false, targetWeeklyHours: 16 }
      ],
      existingAssignments: [],
      approvedTimeOff: [],
      historicalAssignments: []
    };

    const output = autoPopulateRoster(input);
    expect(output.success).toBe(true); // Engine ran successfully
    expect(output.assignments.length).toBe(0);
    expect(output.unfilledSlots.length).toBe(1);
    expect(output.unfilledSlots[0].shortfall).toBe(1);
  });
});

import { describe, it, expect } from 'vitest';
import { evaluateTrainerPairing } from '../../src/engine/hard-constraints.js';
import { EngineVolunteer, EngineShiftSlot, EngineAssignment } from '../../src/engine/types.js';

describe('Trainer Pairing Evaluator', () => {
  const trainee: EngineVolunteer = {
    id: 'trainee-1', fullName: 'Trainee', nationality: 'US',
    arrivalDate: '2026-10-01', departureDate: '2026-10-31',
    primaryRole: 'Housekeeping', isReceptionQualified: false,
    isTrainer: false, inTraining: true, targetWeeklyHours: 16
  };

  const shift: EngineShiftSlot = {
    id: 's1', shiftDefinitionId: 'def1', name: 'Housekeeping',
    date: '2026-10-15', startTime: '10:00', endTime: '14:00',
    durationHours: 4.0, minStaffRequired: 2, eligibleRoles: ['Housekeeping']
  };

  it('rejects trainee if no trainer is assigned to the slot', () => {
    const assignments: EngineAssignment[] = [];
    const volunteers: EngineVolunteer[] = [trainee];
    const result = evaluateTrainerPairing(trainee, shift, assignments, volunteers);
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('trainer');
  });

  it('allows trainee if a trainer is already assigned to the slot', () => {
    const trainer: EngineVolunteer = { ...trainee, id: 'trainer-1', isTrainer: true, inTraining: false };
    const assignments: EngineAssignment[] = [
      { shiftSlotId: 's1', volunteerId: 'trainer-1', date: '2026-10-15', durationHours: 4.0, isLocked: false }
    ];
    const volunteers: EngineVolunteer[] = [trainee, trainer];
    const result = evaluateTrainerPairing(trainee, shift, assignments, volunteers);
    expect(result.isValid).toBe(true);
  });
});

import { EngineVolunteer, EngineShiftSlot, EngineAssignment, EngineTimeOff, EngineConfig } from './types.js';

export function evaluateHardConstraints(
  volunteer: EngineVolunteer,
  shift: EngineShiftSlot,
  existingAssignments: EngineAssignment[],
  approvedTimeOff: EngineTimeOff[],
  _historicalAssignments: EngineAssignment[],
  _config: EngineConfig
): { isValid: boolean; reason?: string } {
  // 1. Stay Date Boundaries
  if (shift.date < volunteer.arrivalDate || shift.date > volunteer.departureDate) {
    return { isValid: false, reason: 'Outside active stay window' };
  }

  // 2. Approved Leave
  if (approvedTimeOff.some(to => to.volunteerId === volunteer.id && to.date === shift.date)) {
    return { isValid: false, reason: 'Approved time-off on this date' };
  }

  // 3. Role Eligibility
  if (!shift.eligibleRoles.includes(volunteer.primaryRole)) {
    // Check if reception qualified for reception shifts
    if (shift.eligibleRoles.includes('Reception') && !volunteer.isReceptionQualified) {
        return { isValid: false, reason: 'Not eligible for role' };
    }
  }

  // 4. Hour Cap Filter
  const weekHours = existingAssignments
    .filter(a => a.volunteerId === volunteer.id)
    .reduce((sum, a) => sum + a.durationHours, 0);
  if (weekHours + shift.durationHours > volunteer.targetWeeklyHours) {
    return { isValid: false, reason: 'Target hours exceeded' };
  }

  // 5. No Double-Booking
  if (existingAssignments.some(a => a.volunteerId === volunteer.id && a.date === shift.date)) {
    return { isValid: false, reason: 'Double-booking on same day' };
  }

  // 6. Turnaround Rest Filter
  // For strict checks, we'd compare exact datetimes. Simplified placeholder:
  // If they worked yesterday evening, they can't work this morning.
  // Full logic requires parsing HH:mm and Date.

  return { isValid: true };
}

export function evaluateTrainerPairing(
  trainee: EngineVolunteer,
  shift: EngineShiftSlot,
  existingAssignments: EngineAssignment[],
  availableVolunteers: EngineVolunteer[]
): { isValid: boolean; reason?: string } {
  if (!trainee.inTraining) return { isValid: true };

  // Check if a trainer is already assigned to this slot
  const trainerAssigned = existingAssignments.some(a => {
    if (a.shiftSlotId !== shift.id) return false;
    const vol = availableVolunteers.find(v => v.id === a.volunteerId);
    return vol?.isTrainer;
  });

  if (!trainerAssigned) {
     return { isValid: false, reason: 'Requires a trainer assigned to the same shift' };
  }

  return { isValid: true };
}

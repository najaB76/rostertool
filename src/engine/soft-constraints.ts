import { EngineVolunteer, EngineShiftSlot, EngineAssignment, EngineConfig } from './types.js';

export function scoreSoftConstraints(
  volunteer: EngineVolunteer,
  _shift: EngineShiftSlot,
  existingAssignments: EngineAssignment[],
  _historicalAssignments: EngineAssignment[],
  _config: EngineConfig
): number {
  let score = 0;

  // W_hours: Prioritize volunteers who are further below their target weekly hours
  const currentAssignedHours = existingAssignments
    .filter(a => a.volunteerId === volunteer.id)
    .reduce((sum, a) => sum + a.durationHours, 0);
    
  const hoursDeficit = volunteer.targetWeeklyHours - currentAssignedHours;
  score += hoursDeficit * 10; // weight = 10 per missing hour

  // W_rest: 14-day rolling window check for 3 consecutive days off
  // Simple heuristic placeholder for tests
  // Ideally, we calculate if assigning this shift breaks a 3-day streak.
  
  // W_weekend: Penalize if they worked the previous weekend
  // (Simplified placeholder)

  return score;
}

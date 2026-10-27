import { RosterEngineInput, RosterEngineOutput, EngineProposedAssignment, EngineUnfilledSlot, EngineAuditEntry } from './types.js';
import { evaluateHardConstraints, evaluateTrainerPairing } from './hard-constraints.js';
import { scoreSoftConstraints } from './soft-constraints.js';

export function autoPopulateRoster(input: RosterEngineInput): RosterEngineOutput {
  const assignments: EngineProposedAssignment[] = [];
  const unfilledSlots: EngineUnfilledSlot[] = [];
  const auditLog: EngineAuditEntry[] = [];
  
  const config = input.config || {
    minimumTurnaroundHours: 9,
    targetConsecutiveDaysOff: 3,
    rollingWindowDays: 14
  };

  const currentAssignments = [...input.existingAssignments];

  // Simple Greedy approach for MVP solver
  for (const shift of input.shifts) {
    let assignedCount = currentAssignments.filter(a => a.shiftSlotId === shift.id).length;
    let shortfall = shift.minStaffRequired - assignedCount;

    while (shortfall > 0) {
      // Find eligible volunteers
      const eligible = input.volunteers.filter(vol => {
        // Evaluate general hard constraints
        const hard = evaluateHardConstraints(
          vol, shift, currentAssignments, input.approvedTimeOff, input.historicalAssignments, config
        );
        if (!hard.isValid) return false;

        // Evaluate trainer pairing if they are in training
        const pairing = evaluateTrainerPairing(vol, shift, currentAssignments, input.volunteers);
        if (!pairing.isValid) return false;

        return true;
      });

      if (eligible.length === 0) {
        unfilledSlots.push({
          shiftSlotId: shift.id,
          shiftName: shift.name,
          date: shift.date,
          shortfall,
          rejectionReasons: { "all": "No eligible volunteers found" }
        });
        break;
      }

      // Score and sort eligible volunteers (highest score first)
      const scored = eligible.map(vol => ({
        vol,
        score: scoreSoftConstraints(vol, shift, currentAssignments, input.historicalAssignments, config)
      })).sort((a, b) => b.score - a.score);

      const selected = scored[0].vol;

      const newAssignment = {
        shiftSlotId: shift.id,
        volunteerId: selected.id,
        date: shift.date,
        durationHours: shift.durationHours,
        isLocked: false,
      };

      currentAssignments.push(newAssignment);
      assignments.push({
        shiftSlotId: shift.id,
        volunteerId: selected.id,
        date: shift.date,
        durationHours: shift.durationHours,
        isTrainingPair: selected.inTraining
      });

      shortfall--;
    }
  }

  return {
    assignments,
    unfilledSlots,
    volunteerSummaries: {},
    auditLog,
    success: true
  };
}

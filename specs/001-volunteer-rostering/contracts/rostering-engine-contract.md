# Rostering Engine Contract & Domain Interface

**Feature**: `001-volunteer-rostering`
**Date**: 2026-10-27
**Status**: Completed

## 1. Pure Engine Boundary

In adherence to **Principle I** and **Principle II**, the rostering constraint engine is completely decoupled from HTTP, SQL database, and presentation layers. It operates as a deterministic, pure function:

```typescript
export function autoPopulateRoster(
  input: RosterEngineInput
): RosterEngineOutput;
```

---

## 2. Input Types

```typescript
export interface RosterEngineInput {
  /** Target rostering window: Monday to Sunday (YYYY-MM-DD format) */
  weekStartDate: string; // e.g. "2026-10-26"
  weekEndDate: string;   // e.g. "2026-11-01"

  /** Shift slots needing coverage in this week */
  shifts: EngineShiftSlot[];

  /** Active pool of volunteers available during this week */
  volunteers: EngineVolunteer[];

  /** Pre-existing shift assignments (e.g. manually locked assignments) */
  existingAssignments: EngineAssignment[];

  /** Approved time-off requests falling within this week */
  approvedTimeOff: EngineTimeOff[];

  /** Historical assignments from previous 7 days (to evaluate 14-day rolling rest & turnarounds) */
  historicalAssignments: EngineAssignment[];

  /** Configuration options */
  config?: EngineConfig;
}

export interface EngineShiftSlot {
  id: string;                    // unique slot instance identifier
  shiftDefinitionId: string;
  name: string;                  // 'Housekeeping' | 'Reception Day' | 'Reception Evening' | 'Reception Graveyard'
  date: string;                  // YYYY-MM-DD
  startTime: string;             // HH:mm, e.g. "10:00"
  endTime: string;               // HH:mm, e.g. "14:00"
  durationHours: number;         // 4.0, 8.0, 10.0
  minStaffRequired: number;      // e.g. 3 for HK, 1 for Reception
  eligibleRoles: ('Housekeeping' | 'Reception')[];
}

export interface EngineVolunteer {
  id: string;
  fullName: string;
  nationality: string;           // ISO 3166-1 alpha-2
  arrivalDate: string;           // YYYY-MM-DD
  departureDate: string;         // YYYY-MM-DD
  primaryRole: 'Housekeeping' | 'Reception';
  isReceptionQualified: boolean;
  isTrainer: boolean;
  inTraining: boolean;
  
  /** Max target hours for this specific week (normally 16h, or pro-rated for mid-week arrivals) */
  targetWeeklyHours: number;
}

export interface EngineAssignment {
  shiftSlotId: string;
  volunteerId: string;
  date: string;
  durationHours: number;
  isLocked: boolean; // if true, manual assignment that auto-populate cannot remove
}

export interface EngineTimeOff {
  volunteerId: string;
  date: string; // YYYY-MM-DD
}

export interface EngineConfig {
  minimumTurnaroundHours: number; // default: 9
  targetConsecutiveDaysOff: number; // default: 3
  rollingWindowDays: number; // default: 14
}
```

---

## 3. Output Types

```typescript
export interface RosterEngineOutput {
  /** Complete proposed shift assignments for the week */
  assignments: EngineProposedAssignment[];

  /** Shift slots that could not be fully filled */
  unfilledSlots: EngineUnfilledSlot[];

  /** Per-volunteer schedule breakdown and metric validation */
  volunteerSummaries: Record<string, VolunteerScheduleSummary>;

  /** Full audit log of constraint checks and scoring diagnostics */
  auditLog: EngineAuditEntry[];

  /** Overall constraint satisfaction status */
  success: boolean;
}

export interface EngineProposedAssignment {
  shiftSlotId: string;
  volunteerId: string;
  date: string;
  durationHours: number;
  isTrainingPair: boolean;
  trainerVolunteerId?: string; // set if assigned to supervise an in_training volunteer
}

export interface EngineUnfilledSlot {
  shiftSlotId: string;
  shiftName: string;
  date: string;
  shortfall: number; // number of volunteers missing to reach minStaffRequired
  rejectionReasons: Record<string, string>; // volunteerId -> reason disqualified
}

export interface VolunteerScheduleSummary {
  volunteerId: string;
  assignedHours: number;
  targetHours: number;
  shiftCount: number;
  consecutiveDaysOffInWindow: number;
  meetsRestRequirement: boolean;
}

export interface EngineAuditEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  context?: Record<string, unknown>;
}
```

---

## 4. Hard Constraints Evaluation Order

1. **Date Boundary Filter**: Volunteer must satisfy $Arrival \le Date \le Departure$.
2. **Approved Leave Filter**: Disqualify volunteer if $Date \in ApprovedTimeOff$.
3. **Role Eligibility Filter**:
   - Reception shifts require `isReceptionQualified === true`.
   - Housekeeping shifts require `eligibleRoles.includes(volunteer.primaryRole)` or dual-skill eligibility.
4. **Hour Cap Filter**: $AssignedHours + ShiftHours \le TargetWeeklyHours$.
5. **No Double-Booking**: Volunteer cannot be assigned to more than 1 shift on the same calendar day.
6. **Turnaround Rest Filter**: Turnaround between previous shift end time and next shift start time must be $\ge 9$ hours.
7. **Trainer Pairing Rule**:
   - If volunteer is `inTraining === true`, candidate can only be assigned if a volunteer with `isTrainer === true` is also assigned or simultaneously available to be assigned to the identical slot.

---

## 5. Soft Constraints Optimization Scoring

Assignments are prioritized by a scalar utility objective function:
$$Score(v, s) = w_{hours} \cdot (Target - CurrentHours) + w_{rest} \cdot Bonus_{3DaysOff} - w_{weekend} \cdot PriorWeekendShifts$$

- **$w_{hours}$ (Under-utilization weight)**: Prioritizes volunteers furthest below their target weekly hours.
- **$w_{rest}$ (14-Day 3-consecutive-days-off weight)**: Heavy reward for preserving or completing a 3-day consecutive rest block within the 14-day rolling window.
- **$w_{weekend}$ (Fairness penalty)**: Penalizes volunteers who worked the previous Friday/Saturday/Sunday to balance weekend duties across the team.

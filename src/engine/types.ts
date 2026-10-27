export interface RosterEngineInput {
  weekStartDate: string;
  weekEndDate: string;
  shifts: EngineShiftSlot[];
  volunteers: EngineVolunteer[];
  existingAssignments: EngineAssignment[];
  approvedTimeOff: EngineTimeOff[];
  historicalAssignments: EngineAssignment[];
  config?: EngineConfig;
}

export interface EngineShiftSlot {
  id: string;
  shiftDefinitionId: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  minStaffRequired: number;
  eligibleRoles: ('Housekeeping' | 'Reception')[];
}

export interface EngineVolunteer {
  id: string;
  fullName: string;
  nationality: string;
  arrivalDate: string;
  departureDate: string;
  primaryRole: 'Housekeeping' | 'Reception';
  isReceptionQualified: boolean;
  isTrainer: boolean;
  inTraining: boolean;
  targetWeeklyHours: number;
}

export interface EngineAssignment {
  shiftSlotId: string;
  volunteerId: string;
  date: string;
  durationHours: number;
  isLocked: boolean;
}

export interface EngineTimeOff {
  volunteerId: string;
  date: string;
}

export interface EngineConfig {
  minimumTurnaroundHours: number;
  targetConsecutiveDaysOff: number;
  rollingWindowDays: number;
}

export interface RosterEngineOutput {
  assignments: EngineProposedAssignment[];
  unfilledSlots: EngineUnfilledSlot[];
  volunteerSummaries: Record<string, VolunteerScheduleSummary>;
  auditLog: EngineAuditEntry[];
  success: boolean;
}

export interface EngineProposedAssignment {
  shiftSlotId: string;
  volunteerId: string;
  date: string;
  durationHours: number;
  isTrainingPair: boolean;
  trainerVolunteerId?: string;
}

export interface EngineUnfilledSlot {
  shiftSlotId: string;
  shiftName: string;
  date: string;
  shortfall: number;
  rejectionReasons: Record<string, string>;
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

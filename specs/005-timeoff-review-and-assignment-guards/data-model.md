# Data Model: Time-Off Review & Assignment Guards

**Feature**: `005-timeoff-review-and-assignment-guards`
**Date**: 2026-10-27
**Status**: Completed

## 1. Time-Off Request Status Model

The `time_off_requests` table supports four distinct states:
- `Pending`: Initial state upon volunteer submission. Awaiting manager action.
- `Approved`: Approved by management. Locks the date against auto-scheduling; prompts confirmation on manual assignment.
- `Denied`: Declined by management. The date remains available for scheduling.
- `Cancelled`: Cancelled by the volunteer prior to or during the leave period. Frees up availability.

## 2. Shift Assignment Candidate Guard Model

```typescript
export interface CandidateEligibility {
  volunteerId: string;
  isReceptionQualified: boolean;
  primaryRole: 'Housekeeping' | 'Reception';
  hasApprovedTimeOff: boolean;
  timeOffReason?: string;
  isAssignDisabled: boolean;
  disabledReason?: string;
}
```

- When `shiftName` includes `'reception'`:
  - `isAssignDisabled = !isReceptionQualified && primaryRole !== 'Reception'`.
  - `disabledReason = "Not Reception Qualified"`.
- When `hasApprovedTimeOff`:
  - `isAssignDisabled = false` (manager override allowed).
  - Triggers confirmation prompt before calling `onAssign()`.

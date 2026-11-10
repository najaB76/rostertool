# Data Model: Assignment Modal, Country Search & Multi-Day Time-Off

**Feature**: `004-roster-assignment-and-timeoff-improvements`
**Date**: 2026-10-27
**Status**: Completed

## 1. Entities & UI Models

### 1.1 Shift Assignment Candidate (`ShiftAssignModal`)
```typescript
export interface Candidate {
  id: string;
  type: 'volunteer' | 'staff';
  fullName: string;
  firstName: string;
  nationality: string;
  primaryRole: 'Housekeeping' | 'Reception';
  isReceptionQualified: boolean;
  isTrainer: boolean;
  inTraining: boolean;
  assignedHoursThisWeek: number;
  targetWeeklyHours: number;
  hasTimeOffConflict: boolean;
  hasDoubleBookingConflict: boolean;
  isStayDateValid: boolean;
}
```

### 1.2 Canonical Country Entity (`src/client/data/countries.ts`)
```typescript
export interface CountryOption {
  code: string;       // ISO 3166-1 alpha-2, e.g. "JM", "BB", "FR"
  name: string;       // Full English name, e.g. "Jamaica", "Barbados", "France"
  flag?: string;      // Emoji or fallback
}
```
Coverage includes all 266 standard ISO countries and territories with flags supported by `country-flag-icons`.

### 1.3 Multi-Day Time-Off Request Payload
```typescript
export interface MultiDayTimeOffInput {
  startDate: string;  // YYYY-MM-DD
  endDate?: string;    // YYYY-MM-DD (defaults to startDate)
  reason?: string;
}
```
Database storage expands this into individual date records in `time_off_requests` (`volunteerId`, `date`, `status = 'Pending'`, `reason`).

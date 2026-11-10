# Data Model: Timeline Volunteers Scope & SVG Flag Enforcement

**Feature**: `012-timeline-volunteers-and-flags`
**Date**: 2026-10-27
**Status**: Completed

## 1. Domain Entities & Interface Contracts

### 1.1 `VolunteerTimelineEntry`
Represents an individual volunteer's schedule and attributes in the timeline view:
```typescript
export interface VolunteerTimelineEntry {
  id: string;
  preferredName: string;
  fullName: string;
  nationality: string;      // ISO 3166-1 alpha-2 (e.g. 'GB', 'FR', 'ES')
  countryName?: string;     // Resolved full country name (e.g. 'United Kingdom')
  gender: 'Male' | 'Female' | 'Neutral' | 'Unspecified';
  age: number | null;       // Computed from dateOfBirth
  source: string;           // Application source (e.g. 'Worldpackers', 'HelpX')
  status: 'Active' | 'Accepted' | 'Applied';
  role: 'Reception' | 'Housekeeping';
  arrivalDate: string | null;
  departureDate: string | null;
  noEndDate: boolean;
  activeDates: string[];    // ISO dates on which the volunteer is on site
}
```

### 1.2 `TimelineResponse`
Payload returned by `GET /api/admin/timeline`:
```typescript
export interface TimelineResponse {
  days: {
    date: string;
    dayOfWeek: number;
    dayName: string;
    dayOfMonth: number;
    monthName: string;
  }[];
  reception: VolunteerTimelineEntry[];    // Volunteers in Reception (Active/Accepted)
  housekeeping: VolunteerTimelineEntry[]; // Volunteers in Housekeeping (Active/Accepted)
  applied: VolunteerTimelineEntry[];      // Volunteers in Applied status
  dailyConfirmedCounts: Record<string, number>; // Date -> confirmed volunteer count
  headcountThresholds: {
    baseline: number;
    lowMin: number;
    lowMax: number;
    critical: number;
    overbooked: number;
  };
}
```

### 1.3 Invariants
1. `staff_users` records are NEVER present in `reception`, `housekeeping`, or `applied`.
2. `dailyConfirmedCounts` only increments for volunteers with `status IN ('Active', 'Accepted')` whose stay dates cover the given date.
3. Every volunteer row displays an authentic SVG flag (`country-flag-icons`) and never a bare text abbreviation.

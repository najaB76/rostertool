# Data Model: Timeline Interactivity, Historical Staffing, and Volunteer Edit Enhancements

**Feature**: `018-timeline-interactivity-and-history-fixes`
**Date**: 2026-10-27
**Status**: Completed

## Timeline Entity Extensions

```typescript
export interface TimelineEntry {
  id: string;
  isStaff: false;
  gender: string;
  preferredName: string;
  fullName: string;
  nationality: string;
  age: number | null;
  source: string;
  status: 'Active' | 'Accepted' | 'Applied' | 'Departed';
  effectiveStatus?: 'Active' | 'Accepted' | 'Applied' | 'Departed';
  role: 'Reception' | 'Housekeeping';
  arrivalDate: string | null;
  departureDate: string | null;
  noEndDate: boolean;
  activeDates: string[];
}

export interface TimelineResponse {
  days: {
    date: string;
    dayOfWeek: number;
    dayName: string;
    dayOfMonth: number;
    monthName: string;
  }[];
  reception: TimelineEntry[];
  housekeeping: TimelineEntry[];
  applied: TimelineEntry[];
  dailyConfirmedCounts: Record<string, number>;
  dailyAppliedCounts: Record<string, number>;
  headcountThresholds: {
    baseline: number;
    lowMin: number;
    lowMax: number;
    critical: number;
    overbooked: number;
  };
}
```

### Invariant Rules
1. Any volunteer on site during a historical timeline window $[T_{start}, T_{end}]$ is included in `reception` or `housekeeping` with `activeDates` populated.
2. `dailyAppliedCounts[date]` tallies the number of candidates in `applied` whose dates overlap `date`.
3. `volunteers.source` is stored as the literal name of the selected or custom source (e.g. `'HelpX'`).

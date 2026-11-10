# Data Model: Operations, Timeline & Volunteer Management

**Feature**: `011-operations-timeline-and-management`
**Date**: 2026-10-27
**Status**: Completed

## 1. Relational Schema Additions

### 1.1 `volunteers` Table Updates
New columns added to existing `volunteers` table:
- `gender`: `text('gender').notNull().default('Unspecified')` (`'Male' | 'Female' | 'Neutral' | 'Unspecified'`)
- `source`: `text('source').notNull().default('Other')` (`'Worldpackers' | 'HelpX' | 'Former staff' | 'Email' | 'Friend' | 'Direct' | 'Other'`)
- `noEndDate`: `integer('no_end_date', { mode: 'boolean' }).notNull().default(false)`

### 1.2 `volunteer_stays` Table
New table to record multiple historical and current stays for repeat volunteers:
```typescript
export const volunteerStays = sqliteTable('volunteer_stays', {
  id: text('id').primaryKey(),
  volunteerId: text('volunteer_id').notNull().references(() => volunteers.id, { onDelete: 'cascade' }),
  arrivalDate: text('arrival_date').notNull(),
  departureDate: text('departure_date'),
  noEndDate: integer('no_end_date', { mode: 'boolean' }).notNull().default(false),
  departureRating: integer('departure_rating'), // 1 to 5 stars
  departureNotes: text('departure_notes'),
  rehireStatus: text('rehire_status'), // 'Accept' | 'Possible' | 'Don\'t Accept'
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
```

### 1.3 `system_settings` Keys
| Setting Key | Default Value | Description |
|---|---|---|
| `headcount_baseline` | `"11"` | Ideal target confirmed staff on-site |
| `headcount_low_min` | `"8"` | Lower bound of low-staffing warning |
| `headcount_low_max` | `"10"` | Upper bound of low-staffing warning |
| `headcount_critical` | `"8"` | Critical shortage alert (< 8) |
| `headcount_overbooked` | `"11"` | Overbooked notice (> 11) |
| `date_format_preference` | `"YYYY-MM-DD"` | UI date format (`'YYYY-MM-DD'` or `'DD-MM-YYYY'`) |

---

## 2. Domain Types

### 2.1 Gender
```typescript
export type Gender = 'Male' | 'Female' | 'Neutral' | 'Unspecified';

export const GENDER_SYMBOLS: Record<Gender, string> = {
  Male: '♂',
  Female: '♀',
  Neutral: '⚧',
  Unspecified: '⚪'
};
```

### 2.2 Rehire Status
```typescript
export type RehireStatus = 'Accept' | 'Possible' | 'Don\'t Accept';

export const REHIRE_BADGE_COLORS: Record<RehireStatus, { bg: string; text: string; border: string }> = {
  Accept: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },       // Green
  Possible: { bg: '#fef9c3', text: '#854d0e', border: '#fef08a' },     // Yellow
  "Don't Accept": { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' } // Red
};
```

### 2.3 Timeline Data Contract
```typescript
export interface TimelineEntry {
  id: string;
  volunteerId?: string;
  staffId?: string;
  preferredName: string;
  fullName: string;
  nationality: string;
  gender: Gender;
  age: number | null;
  source: string;
  status: 'Active' | 'Accepted' | 'Applied';
  role: 'Reception' | 'Housekeeping';
  arrivalDate: string;
  departureDate: string | null;
  noEndDate: boolean;
  activeDates: Set<string>; // Dates they are confirmed on site
}

export interface TimelineResponse {
  days: {
    date: string;
    dayOfWeek: string;
    dayOfMonth: number;
    monthName: string;
  }[];
  reception: TimelineEntry[];
  housekeeping: TimelineEntry[];
  applied: TimelineEntry[];
  dailyConfirmedCounts: Record<string, number>;
  headcountThresholds: {
    baseline: number;
    lowMin: number;
    lowMax: number;
    critical: number;
    overbooked: number;
  };
}
```

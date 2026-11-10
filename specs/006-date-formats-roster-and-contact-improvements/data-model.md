# Data Model: Date Formats, Roster Navigation & Volunteer Contacts

**Feature**: `006-date-formats-roster-and-contact-improvements`
**Date**: 2026-10-27
**Status**: Completed

## 1. Entities & UI Models

### 1.1 Volunteer Contact Model (`volunteers`)
- `email`: `TEXT` NULL (e.g. `elena.rostova@example.com`).
- `phone`: `TEXT` NULL (e.g. `+49 151 23456789`).
- Rendered on cards with active browser links:
  - Email: `<a href="mailto:${v.email}">`
  - Phone: `<a href="tel:${v.phone}">`

### 1.2 Roster Week Interval Model
```typescript
export interface WeekInterval {
  weekStartDate: string; // YYYY-MM-DD (Strictly Monday)
  weekEndDate: string;   // YYYY-MM-DD (Strictly Sunday, 6 days after start)
  displayRange: string;  // "Monday, YYYY-MM-DD to Sunday, YYYY-MM-DD"
}
```

### 1.3 Uniform Date Format Helper
```typescript
export function formatDate(input: string | Date | null | undefined): string {
  if (!input) return '';
  const d = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(d.getTime())) return String(input);
  return d.toISOString().split('T')[0];
}
```
All UI views render dates through this standard function.

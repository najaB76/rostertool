# Data Model: Roster, Lifecycle & Headcount Refinements

**Feature**: `002-roster-lifecycle-refinements`
**Date**: 2026-10-27
**Status**: Completed

## 1. Schema Adaptations & Enhancements

### 1.1 `shift_definitions` Day-of-Week Specificity
To ensure exactly 3 shift slots render each day:
- `applicable_days`: `TEXT` (Comma-separated integers representing day of week: `0`=Sun, `1`=Mon, `2`=Tue, `3`=Wed, `4`=Thu, `5`=Fri, `6`=Sat).
  - Housekeeping (10:00–14:00): `applicable_days = '0,1,2,3,4,5,6'`
  - Reception Day (08:00–18:00): `applicable_days = '0,1,2,3,4,5,6'`
  - Reception Evening Sun–Thu (16:00–00:00): `applicable_days = '0,1,2,3,4'`
  - Reception Evening Fri–Sat (17:00–01:00): `applicable_days = '5,6'`

### 1.2 `volunteers` Table
- `notes`: `TEXT` NULL (Universal open comments field, preserved across all statuses).
- Lifecycle state machine transitions:
  - `Applied`: initial state; can transition to `Accepted` or `Cancelled`.
  - `Accepted`: confirmed stay dates; can transition to `Active` or `Cancelled`.
  - `Active`: currently on site; can transition to `Departed` (with review) or `Cancelled`.
  - `Departed`: stay completed; historical records archived with rating and re-hire flag. Can be re-opened to `Active`.
  - `Cancelled`: cancelled before or during stay; shifts released. Can be re-opened to `Applied` or `Accepted`.

---

## 2. Country Metadata Structure (`src/client/data/countries.ts`)

```typescript
export interface CountryOption {
  code: string;       // ISO 3166-1 alpha-2, e.g. "DE"
  name: string;       // Common English country name, e.g. "Germany"
  flag: string;       // Unicode flag emoji, e.g. "🇩🇪"
}
```

Includes all standard UN member countries sorted alphabetically by name.

---

## 3. Headcount Multi-Scale Query Model

### 3.1 Scales
- `Month`: Start of month to End of month (28–31 days).
- `Quarter`: Start of Q1/Q2/Q3/Q4 to End of Quarter (90–92 days).
- `Year`: January 1 to December 31 (365–366 days).

### 3.2 Display Modes
- `Detailed`: Full calendar tiles with date number, headcount count, status label, and tooltip volunteer names.
- `Compact / Heatmap`: Square colored blocks (12px–24px) reflecting capacity status with hover tooltips (`"2026-05-12: 12 volunteers (Optimal)"`).

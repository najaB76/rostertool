# Data Model: Roster Fixes, Width Expansion & Housekeeping Settings

**Feature**: `010-roster-fixes-and-settings`
**Date**: 2026-10-27
**Status**: Completed

## 1. Entities & Relational Schemas

### 1.1 `system_settings` Schema
```typescript
export const systemSettings = sqliteTable('system_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
```

### 1.2 Default System Settings
| Key | Default Value | Description |
|---|---|---|
| `housekeepers_per_day` | `"3"` | Minimum staff count per day for housekeeping |
| `housekeeping_shifts_per_week` | `"4"` | Number of housekeeping shifts per volunteer/week |
| `housekeeping_start_time` | `"10:00"` | Shift start time |
| `housekeeping_end_time` | `"14:00"` | Shift end time |

### 1.3 `shift_assignments` Unique Constraints
- `(shift_definition_id, date, volunteer_id)` UNIQUE
- `(shift_definition_id, date, staff_id)` UNIQUE

### 1.4 Unassign API Payload
```typescript
export interface UnassignPayload {
  shiftDefinitionId: string;
  date: string;
  volunteerId?: string | null;
  staffId?: string | null;
}
```

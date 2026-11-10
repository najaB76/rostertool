# Data Model: Staff Assignment Fix, Reception Copy & Birthdays

**Feature**: `009-staff-fix-reception-copy-and-birthdays`
**Date**: 2026-10-27
**Status**: Completed

## 1. Updated `volunteers` Entity Schema

```typescript
export const volunteers = sqliteTable('volunteers', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  preferredName: text('preferred_name'),   // Nickname / chosen name for display
  dateOfBirth: text('date_of_birth'),       // YYYY-MM-DD
  email: text('email'),
  phone: text('phone'),
  nationality: text('nationality').notNull(),
  status: text('status').notNull().default('Applied'),
  arrivalDate: text('arrival_date'),
  departureDate: text('departure_date'),
  primaryRole: text('primary_role').notNull().default('Housekeeping'),
  isReceptionQualified: integer('is_reception_qualified', { mode: 'boolean' }).notNull().default(false),
  isTrainer: integer('is_trainer', { mode: 'boolean' }).notNull().default(false),
  inTraining: integer('in_training', { mode: 'boolean' }).notNull().default(false),
  applicationSourceId: text('application_source_id').references(() => applicationSources.id),
  futureAcceptance: text('future_acceptance').notNull().default('YES'),
  notes: text('notes'),
  magicLinkToken: text('magic_link_token').unique(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
```

## 2. Birthday Alert Model

```typescript
export interface BirthdayAlert {
  isUpcoming: boolean;
  daysUntil: number;       // 0 = today, 1 = tomorrow ... 7 = in 7 days
  birthdayFormatted: string; // e.g. "Nov 3"
}
```

## 3. Shift Assignment API Payload

```typescript
export interface AssignShiftPayload {
  shiftDefinitionId: string;
  date: string;
  volunteerId?: string | null;
  staffId?: string | null;
}
```
Validation rule:
- If `!volunteerId && !staffId`: unassign slot.
- If `staffId` present: assign staff member to slot.
- If `volunteerId` present: assign volunteer to slot.

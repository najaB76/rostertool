# Data Model: Staff Management, Admin Auth & Printable Roster

**Feature**: `007-staff-management-auth-and-roster-export`
**Date**: 2026-10-27
**Status**: Completed

## 1. Entities & Schemas

### 1.1 Updated `staff_users` Schema
```typescript
export const staffUsers = sqliteTable('staff_users', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  role: text('role').notNull().default('Receptionist'),
  nationality: text('nationality').notNull().default('ES'), // ISO 3166-1 alpha-2
  contactInfo: text('contact_info'),
  isActive: integer('is_active').notNull().default(1),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
```

### 1.2 Authentication Session Model
```typescript
export interface AuthSession {
  token: string;
  username: string;
  expiresAt: number; // Unix timestamp
}
```

### 1.3 Portrait Roster Day Model
```typescript
export interface PortraitRosterDay {
  date: string;               // YYYY-MM-DD
  dayName: string;            // "Monday", "Tuesday", etc.
  formattedDate: string;      // "26/10/26"
  receptionDay: {
    name: string;
    nationality: string;
  } | null;
  receptionNight: {
    name: string;
    nationality: string;
  } | null;
  housekeepers: Array<{
    name: string;
    nationality: string;
  }>;
}
```

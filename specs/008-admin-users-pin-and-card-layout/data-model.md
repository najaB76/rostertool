# Data Model: Admin Users, PIN Change & Card Layout

**Feature**: `008-admin-users-pin-and-card-layout`
**Date**: 2026-10-27
**Status**: Completed

## 1. Entities & Relational Schemas

### 1.1 `admin_users` Schema
```typescript
export const adminUsers = sqliteTable('admin_users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  pin: text('pin').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
```

### 1.2 Admin Session Payload
```typescript
export interface ActiveSession {
  userId: string;
  username: string;
  token: string;
  createdAt: number;
}
```

### 1.3 Volunteer Card Display Model
- Line 1: `{ primaryRole, applicationSourceName, arrivalDate, departureDate, isTrainer, inTraining, isReceptionQualified }`
- Line 2: `{ email, phone }`

### 1.4 Staff Role Options
`'Receptionist' | 'Senior Receptionist' | 'Assistant Manager' | 'Hostel Manager' | 'General Staff'`

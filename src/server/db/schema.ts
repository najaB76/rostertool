import { sqliteTable, text, integer, real, unique } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const volunteers = sqliteTable('volunteers', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  preferredName: text('preferred_name'),
  dateOfBirth: text('date_of_birth'),
  email: text('email'),
  phone: text('phone'),
  nationality: text('nationality').notNull(),
  status: text('status').notNull().default('Applied'), // Applied, Accepted, Active, Departed, Cancelled
  arrivalDate: text('arrival_date'),
  departureDate: text('departure_date'),
  primaryRole: text('primary_role').notNull().default('Housekeeping'), // Housekeeping, Reception
  isReceptionQualified: integer('is_reception_qualified', { mode: 'boolean' }).notNull().default(false),
  isTrainer: integer('is_trainer', { mode: 'boolean' }).notNull().default(false),
  inTraining: integer('in_training', { mode: 'boolean' }).notNull().default(false),
  applicationSourceId: text('application_source_id').references(() => applicationSources.id),
  futureAcceptance: text('future_acceptance').notNull().default('YES'), // YES, CONDITIONAL, NO
  notes: text('notes'),
  magicLinkToken: text('magic_link_token').unique(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const applicationSources = sqliteTable('application_sources', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(), // e.g. WorkAway, HelpEx, Worldpackers
  isActive: integer('is_active').notNull().default(1),
});

export const stayReviews = sqliteTable('stay_reviews', {
  id: text('id').primaryKey(),
  volunteerId: text('volunteer_id').notNull().references(() => volunteers.id, { onDelete: 'cascade' }),
  futureAcceptance: text('future_acceptance').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const staffUsers = sqliteTable('staff_users', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  role: text('role').notNull().default('Receptionist'),
  nationality: text('nationality').notNull().default('ES'),
  contactInfo: text('contact_info'),
  isActive: integer('is_active').notNull().default(1),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const staffPto = sqliteTable('staff_pto', {
  id: text('id').primaryKey(),
  staffId: text('staff_id').notNull().references(() => staffUsers.id, { onDelete: 'cascade' }),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  notes: text('notes'),
});

export const shiftDefinitions = sqliteTable('shift_definitions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  dayOfWeek: integer('day_of_week'), // 0-6, null means every day
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  durationHours: real('duration_hours').notNull(),
  minStaff: integer('min_staff').notNull().default(1),
  eligibleRoles: text('eligible_roles').notNull().default('Housekeeping,Reception'),
  isActive: integer('is_active').notNull().default(1),
});

export const shiftAssignments = sqliteTable('shift_assignments', {
  id: text('id').primaryKey(),
  shiftDefinitionId: text('shift_definition_id').notNull().references(() => shiftDefinitions.id),
  date: text('date').notNull(), // YYYY-MM-DD
  volunteerId: text('volunteer_id').references(() => volunteers.id, { onDelete: 'cascade' }),
  staffId: text('staff_id').references(() => staffUsers.id, { onDelete: 'set null' }),
  isTrainingShift: integer('is_training_shift', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  unq: unique('unq_shift_date_vol').on(t.shiftDefinitionId, t.date, t.volunteerId),
  unqStaff: unique('unq_shift_date_staff').on(t.shiftDefinitionId, t.date, t.staffId),
}));

export const timeOffRequests = sqliteTable('time_off_requests', {
  id: text('id').primaryKey(),
  volunteerId: text('volunteer_id').notNull().references(() => volunteers.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  status: text('status').notNull().default('Pending'),
  reason: text('reason'),
  reviewedBy: text('reviewed_by'),
  reviewedAt: text('reviewed_at'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const adminUsers = sqliteTable('admin_users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  pin: text('pin').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const systemSettings = sqliteTable('system_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

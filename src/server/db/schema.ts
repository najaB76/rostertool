import { sqliteTable, text, integer, real, unique } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const applicationSources = sqliteTable('application_sources', {
  id: text('id').primaryKey(), // UUID
  name: text('name').notNull().unique(),
  isActive: integer('is_active').notNull().default(1),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const volunteers = sqliteTable('volunteers', {
  id: text('id').primaryKey(), // UUID
  applicationSourceId: text('application_source_id').references(() => applicationSources.id),
  fullName: text('full_name').notNull(),
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
  futureAcceptance: text('future_acceptance').notNull().default('Accept'),
  magicLinkToken: text('magic_link_token').notNull().unique(),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const stayReviews = sqliteTable('stay_reviews', {
  id: text('id').primaryKey(),
  volunteerId: text('volunteer_id').notNull().references(() => volunteers.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  reviewNotes: text('review_notes'),
  futureAcceptanceRecommendation: text('future_acceptance_recommendation').notNull().default('Accept'),
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
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
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
  date: text('date').notNull(),
  volunteerId: text('volunteer_id').references(() => volunteers.id, { onDelete: 'set null' }),
  staffId: text('staff_id').references(() => staffUsers.id, { onDelete: 'set null' }),
  isTrainingShift: integer('is_training_shift', { mode: 'boolean' }).notNull().default(false),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  unq: unique('unq_shift_date_vol').on(t.shiftDefinitionId, t.date, t.volunteerId),
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

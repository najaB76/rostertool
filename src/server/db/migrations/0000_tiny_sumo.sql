CREATE TABLE `application_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `application_sources_name_unique` ON `application_sources` (`name`);--> statement-breakpoint
CREATE TABLE `shift_assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`shift_definition_id` text NOT NULL,
	`date` text NOT NULL,
	`volunteer_id` text,
	`staff_id` text,
	`is_training_shift` integer DEFAULT false NOT NULL,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`shift_definition_id`) REFERENCES `shift_definitions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`volunteer_id`) REFERENCES `volunteers`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`staff_id`) REFERENCES `staff_users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unq_shift_date_vol` ON `shift_assignments` (`shift_definition_id`,`date`,`volunteer_id`);--> statement-breakpoint
CREATE TABLE `shift_definitions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`day_of_week` integer,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`duration_hours` real NOT NULL,
	`min_staff` integer DEFAULT 1 NOT NULL,
	`eligible_roles` text DEFAULT 'Housekeeping,Reception' NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `staff_pto` (
	`id` text PRIMARY KEY NOT NULL,
	`staff_id` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`staff_id`) REFERENCES `staff_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `staff_users` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`role` text DEFAULT 'Receptionist' NOT NULL,
	`contact_info` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stay_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`volunteer_id` text NOT NULL,
	`rating` integer NOT NULL,
	`review_notes` text,
	`future_acceptance_recommendation` text DEFAULT 'Accept' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`volunteer_id`) REFERENCES `volunteers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `time_off_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`volunteer_id` text NOT NULL,
	`date` text NOT NULL,
	`status` text DEFAULT 'Pending' NOT NULL,
	`reason` text,
	`reviewed_by` text,
	`reviewed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`volunteer_id`) REFERENCES `volunteers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `volunteers` (
	`id` text PRIMARY KEY NOT NULL,
	`application_source_id` text,
	`full_name` text NOT NULL,
	`email` text,
	`phone` text,
	`nationality` text NOT NULL,
	`status` text DEFAULT 'Applied' NOT NULL,
	`arrival_date` text,
	`departure_date` text,
	`primary_role` text DEFAULT 'Housekeeping' NOT NULL,
	`is_reception_qualified` integer DEFAULT false NOT NULL,
	`is_trainer` integer DEFAULT false NOT NULL,
	`in_training` integer DEFAULT false NOT NULL,
	`future_acceptance` text DEFAULT 'Accept' NOT NULL,
	`magic_link_token` text NOT NULL,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`application_source_id`) REFERENCES `application_sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `volunteers_magic_link_token_unique` ON `volunteers` (`magic_link_token`);
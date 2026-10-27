# Data Model: Hostel Volunteer Rostering

**Feature**: `001-volunteer-rostering`
**Date**: 2026-10-27
**Status**: Completed

## 1. Relational Entity-Relationship Diagram

```
+---------------------------+       +----------------------------+
|    application_sources    |       |         volunteers         |
+---------------------------+       +----------------------------+
| id: TEXT (UUID) [PK]      |1     *| id: TEXT (UUID) [PK]       |
| name: TEXT [UNIQUE]       |<------| application_source_id: TEXT|
| is_active: INTEGER        |       | full_name: TEXT            |
| created_at: TEXT          |       | email: TEXT                |
+---------------------------+       | phone: TEXT                |
                                    | nationality: TEXT (ISO-2)  |
                                    | status: TEXT               |
+---------------------------+       | arrival_date: TEXT (YYYY-MM-DD)|
|        staff_users        |       | departure_date: TEXT       |
+---------------------------+       | primary_role: TEXT         |
| id: TEXT (UUID) [PK]      |       | is_reception_qualified: INT|
| full_name: TEXT           |       | is_trainer: INTEGER        |
| role: TEXT                |       | in_training: INTEGER       |
| contact_info: TEXT        |       | future_acceptance: TEXT    |
| is_active: INTEGER        |       | magic_link_token: TEXT [UQ]|
+---------------------------+       | notes: TEXT                |
         |1        |1               | created_at: TEXT           |
         |         |                | updated_at: TEXT           |
         |*        |*               +----------------------------+
+----------------+ +--------------+    |1           |1          |1
|   staff_pto    | |shift_assigns |    |            |           |
+----------------+ +--------------+    |*           |*          |1
| id: TEXT [PK]  | | id: TEXT [PK]|<---+            |           |
| staff_id: TEXT | | date: TEXT   |                 |           |
| start_date:TEXT| | shift_id:TEXT|<--+             |           |
| end_date: TEXT | | vol_id: TEXT |   |             |           |
| notes: TEXT    | | staff_id:TEXT|   |             |           |
+----------------+ | is_train: INT|   |             |           |
                   | notes: TEXT  |   |             |           |
                   +--------------+   |             |           |
                          |*          |             |           |
               +--------------------+ |             |           |
               | shift_definitions  | |             |           |
               +--------------------+ |             |           |
               | id: TEXT [PK]      | |             |           |
               | name: TEXT         | |             |           |
               | day_of_week: INT   | |             |           |
               | start_time: TEXT   | |             |           |
               | end_time: TEXT     | |             |           |
               | duration_hours: NUM| |             |           |
               | min_staff: INTEGER | |             |           |
               | eligible_roles:TEXT| |             |           |
               | is_active: INTEGER | |             |           |
               +--------------------+ |             |           |
                                      v*            v*          v1
                         +-------------------+ +----------+ +-----------+
                         | time_off_requests | |stay_revs | |shift_asgns|
                         +-------------------+ +----------+ +-----------+
                         | id: TEXT [PK]     | |id: TEXT  | (see above)
                         | volunteer_id: TEXT| |vol_id: TX|
                         | date: TEXT        | |rating:INT|
                         | status: TEXT      | |notes: TX |
                         | reason: TEXT      | |rehire: TX|
                         | reviewed_by: TEXT | +----------+
                         | reviewed_at: TEXT |
                         +-------------------+
```

---

## 2. Table Specifications & SQLite Schema (Drizzle ORM Mapping)

### 2.1 `application_sources`
Tracks where the volunteer applied from.
- `id`: `TEXT` PRIMARY KEY (UUID v4)
- `name`: `TEXT` NOT NULL UNIQUE (e.g. 'HelpEx', 'WorkAway', 'Worldpackers', 'Guest')
- `is_active`: `INTEGER` NOT NULL DEFAULT 1
- `created_at`: `TEXT` NOT NULL DEFAULT (CURRENT_TIMESTAMP)

### 2.2 `volunteers`
Core volunteer profile and lifecycle entity.
- `id`: `TEXT` PRIMARY KEY (UUID v4)
- `application_source_id`: `TEXT` REFERENCES `application_sources(id)` (NULLable)
- `full_name`: `TEXT` NOT NULL
- `email`: `TEXT` NULL
- `phone`: `TEXT` NULL (Phone or WhatsApp)
- `nationality`: `TEXT` NOT NULL (ISO 3166-1 alpha-2, e.g. 'FR', 'BR', 'CA', 'GB')
- `status`: `TEXT` NOT NULL DEFAULT 'Applied'
  - Valid values: `'Applied'`, `'Accepted'`, `'Active'`, `'Departed'`, `'Cancelled'`
- `arrival_date`: `TEXT` NULL (ISO `YYYY-MM-DD`, mandatory when status = `Accepted` or `Active`)
- `departure_date`: `TEXT` NULL (ISO `YYYY-MM-DD`, mandatory when status = `Accepted` or `Active`)
- `primary_role`: `TEXT` NOT NULL DEFAULT 'Housekeeping'
  - Valid values: `'Housekeeping'`, `'Reception'`
- `is_reception_qualified`: `INTEGER` NOT NULL DEFAULT 0 (1 = customer focused & fluent English)
- `is_trainer`: `INTEGER` NOT NULL DEFAULT 0 (1 = experienced, eligible to train)
- `in_training`: `INTEGER` NOT NULL DEFAULT 0 (1 = requires pairing with a trainer)
- `future_acceptance`: `TEXT` NOT NULL DEFAULT 'Accept'
  - Valid values: `'Accept'`, `'Review Required'`, `'Do Not Accept'`
- `magic_link_token`: `TEXT` NOT NULL UNIQUE (Secure random hex token)
- `notes`: `TEXT` NULL (Open comments and management notes)
- `created_at`: `TEXT` NOT NULL DEFAULT (CURRENT_TIMESTAMP)
- `updated_at`: `TEXT` NOT NULL DEFAULT (CURRENT_TIMESTAMP)

**Indexes:**
- `idx_volunteers_status`: ON `volunteers(status)`
- `idx_volunteers_dates`: ON `volunteers(arrival_date, departure_date)`
- `idx_volunteers_token`: ON `volunteers(magic_link_token)`

### 2.3 `stay_reviews`
Exit evaluations captured when volunteers depart.
- `id`: `TEXT` PRIMARY KEY (UUID v4)
- `volunteer_id`: `TEXT` NOT NULL REFERENCES `volunteers(id)` ON DELETE CASCADE
- `rating`: `INTEGER` NOT NULL (Scale 1 to 5)
- `review_notes`: `TEXT` NULL
- `future_acceptance_recommendation`: `TEXT` NOT NULL DEFAULT 'Accept'
  - Valid values: `'Accept'`, `'Review Required'`, `'Do Not Accept'`
- `created_at`: `TEXT` NOT NULL DEFAULT (CURRENT_TIMESTAMP)

### 2.4 `staff_users`
Permanent paid hostel staff who normally cover reception day shifts.
- `id`: `TEXT` PRIMARY KEY (UUID v4)
- `full_name`: `TEXT` NOT NULL
- `role`: `TEXT` NOT NULL DEFAULT 'Receptionist'
- `contact_info`: `TEXT` NULL
- `is_active`: `INTEGER` NOT NULL DEFAULT 1
- `created_at`: `TEXT` NOT NULL DEFAULT (CURRENT_TIMESTAMP)

### 2.5 `staff_pto`
Paid staff leave tracking.
- `id`: `TEXT` PRIMARY KEY (UUID v4)
- `staff_id`: `TEXT` NOT NULL REFERENCES `staff_users(id)` ON DELETE CASCADE
- `start_date`: `TEXT` NOT NULL (ISO `YYYY-MM-DD`)
- `end_date`: `TEXT` NOT NULL (ISO `YYYY-MM-DD`)
- `notes`: `TEXT` NULL
- `created_at`: `TEXT` NOT NULL DEFAULT (CURRENT_TIMESTAMP)

**Indexes:**
- `idx_staff_pto_dates`: ON `staff_pto(start_date, end_date)`

### 2.6 `shift_definitions`
Operational shift templates configuring hostel shift schedule.
- `id`: `TEXT` PRIMARY KEY (UUID v4)
- `name`: `TEXT` NOT NULL (e.g. 'Housekeeping', 'Reception Day', 'Reception Evening', 'Reception Graveyard')
- `day_of_week`: `INTEGER` NULL (0 = Sun, 1 = Mon ... 6 = Sat; NULL = every day)
- `start_time`: `TEXT` NOT NULL (e.g. '10:00', '08:00', '16:00', '17:00', '00:00')
- `end_time`: `TEXT` NOT NULL (e.g. '14:00', '18:00', '00:00', '01:00', '08:00')
- `duration_hours`: `REAL` NOT NULL (e.g. 4.0, 10.0, 8.0, 7.0)
- `min_staff`: `INTEGER` NOT NULL DEFAULT 1 (e.g. 3 for Housekeeping)
- `eligible_roles`: `TEXT` NOT NULL DEFAULT 'Housekeeping,Reception' (Comma-separated)
- `is_active`: `INTEGER` NOT NULL DEFAULT 1

### 2.7 `shift_assignments`
Concrete calendar shift allocations.
- `id`: `TEXT` PRIMARY KEY (UUID v4)
- `shift_definition_id`: `TEXT` NOT NULL REFERENCES `shift_definitions(id)`
- `date`: `TEXT` NOT NULL (ISO `YYYY-MM-DD`)
- `volunteer_id`: `TEXT` NULL REFERENCES `volunteers(id)` ON DELETE SET NULL
- `staff_id`: `TEXT` NULL REFERENCES `staff_users(id)` ON DELETE SET NULL
- `is_training_shift`: `INTEGER` NOT NULL DEFAULT 0
- `notes`: `TEXT` NULL
- `created_at`: `TEXT` NOT NULL DEFAULT (CURRENT_TIMESTAMP)

**Constraints & Indexes:**
- Unique compound index: `UNIQUE(shift_definition_id, date, volunteer_id)` (prevents assigning same volunteer twice to the same shift)
- `idx_assignments_date`: ON `shift_assignments(date)`
- `idx_assignments_vol`: ON `shift_assignments(volunteer_id, date)`

### 2.8 `time_off_requests`
Specific single-day or multi-day time off requests submitted by volunteers.
- `id`: `TEXT` PRIMARY KEY (UUID v4)
- `volunteer_id`: `TEXT` NOT NULL REFERENCES `volunteers(id)` ON DELETE CASCADE
- `date`: `TEXT` NOT NULL (ISO `YYYY-MM-DD`)
- `status`: `TEXT` NOT NULL DEFAULT 'Pending'
  - Valid values: `'Pending'`, `'Approved'`, `'Denied'`
- `reason`: `TEXT` NULL
- `reviewed_by`: `TEXT` NULL
- `reviewed_at`: `TEXT` NULL
- `created_at`: `TEXT` NOT NULL DEFAULT (CURRENT_TIMESTAMP)

**Indexes:**
- `idx_time_off_vol_date`: ON `time_off_requests(volunteer_id, date)`
- `idx_time_off_status`: ON `time_off_requests(status)`

---

## 3. Volunteer Lifecycle State Machine

```
   [ Application Submitted ]
               |
               v
         +-----------+
         |  Applied  | <---------------------------+
         +-----------+                             |
           |       |                               |
(Accepted) |       | (Rejected)                    |
           v       v                               |
     +----------+ +-----------+                    |
     | Accepted | | Cancelled |                    |
     +----------+ +-----------+                    |
           |                                       |
(Arrival)  |                                       |
           v                                       |
      +----------+                                 |
      |  Active  |                                 |
      +----------+                                 |
           |                                       |
(Departure)|                                       |
           v                                       |
     +-----------+                                 |
     | Departed  | --- (Re-apply in future?) ------+
     +-----------+     Checks `future_acceptance`:
       [ Review ]       - 'Accept'
                        - 'Review Required'
                        - 'Do Not Accept' (Alerted)
```

### Transition Validation Invariants:
1. `Applied` $\to$ `Accepted`: Requires valid `arrival_date`, `departure_date` ($arrival \le departure$), and `primary_role`. Generates `magic_link_token`.
2. `Accepted` $\to$ `Active`: Permitted when `arrival_date` is reached. Volunteer is immediately candidate for rostering.
3. `Active` $\to$ `Departed`: Prompts for `stay_reviews` entry (`rating`, `review_notes`, and `future_acceptance_recommendation`). Unassigns any future shifts after `departure_date`.
4. Any state $\to$ `Cancelled`: Unassigns all scheduled future shifts for that volunteer.

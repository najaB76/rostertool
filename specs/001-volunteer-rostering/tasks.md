# Tasks: Hostel Volunteer Rostering

**Input**: Design documents from `/specs/001-volunteer-rostering/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `.specify/memory/constitution.md`

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story mapping ([US1], [US2], [US3], [US4], [US5], [US6])
- Exact file paths included in all tasks

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, toolchain, and basic configuration

- [x] T001 Initialize Node.js & TypeScript project configuration in `package.json` and `tsconfig.json`
- [x] T002 Install runtime and dev dependencies (Fastify, Drizzle ORM, better-sqlite3, React, Vite, Vitest) in `package.json`
- [x] T003 [P] Configure Vite dev server and proxy in `vite.config.ts`
- [x] T004 [P] Setup Drizzle ORM configuration in `drizzle.config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database, schema, migrations, base UI, and server infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Setup SQLite database client with WAL mode enabled in `src/server/db/client.ts`
- [x] T006 Define Drizzle schema for all tables (application_sources, volunteers, stay_reviews, staff_users, staff_pto, shift_definitions, shift_assignments, time_off_requests) in `src/server/db/schema.ts`
- [x] T007 Implement database migration runner in `src/server/db/migrate.ts`
- [x] T008 [P] Create database seed script with default shift definitions, application sources, and initial staff in `src/server/db/seed.ts`
- [x] T009 [P] Build Fastify server bootstrap and static file serving in `src/server/index.ts`
- [x] T010 [P] Implement reusable ISO country flag renderer component with SVG and emoji fallback in `src/client/components/CountryFlag.tsx`
- [x] T011 Setup base React layout, navigation header, and responsive styling in `src/client/App.tsx` and `src/client/styles/main.css`

**Checkpoint**: Foundation ready - user story implementation can begin.

---

## Phase 3: User Story 1 - Weekly Rostering Grid & Shift Assignment (Priority: P1) 🎯 MVP

**Goal**: Deliver the interactive weekly schedule grid (Monday–Sunday) showing Housekeeping and Reception shifts, displaying volunteer names alongside their national country flags, and prominently highlighting unstaffed/understaffed slots.

**Independent Test**: Load the weekly grid for an active week, manually assign an active volunteer to a shift slot, verify their name and national flag render immediately, and observe understaffed cells visually highlighted.

### Tests for User Story 1

- [x] T012 [P] [US1] Integration tests for weekly roster query and manual shift assignment API in `tests/api/roster.test.ts`

### Implementation for User Story 1

- [x] T013 [US1] Implement RosterService for weekly grid query and manual assignment mutation in `src/server/services/roster-service.ts`
- [x] T014 [US1] Implement admin roster API endpoints (`GET /api/admin/roster`, `POST /api/admin/roster/assign`) in `src/server/routes/admin-roster.ts`
- [x] T015 [P] [US1] Build ShiftSlotCell component with volunteer name, flag, role badge, and understaffed highlight in `src/client/components/ShiftSlotCell.tsx`
- [x] T016 [US1] Build RosterGrid component with Mon–Sun columns and shift slot rows in `src/client/components/RosterGrid.tsx`
- [x] T017 [US1] Implement AdminRosterPage with week navigation, manual volunteer assignment modal, and instant hour recalculation in `src/client/pages/AdminRosterPage.tsx`

**Checkpoint**: User Story 1 is fully functional as a standalone MVP.

---

## Phase 4: User Story 2 - Automated Shift Population (Priority: P2)

**Goal**: Implement the pure, deterministic constraint solver that auto-populates open weekly shifts respecting hard constraints (stay dates, 16h weekly caps, pro-rated mid-week arrivals, turnaround rest, trainee/trainer pairing) and optimizing soft constraints (3 consecutive days off in 14 days, weekend fairness).

**Independent Test**: Provide an unassigned week with active volunteers and run Auto-Populate. Verify in < 1 second that 100% of assignments satisfy hard constraints, trainees are paired with trainers, and turnaround rest is preserved.

### Tests for User Story 2 (TDD Mandate - Write and Verify Failing First)

- [x] T018 [P] [US2] Unit tests for hard constraints (date bounds, weekly hour caps, role eligibility, 9h turnaround rest) in `tests/engine/hard-constraints.test.ts`
- [x] T019 [P] [US2] Unit tests for trainer-trainee pairing rules in `tests/engine/trainer-pairing.test.ts`
- [x] T020 [P] [US2] Unit tests for mid-week arrival pro-rated hours calculation in `tests/engine/pro-rating.test.ts`
- [x] T021 [P] [US2] Unit tests for soft constraints (14-day rolling window 3 days off, weekend distribution) in `tests/engine/soft-constraints.test.ts`
- [x] T022 [US2] Unit tests for complete backtracking heuristic solver in `tests/engine/solver.test.ts`

### Implementation for User Story 2

- [x] T023 [P] [US2] Define engine domain types and interfaces in `src/engine/types.ts`
- [x] T024 [P] [US2] Implement pro-rating calculation utility in `src/engine/pro-rate.ts`
- [x] T025 [US2] Implement hard constraint evaluators (availability, hours, rest, trainer pairing) in `src/engine/hard-constraints.ts`
- [x] T026 [US2] Implement soft constraint scoring heuristic (consecutive days off, weekend fairness) in `src/engine/soft-constraints.ts`
- [x] T027 [US2] Implement the pure backtracking CSP solver in `src/engine/solver.ts`
- [x] T028 [US2] Implement auto-populate API endpoint (`POST /api/admin/roster/auto-populate`) in `src/server/routes/admin-roster.ts`
- [x] T029 [US2] Add "Auto-Populate" trigger button, progress feedback, and unfilled slot diagnostics modal in `src/client/pages/AdminRosterPage.tsx`

**Checkpoint**: User Stories 1 AND 2 work together seamlessly.

---

## Phase 5: User Story 3 - Volunteer Lifecycle, Sources & Profile Management (Priority: P3)

**Goal**: Track volunteers across full lifecycle states (`Applied`, `Accepted`, `Active`, `Departed`, `Cancelled`), record application sources (HelpEx, WorkAway, Worldpackers, Guest, custom), record future re-acceptance recommendations, and support instant profile editing.

**Independent Test**: Create an applicant with an application source, accept them with dates, edit their contact info and nationality, mark them departed with an exit review, and verify future re-application recommendation flags.

### Tests for User Story 3

- [x] T030 [P] [US3] Integration tests for volunteer CRUD, lifecycle transitions, and stay reviews in `tests/api/volunteers.test.ts`

### Implementation for User Story 3

- [x] T031 [US3] Implement VolunteerService for managing volunteer profiles, application sources, magic tokens, and status transitions in `src/server/services/volunteer-service.ts`
- [x] T032 [US3] Implement admin volunteer API endpoints (`GET /api/admin/volunteers`, `POST /api/admin/volunteers`, `PUT /api/admin/volunteers/:id`, `POST /api/admin/volunteers/:id/depart`, `POST /api/admin/volunteers/:id/reset-token`) in `src/server/routes/admin-volunteers.ts`
- [x] T033 [P] [US3] Build VolunteerModal component for adding/editing volunteers, configuring role, qualification, trainer flags, application sources, and notes in `src/client/components/VolunteerModal.tsx`
- [x] T034 [US3] Implement AdminVolunteersPage with status filtering tabs (Applied, Accepted, Active, Departed, Cancelled), application source badges, re-application flags, and depart action in `src/client/pages/AdminVolunteersPage.tsx`

**Checkpoint**: User Stories 1, 2, and 3 fully functional.

---

## Phase 6: User Story 4 - Volunteer Headcount Calendar & Capacity Management (Priority: P3)

**Goal**: Provide a dedicated calendar view displaying daily volunteer counts against the 12-volunteer baseline target, highlighting low capacity (10–11) and overlap periods (13–15), with capacity impact preview during application review.

**Independent Test**: Navigate to the Headcount Calendar, verify daily counts display with appropriate green/yellow/amber/red color highlights, and open an application to verify proposed dates preview capacity impact.

### Tests for User Story 4

- [x] T035 [P] [US4] Integration tests for daily headcount calculations and capacity status flags in `tests/api/headcount.test.ts`

### Implementation for User Story 4

- [x] T036 [US4] Implement HeadcountService for querying daily volunteer counts, overlap/low status flags, and stay preview deltas in `src/server/services/headcount-service.ts`
- [x] T037 [US4] Implement headcount API endpoint (`GET /api/admin/headcount`) in `src/server/routes/admin-headcount.ts`
- [x] T038 [P] [US4] Build HeadcountCalendar component with monthly view, 12-baseline indicator, yellow overlap warning (13–15), amber low warning (10–11), and red critical badges in `src/client/components/HeadcountCalendar.tsx`
- [x] T039 [US4] Integrate capacity impact preview into VolunteerModal when adjusting arrival/departure dates in `src/client/components/VolunteerModal.tsx`
- [x] T040 [US4] Create AdminHeadcountPage for management overview of long-term volunteer occupancy in `src/client/pages/AdminHeadcountPage.tsx`

**Checkpoint**: Capacity tracking and headcount calendar operational.

---

## Phase 7: User Story 5 - Volunteer Self-Service Portal & Time-Off Requests (Priority: P4)

**Goal**: Allow volunteers to access their upcoming shifts and hostel weekly schedule on their mobile phones via passwordless magic links, and submit time-off requests for management review and approval.

**Independent Test**: Open a volunteer's magic link token in an incognito mobile browser, view assigned shifts and weekly schedule with peer flags, submit a day-off request, approve it as manager, and verify the day off is locked against scheduling.

### Tests for User Story 5

- [x] T041 [P] [US5] Integration tests for magic-link authentication, portal data retrieval, and time-off request flow in `tests/api/portal.test.ts`

### Implementation for User Story 5

- [x] T042 [US5] Implement time-off request service and manager review endpoints (`GET /api/admin/time-off`, `POST /api/admin/time-off/:id/review`) in `src/server/routes/admin-timeoff.ts`
- [x] T043 [US5] Implement magic-link authenticated portal endpoints (`GET /api/portal/me`, `POST /api/portal/time-off`) in `src/server/routes/portal.ts`
- [x] T044 [P] [US5] Build TimeOffModal for submitting day-off requests in `src/client/components/TimeOffModal.tsx`
- [x] T045 [US5] Implement mobile-optimized VolunteerPortalPage showing upcoming shifts, weekly roster overview with flags, and time-off request status in `src/client/pages/VolunteerPortalPage.tsx`

**Checkpoint**: Volunteer self-service portal and time-off workflow active.

---

## Phase 8: User Story 6 - Paid Staff Coverage & Staff PTO Handling (Priority: P5)

**Goal**: Manage regular paid staff assignments on daily reception shifts and handle paid staff PTO periods so volunteer coverage can be backfilled during staff absences.

**Independent Test**: Assign a paid staff member to a reception day shift, mark them on PTO for a given date, and observe the slot become open and available for qualified volunteer assignment.

### Tests for User Story 6

- [x] T046 [P] [US6] Integration tests for paid staff assignments and staff PTO coverage backfill in `tests/api/staff.test.ts`

### Implementation for User Story 6

- [x] T047 [US6] Implement staff PTO endpoints and volunteer eligibility override for reception day shifts in `src/server/routes/admin-staff.ts`
- [x] T048 [US6] Update RosterGrid and assignment modals to allow assigning paid staff and visual PTO absence indicators in `src/client/components/RosterGrid.tsx`

**Checkpoint**: Paid staff PTO and volunteer backfill coverage operational.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end verification, Proxmox deployment configuration, and quality gates

- [x] T049 [P] End-to-end quickstart verification run following `specs/001-volunteer-rostering/quickstart.md`
- [x] T050 [P] Create native Proxmox LXC systemd service and deployment guide in `deploy/rostertool.service`, `deploy/setup-proxmox-lxc.sh`, and `README.md`
- [x] T051 Perform strict TypeScript typecheck (`tsc --noEmit`), code cleanup, and performance audit across all views

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
     │
     ▼
Phase 2: Foundational (BLOCKS all user stories)
     │
     ├──────────────────────┬──────────────────────┬──────────────────────┐
     ▼                      ▼                      ▼                      ▼
Phase 3: US1 (P1)      Phase 4: US2 (P2)      Phase 5: US3 (P3)      Phase 6: US4 (P3)
Weekly Grid 🎯 MVP     Auto-Populate Solver    Lifecycle & Sources    Headcount Calendar
     │                      │                      │                      │
     └──────────────────────┴──────────┬───────────┴──────────────────────┘
                                       ▼
                              Phase 7: US5 (P4)
                              Volunteer Portal & Time-Off
                                       ▼
                              Phase 8: US6 (P5)
                              Paid Staff & PTO
                                       ▼
                              Phase 9: Polish & Validation
```

### Parallel Opportunities

- **Phase 1**: T003 (`vite.config.ts`) and T004 (`drizzle.config.ts`) can run in parallel.
- **Phase 2**: T008 (`seed.ts`), T009 (`index.ts`), and T010 (`CountryFlag.tsx`) can run in parallel once T006 (`schema.ts`) is complete.
- **Phase 4 (US2 Engine Tests)**: T018, T019, T020, and T021 can all be written concurrently.
- **Phase 4 (Engine Implementation)**: T023 (`types.ts`) and T024 (`pro-rate.ts`) can run in parallel.
- **Components across Stories**: UI components (T015, T033, T038, T044) can be developed independently of backend routes.

---

## Implementation Strategy: MVP First

1. **Step 1**: Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. **Step 2**: Implement Phase 3 (User Story 1).
3. **Step 3 - STOP & VALIDATE**: Verify manual weekly shift scheduling, volunteer flag rendering, and understaffed highlighting. This delivers an immediate working MVP!
4. **Step 4**: Implement Phase 4 (Auto-Populate solver with TDD tests) $\to$ test independently.
5. **Step 5**: Implement Phase 5 (Lifecycle & Sources) and Phase 6 (Headcount Calendar) $\to$ test independently.
6. **Step 6**: Implement Phase 7 (Volunteer Portal) and Phase 8 (Paid Staff PTO) $\to$ test independently.
7. **Step 7**: Run Phase 9 polish and quickstart verification.

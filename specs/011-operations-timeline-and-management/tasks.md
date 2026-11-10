# Tasks: Hostel Operations, Staffing Timeline & Volunteer Management Enhancements

**Input**: Design documents from `/specs/011-operations-timeline-and-management/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `.specify/memory/constitution.md`

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story mapping ([US1], [US2], [US3], [US4], [US5], [US6])
- Exact file paths included in all tasks

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify dependencies and environment for feature 011

- [x] T001 [P] Verify project dependencies and environment for feature 011 in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema additions, multi-stay table, auto-migrations, and date utilities

- [x] T002 Add `gender`, `source`, and `noEndDate` to `volunteers` table and create `volunteerStays` table in `src/server/db/schema.ts`
- [x] T003 Auto-migrate columns, create `volunteer_stays` table, seed default headcount and date format settings, and backfill existing volunteers into initial stay records in `src/server/db/client.ts`
- [x] T004 [P] Add date, day-of-week, and age calculation helpers (`calculateAge`, `formatDateWithDay`, `formatDateWithPreference`) in `src/client/utils/date-utils.ts`

**Checkpoint**: Foundation ready - database tables, migrations, and date utilities active.

---

## Phase 3: User Story 1 - Manual Rostering Assignment Guards & Over-Allocation Warnings (Priority: P1)

**Goal**: Prevent assigning reception shifts to non-reception trained volunteers, enforce stay date boundaries, and warn with current hours on over-allocation.

**Independent Test**: Attempt assigning non-reception volunteer to reception (blocked); attempt assigning outside stay dates (rejected); assign volunteer with $\ge 16$ hours (triggers confirmation modal with current hours).

### Tests for User Story 1

- [x] T005 [P] [US1] Unit and integration tests for stay date boundaries and reception qualification filtering in `tests/api/roster-guards.test.ts`

### Implementation for User Story 1

- [x] T006 [US1] Enforce stay date boundary guards and calculate weekly assigned hours in `src/server/services/roster-service.ts` and `src/server/routes/admin-roster.ts`
- [x] T007 [US1] Update `src/client/components/ShiftAssignModal.tsx` to strictly filter non-reception volunteers, disable candidates outside stay dates, and show confirmation dialog with current assigned hours when $\ge 16$ hours with manager override

**Checkpoint**: User Story 1 complete - rostering guards and over-allocation warning active.

---

## Phase 4: User Story 2 - Volunteer Management, Departure Modal, Rehire Badges & Stay History (Priority: P1)

**Goal**: Support gender symbols, age display, 5-star departure review modal, colored rehire badges, multi-stay history, re-activate modal, and filters.

**Independent Test**: Toggle "No end date"; check gender symbol; click "Mark as Departed" to record stars/notes/rehire; view stars and green/yellow/red rehire badge; re-activate for new stay; filter by rating/nationality/rehire/gender/dates.

### Tests for User Story 2

- [x] T008 [P] [US2] Integration tests for multi-stay lifecycle, departure review, re-activation, and stay history in `tests/api/volunteers-stays.test.ts`

### Implementation for User Story 2

- [x] T009 [US2] Implement `/depart`, `/reactivate`, and `/stays` backend endpoints in `src/server/routes/admin-volunteers.ts`
- [x] T010 [P] [US2] Build `DepartureModal.tsx` with 5-star rating control, comments textarea, and 3-state rehire dropdown in `src/client/components/DepartureModal.tsx`
- [x] T011 [P] [US2] Build `ReactivateModal.tsx` and `StayHistoryModal.tsx` in `src/client/components/`
- [x] T012 [US2] Update `src/client/pages/AdminVolunteersPage.tsx` to display gender symbols (`♂`, `♀`, `⚧`, `⚪`), calculated Age instead of birth date, visual stars (★), colored rehire badges, and integrate departure/reactivate modals
- [x] T013 [US2] Implement filter controls bar in `src/client/pages/AdminVolunteersPage.tsx` for rating, nationality, rehire eligibility, gender, and date range

**Checkpoint**: User Story 2 complete - comprehensive volunteer lifecycle and stay history management active.

---

## Phase 5: User Story 3 - Visual Staffing Timeline View (Priority: P1)

**Goal**: Provide a 5+ week horizontal calendar timeline view partitioned into Reception, Housekeeping, and Applied tiers with daily confirmed staff count totals.

**Independent Test**: Open `/admin/timeline`; verify Reception, Housekeeping, and Applied sections with 5+ weeks calendar days, stay bars, and color-coded daily confirmed totals row.

### Tests for User Story 3

- [x] T014 [P] [US3] Integration test for timeline endpoint and daily confirmed staff count aggregation in `tests/api/timeline.test.ts`

### Implementation for User Story 3

- [x] T015 [US3] Implement `GET /api/admin/timeline` endpoint with 5+ weeks calendar days, Reception/Housekeeping/Applied groupings, and daily confirmed staff counts in `src/server/routes/admin-timeline.ts`
- [x] T016 [US3] Register `adminTimelineRoutes` in `src/server/index.ts`
- [x] T017 [US3] Build `AdminTimelinePage.tsx` in `src/client/pages/AdminTimelinePage.tsx` matching `image.png` with horizontal 5+ week calendar, procedural stay bars, left volunteer columns, and color-coded daily confirmed totals row
- [x] T018 [US3] Add "Timeline" navigation link in `AdminLayout` header and route in `src/client/App.tsx`

**Checkpoint**: User Story 3 complete - staffing timeline view fully functional.

---

## Phase 6: User Story 4 - Configurable Headcount Targets & Global Date Format in Settings (Priority: P2)

**Goal**: Configure headcount thresholds (Baseline, Low, Critical, Overbooked) and choose between `YYYY-MM-DD` and `DD-MM-YYYY` formats.

**Independent Test**: Navigate to `/admin/settings`; edit headcount thresholds; toggle date format to `DD-MM-YYYY`; verify all displayed dates conform across views.

### Tests for User Story 4

- [x] T019 [P] [US4] Integration tests for headcount targets and date format preference in `tests/api/settings.test.ts`

### Implementation for User Story 4

- [x] T020 [US4] Update `src/server/routes/admin-settings.ts` to support reading and saving headcount thresholds (Baseline, Low, Critical, Overbooked) and `date_format_preference`
- [x] T021 [US4] Update `src/client/pages/AdminSettingsPage.tsx` to provide UI controls for headcount targets and date format dropdown (`YYYY-MM-DD` vs `DD-MM-YYYY`)

**Checkpoint**: User Story 4 complete - headcount thresholds and date format preference configured.

---

## Phase 7: User Story 5 - Data Backup Export & Historical Data Migration (Priority: P2)

**Goal**: Export full database backup snapshot and provide a CLI migration script to import historical CSV data from spreadsheets.

**Independent Test**: Click "Download Database Backup" in Settings; run `npm run import:history -- sample.csv` and verify records imported into SQLite.

### Tests for User Story 5

- [x] T022 [P] [US5] Integration test for database backup export endpoint in `tests/api/backup.test.ts`

### Implementation for User Story 5

- [x] T023 [US5] Implement `GET /api/admin/backup/export` endpoint streaming SQLite database file in `src/server/routes/admin-backup.ts` and add download button in `src/client/pages/AdminSettingsPage.tsx`
- [x] T024 [P] [US5] Build standalone CLI migration script `scripts/import-historical-data.ts` to parse CSV exported from legacy `STAFF.ods` and seed volunteers/stays

**Checkpoint**: User Story 5 complete - backup export and historical data migration ready.

---

## Phase 8: User Story 6 - Day Names on Volunteer Portal Upcoming Shifts & Time-Off Requests (Priority: P2)

**Goal**: Display day of week names alongside dates on upcoming shifts and time-off request cards in `/portal`.

**Independent Test**: Open volunteer portal; verify upcoming shifts and time-off requests show day names (e.g., `Monday, 2026-11-09`).

### Implementation for User Story 6

- [x] T025 [US6] Update `src/client/pages/VolunteerPortalPage.tsx` to display day of the week name alongside date on upcoming shifts and time-off request cards

**Checkpoint**: User Story 6 complete - day names rendered on volunteer portal.

---

## Phase 9: Polish & Validation

**Purpose**: End-to-end verification, regression check, and production build check

- [x] T026 [P] Execute end-to-end quickstart validation scenarios from `specs/011-operations-timeline-and-management/quickstart.md`
- [x] T027 Run full automated test suite (`npm test`) and production build check (`npm run build`)

---

## Dependencies & Execution Order

```
Phase 1: Setup
     │
     ▼
Phase 2: Foundational (Schema, Multi-Stay Table, Date Helpers)
     │
     ├──────────────────────┬──────────────────────┬──────────────────────┐
     ▼                      ▼                      ▼                      ▼
Phase 3: US1 (P1)      Phase 4: US2 (P1)      Phase 5: US3 (P1)      Phase 6: US4 (P2)
Roster Guards          Volunteer Lifecycle    Timeline View          Settings Targets
     │                      │                      │                      │
     └──────────────────────┴──────────┬───────────┴──────────────────────┘
                                       │
     ┌─────────────────────────────────┴──────────────────────────────────┐
     ▼                                                                    ▼
Phase 7: US5 (P2) Data Backup & Import CLI           Phase 8: US6 (P2) Portal Day Names
     │                                                                    │
     └─────────────────────────────────┬──────────────────────────────────┘
                                       ▼
                         Phase 9: Polish & Validation
```

### Parallel Opportunities

- **Phase 3 & Phase 4**: Roster guards (`ShiftAssignModal.tsx`) and volunteer lifecycle modals (`DepartureModal.tsx`, `ReactivateModal.tsx`) edit different files.
- **Phase 4**: `DepartureModal.tsx` (T010) and `ReactivateModal.tsx` / `StayHistoryModal.tsx` (T011) can be developed concurrently.
- **Phase 5 & Phase 6**: Timeline view (`AdminTimelinePage.tsx`) and settings updates (`AdminSettingsPage.tsx`) are independent.
- **Phase 7 & Phase 8**: CLI migration script (`scripts/import-historical-data.ts`) and portal UI (`VolunteerPortalPage.tsx`) can be implemented in parallel.

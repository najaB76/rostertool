# Tasks: Roster Fixes, Width Expansion & Housekeeping Settings

**Input**: Design documents from `/specs/010-roster-fixes-and-settings/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `.specify/memory/constitution.md`

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story mapping ([US1], [US2], [US3], [US4], [US5])
- Exact file paths included in all tasks

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify dependencies and environment for feature 010

- [x] T001 [P] Verify project dependencies and environment for feature 010 in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema additions, duplicate deduplication, and settings table initialization

- [x] T002 Add `systemSettings` table to `src/server/db/schema.ts` and initialize table with default settings and staff unique index in `src/server/db/client.ts`
- [x] T003 Clean up existing duplicate shift assignment rows in `src/server/db/client.ts`

**Checkpoint**: Foundation ready - database constraints and system settings table active.

---

## Phase 3: User Story 1 - Shift Assignment Removal Bug Fix (Priority: P1)

**Goal**: Fix the bug where clicking "×" remove re-assigned or duplicated staff/volunteers.

**Independent Test**: Assign staff member to a shift. Click "×" remove. Confirm. Verify staff member is deleted from that shift slot and not duplicated. Repeat for volunteer.

### Tests for User Story 1

- [x] T004 [P] [US1] Unit and integration tests for dedicated unassign endpoint in `tests/api/roster.test.ts`

### Implementation for User Story 1

- [x] T005 [US1] Implement dedicated `POST /api/admin/roster/unassign` endpoint in `src/server/routes/admin-roster.ts`
- [x] T006 [US1] Update `handleRemoveClick` in `src/client/pages/AdminRosterPage.tsx` to call `/api/admin/roster/unassign`

**Checkpoint**: User Story 1 complete - removing staff and volunteers works reliably.

---

## Phase 4: User Story 2 - Duplicate Assignment Prevention Guard (Priority: P1)

**Goal**: Prevent any staff member or volunteer from being assigned more than once to the same shift slot on the same date.

**Independent Test**: Attempt assigning the same staff member twice to the same shift on the same date. Verify duplicate is rejected and only 1 assignment exists.

### Tests for User Story 2

- [x] T007 [P] [US2] Unit test verifying duplicate staff and volunteer assignments are blocked in `tests/api/roster.test.ts`

### Implementation for User Story 2

- [x] T008 [US2] Enforce uniqueness check in `rosterService.assignShift` in `src/server/services/roster-service.ts`

**Checkpoint**: User Story 2 complete - duplicate assignments strictly prevented.

---

## Phase 5: User Story 3 - Full-Width Dynamic Roster Layout (Priority: P1)

**Goal**: Expand roster container up to 95% of viewport width to eliminate sideways scrolling on desktop.

**Independent Test**: Open `/admin/roster` on desktop. Verify layout expands up to 95% of screen width and all 7 days fit horizontally without scrolling.

### Implementation for User Story 3

- [x] T009 [US3] Update `.admin-main` max-width to `95%` in `src/client/styles/main.css` to eliminate horizontal scrolling on desktop

**Checkpoint**: User Story 3 complete - widescreen dynamic layout active.

---

## Phase 6: User Story 4 - Housekeeping Operational Settings (Priority: P1)

**Goal**: Provide a Settings page to customize housekeepers per day (default 3), shifts per week (default 4), and shift hours (default 10:00-14:00).

**Independent Test**: Navigate to `/admin/settings`. Update housekeepers per day to 4. Save. Verify roster housekeeping slots now require 4 staff (`0 / 4`) and auto-populate schedules 4 housekeepers.

### Tests for User Story 4

- [x] T010 [P] [US4] Unit tests for settings GET and POST endpoints in `tests/api/settings.test.ts`

### Implementation for User Story 4

- [x] T011 [US4] Implement `GET` and `POST /api/admin/settings` routes and sync with `shift_definitions` in `src/server/routes/admin-settings.ts`
- [x] T012 [US4] Register settings route in `src/server/index.ts` and incorporate dynamic settings in `src/server/routes/admin-roster.ts`
- [x] T013 [US4] Build `AdminSettingsPage` component in `src/client/pages/AdminSettingsPage.tsx` and add "Settings" link in `src/client/App.tsx`

**Checkpoint**: User Story 4 complete - operational housekeeping settings functional.

---

## Phase 7: User Story 5 - Automatic Time-Off End Date Defaulting (Priority: P2)

**Goal**: Default End Date to match Start Date whenever Start Date is picked in the volunteer portal.

**Independent Test**: In portal, open "Request Time Off". Select Start Date. Verify End Date is automatically set to the same date with 1-day summary preview.

### Implementation for User Story 5

- [x] T014 [US5] Default `endDate` to match `startDate` on date change in `src/client/components/TimeOffModal.tsx`

**Checkpoint**: User Story 5 complete - 1-click single-day leave requests enabled.

---

## Phase 8: Polish & Validation

**Purpose**: End-to-end verification, build check, and test coverage

- [x] T015 [P] Run end-to-end quickstart verification scenarios from `specs/010-roster-fixes-and-settings/quickstart.md`
- [x] T016 Execute full automated test suite (`npm test`) and production build (`npm run build`)

---

## Dependencies & Execution Order

```
Phase 1: Setup
     │
     ▼
Phase 2: Foundational (Deduplication & system_settings table)
     │
     ├──────────────────────┬──────────────────────┬──────────────────────┐
     ▼                      ▼                      ▼                      ▼
Phase 3: US1 (P1)      Phase 4: US2 (P1)      Phase 5: US3 (P1)      Phase 6: US4 (P1)
Unassign Bug Fix       Duplicate Prevention   95% Width Layout       Settings Page
     │                      │                      │                      │
     └──────────────────────┴──────────┬───────────┴──────────────────────┘
                                       ▼
                              Phase 7: US5 (P2) Time-Off Date Defaulting
                                       ▼
                              Phase 8: Polish & Validation
```

### Parallel Opportunities

- **Phase 3 & Phase 4**: Both unassign bug fix and duplicate prevention guards can be implemented in `roster-service.ts` and tested together in `roster.test.ts`.
- **Phase 5 & Phase 7**: CSS 95% width update and `TimeOffModal` date change can be edited in parallel.
- **Phase 6**: `AdminSettingsPage.tsx` and backend settings routes can be developed independently.

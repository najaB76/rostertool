# Tasks: Timeline Interactivity, Historical Staffing, and Volunteer Edit Enhancements

**Input**: Design documents from `/specs/018-timeline-interactivity-and-history-fixes/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`
**Status**: Ready for implementation

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

---

## Phase 1: Setup

- [x] T001 [P] Verify project dependencies and environment in `package.json`

---

## Phase 2: Foundational

- [x] T002 Verify database client and `volunteer_stays` table access in `src/server/db/client.ts`

---

## Phase 3: User Story 4 - Fix Volunteer Application Source Synchronization (Priority: P1)

**Goal**: Ensure when a user selects or enters a source (e.g. HelpX) in `VolunteerModal`, it is saved to both `volunteers.source` and `volunteers.applicationSourceId`, and accurately displayed on volunteer cards and timeline rows instead of defaulting to 'Other'.

**Independent Test**: Edit a volunteer in `VolunteerModal`, select or type 'HelpX', save. Verify `/admin/volunteers` card displays "Source: HelpX" and `/admin/timeline` Source column displays "HelpX".

### Implementation for User Story 4

- [x] T003 [US4] Update `src/server/services/volunteer-service.ts` to synchronize `volunteers.source` with `applicationSourceName` during volunteer creation and update
- [x] T004 [US4] Update `src/server/routes/admin-timeline.ts` and `src/client/pages/AdminVolunteersPage.tsx` to resolve and display the synchronized source name

**Checkpoint**: User Story 4 complete - source is accurately saved and displayed across all views.

---

## Phase 4: User Story 1 - Historical Staffing & Point-in-Time Status on Timeline (Priority: P1)

**Goal**: When scrolling backwards in time, the timeline must include all volunteers who had active stays during that date window (even if currently 'Departed') and render their point-in-time status so management can see who was on staff together.

**Independent Test**: Seed a volunteer with a stay 2 months ago and status `Departed`. Query `GET /api/admin/timeline` for that past window. Verify the volunteer appears in reception or housekeeping with their active stay bar, and is included in the daily confirmed counts.

### Tests for User Story 1

- [x] T005 [P] [US1] Add integration test in `tests/api/timeline.test.ts` asserting historical stays appear in timeline tiers and daily confirmed counts when querying past date ranges

### Implementation for User Story 1

- [x] T006 [US1] Update `src/server/routes/admin-timeline.ts` to query volunteers with active or historical stays (`volunteer_stays`) overlapping the window and compute point-in-time status

**Checkpoint**: User Story 1 complete - historical staffing audit works seamlessly when scrolling backwards.

---

## Phase 5: User Story 3 - Running Daily Total Row for Applied Candidates (Priority: P2)

**Goal**: Add a running daily total row beneath the Unconfirmed (Applied Candidates) section on the timeline to track daily applicant pipeline volume.

**Independent Test**: Open `/admin/timeline` on a date window with applied candidates. Scroll to bottom of Unconfirmed section and verify the "Total APPLIED Candidates" row displays accurate daily sums matching the columns.

### Implementation for User Story 3

- [x] T007 [US3] Update `src/server/routes/admin-timeline.ts` to compute `dailyAppliedCounts` and `src/client/pages/AdminTimelinePage.tsx` to render the "Total APPLIED Candidates" summary row

**Checkpoint**: User Story 3 complete - running total row rendered under applied candidates.

---

## Phase 6: User Story 2 - Interactive Timeline Actions (Name Link & Status Change) (Priority: P1)

**Goal**: Allow clicking a volunteer's name on the timeline to open `VolunteerModal`, and clicking the status pill to directly transition status (`In da house`, `Departed` via `DepartureModal`, `Reactivate` via `ReactivateModal`, `Cancel`). Refresh timeline after any change.

**Independent Test**: On `/admin/timeline`, click a volunteer's name to open `VolunteerModal`, edit and save, verify timeline refreshes. Click status pill of an active volunteer, select 'Depart', submit rating/notes, verify status updates to 'Departed' on the timeline.

### Implementation for User Story 2

- [x] T008 [US2] Update `src/client/pages/AdminTimelinePage.tsx` to make volunteer names clickable hyperlinks that open `VolunteerModal` and refresh timeline on save
- [x] T009 [US2] Update `src/client/pages/AdminTimelinePage.tsx` to make status pills interactive buttons with an action menu integrating `DepartureModal` and `ReactivateModal`, refreshing timeline after changes

**Checkpoint**: User Story 2 complete - full volunteer editing and lifecycle transitions directly on timeline.

---

## Phase 7: User Story 5 - Resizable & Esc-Dismissible Volunteer Modal (Priority: P2)

**Goal**: Make `VolunteerModal` resizable by dragging its edge, and dismissible by pressing the `Esc` key.

**Independent Test**: Open `VolunteerModal`, press `Esc` to verify it closes. Drag modal border to verify smooth resizing with minWidth 480px and minHeight 400px.

### Implementation for User Story 5

- [x] T010 [P] [US5] Update `src/client/components/VolunteerModal.tsx` to enable CSS `resize: both` with min/max constraints and add `Escape` keydown listener

**Checkpoint**: User Story 5 complete - modal is resizable and dismissible via `Esc`.

---

## Phase 8: Polish & Validation

**Purpose**: End-to-end verification and regression prevention

- [x] T011 [P] Execute quickstart validation scenarios from `specs/018-timeline-interactivity-and-history-fixes/quickstart.md`
- [x] T012 Run full automated test suite (`npm test`) and production build check (`npm run build`)

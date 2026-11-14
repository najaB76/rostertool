# Tasks: Timeline Applied Candidates Population & Resizable Modal Fix

**Input**: Design documents from `/specs/019-timeline-applied-candidates-and-modal-resize/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`
**Status**: Ready for implementation

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

---

## Phase 1: Setup

- [x] T001 [P] Verify project dependencies and environment in `package.json`

---

## Phase 2: User Story 1 - Populate Timeline Candidate Rows for Accepted & Applied Dates (Priority: P1)

**Goal**: Populate incoming volunteers with `status === 'Accepted'` and `status === 'Applied'` in the candidate section on the timeline for the dates they have been accepted for, ensuring their rows are rendered and their daily totals calculated in the "Total APPLIED Candidates" running total row.

**Independent Test**: Seed a volunteer with status `Accepted` for dates overlapping the timeline window. Query `GET /api/admin/timeline`. Verify they appear in `applied` entries, their stay bar is populated, and `dailyAppliedCounts` reflects them on each scheduled day.

### Tests for User Story 1

- [x] T002 [P] [US1] Add integration test in `tests/api/timeline.test.ts` asserting accepted volunteers appear in `applied` entries for their accepted dates and drive `dailyAppliedCounts`

### Implementation for User Story 1

- [x] T003 [US1] Update `src/server/routes/admin-timeline.ts` to populate incoming accepted (`status === 'Accepted'`) and applied (`status === 'Applied'`) volunteers in `appliedEntries` for their scheduled dates
- [x] T004 [US1] Update `src/client/pages/AdminTimelinePage.tsx` section header and empty state copy to accurately reflect incoming accepted and applied candidates

**Checkpoint**: User Story 1 complete - candidate section is populated with incoming accepted volunteers and daily counts tally accurately.

---

## Phase 3: User Story 2 - Smooth & Reliable Drag-to-Resize for Volunteer Modal (Priority: P1)

**Goal**: Implement an interactive, cross-browser mouse-drag resize handle on `VolunteerModal` allowing users to smoothly click and drag the bottom-right corner to adjust width and height.

**Independent Test**: Open `VolunteerModal`, drag the bottom-right corner handle diagonally outward. Verify modal dimensions resize in real time following the cursor, respecting min/max boundary constraints. Press `Esc` to verify instant dismissal.

### Implementation for User Story 2

- [x] T005 [P] [US2] Update `src/client/components/VolunteerModal.tsx` to add an interactive mouse-drag resize handler with corner grip, maintaining `minWidth: 480px` and `minHeight: 400px` constraints

**Checkpoint**: User Story 2 complete - modal is smoothly resizable via mouse drag and dismissible via `Esc`.

---

## Phase 4: Polish & Validation

**Purpose**: End-to-end verification and regression prevention

- [x] T006 [P] Execute quickstart validation scenarios from `specs/019-timeline-applied-candidates-and-modal-resize/quickstart.md`
- [x] T007 Run full automated test suite (`npm test`) and production build check (`npm run build`)

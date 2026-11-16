# Tasks: Timeline Hierarchy, Roster Assignment Accuracy, and Visual Enhancements

**Input**: Design documents from `/specs/021-timeline-roster-ux-improvements/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`
**Status**: Ready for implementation

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

---

## Phase 1: Setup

- [x] T001 [P] Verify project dependencies and environment in `package.json`

---

## Phase 2: User Story 1 - Timeline Tier Separation: Confirmed Staffing vs Unconfirmed Pipeline (Priority: P1)

**Goal**: Place confirmed volunteers (`Active` and `Accepted`, plus historical on-site stays) into operational departments (`reception` or `housekeeping`) and calculate total confirmed bed demand, while keeping the bottom section strictly for candidates in the `'Applied'` state (unconfirmed pipeline).

**Independent Test**: Seed a volunteer with `status: 'Accepted'` and another with `status: 'Applied'`. Call `GET /api/admin/timeline`. Verify the accepted volunteer appears in `reception`/`housekeeping` and in `dailyConfirmedCounts`. Verify the applied volunteer appears in `applied` and in `dailyAppliedCounts`. Verify past stays remain visible when scrolling back.

### Tests for User Story 1

- [x] T002 [P] [US1] Update `tests/api/timeline.test.ts` to assert `Accepted` volunteers appear in operational departments and `Applied` in candidate pool, with accurate confirmed and applied counts

### Implementation for User Story 1

- [x] T003 [US1] Update `src/server/routes/admin-timeline.ts` to place `Active` and `Accepted` volunteers into `reception` or `housekeeping`, and restrict `applied` to `status === 'Applied'`
- [x] T004 [US1] Update `src/client/pages/AdminTimelinePage.tsx` section titles and empty messages to reflect Confirmed Staff and Unconfirmed Applied candidates

**Checkpoint**: User Story 1 complete - confirmed staff in operational tiers and unconfirmed pool in bottom section.

---

## Phase 3: User Story 2 - Shift-Day In-House Candidate Filter for Manual Assignment (Priority: P1)

**Goal**: Filter candidates in `ShiftAssignModal` strictly for the shift date $D$ (`shift.date`), displaying only and all volunteers who are or will be in-house on date $D$ (including accepted upcoming volunteers for date $D$), and excluding any volunteers who departed prior to $D$.

**Independent Test**: In `ShiftAssignModal` for a shift on date $D$, verify candidate list includes volunteers with `arrivalDate <= D && departureDate >= D` and `status IN ('Active', 'Accepted')`, and excludes volunteers who departed before $D$.

### Implementation for User Story 2

- [x] T005 [P] [US2] Update `src/client/components/ShiftAssignModal.tsx` to filter candidates strictly by the selected shift date presence (`arrivalDate <= shift.date && departureDate >= shift.date`)

**Checkpoint**: User Story 2 complete - candidate selection accurately targets in-house volunteers for that specific shift day.

---

## Phase 4: User Story 3 - Sticky Name Column on Timeline Grid (Priority: P2)

**Goal**: Pin the Sex (Col A) and Name with Flag (Col B) columns on the left side of the timeline table with `position: sticky` so they remain visible when scrolling horizontally across weeks.

**Independent Test**: On `/admin/timeline`, scroll horizontally to week 4 or 5. Verify the Sex and Name columns remain pinned to the left edge of the table.

### Implementation for User Story 3

- [x] T006 [P] [US3] Update `src/client/pages/AdminTimelinePage.tsx` to make Sex and Name columns sticky (`position: sticky`) with proper z-indices and solid backgrounds for header and body rows

**Checkpoint**: User Story 3 complete - name column remains anchored and visible during horizontal scrolling.

---

## Phase 5: User Story 4 - Clickable Date Header Column Highlighting (Priority: P2)

**Goal**: Allow clicking any date column header on the timeline to toggle a vertical highlight for that date column across all table rows.

**Independent Test**: On `/admin/timeline`, click a date in the header row. Verify that date's entire column is highlighted. Click the same date again to toggle the highlight off.

### Implementation for User Story 4

- [x] T007 [P] [US4] Update `src/client/pages/AdminTimelinePage.tsx` to add `highlightedDate` state and apply vertical column highlighting when clicking date headers

**Checkpoint**: User Story 4 complete - interactive date column highlighting is functional.

---

## Phase 6: User Story 5 - Training Status Highlight on Printable Roster (Priority: P2)

**Goal**: On `PrintableRosterView.tsx`, render shift assignment cells with a light yellow background (`#fef9c3`) when the assigned volunteer has `inTraining === true`.

**Independent Test**: Assign a volunteer with `inTraining: true` to a shift. Open `PrintableRosterView`. Verify their shift cell has a light yellow background.

### Implementation for User Story 5

- [x] T008 [P] [US5] Update `src/client/components/PrintableRosterView.tsx` to render light yellow background (`#fef9c3`) for volunteers in training

**Checkpoint**: User Story 5 complete - trainee shifts highlighted on printable roster.

---

## Phase 7: Polish & Validation

**Purpose**: End-to-end verification and regression prevention

- [x] T009 [P] Execute quickstart validation scenarios from `specs/021-timeline-roster-ux-improvements/quickstart.md`
- [x] T010 Run full automated test suite (`npm test`) and production build check (`npm run build`)

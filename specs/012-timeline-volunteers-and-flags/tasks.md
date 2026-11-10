# Tasks: Timeline View Volunteer-Only Scope & Country Column Removal

**Input**: Design documents from `/specs/012-timeline-volunteers-and-flags/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `.specify/memory/constitution.md`

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story mapping ([US1], [US2])
- Exact file paths included in all tasks

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify project dependencies and environment for feature 012

- [x] T001 [P] Verify project dependencies and environment in `package.json`

---

## Phase 2: User Story 1 - Exclude Paid Staff from Staffing Timeline (Priority: P1)

**Goal**: Exclude permanent paid staff (`staffUsers`) from `/api/admin/timeline` and the client UI, restricting all tiers and daily confirmed counts exclusively to volunteers.

**Independent Test**: Seed both paid staff and volunteers. Call `GET /api/admin/timeline`. Verify no staff IDs or records appear in `reception`, `housekeeping`, or `applied`, and daily confirmed counts only tally on-site active/accepted volunteers.

### Tests for User Story 1

- [x] T002 [P] [US1] Update integration test in `tests/api/timeline.test.ts` to assert that paid staff (`staffUsers`) are excluded from timeline sections and daily confirmed counts

### Implementation for User Story 1

- [x] T003 [US1] Remove `staffUsers` query and exclude paid staff from `reception`, `housekeeping`, and `dailyConfirmedCounts` in `src/server/routes/admin-timeline.ts`
- [x] T004 [US1] Update summary row label in `src/client/pages/AdminTimelinePage.tsx` to "Total CONFIRMED Volunteers"

**Checkpoint**: User Story 1 complete - timeline view and counts are strictly volunteer-only.

---

## Phase 3: User Story 2 - Remove Redundant Country Column & Rely on SVG Flag Adjacent to Name (Priority: P1)

**Goal**: Remove the separate Country column from the timeline table to expand horizontal calendar space, and ensure authentic SVG flags (`CountryFlag`) are displayed directly adjacent to volunteer names in compliance with Constitution Principle II.

**Independent Test**: Open `/admin/timeline`. Verify the standalone Country column is gone, table headers span 7 columns for personnel details, and each volunteer's name in Column B has an authentic SVG flag.

### Implementation for User Story 2

- [x] T005 [US2] Remove the "Country" column header and cells, and update table colSpans from 8 to 7 in `src/client/pages/AdminTimelinePage.tsx`
- [x] T006 [US2] Verify SVG vector flag is rendered directly adjacent to volunteer names in Column B in `src/client/pages/AdminTimelinePage.tsx`

**Checkpoint**: User Story 2 complete - redundant text column eliminated, SVG flags preserved, calendar horizontal space maximized.

---

## Phase 4: Polish & Validation

**Purpose**: End-to-end verification, regression check, and production build check

- [x] T007 [P] Execute quickstart validation scenarios from `specs/012-timeline-volunteers-and-flags/quickstart.md`
- [x] T008 Run full automated test suite (`npm test`) and production build check (`npm run build`)

---

## Dependencies & Execution Order

```
Phase 1: Setup
     │
     ├────────────────────────────────────┐
     ▼                                    ▼
Phase 2: US1 (P1) Paid Staff Exclusion   Phase 3: US2 (P1) Country Column Removal
     │                                    │
     └─────────────────┬──────────────────┘
                       ▼
         Phase 4: Polish & Validation
```

### Parallel Opportunities

- **T002 & T005**: Integration test update in `tests/api/timeline.test.ts` and table layout update in `AdminTimelinePage.tsx` can be executed concurrently.
- **T003 & T005**: Backend endpoint logic and frontend column removal touch independent files.

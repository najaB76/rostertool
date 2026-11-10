# Tasks: Roster, Lifecycle & Headcount Refinements

**Input**: Design documents from `/specs/002-roster-lifecycle-refinements/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `.specify/memory/constitution.md`

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story mapping ([US1], [US2], [US3], [US4])
- Exact file paths included in all tasks

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify and prepare project dependencies for refinements

- [x] T001 [P] Verify project dependencies and environment for feature 002 in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data catalogs and schema adjustments required before user stories

- [x] T002 [P] Create static country catalog with ISO codes, country names, and flag emojis in `src/client/data/countries.ts`
- [x] T003 Update shift definition seed data with explicit day-of-week indexing for evening shifts in `src/server/db/seed.ts`

**Checkpoint**: Foundation ready - user story implementation can begin.

---

## Phase 3: User Story 1 - Clean Three-Shift Daily Roster View (Priority: P1)

**Goal**: Ensure every day column on the weekly roster displays exactly three shift sections: Housekeeping, Reception Day, and the day-appropriate Reception Evening shift (Sunday–Thursday vs Friday–Saturday).

**Independent Test**: Load the weekly roster for any week. Verify every day column contains exactly 3 shift slots and that non-applicable evening shifts are completely hidden.

### Tests for User Story 1

- [x] T004 [P] [US1] Unit and integration tests for 3-shift daily schedule filtering in `tests/api/roster.test.ts`

### Implementation for User Story 1

- [x] T005 [US1] Update `RosterService.getWeeklyRoster` and auto-populate query to enforce 3-shift day filtering in `src/server/services/roster-service.ts` and `src/server/routes/admin-roster.ts`
- [x] T006 [US1] Update `RosterGrid.tsx` to render the clean 3-shift layout per day column in `src/client/components/RosterGrid.tsx`

**Checkpoint**: User Story 1 complete - roster grid displays exactly three shifts per day.

---

## Phase 4: User Story 2 - Volunteer Lifecycle State Transitions (Priority: P1)

**Goal**: Provide direct management action buttons to advance volunteers across all lifecycle states (`Applied` $\to$ `Accepted` $\to$ `Active` $\to$ `Departed` / `Cancelled`).

**Independent Test**: Advance an applicant from `Applied` to `Accepted`, then to `Active`, and finally to `Departed` with exit review; verify each status transition updates immediately.

### Tests for User Story 2

- [x] T007 [P] [US2] Integration tests for lifecycle transitions (accept, activate, cancel) in `tests/api/volunteers.test.ts`

### Implementation for User Story 2

- [x] T008 [US2] Implement `acceptVolunteer`, `activateVolunteer`, and `cancelVolunteer` service methods in `src/server/services/volunteer-service.ts`
- [x] T009 [US2] Expose `/api/admin/volunteers/:id/accept`, `/api/admin/volunteers/:id/activate`, and `/api/admin/volunteers/:id/cancel` endpoints in `src/server/routes/admin-volunteers.ts`
- [x] T010 [US2] Add lifecycle transition action buttons and acceptance confirmation dialog in `src/client/pages/AdminVolunteersPage.tsx`

**Checkpoint**: User Stories 1 and 2 functional - complete lifecycle control enabled.

---

## Phase 5: User Story 3 - Country Flag & Source Dropdowns, Universal Notes (Priority: P2)

**Goal**: Replace free-text inputs with structured dropdowns for nationalities (with country names and flags) and application sources, and make notes universally viewable and editable in all statuses.

**Independent Test**: Create/edit a volunteer using the country flag dropdown and source dropdown. Verify notes can be updated and saved across all statuses.

### Implementation for User Story 3

- [x] T011 [P] [US3] Build searchable `CountrySelect` component with flag previews in `src/client/components/CountrySelect.tsx`
- [x] T012 [US3] Integrate `CountrySelect` and dynamic application source dropdown into `src/client/components/VolunteerModal.tsx`
- [x] T013 [US3] Make notes field universally visible and editable across all volunteer statuses in `src/client/components/VolunteerModal.tsx` and `src/client/pages/AdminVolunteersPage.tsx`

**Checkpoint**: User Story 3 functional - streamlined volunteer data entry and notes tracking.

---

## Phase 6: User Story 4 - Headcount Calendar Navigation & Multi-Scale Heatmaps (Priority: P2)

**Goal**: Add month-by-month navigation buttons and support compact Quarter (3-month) and Year (12-month) heatmap views displaying capacity status colors without text clutter.

**Independent Test**: Navigate months using Previous/Next buttons. Switch to Quarter and Year views, toggle "Compact Heatmap", and verify color-only capacity blocks render smoothly.

### Tests for User Story 4

- [x] T014 [P] [US4] Integration tests for multi-scale headcount queries (Month, Quarter, Year) in `tests/api/headcount.test.ts`

### Implementation for User Story 4

- [x] T015 [US4] Update `HeadcountCalendar.tsx` to support Month, Quarter, and Year display with a compact heatmap mode in `src/client/components/HeadcountCalendar.tsx`
- [x] T016 [US4] Add navigation buttons (Previous, Today, Next) and scale toggle controls to `src/client/pages/AdminHeadcountPage.tsx`

**Checkpoint**: User Story 4 functional - comprehensive headcount navigation and heatmaps operational.

---

## Phase 7: Polish & Validation

**Purpose**: End-to-end verification, build check, and test coverage

- [x] T017 [P] Run end-to-end quickstart verification scenarios from `specs/002-roster-lifecycle-refinements/quickstart.md`
- [x] T018 Execute full automated test suite (`npm test`) and production build (`npm run build`)

---

## Dependencies & Execution Order

```
Phase 1: Setup
     │
     ▼
Phase 2: Foundational (Country catalog, Seed update)
     │
     ├──────────────────────┬──────────────────────┐
     ▼                      ▼                      ▼
Phase 3: US1 (P1)      Phase 4: US2 (P1)      Phase 5: US3 (P2)
3-Shift Day Roster     Lifecycle Transitions  Dropdowns & Notes
     │                      │                      │
     └──────────────────────┴──────────┬───────────┘
                                       ▼
                              Phase 6: US4 (P2)
                              Headcount Navigation & Heatmaps
                                       ▼
                              Phase 7: Polish & Validation
```

### Parallel Opportunities

- **Phase 2**: T002 (`countries.ts`) and T003 (`seed.ts`) can run in parallel.
- **Phase 3 & 4**: US1 backend tests (T004) and US2 backend tests (T007) can be written concurrently.
- **Phase 5**: T011 (`CountrySelect.tsx`) can be built independently of backend changes.
- **Phase 6**: T014 (`headcount.test.ts`) can run in parallel with frontend calendar refactoring.

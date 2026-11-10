# Tasks: Roster Assignment, Country Search & Multi-Day Time-Off

**Input**: Design documents from `/specs/004-roster-assignment-and-timeoff-improvements/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `.specify/memory/constitution.md`

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story mapping ([US1], [US2], [US3])
- Exact file paths included in all tasks

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify and prepare dependencies for feature 004

- [x] T001 [P] Verify project dependencies and environment for feature 004 in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Expand the canonical country dataset to all 266 countries/territories

- [x] T002 [P] Expand `src/client/data/countries.ts` with all 266 countries, territories, and regions with vector flags (including complete Caribbean coverage)

**Checkpoint**: Foundation ready - all countries available for searchable select.

---

## Phase 3: User Story 1 - Interactive Shift Assignment Modal (Priority: P1)

**Goal**: Replace browser `prompt` dialogs with an interactive `ShiftAssignModal` displaying eligible volunteers and staff with flags, roles, weekly hours, and 1-click assignment.

**Independent Test**: Click "+ Assign" on an open shift. Verify a clean modal opens listing active volunteers and staff. Click any candidate and verify they are assigned in 1 click without typing IDs or codes.

### Implementation for User Story 1

- [x] T003 [US1] Build `ShiftAssignModal` component listing eligible active volunteers and staff members with flags, roles, and weekly hours in `src/client/components/ShiftAssignModal.tsx`
- [x] T004 [US1] Integrate `ShiftAssignModal` into `src/client/pages/AdminRosterPage.tsx`, replacing prompt dialogs with 1-click assignment

**Checkpoint**: User Story 1 complete - manual roster assignment is intuitive and 1-click.

---

## Phase 4: User Story 2 - Comprehensive Searchable Country & Territory Select (Priority: P1)

**Goal**: Upgrade `CountrySelect` into a searchable select menu with real-time text filtering across all 266 countries, territories, and regions.

**Independent Test**: Open the volunteer application modal. Click country selector, type "Jam" to select Jamaica (🇯🇲), "Barba" for Barbados (🇧🇧), "Cur" for Curaçao (🇨🇼), "Bah" for Bahamas (🇧🇸). Verify selection updates with vector flags.

### Implementation for User Story 2

- [x] T005 [P] [US2] Upgrade `CountrySelect` component into a searchable select menu with real-time text filter and flag icons in `src/client/components/CountrySelect.tsx`
- [x] T006 [US2] Verify country search and selection integration in `src/client/components/VolunteerModal.tsx`

**Checkpoint**: User Story 2 complete - global volunteer coverage with fast search select.

---

## Phase 5: User Story 3 - Multi-Day Time-Off Requests in Volunteer Portal (Priority: P2)

**Goal**: Allow volunteers to request multiple consecutive days off in a single submission by selecting a Start Date and End Date range.

**Independent Test**: In volunteer portal, open "Request Time Off", choose a 3-day range (Friday to Sunday), and submit. Verify 3 daily leave requests are generated with `Pending` status.

### Tests for User Story 3

- [x] T007 [P] [US3] Unit & integration tests for multi-day time-off submission in `tests/api/portal.test.ts`

### Implementation for User Story 3

- [x] T008 [US3] Update `POST /api/portal/time-off` endpoint in `src/server/routes/portal.ts` to support multi-day date ranges
- [x] T009 [US3] Upgrade `TimeOffModal` in `src/client/components/TimeOffModal.tsx` to support Start Date and End Date range selection with day count preview

**Checkpoint**: User Story 3 complete - multi-day leave requests supported end-to-end.

---

## Phase 6: Polish & Validation

**Purpose**: End-to-end verification, build check, and test coverage

- [x] T010 [P] Run end-to-end quickstart verification scenarios from `specs/004-roster-assignment-and-timeoff-improvements/quickstart.md`
- [x] T011 Execute full automated test suite (`npm test`) and production build (`npm run build`)

---

## Dependencies & Execution Order

```
Phase 1: Setup
     │
     ▼
Phase 2: Foundational (Expand countries.ts to 266)
     │
     ├──────────────────────┬──────────────────────┐
     ▼                      ▼                      ▼
Phase 3: US1 (P1)      Phase 4: US2 (P1)      Phase 5: US3 (P2)
ShiftAssignModal       Searchable CountrySelect Multi-Day Time-Off
     │                      │                      │
     └──────────────────────┴──────────┬───────────┘
                                       ▼
                              Phase 6: Polish & Validation
```

### Parallel Opportunities

- **Phase 2 & Phase 3**: `ShiftAssignModal.tsx` can be developed in parallel with `countries.ts`.
- **Phase 4 & Phase 5**: `CountrySelect.tsx` search upgrade can run in parallel with multi-day time-off backend updates in `portal.ts`.

# Tasks: Flag, Roster & Headcount Enhancements

**Input**: Design documents from `/specs/003-flag-and-calendar-enhancements/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `.specify/memory/constitution.md`

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story mapping ([US1], [US2], [US3], [US4])
- Exact file paths included in all tasks

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add vector SVG flag library to project dependencies

- [x] T001 [P] Install `country-flag-icons` dependency in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core SVG flag renderer component used across all UI views

- [x] T002 Implement SVG vector flag renderer component with globe fallback in `src/client/components/CountryFlag.tsx`
- [x] T003 [P] Update `CountrySelect` component to render vector flags in `src/client/components/CountrySelect.tsx`

**Checkpoint**: Foundation ready - vector flags available across application.

---

## Phase 3: User Story 1 - Graphic SVG Flag Rendering on All Platforms (Priority: P1)

**Goal**: Ensure country flags render as graphic SVG images on all operating systems and browsers without relying on OS emoji fonts.

**Independent Test**: Load the weekly roster and volunteer management pages in any browser on Windows or Linux. Verify flags render as graphical images rather than two-letter letter boxes.

### Implementation for User Story 1

- [x] T004 [US1] Verify and style SVG flags with rounded corners and consistent alignment across roster grid, volunteer cards, and dropdowns in `src/client/styles/main.css`

**Checkpoint**: User Story 1 complete - graphical SVG flags active everywhere.

---

## Phase 4: User Story 2 - Compact First-Name Display on Daily Shift Grid (Priority: P1)

**Goal**: Display only the first name of scheduled volunteers on the weekly schedule cards with full name accessible in hover tooltip.

**Independent Test**: Schedule volunteers with full names (e.g. "Elena Rostova", "Jean-Luc Picard") and observe shift cards display "Elena" and "Jean-Luc" alongside their flag.

### Implementation for User Story 2

- [x] T005 [US2] Extract and display first name only with full-name tooltip in `src/client/components/ShiftSlotCell.tsx`

**Checkpoint**: User Story 2 complete - roster shift cards are clean and compact.

---

## Phase 5: User Story 3 - Magic Link Display & Management on Volunteer Cards (Priority: P1)

**Goal**: Display each volunteer's portal URL on their card with 1-click clipboard copy and management token regeneration.

**Independent Test**: Navigate to volunteer management. Verify portal URL is visible on volunteer cards. Click "Copy Link" to verify clipboard copy, and click "Reset Link" to verify token regeneration.

### Implementation for User Story 3

- [x] T006 [US3] Add portal URL display, 1-click "Copy Link" with visual confirmation, and "Reset Link" action in `src/client/pages/AdminVolunteersPage.tsx`

**Checkpoint**: User Story 3 complete - magic links easily managed and shared.

---

## Phase 6: User Story 4 - Monday-Aligned Headcount Calendar Grid (Priority: P2)

**Goal**: Align the Headcount Calendar grid to a Monday-to-Sunday work week with weekday headers (`Mon`–`Sun`) and proper day-of-week offset padding.

**Independent Test**: View October 2026. Verify column 1 is Monday, column 2 is Tuesday, and Tuesday October 27th falls strictly in Column 2 with blank offset cells for Oct 1–3.

### Implementation for User Story 4

- [x] T007 [US4] Prepend Monday-first weekday offset padding cells and render `Mon`–`Sun` column headers in `src/client/components/HeadcountCalendar.tsx`
- [x] T008 [US4] Ensure compact heatmap mode (Month, Quarter, Year) preserves Monday-to-Sunday alignment in `src/client/components/HeadcountCalendar.tsx`

**Checkpoint**: User Story 4 complete - calendar dates accurately aligned to days of the week.

---

## Phase 7: Polish & Validation

**Purpose**: End-to-end verification, build check, and test coverage

- [x] T009 [P] Run end-to-end quickstart verification scenarios from `specs/003-flag-and-calendar-enhancements/quickstart.md`
- [x] T010 Execute full automated test suite (`npm test`) and production build (`npm run build`)

---

## Dependencies & Execution Order

```
Phase 1: Setup (country-flag-icons)
     │
     ▼
Phase 2: Foundational (CountryFlag.tsx)
     │
     ├──────────────────────┬──────────────────────┐
     ▼                      ▼                      ▼
Phase 3: US1 (P1)      Phase 4: US2 (P1)      Phase 5: US3 (P1)
Graphic SVG Flags      First Names on Roster   Magic Link Management
     │                      │                      │
     └──────────────────────┴──────────┬───────────┘
                                       ▼
                              Phase 6: US4 (P2)
                              Monday-Aligned Headcount Grid
                                       ▼
                              Phase 7: Polish & Validation
```

### Parallel Opportunities

- **Phase 2**: T003 (`CountrySelect.tsx`) can be updated in parallel with T002.
- **Phases 3, 4, and 5**: Can be implemented in parallel as they modify different components (`styles/main.css`, `ShiftSlotCell.tsx`, `AdminVolunteersPage.tsx`).

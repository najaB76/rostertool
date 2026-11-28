# Tasks: Comprehensive Dark Mode Theme Audit and Contrast Fixes

**Input**: Design documents from `/specs/029-comprehensive-dark-mode-audit/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`
**Status**: Ready for implementation

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

---

## Phase 1: Setup

- [x] T001 [P] Verify project dependencies and environment in `package.json`

---

## Phase 2: User Story 1 - Global Buttons, Form Cards, and Settings Dark Mode (Priority: P1)

**Goal**: Fix buttons with light text on light background and ensure the Settings form has dark mode styling applied.

**Independent Test**: Enable dark mode. Inspect buttons across all views $\rightarrow$ verify secondary buttons have `#334155` background with white text. Open `/admin/settings` $\rightarrow$ verify settings form cards have `#1e293b` surfaces and legible labels.

### Implementation for User Story 1

- [x] T002 [P] [US1] Update `src/client/styles/main.css` to give all secondary buttons dark slate backgrounds (`#334155`), white text (`#f8fafc`), and clear borders in dark mode
- [x] T003 [US1] Update `src/client/pages/AdminSettingsPage.tsx` to give settings cards, fieldsets, and form containers dark theme surfaces and legible text

**Checkpoint**: User Story 1 complete - buttons and settings forms have high contrast in dark mode.

---

## Phase 3: User Story 2 - Weekly Roster Grid Dark Mode Alignment (Priority: P1)

**Goal**: Fix weekly roster column headers and shift cells so day names and volunteer chips are clearly readable on dark surfaces.

**Independent Test**: Open `/admin/roster` in dark mode $\rightarrow$ verify weekday column headers have `#1e293b` backgrounds with white day names, and shift cells have dark surfaces.

### Implementation for User Story 2

- [x] T004 [P] [US2] Update `src/client/components/RosterGrid.tsx` and `src/client/styles/main.css` to style day column headers with dark backgrounds (`#1e293b`) and high-contrast text (`#f8fafc`)
- [x] T005 [P] [US2] Update `src/client/components/ShiftSlotCell.tsx` and `src/client/styles/main.css` to ensure shift cells and assignment chips have dark surfaces and light text

**Checkpoint**: User Story 2 complete - weekly roster grid displays dark surfaces with crisp white text.

---

## Phase 4: User Story 3 - Full Timeline Table Dark Theme Coverage (Priority: P1)

**Goal**: Extend dark theme styling across all columns of the staffing timeline (Age, Source, Status, Arrival, Leaving, Day cells).

**Independent Test**: Open `/admin/timeline` in dark mode $\rightarrow$ verify all columns across the full horizontal width render with dark surfaces (`#1e293b` / `#0f172a`) and light text.

### Implementation for User Story 3

- [x] T006 [P] [US3] Update `src/client/pages/AdminTimelinePage.tsx` and `src/client/styles/main.css` to ensure all columns (Age, Source, Status, Arrival, Leaving, Day cells) render with dark surfaces and legible typography in dark mode

**Checkpoint**: User Story 3 complete - 100% of timeline columns have consistent dark theming.

---

## Phase 5: User Story 4 - High-Contrast Text on Volunteers, Headcount, and Admin Users (Priority: P1)

**Goal**: Fix portal link container on volunteers page, period title on headcount page, and user names on admin users page.

**Independent Test**: In dark mode, verify `/admin/volunteers` portal link container is dark themed, `/admin/headcount` period title is bright white, and `/admin/users` user names and roles are clearly readable.

### Implementation for User Story 4

- [x] T007 [P] [US4] Update `src/client/pages/AdminVolunteersPage.tsx` to ensure magic link container has dark background and light label
- [x] T008 [P] [US4] Update `src/client/pages/AdminHeadcountPage.tsx` to ensure period title and capacity benchmarks display high-contrast light text on dark surfaces
- [x] T009 [P] [US4] Update `src/client/pages/AdminUsersPage.tsx` to ensure admin user names and roles render with bright, legible typography on dark card surfaces

**Checkpoint**: User Story 4 complete - zero dark-on-dark text artifacts across volunteers, headcount, and admin users.

---

## Phase 6: Polish & Validation

**Purpose**: End-to-end verification and regression prevention

- [x] T010 [P] Execute quickstart validation scenarios from `specs/029-comprehensive-dark-mode-audit/quickstart.md`
- [x] T011 Run full automated test suite (`npm test`) and production build check (`npm run build`)

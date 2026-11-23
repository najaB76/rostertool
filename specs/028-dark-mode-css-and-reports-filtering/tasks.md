# Tasks: Complete Dark Mode CSS Audit, Report Date Slicing, and Sortable Tables

**Input**: Design documents from `/specs/028-dark-mode-css-and-reports-filtering/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`
**Status**: Ready for implementation

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

---

## Phase 1: Setup

- [x] T001 [P] Verify project dependencies and environment in `package.json`

---

## Phase 2: User Story 1 - Complete Dark Mode Theme & High Contrast Across All Views (Priority: P1)

**Goal**: Eliminate all remaining white background surfaces (`#fff`) on cards, schedule cells, timeline rows, and modals in dark mode, ensuring high contrast in both themes.

**Independent Test**: Enable dark mode. Inspect `/admin/roster`, `/admin/volunteers`, `/admin/timeline`, and modals $\rightarrow$ verify 0 white surfaces remain and all text has high contrast.

### Implementation for User Story 1

- [x] T002 [P] [US1] Overhaul dark mode CSS in `src/client/styles/main.css` to target cards, schedule cells, tables, timeline rows, modals, and text colors with dark surfaces (`#1e293b` / `#0f172a`), dark borders (`#334155`), and high-contrast typography
- [x] T003 [US1] Ensure `src/client/pages/AdminRosterPage.tsx`, `src/client/pages/AdminTimelinePage.tsx`, and `src/client/pages/AdminVolunteersPage.tsx` adapt components to dark mode with no hardcoded low-contrast white text on white backgrounds

**Checkpoint**: User Story 1 complete - dark mode displays dark surfaces with high contrast across all pages.

---

## Phase 3: User Story 2 - Date Filtering & Period Slicing for Reports (Priority: P1)

**Goal**: Allow filtering reports by date range (`startDate`, `endDate`, and presets) to enable period comparisons (e.g. year-on-year).

**Independent Test**: Query `/api/admin/reports?startDate=2025-01-01&endDate=2025-12-31` $\rightarrow$ verify metrics reflect only 2025 stays. In UI, click "This Year" and "Last Year" presets $\rightarrow$ verify charts and tables update.

### Tests for User Story 2

- [x] T004 [P] [US2] Add test in `tests/api/reports.test.ts` verifying date-filtered reports query (`startDate` and `endDate`)

### Implementation for User Story 2

- [x] T005 [US2] Update `src/server/services/reporting-service.ts` and `src/server/routes/admin-reports.ts` to filter stays and volunteers by date range
- [x] T006 [US2] Add date period filter bar with quick presets ("All Time", "This Year", "Last Year", "Last 12 Months", "Custom") in `src/client/pages/AdminReportsPage.tsx`

**Checkpoint**: User Story 2 complete - date period filtering functional in reports API and UI.

---

## Phase 4: User Story 3 - Interactive Column Sorting on Report Tables (Priority: P2)

**Goal**: Allow sorting any report table by clicking column headers with visual direction arrows (`▲`/`▼`).

**Independent Test**: In `AdminReportsPage.tsx`, click "Avg Rating" header $\rightarrow$ verify table sorts descending. Click again $\rightarrow$ verify sorts ascending.

### Implementation for User Story 3

- [x] T007 [P] [US3] Add interactive column header click sorting (`▲`/`▼`) to all report tables in `src/client/pages/AdminReportsPage.tsx`

**Checkpoint**: User Story 3 complete - report tables support interactive multi-column sorting.

---

## Phase 5: Polish & Validation

**Purpose**: End-to-end verification and regression prevention

- [x] T008 [P] Execute quickstart validation scenarios from `specs/028-dark-mode-css-and-reports-filtering/quickstart.md`
- [x] T009 Run full automated test suite (`npm test`) and production build check (`npm run build`)

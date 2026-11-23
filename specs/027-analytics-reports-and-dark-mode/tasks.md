# Tasks: Volunteer Analytics & Reporting, Timeline Datepicker, and Accessible Dark Mode

**Input**: Design documents from `/specs/027-analytics-reports-and-dark-mode/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`
**Status**: Ready for implementation

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

---

## Phase 1: Setup

- [x] T001 [P] Verify project dependencies and environment in `package.json`

---

## Phase 2: User Story 1 - Volunteer Analytics & Reporting Tab (Priority: P1)

**Goal**: Provide a comprehensive Analytics & Reporting dashboard (`/admin/reports`) with KPI cards, crosstabulation tables, and interactive SVG charts (by country, continent, age bracket, gender, and rehire ratios).

**Independent Test**: Seed diverse volunteers and stays. Call `GET /api/admin/reports` $\rightarrow$ verify response aggregates KPIs, byCountry, byContinent, byAgeBracket, byGender, and rehire ratios. Open `/admin/reports` in browser $\rightarrow$ verify charts and tables render correctly.

### Tests for User Story 1

- [x] T002 [P] [US1] Create integration test in `tests/api/reports.test.ts` verifying `GET /api/admin/reports` structure, KPIs, and crosstabulations

### Implementation for User Story 1

- [x] T003 [US1] Implement `ReportingService` in `src/server/services/reporting-service.ts` and register `GET /api/admin/reports` in `src/server/routes/admin-reports.ts` and `src/server/index.ts`
- [x] T004 [US1] Implement `src/client/pages/AdminReportsPage.tsx` with KPI metric cards, interactive SVG charts, crosstabulation tables, and add navigation link in `src/client/App.tsx`

**Checkpoint**: User Story 1 complete - Reports tab is operational with full analytics, charts, and tables.

---

## Phase 3: User Story 2 - Datepicker Jump Navigation on Staffing Timeline (Priority: P1)

**Goal**: Add a datepicker input to `/admin/timeline` allowing coordinators to jump directly to any date without repetitive pagination clicking.

**Independent Test**: On `/admin/timeline`, select any date in the datepicker $\rightarrow$ verify timeline instantly reloads and snaps to the Monday of that date's week.

### Implementation for User Story 2

- [x] T005 [P] [US2] Add datepicker `<input type="date">` to `src/client/pages/AdminTimelinePage.tsx` navigation bar with auto-snap to Monday

**Checkpoint**: User Story 2 complete - datepicker navigation functional on timeline.

---

## Phase 4: User Story 3 - Persistent Dark Mode with High-Visibility SVG Flags (Priority: P2)

**Goal**: Implement a toggleable dark mode theme across the application with guaranteed contrast for country flags.

**Independent Test**: Toggle dark mode in navigation header $\rightarrow$ verify entire UI transitions to dark surfaces with light text. Verify country flags have high-visibility outlines. Refresh page $\rightarrow$ verify theme preference persists.

### Implementation for User Story 3

- [x] T006 [P] [US3] Implement `src/client/context/ThemeContext.tsx` with persistent localStorage state and add theme toggle button in `src/client/App.tsx` navigation header
- [x] T007 [P] [US3] Add dark mode theme styling and CSS variables in `src/client/App.tsx`
- [x] T008 [P] [US3] Update `src/client/components/CountryFlag.tsx` with contrast outline in dark mode

**Checkpoint**: User Story 3 complete - dark mode theme fully functional with preserved flag visibility.

---

## Phase 5: Polish & Validation

**Purpose**: End-to-end verification and regression prevention

- [x] T009 [P] Execute quickstart validation scenarios from `specs/027-analytics-reports-and-dark-mode/quickstart.md`
- [x] T010 Run full automated test suite (`npm test`) and production build check (`npm run build`)

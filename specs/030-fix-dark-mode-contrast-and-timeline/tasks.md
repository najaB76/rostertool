# Tasks: Dark Mode Contrast, Timeline Cell Fills, and Active State Differentiation

**Input**: Design documents from `/specs/030-fix-dark-mode-contrast-and-timeline/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`
**Status**: Ready for implementation

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

---

## Phase 1: Setup

- [x] T001 [P] Verify project dependencies and environment in `package.json`

---

## Phase 2: User Story 1 - Timeline Occupancy Bar Fills & Status Button Colors (Priority: P1)

**Goal**: Preserve solid volunteer occupancy bar fills in dark mode on `/admin/timeline`, and maintain color-coded status buttons (`In da house`, `Confirmed`, `Departed`, `Not confirmed`) and action dropdown menus.

**Independent Test**: In dark mode, open `/admin/timeline` $\rightarrow$ verify occupied stay cells have their distinct solid bar fills (`barColor`). Verify status buttons show green/blue/red/amber and dropdown menu actions preserve their colors.

### Implementation for User Story 1

- [x] T002 [US1] Update `src/client/pages/AdminTimelinePage.tsx` to tag occupied cells with `timeline-occupied` and assign semantic classes to status buttons (`.status-btn-*`) and dropdown menu items
- [x] T003 [US1] Update `src/client/styles/main.css` to protect `.timeline-occupied` background fills and style `.status-btn-*` and `.timeline-status-menu` with dark theme color coding

**Checkpoint**: User Story 1 complete - timeline occupancy bars and status buttons display full color coding in dark mode.

---

## Phase 3: User Story 2 - Visual Differentiation of Active States & Primary Buttons (Priority: P1)

**Goal**: Ensure active filter tabs are prominently highlighted and primary action buttons ("Save", "Save Volunteer") are visually distinct from neutral cancel buttons in dark mode.

**Independent Test**: In dark mode, open `/admin/volunteers` $\rightarrow$ verify the selected filter tab is highlighted in blue (`#2563eb`). Open modals $\rightarrow$ verify "Save" is primary blue/green and "Cancel" is neutral dark slate.

### Implementation for User Story 2

- [x] T004 [P] [US2] Update `src/client/pages/AdminVolunteersPage.tsx` filter tabs to use `.tab-button` and `.tab-button.active` with primary blue accent (`#2563eb`)
- [x] T005 [P] [US2] Update modals (`src/client/components/VolunteerModal.tsx`, `src/client/components/DepartureModal.tsx`, `src/client/components/ReactivateModal.tsx`, `src/client/components/StayHistoryModal.tsx`) to apply `.btn-primary` and `.btn-cancel`
- [x] T006 [US2] Add styling rules for `.tab-button.active`, `.btn-primary`, and `.btn-cancel` in `src/client/styles/main.css`

**Checkpoint**: User Story 2 complete - active tabs and primary buttons have clear visual hierarchy in dark mode.

---

## Phase 4: User Story 3 - Status Pills & Comprehensive Contrast Across All Views (Priority: P1)

**Goal**: Fix status pills on `/admin/volunteers` (especially `Cancelled` light-on-light text) to display dark-tinted backgrounds with high-contrast text.

**Independent Test**: In dark mode, inspect `Cancelled` status pill $\rightarrow$ verify dark red background (`#450a0a`) with bright red text (`#fca5a5`), eliminating light-on-light text.

### Implementation for User Story 3

- [x] T007 [P] [US3] Update `src/client/pages/AdminVolunteersPage.tsx` to assign semantic classes `.status-pill-*` to status badges
- [x] T008 [US3] Add `.status-pill-*` dark theme semantic styling in `src/client/styles/main.css` eliminating light-on-light text on Cancelled and other statuses

**Checkpoint**: User Story 3 complete - status pills and text contrast satisfy WCAG AA across all views.

---

## Phase 5: Polish & Validation

**Purpose**: End-to-end verification and regression prevention

- [x] T009 [P] Execute quickstart validation scenarios from `specs/030-fix-dark-mode-contrast-and-timeline/quickstart.md`
- [x] T010 Run full automated test suite (`npm test`) and production build check (`npm run build`)

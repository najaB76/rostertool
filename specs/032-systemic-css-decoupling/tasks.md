# Tasks: Systemic CSS Decoupling and Universal Dark Mode Theme Architecture

**Input**: Design documents from `/specs/032-systemic-css-decoupling/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`
**Status**: Ready for implementation

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

---

## Phase 1: Design Tokens & Core Modal CSS Classes

- [x] T001 [P] Update `src/client/styles/main.css` to define `.modal-overlay`, `.modal-card`, `.modal-title`, `.form-group`, `.form-label`, `.form-input`, `.form-select`, `.form-textarea`, and eliminate brittle `[style*="..."]` selectors

---

## Phase 2: User Story 1 - Modal Dialog Decoupling & Heading Contrast Fix (Priority: P1)

**Goal**: Eradicate inline styles on all modal dialogs and fix the "Edit Volunteer" white-on-white heading regression.

**Independent Test**: Enable dark mode. Open `VolunteerModal` $\rightarrow$ verify modal card is `#1e293b` and heading is `#f8fafc`. Open `DepartureModal`, `ReactivateModal`, `StayHistoryModal`, and `ChangePinModal` $\rightarrow$ verify all modals render with dark surfaces and high-contrast text.

### Implementation for User Story 1

- [x] T002 [P] [US1] Refactor `src/client/components/VolunteerModal.tsx` to use `.modal-overlay`, `.modal-card`, `.modal-title`, `.form-input`, and `.form-select`, completely resolving the white-on-white heading regression
- [x] T003 [P] [US1] Refactor `src/client/components/DepartureModal.tsx` to use `.modal-overlay`, `.modal-card`, and `.modal-title`
- [x] T004 [P] [US1] Refactor `src/client/components/ReactivateModal.tsx` to use `.modal-overlay`, `.modal-card`, and `.modal-title`
- [x] T005 [P] [US1] Refactor `src/client/components/StayHistoryModal.tsx` to use `.modal-overlay`, `.modal-card`, and `.modal-title`
- [x] T006 [P] [US1] Refactor `src/client/components/ChangePinModal.tsx` to use `.modal-overlay`, `.modal-card`, and `.modal-title`

**Checkpoint**: User Story 1 complete - all modals use pure CSS classes and dark mode contrast is rock-solid.

---

## Phase 3: User Story 2 - Decouple Inline Styles in Primary Pages (Priority: P1)

**Goal**: Replace hardcoded inline style attributes on page containers, toolbars, and cards with semantic CSS classes.

**Independent Test**: Inspect pages in DevTools. Verify elements use `.filter-bar`, `.volunteer-card`, `.headcount-toolbar`, `.admin-user-card`, `.settings-card` with clean, unified theme styling.

### Implementation for User Story 2

- [x] T007 [P] [US2] Refactor `src/client/pages/AdminVolunteersPage.tsx` to replace inline styles on filter bar, cards, and acceptance dialog with CSS classes
- [x] T008 [P] [US2] Refactor `src/client/pages/AdminHeadcountPage.tsx` to use `.headcount-toolbar`, `.legend-banner`, and CSS classes
- [x] T009 [P] [US2] Refactor `src/client/pages/AdminUsersPage.tsx` to use `.admin-user-card`, `.admin-user-form`, and CSS classes
- [x] T010 [P] [US2] Refactor `src/client/pages/AdminSettingsPage.tsx` to use `.settings-card` and CSS classes

**Checkpoint**: User Story 2 complete - all primary views receive styling from CSS classes.

---

## Phase 4: Polish & Validation

**Purpose**: End-to-end verification and regression prevention

- [x] T011 [P] Execute quickstart validation scenarios from `specs/032-systemic-css-decoupling/quickstart.md`
- [x] T012 Run full automated test suite (`npm test`) and production build check (`npm run build`)

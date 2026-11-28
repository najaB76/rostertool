# Tasks: Volunteer Profile Pictures and CSS Style Decoupling

**Input**: Design documents from `/specs/031-volunteer-profile-pictures-and-css/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`
**Status**: Ready for implementation

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

---

## Phase 1: Setup & Data Model

- [x] T001 [P] Update `src/server/db/schema.ts` to add `profilePicture` column to `volunteers` table
- [x] T002 Update `src/server/db/client.ts` with PRAGMA check and ALTER TABLE for `profile_picture`
- [x] T003 Update `src/server/services/volunteer-service.ts` to persist `profilePicture` in create and update methods
- [x] T004 Add integration test in `tests/api/volunteers.test.ts` for profile picture persistence

---

## Phase 2: User Story 1 & 2 - Profile Picture Upload, Thumbnail & Lightbox Modal (Priority: P1)

**Goal**: Support uploading, updating, and removing volunteer profile pictures; display thumbnail next to preferred name; provide full-sized lightbox modal overlay with (X) and Escape key dismissal.

**Independent Test**: Edit a volunteer $\rightarrow$ upload an image $\rightarrow$ verify thumbnail next to preferred name. Click thumbnail $\rightarrow$ verify full-sized image opens in modal overlay. Press Escape $\rightarrow$ verify overlay closes. Save and verify thumbnail displays on volunteer cards in `/admin/volunteers`.

### Implementation for User Story 1 & 2

- [x] T005 [P] [US2] Create `src/client/components/ImageLightboxModal.tsx` for full-sized image display with (X) button, backdrop click, and Escape key dismissal
- [x] T006 [P] [US1] Update `src/client/components/VolunteerModal.tsx` to add profile picture upload, thumbnail display next to preferred name, remove action, and connect `ImageLightboxModal`
- [x] T007 [P] [US2] Update `src/client/pages/AdminVolunteersPage.tsx` to render profile picture thumbnail next to preferred name on volunteer cards and connect `ImageLightboxModal`

**Checkpoint**: User Stories 1 & 2 complete - profile picture upload, thumbnail display, and lightbox modal are functional.

---

## Phase 3: User Story 3 - CSS Decoupling & Theme Consistency (Priority: P2)

**Goal**: Replace hardcoded inline styling on HTML elements with semantic CSS classes in `main.css`, guaranteeing high contrast and consistent presentation in both light and dark modes.

**Independent Test**: Toggle dark mode. Verify thumbnail, upload controls, lightbox modal, volunteer cards, and form inputs look sharp with no contrast or specificity bugs.

### Implementation for User Story 3

- [x] T008 [P] [US3] Add semantic CSS classes in `src/client/styles/main.css` for `.profile-thumbnail`, `.profile-upload-placeholder`, `.lightbox-overlay`, `.lightbox-container`, `.lightbox-close`, and form layout classes
- [x] T009 [US3] Refactor inline styles in `VolunteerModal.tsx` and `AdminVolunteersPage.tsx` to use the new CSS classes with full light and dark mode support

**Checkpoint**: User Story 3 complete - styling is decoupled into CSS with seamless light and dark mode contrast.

---

## Phase 4: Polish & Validation

**Purpose**: End-to-end verification and regression prevention

- [x] T010 [P] Execute quickstart validation scenarios from `specs/031-volunteer-profile-pictures-and-css/quickstart.md`
- [x] T011 Run full automated test suite (`npm test`) and production build check (`npm run build`)

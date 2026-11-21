# Tasks: Fix Stay History Modal ReferenceError

**Input**: Design documents from `/specs/023-fix-stay-history-reference-error/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`
**Status**: Ready for implementation

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

---

## Phase 1: Setup

- [x] T001 [P] Verify project dependencies and environment in `package.json`

---

## Phase 2: User Story 1 - Fix Stay History Modal ReferenceError (Priority: P1)

**Goal**: Fix `ReferenceError: loadVolunteers is not defined` when opening the Stay History modal on `/admin/volunteers` by passing `fetchVolunteers`.

**Independent Test**: Navigate to `/admin/volunteers` and click the "Stays" link on any volunteer card. Verify the modal opens immediately without throwing `ReferenceError` or blanking the page. Edit a review and save, verifying that `fetchVolunteers` refreshes the volunteer cards seamlessly.

### Implementation for User Story 1

- [x] T002 [US1] Update `src/client/pages/AdminVolunteersPage.tsx` to pass `onStayUpdated={fetchVolunteers}` to `StayHistoryModal`

**Checkpoint**: User Story 1 complete - `StayHistoryModal` opens and updates cleanly without runtime errors.

---

## Phase 3: Polish & Validation

**Purpose**: End-to-end verification and regression prevention

- [x] T003 [P] Execute quickstart validation scenario from `specs/023-fix-stay-history-reference-error/quickstart.md`
- [x] T004 Run full automated test suite (`npm test`) and production build check (`npm run build`)

# Tasks: Time-Off Review & Assignment Guards

**Input**: Design documents from `/specs/005-timeoff-review-and-assignment-guards/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `.specify/memory/constitution.md`

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story mapping ([US1], [US2], [US3], [US4])
- Exact file paths included in all tasks

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify dependencies and environment for feature 005

- [x] T001 [P] Verify project dependencies and environment for feature 005 in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Register time-off administration navigation and layout routes

- [x] T002 Register `/admin/time-off` route and add `Time Off` navigation link in `src/client/App.tsx`

**Checkpoint**: Foundation ready - navigation path established.

---

## Phase 3: User Story 1 - Management Time-Off Review & Approval Hub (Priority: P1)

**Goal**: Build a dedicated Time-Off review page for managers to inspect pending leave requests with flags, dates, and reasons, and approve or decline with 1 click.

**Independent Test**: Navigate to `/admin/time-off`. Observe pending requests. Click "Approve" on a request and verify status updates to `Approved`. Click "Decline" and verify status updates to `Denied`.

### Implementation for User Story 1

- [x] T003 [US1] Build `AdminTimeOffPage` component with status tabs (`Pending`, `Approved`, `Denied`, `Cancelled`) and 1-click `Approve` and `Decline` action buttons in `src/client/pages/AdminTimeOffPage.tsx`
- [x] T004 [US1] Update `src/server/routes/admin-timeoff.ts` to support querying by all statuses and include cancellation metadata

**Checkpoint**: User Story 1 complete - management time-off hub active.

---

## Phase 4: User Story 2 - Warning Confirmation for Shift Overrides on Approved Time-Off (Priority: P1)

**Goal**: Prompt a warning confirmation dialog whenever a manager attempts to assign a volunteer on a date where they have approved time-off.

**Independent Test**: In `ShiftAssignModal`, click "Assign" on a volunteer with approved time-off. Verify a confirmation dialog prompts: `"Warning: [Name] has approved time-off on this date. Do you want to override and assign them anyway?"`. If cancelled, abort. If confirmed, assign.

### Implementation for User Story 2

- [x] T005 [US2] Intercept candidate assignment in `src/client/components/ShiftAssignModal.tsx` and prompt confirmation warning when volunteer has approved time-off

**Checkpoint**: User Story 2 complete - accidental scheduling on approved leave prevented.

---

## Phase 5: User Story 3 - Volunteer Self-Service Time-Off Cancellation (Priority: P1)

**Goal**: Allow volunteers to cancel their pending or upcoming time-off requests directly from the portal, freeing up their availability.

**Independent Test**: In volunteer portal, view submitted requests. Click "Cancel Request" on a pending or upcoming request. Confirm. Verify status updates to `Cancelled` and the date is freed.

### Tests for User Story 3

- [x] T006 [P] [US3] Unit & integration tests for volunteer time-off cancellation endpoint in `tests/api/portal.test.ts`

### Implementation for User Story 3

- [x] T007 [US3] Expose `POST /api/portal/time-off/:id/cancel` endpoint in `src/server/routes/portal.ts`
- [x] T008 [US3] Add "Cancel Request" action button with confirmation dialog on time-off cards in `src/client/pages/VolunteerPortalPage.tsx`

**Checkpoint**: User Story 3 complete - volunteers can cancel time-off requests.

---

## Phase 6: User Story 4 - Reception Qualification Guard for Reception Shifts (Priority: P1)

**Goal**: Strictly disable the "Assign" button for volunteers who are not reception-qualified when assigning Reception shifts in `ShiftAssignModal`.

**Independent Test**: Open `ShiftAssignModal` for Reception Day or Reception Evening. Verify volunteers without reception qualification have their "Assign" button disabled (grayed out) with the label `"Not Reception Qualified"`. On Housekeeping shifts, verify they remain assignable.

### Implementation for User Story 4

- [x] T009 [US4] Strictly disable `Assign` button for reception-unqualified volunteers when viewing Reception shifts in `src/client/components/ShiftAssignModal.tsx`

**Checkpoint**: User Story 4 complete - reception shifts protected by qualification guard.

---

## Phase 7: Polish & Validation

**Purpose**: End-to-end verification, build check, and test coverage

- [x] T010 [P] Run end-to-end quickstart verification scenarios from `specs/005-timeoff-review-and-assignment-guards/quickstart.md`
- [x] T011 Execute full automated test suite (`npm test`) and production build (`npm run build`)

---

## Dependencies & Execution Order

```
Phase 1: Setup
     │
     ▼
Phase 2: Foundational (Register /admin/time-off route)
     │
     ├──────────────────────┬──────────────────────┬──────────────────────┐
     ▼                      ▼                      ▼                      ▼
Phase 3: US1 (P1)      Phase 4: US2 (P1)      Phase 5: US3 (P1)      Phase 6: US4 (P1)
AdminTimeOffPage       Override Warning       Portal Cancellation    Reception Guard
     │                      │                      │                      │
     └──────────────────────┴──────────┬───────────┴──────────────────────┘
                                       ▼
                              Phase 7: Polish & Validation
```

### Parallel Opportunities

- **Phase 4 & Phase 6**: Can be implemented together in `ShiftAssignModal.tsx`.
- **Phase 3 & Phase 5**: Admin time-off UI and portal time-off cancellation can be developed in parallel.

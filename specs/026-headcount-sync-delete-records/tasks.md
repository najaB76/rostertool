# Tasks: Headcount In-House Synchronization and Record Deletion

**Input**: Design documents from `/specs/026-headcount-sync-delete-records/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`
**Status**: Ready for implementation

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

---

## Phase 1: Setup

- [x] T001 [P] Verify project dependencies and environment in `package.json`

---

## Phase 2: User Story 1 - Synchronize Headcount Daily In-House Count with Timeline (Priority: P1)

**Goal**: Align daily in-house volunteer counts on `/admin/headcount` to match `/admin/timeline` exactly for all days (including open-ended stays and historical stays).

**Independent Test**: Query `/api/admin/timeline` and `/api/admin/headcount` across the same date range (e.g. `2026-11-20` to `2026-12-05`). Verify the daily volunteer counts match for 100% of days.

### Tests for User Story 1

- [x] T002 [P] [US1] Create integration test in `tests/api/headcount-sync.test.ts` verifying parity between `/api/admin/headcount` and `/api/admin/timeline` daily confirmed counts

### Implementation for User Story 1

- [x] T003 [US1] Refactor `src/server/services/headcount-service.ts` to calculate in-house confirmed volunteers using the same stay resolution and overnight bed rules as timeline

**Checkpoint**: User Story 1 complete - headcount and timeline show identical daily volunteer occupancy counts.

---

## Phase 3: User Story 2 - In-App Volunteer Deletion Without Orphaned Records (Priority: P1)

**Goal**: Enable administrators to delete duplicate volunteer profiles via `DELETE /api/admin/volunteers/:id` with atomic cascading deletion across all related tables (shifts, time-off, reviews, stays).

**Independent Test**: Seed a volunteer with shift assignments, time-off requests, and stays. Call `DELETE /api/admin/volunteers/:id`. Verify volunteer is removed and 0 orphaned child rows exist in any table.

### Tests for User Story 2

- [x] T004 [P] [US2] Create integration test in `tests/api/volunteer-deletion.test.ts` verifying `DELETE /api/admin/volunteers/:id` purges all related child records with zero orphans

### Implementation for User Story 2

- [x] T005 [US2] Implement `deleteVolunteer` in `src/server/services/volunteer-service.ts` and register `DELETE /:id` in `src/server/routes/admin-volunteers.ts`
- [x] T006 [US2] Add "Delete Volunteer" button with confirmation modal in `src/client/components/VolunteerModal.tsx` and `src/client/pages/AdminVolunteersPage.tsx`

**Checkpoint**: User Story 2 complete - duplicate volunteers can be deleted from the UI with zero orphaned records.

---

## Phase 4: User Story 3 - In-App Stay Record Deletion (Priority: P2)

**Goal**: Allow administrators to delete individual duplicate or erroneous stay records via `DELETE /api/admin/volunteers/:id/stays/:stayId` without deleting the volunteer.

**Independent Test**: Call `DELETE /api/admin/volunteers/:id/stays/:stayId`. Verify only the specified stay is deleted from `volunteer_stays` while the parent volunteer remains.

### Implementation for User Story 3

- [x] T007 [US3] Implement `deleteStay` in `src/server/services/volunteer-service.ts` and register `DELETE /:id/stays/:stayId` in `src/server/routes/admin-volunteers.ts`
- [x] T008 [US3] Add "Delete Stay" button with confirmation modal on each stay record in `src/client/components/StayHistoryModal.tsx`

**Checkpoint**: User Story 3 complete - duplicate stays can be deleted in `StayHistoryModal`.

---

## Phase 5: Polish & Validation

**Purpose**: End-to-end verification and regression prevention

- [x] T009 [P] Execute quickstart validation scenarios from `specs/026-headcount-sync-delete-records/quickstart.md`
- [x] T010 Run full automated test suite (`npm test`) and production build check (`npm run build`)

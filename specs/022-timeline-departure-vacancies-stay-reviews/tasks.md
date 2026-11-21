# Tasks: Timeline Departure Date Integrity, Daily Vacancies Row, and Editable Stay Reviews

**Input**: Design documents from `/specs/022-timeline-departure-vacancies-stay-reviews/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`
**Status**: Ready for implementation

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

---

## Phase 1: Setup

- [x] T001 [P] Verify project dependencies and environment in `package.json`

---

## Phase 2: User Story 1 - Fix Departure Date Null Overwrite on Forward Timeline Scroll (Priority: P1)

**Goal**: Prevent departure dates from turning into `null` (rendering `'????'` indefinitely) when scrolling forward past a volunteer's actual departure date.

**Independent Test**: Seed a volunteer with `arrivalDate: '2026-11-06'` and `departureDate: '2026-12-05'`. Query timeline for past dates (`2026-11-16`) and future dates (`2026-12-21`). Verify the volunteer appears with their real departure date on the first call, and is completely excluded (does not reappear with null/open-ended stay) on the second call.

### Tests for User Story 1

- [x] T002 [P] [US1] Add test in `tests/api/timeline.test.ts` verifying that when a volunteer has an authoritative departure date, older null stays do not overwrite it on future date queries

### Implementation for User Story 1

- [x] T003 [US1] Update stay consolidation in `src/server/routes/admin-timeline.ts` to skip duplicate null stays in `volunteer_stays` sharing the same `arrivalDate` as the volunteer's authoritative record
- [x] T004 [US1] Update `src/server/services/volunteer-service.ts` (`updateVolunteer`) to synchronize `arrivalDate`, `departureDate`, and `noEndDate` into matching `volunteer_stays` records

**Checkpoint**: User Story 1 complete - forward timeline scrolling preserves departure dates without phantom null stays.

---

## Phase 3: User Story 2 - Daily Bed Vacancies Calculation Row on Timeline (Priority: P1)

**Goal**: Render a dedicated "Vacancies (vs Target)" calculation row directly beneath "Total CONFIRMED Volunteers" on `/admin/timeline` showing available beds (`Math.max(0, baseline - confirmedVolunteers)`).

**Independent Test**: Open `/admin/timeline` with Baseline Target set to 11. On a day with 8 confirmed volunteers, verify the vacancy cell displays 3 with soft green styling and descriptive tooltip.

### Implementation for User Story 2

- [x] T005 [P] [US2] Update `src/client/pages/AdminTimelinePage.tsx` to add "Vacancies (vs Target)" summary row directly beneath "Total CONFIRMED Volunteers" calculating `Math.max(0, baseline - confirmedVolunteers)`

**Checkpoint**: User Story 2 complete - daily vacancies row accurately displays available bed capacity.

---

## Phase 4: User Story 3 - Editable Past Stay Reviews & Star Ratings (Priority: P2)

**Goal**: Allow coordinators to edit star ratings (1-5), departure notes, and rehire status for past stays in `StayHistoryModal.tsx` and persist them via `PUT /api/admin/volunteers/:id/stays/:stayId`.

**Independent Test**: Open `StayHistoryModal`, click "Edit Review" on a stay with 3 stars. Update to 5 stars and save. Verify the update persists and updates the volunteer card.

### Tests for User Story 3

- [x] T006 [P] [US3] Add integration test in `tests/api/volunteers-stays.test.ts` for `PUT /api/admin/volunteers/:id/stays/:stayId` updating star rating, notes, and rehire status

### Implementation for User Story 3

- [x] T007 [US3] Implement `updateStayReview` in `src/server/services/volunteer-service.ts` and register `PUT /:id/stays/:stayId` in `src/server/routes/admin-volunteers.ts`
- [x] T008 [US3] Update `src/client/components/StayHistoryModal.tsx` to add an inline review editor allowing modification of 1-5 star ratings, departure notes, and rehire status

**Checkpoint**: User Story 3 complete - past stay reviews can be edited and corrected directly in the UI.

---

## Phase 5: Polish & Validation

**Purpose**: End-to-end verification and regression prevention

- [x] T009 [P] Execute quickstart validation scenarios from `specs/022-timeline-departure-vacancies-stay-reviews/quickstart.md`
- [x] T010 Run full automated test suite (`npm test`) and production build check (`npm run build`)

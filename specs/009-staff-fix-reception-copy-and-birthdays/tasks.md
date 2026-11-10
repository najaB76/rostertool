# Tasks: Staff Assignment Fix, Reception Copy & Birthdays

**Input**: Design documents from `/specs/009-staff-fix-reception-copy-and-birthdays/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `.specify/memory/constitution.md`

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story mapping ([US1], [US2], [US3], [US4])
- Exact file paths included in all tasks

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify dependencies and environment for feature 009

- [x] T001 [P] Verify project dependencies and environment for feature 009 in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema additions and date utilities for volunteer profiles and birthdays

- [x] T002 Add `preferredName` and `dateOfBirth` columns to `volunteers` table in `src/server/db/schema.ts` and ensure database compatibility in `src/server/db/client.ts`
- [x] T003 [P] Add `getBirthdayAlert` utility function in `src/client/utils/date-utils.ts`

**Checkpoint**: Foundation ready - volunteer schema supports preferred name and DOB.

---

## Phase 3: User Story 1 - Fix Staff Shift Assignment (Bug Fix) (Priority: P1)

**Goal**: Fix the bug where assigning a staff member closed the modal but left the shift unassigned.

**Independent Test**: On `/admin/roster`, click "+ Assign" on an open Reception shift. Click "Assign Staff" next to a staff member. Verify modal closes, the cell updates with their name and country flag, and database persists `staff_id`.

### Tests for User Story 1

- [x] T004 [P] [US1] Unit and integration tests for staff shift assignment and unassignment in `tests/api/roster.test.ts`

### Implementation for User Story 1

- [x] T005 [US1] Fix `/api/admin/roster/assign` route condition and staff persistence in `src/server/routes/admin-roster.ts` and `src/server/services/roster-service.ts`

**Checkpoint**: User Story 1 complete - staff members successfully assign to shifts.

---

## Phase 4: User Story 2 - Copy Previous Week's Reception Shifts During Auto-Populate (Priority: P1)

**Goal**: Automatically copy forward the previous week's reception shifts (AM & PM) when running auto-populate.

**Independent Test**: Assign receptionists on Week 1. Advance to Week 2 and click "⚡ Auto-Populate". Verify Week 2's reception slots automatically inherit the assigned receptionists from Week 1.

### Tests for User Story 2

- [x] T006 [P] [US2] Integration test for previous week reception copy forward in `tests/api/roster.test.ts`

### Implementation for User Story 2

- [x] T007 [US2] Implement reception shift copy forward from `weekStartDate - 7 days` in `src/server/services/roster-service.ts`

**Checkpoint**: User Story 2 complete - reception shifts copy forward smoothly during auto-populate.

---

## Phase 5: User Story 3 - Volunteer Preferred Name Support (Priority: P1)

**Goal**: Allow volunteers to specify a preferred name and prioritize it across all roster views and cards.

**Independent Test**: Create volunteer with Full Name: "Guilherme Silveira", Preferred Name: "Gui". Verify card displays "Gui (Guilherme Silveira)" and shift cells / WhatsApp view display "Gui 🇧🇷".

### Implementation for User Story 3

- [x] T008 [US3] Add Preferred Name input field in `src/client/components/VolunteerModal.tsx` and persist in `src/server/services/volunteer-service.ts`
- [x] T009 [US3] Prioritize displaying preferred name across `src/client/pages/AdminVolunteersPage.tsx`, `src/client/components/ShiftSlotCell.tsx`, and `src/client/components/PrintableRosterView.tsx`

**Checkpoint**: User Story 3 complete - preferred names supported across all displays.

---

## Phase 6: User Story 4 - Date of Birth & Birthday Cake Alert (Priority: P1)

**Goal**: Capture volunteer Date of Birth and display a birthday cake icon (`🎂`) on their card in the 7 days leading up to and on their birthday.

**Independent Test**: Set a volunteer's DOB to 3 days from now. Open `/admin/volunteers` and verify `🎂 Birthday in 3 days!` badge is displayed. Set DOB to 2 months from now and verify no cake icon is shown.

### Implementation for User Story 4

- [x] T010 [US4] Add Date of Birth input field in `src/client/components/VolunteerModal.tsx`
- [x] T011 [US4] Display Date of Birth and render `🎂` birthday cake alert for birthdays within 7 days on volunteer cards in `src/client/pages/AdminVolunteersPage.tsx`

**Checkpoint**: User Story 4 complete - birthday cake alerts active.

---

## Phase 7: Polish & Validation

**Purpose**: End-to-end verification, build check, and test coverage

- [x] T012 [P] Run end-to-end quickstart verification scenarios from `specs/009-staff-fix-reception-copy-and-birthdays/quickstart.md`
- [x] T013 Execute full automated test suite (`npm test`) and production build (`npm run build`)

---

## Dependencies & Execution Order

```
Phase 1: Setup
     │
     ▼
Phase 2: Foundational (volunteers schema & date-utils)
     │
     ├──────────────────────┬──────────────────────┬──────────────────────┐
     ▼                      ▼                      ▼                      ▼
Phase 3: US1 (P1)      Phase 4: US2 (P1)      Phase 5: US3 (P1)      Phase 6: US4 (P1)
Fix Staff Assignment   Copy Reception Shifts  Preferred Names        DOB & Birthday Alert
     │                      │                      │                      │
     └──────────────────────┴──────────┬───────────┴──────────────────────┘
                                       ▼
                              Phase 7: Polish & Validation
```

### Parallel Opportunities

- **Phase 3 & Phase 4**: Staff assignment fix and auto-populate reception copy can be tested in `roster.test.ts`.
- **Phase 5 & Phase 6**: Preferred name and DOB inputs in `VolunteerModal.tsx` and `AdminVolunteersPage.tsx` can be implemented together.

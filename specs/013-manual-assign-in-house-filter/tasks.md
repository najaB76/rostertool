# Tasks: In-House Volunteer Candidate Filtering for Manual Shift Assignment

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

## Phase 1: Setup
- [x] T001 [P] Verify project dependencies in `package.json`

## Phase 2: User Story 1 - In-House Candidate Filter (Priority: P1)
- [x] T002 [P] [US1] Add test for in-house volunteer date filtering in `tests/api/volunteers.test.ts`
- [x] T003 [US1] Support `inHouseStart` and `inHouseEnd` filtering in `src/server/services/volunteer-service.ts` and `src/server/routes/admin-volunteers.ts`
- [x] T004 [US1] Update `src/client/components/ShiftAssignModal.tsx` to compute roster week range from `shift.date` and filter candidates strictly to volunteers in-house during the roster week

## Phase 3: Polish & Validation
- [x] T005 [P] Run tests (`npm test`) and production build check (`npm run build`)

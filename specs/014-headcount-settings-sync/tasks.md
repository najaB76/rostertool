# Tasks: Dynamic Headcount Capacity Settings Integration

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

## Phase 1: Setup
- [x] T001 [P] Verify project dependencies in `package.json`

## Phase 2: User Story 1 - Dynamic Headcount Settings (Priority: P1)
- [x] T002 [P] [US1] Add test for dynamic headcount status calculation in `tests/api/headcount.test.ts`
- [x] T003 [US1] Update `src/server/services/headcount-service.ts` to query `systemSettings` and calculate status dynamically
- [x] T004 [US1] Update `src/client/pages/AdminHeadcountPage.tsx` to fetch `/api/admin/settings` and render the Capacity Benchmarks banner dynamically

## Phase 3: Polish & Validation
- [x] T005 [P] Run tests (`npm test`) and production build check (`npm run build`)

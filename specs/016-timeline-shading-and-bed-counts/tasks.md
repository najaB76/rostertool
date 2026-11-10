# Tasks: Timeline Shading & Bed Count Capacity Adjustments

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

## Phase 1: Setup
- [x] T001 [P] Verify project dependencies in `package.json`

## Phase 2: User Story 1 & 2 - Bed Demand Count & Shading (Priority: P1)
- [x] T002 [P] [US2] Update `tests/api/timeline.test.ts` to verify volunteers departing on date $D$ are NOT included in overnight bed demand count on date $D$
- [x] T003 [US2] Update `src/server/routes/admin-timeline.ts` to exclude departure date from `dailyConfirmedCounts` (`departureDate > date`)
- [x] T004 [US1] Update `src/client/pages/AdminTimelinePage.tsx` to remove `'1'` and `'0'` text and render departure days with lighter hatched shading

## Phase 3: Polish & Validation
- [x] T005 [P] Run tests (`npm test`) and production build check (`npm run build`)

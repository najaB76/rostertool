# Tasks: Global Date Format Synchronization Across All Views

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

## Phase 1: Setup
- [x] T001 [P] Verify project dependencies in `package.json`

## Phase 2: User Story 1 - Global Date Format (Priority: P1)
- [x] T002 [P] [US1] Create unit tests for date format preference in `tests/client/date-format.test.ts`
- [x] T003 [US1] Build `DateFormatContext.tsx` in `src/client/context/DateFormatContext.tsx` and wrap app in `src/client/App.tsx`
- [x] T004 [US1] Update `AdminSettingsPage.tsx` to notify context on date format change
- [x] T005 [P] [US1] Update `AdminVolunteersPage.tsx` and `StayHistoryModal.tsx` to use `useDateFormat`
- [x] T006 [P] [US1] Update `AdminRosterPage.tsx`, `RosterGrid.tsx`, and `PrintableRosterView.tsx` to use `useDateFormat`
- [x] T007 [P] [US1] Update `AdminTimelinePage.tsx` to use `useDateFormat`
- [x] T008 [P] [US1] Update `AdminHeadcountPage.tsx` and `HeadcountCalendar.tsx` to use `useDateFormat`
- [x] T009 [P] [US1] Update `AdminTimeOffPage.tsx` to use `useDateFormat`

## Phase 3: Polish & Validation
- [x] T010 [P] Run tests (`npm test`) and production build check (`npm run build`)

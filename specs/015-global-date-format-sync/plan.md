# Implementation Plan: Global Date Format Synchronization Across All Views

**Branch**: `015-global-date-format-sync` | **Date**: 2026-10-27 | **Spec**: [specs/015-global-date-format-sync/spec.md](spec.md)

## Summary
Implement a global React `DateFormatContext` that reads `date_format_preference` from `/api/admin/settings` and applies the chosen formatting convention (`DD-MM-YYYY` vs `YYYY-MM-DD`) across all visual text displays in Volunteer Management, Weekly Roster, Timeline, Headcount, and Time Off views.

## Constitution Check
- **I. Test-First Engine & Invariants**: Backend dates remain ISO `YYYY-MM-DD`. **PASS**
- **II. Cultural Identity & High-Visibility Flags**: **PASS**
- **III. Self-Hosted Simplicity & Zero-Config**: **PASS**
- **IV. Human Override & Visual Highlighting**: User-controlled formatting preference honored everywhere. **PASS**

## Project Structure & File Roadmap
- `src/client/context/DateFormatContext.tsx`: New context provider exposing `formatDate` and `dateFormatPreference`.
- `src/client/App.tsx`: Wrap application in `<DateFormatProvider>`.
- `src/client/pages/AdminSettingsPage.tsx`: Call `setDateFormatPreference` when saving.
- Update date formatting calls in:
  - `src/client/pages/AdminVolunteersPage.tsx`
  - `src/client/components/StayHistoryModal.tsx`
  - `src/client/pages/AdminRosterPage.tsx`
  - `src/client/components/RosterGrid.tsx`
  - `src/client/components/PrintableRosterView.tsx`
  - `src/client/pages/AdminTimelinePage.tsx`
  - `src/client/pages/AdminHeadcountPage.tsx`
  - `src/client/pages/AdminTimeOffPage.tsx`
- `tests/client/date-format.test.ts`: Unit test date formatting utilities.

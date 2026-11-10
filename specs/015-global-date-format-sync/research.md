# Research & Technical Decisions: Global Date Format Synchronization

**Feature**: `015-global-date-format-sync`
**Date**: 2026-10-27
**Status**: Completed

## 1. Global Date Format Propagation Pattern

- **Decision**: Create a React `DateFormatContext` (`src/client/context/DateFormatContext.tsx`) that:
  - Fetches the active `date_format_preference` (`YYYY-MM-DD` or `DD-MM-YYYY`) from `/api/admin/settings`.
  - Exposes `dateFormatPreference`, `formatDate(dateStr, includeDayName?)`, and `setDateFormatPreference(pref)`.
  - Provides instant state updates when settings are saved in `AdminSettingsPage`.
  - Wraps the application inside `<DateFormatProvider>` in `App.tsx`.
- **Rationale**:
  - Centralizing date formatting logic in a React context guarantees that whenever a user toggles the date format in settings, every mounted component and future navigation immediately re-renders using the chosen format with zero manual page reload required.
  - Keeps underlying ISO dates (`YYYY-MM-DD`) intact for API payloads, storage, and date input values.

## 2. Views to Update
- **Volunteer Management** (`AdminVolunteersPage.tsx`, `StayHistoryModal.tsx`)
- **Weekly Roster** (`AdminRosterPage.tsx`, `RosterGrid.tsx`, `PrintableRosterView.tsx`, `ShiftAssignModal.tsx`)
- **Timeline View** (`AdminTimelinePage.tsx`)
- **Headcount Page** (`AdminHeadcountPage.tsx`, `HeadcountCalendar.tsx`)
- **Time Off Management** (`AdminTimeOffPage.tsx`)
- **Volunteer Portal** (`VolunteerPortalPage.tsx`)

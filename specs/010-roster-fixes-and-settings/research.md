# Research & Technical Decisions: Roster Fixes, Width Expansion & Housekeeping Settings

**Feature**: `010-roster-fixes-and-settings`
**Date**: 2026-10-27
**Status**: Completed

## 1. Shift Assignment Removal Bug Diagnosis & Fix

- **Decision**: Introduce a dedicated endpoint `POST /api/admin/roster/unassign` and point `handleRemoveClick` exclusively to it.
- **Rationale**:
  - The frontend `handleRemoveClick` was sending the ID of the person to remove to `POST /api/admin/roster/assign`.
  - The `/assign` handler interpreted the presence of the ID as an instruction to assign, resulting in adding staff again (creating duplicates) and keeping volunteers assigned.
  - Creating an explicit `/unassign` endpoint completely eliminates ambiguity.
- **Alternatives Considered**:
  - *Using query parameters or an action flag on /assign*: Prone to regression; explicit REST endpoints (`/assign` vs `/unassign`) provide clean separation of concerns.

---

## 2. Duplicate Assignment Prevention

- **Decision**:
  - Implement duplicate checks in `rosterService.assignShift` for both `staffId` and `volunteerId`.
  - Add database-level unique index on `(shift_definition_id, date, staff_id)`.
  - Clean up any pre-existing duplicate rows in SQLite on startup.
- **Rationale**:
  - No person should ever be assigned twice to the same shift on the same date.

---

## 3. Full-Width 95% Viewport Container

- **Decision**: Update `.admin-main` in `src/client/styles/main.css` from `max-width: 1200px` to `max-width: 95%`.
- **Rationale**:
  - A 7-day weekly schedule requires horizontal real estate. Expanding up to 95% screen width allows all 7 days to display side-by-side with zero horizontal scroll on standard and widescreen displays.

---

## 4. Housekeeping Operational Settings

- **Decision**:
  - Create a `system_settings` table in SQLite (`key TEXT PRIMARY KEY, value TEXT NOT NULL`).
  - Store:
    - `housekeepers_per_day` (default `3`)
    - `housekeeping_shifts_per_week` (default `4`)
    - `housekeeping_start_time` (default `10:00`)
    - `housekeeping_end_time` (default `14:00`)
  - When settings are saved, synchronize the `minStaff`, `startTime`, `endTime`, and `durationHours` on the `shift_definitions` record for Housekeeping.
  - Build `AdminSettingsPage.tsx` and link in the main navigation.
- **Rationale**:
  - Hostels operate with varying volunteer requirements across seasons. Providing management settings eliminates code alterations when operational hours or staffing counts change.

---

## 5. Time-Off Modal Start/End Date Defaulting

- **Decision**: In `TimeOffModal.tsx`, automatically update `endDate` to match `startDate` whenever `startDate` changes.
- **Rationale**:
  - Single-day requests represent the majority of leave requests. Automatically matching `endDate = startDate` saves clicks while still allowing volunteers to adjust `endDate` for multi-day trips.

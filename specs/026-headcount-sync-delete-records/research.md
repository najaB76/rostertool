# Research & Technical Decisions: Headcount In-House Synchronization and Record Deletion

**Feature**: `026-headcount-sync-delete-records`
**Date**: 2026-10-27
**Status**: Completed

## 1. Headcount In-House Calculation Discrepancy

- **Root Cause**:
  - In `src/server/services/headcount-service.ts`, `getDailyHeadcounts` only queried volunteers with `status IN ('Accepted', 'Active')` and `isNotNull(volunteers.departureDate)`.
  - It excluded:
    1. Volunteers with `noEndDate: true` or `departureDate == null`.
    2. Historical volunteers whose current status is `Departed` but who were active/in-house during past dates in the queried range.
  - Furthermore, it used `v.departureDate! >= dateStr` rather than overnight bed demand rule `v.departureDate > dateStr` (volunteers vacate on their departure date).
- **Decision**:
  - Align `HeadcountService.getDailyHeadcounts` with `admin-timeline.ts` stay resolution:
    - Collect confirmed volunteers: current `volunteers` with status in `('Active', 'Accepted')` and historical stays in `volunteer_stays`.
    - Check occupancy on date $D$: `v.arrivalDate <= D && (v.noEndDate || !v.departureDate || v.departureDate > D)`.
    - Guarantees 100% numerical and identity parity between `/admin/headcount` and `/admin/timeline`.

## 2. In-App Deletion of Volunteers & Zero-Orphan Invariant

- **Decision**:
  - Implement `deleteVolunteer(id: string)` in `src/server/services/volunteer-service.ts`.
  - Execute cascading delete in an atomic SQLite transaction:
    1. Delete from `shift_assignments` where `volunteer_id = id`.
    2. Delete from `time_off_requests` where `volunteer_id = id`.
    3. Delete from `stay_reviews` where `volunteer_id = id`.
    4. Delete from `volunteer_stays` where `volunteer_id = id`.
    5. Delete from `volunteers` where `id = id`.
  - Expose `DELETE /api/admin/volunteers/:id` in `src/server/routes/admin-volunteers.ts`.
  - In `AdminVolunteersPage.tsx` and `VolunteerModal.tsx`, add a red "Delete Volunteer" button with confirmation.

## 3. In-App Deletion of Stay Records

- **Decision**:
  - Implement `deleteStay(stayId: string)` in `src/server/services/volunteer-service.ts`.
  - Expose `DELETE /api/admin/volunteers/:id/stays/:stayId` in `src/server/routes/admin-volunteers.ts`.
  - In `StayHistoryModal.tsx`, add a "Delete Stay" button on each stay record with confirmation.

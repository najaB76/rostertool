# Quickstart: Headcount In-House Synchronization and Record Deletion

**Feature**: `026-headcount-sync-delete-records`

## Verification Scenarios

### Scenario 1: Headcount and Timeline Count Parity
1. Open `/admin/timeline` and observe "Total CONFIRMED Volunteers" for `2026-11-27` (e.g. 13).
2. Open `/admin/headcount` for date range covering `2026-11-27`.
3. Verify the count displayed on `/admin/headcount` for `2026-11-27` is exactly 13.

### Scenario 2: Delete Duplicate Volunteer
1. Navigate to `/admin/volunteers`.
2. Find a duplicate volunteer. Click "Edit" (or click "Delete Volunteer").
3. Confirm deletion.
4. Verify the volunteer disappears from the list, and SQLite contains 0 orphaned stays/shifts/time-off.

### Scenario 3: Delete Duplicate Stay Record
1. In `/admin/volunteers`, open "Stay History" for a volunteer with duplicate stays.
2. Click "Delete Stay" on the duplicate stay.
3. Confirm deletion.
4. Verify the stay is removed while the volunteer profile and remaining stays stay intact.

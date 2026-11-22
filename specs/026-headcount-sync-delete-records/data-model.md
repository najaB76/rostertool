# Data Model: Headcount In-House Synchronization and Record Deletion

**Feature**: `026-headcount-sync-delete-records`
**Date**: 2026-10-27
**Status**: Completed

## Headcount In-House Volunteer Definition

A volunteer $V$ with stay $(V.arrivalDate, V.departureDate, V.noEndDate)$ is counted as in-house on date $D$ iff:
1. $V.arrivalDate \le D$
2. $V.noEndDate = \text{true} \lor V.departureDate > D$
3. Point-in-time status is Confirmed (`Active`, `Accepted`, or historical stay overlapping $[startDate, endDate]$).

## Cascading Deletion Graph

```text
volunteers (id)
  ├── volunteer_stays (volunteer_id)
  ├── stay_reviews (volunteer_id)
  ├── shift_assignments (volunteer_id)
  └── time_off_requests (volunteer_id)
```
Executing `DELETE FROM volunteers WHERE id = :id` cascades through all 4 related tables within an atomic SQLite transaction.

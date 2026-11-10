# Quickstart & Verification Guide: Timeline Volunteers Scope & SVG Flags

**Feature**: `012-timeline-volunteers-and-flags`
**Date**: 2026-10-27
**Status**: Completed

## 1. Automated Verification Scenarios

### Scenario A: Exclude Paid Staff from Timeline
1. Ensure both permanent staff (`staff_users`) and volunteers (`volunteers`) exist in the database.
2. Query `GET /api/admin/timeline`.
3. Verify that:
   - No records from `staff_users` appear in `reception`, `housekeeping`, or `applied`.
   - All entries correspond exclusively to records in `volunteers`.
4. Open the UI at `/admin/timeline`:
   - Verify only volunteers appear in the Reception section.
   - Verify permanent staff (e.g., Steven Staff) do not appear in the timeline table.

### Scenario B: Verify Daily Confirmed Volunteer Counts
1. Count active volunteers on site for a given date $D$.
2. Verify the "Total CONFIRMED Staff Members" (or "Total CONFIRMED Volunteers") row for date $D$ equals exactly the number of on-site active/accepted volunteers, with 0 staff added.

### Scenario C: Constitution Principle II Authentic SVG Flags
1. Open `/admin/timeline`.
2. Inspect Column C (Country):
   - Verify each cell renders an authentic vector SVG flag (`country-flag-icons`).
   - Verify the country name is displayed adjacent to the flag (e.g. `[Flag] United Kingdom` or `[Flag] Spain`).
   - Verify NO bare two-letter codes (e.g. `GB`, `ES`, `NL`) are rendered without their national SVG flag.
3. Inspect Column B (Name):
   - Verify each volunteer name has their SVG national flag rendered directly beside it.

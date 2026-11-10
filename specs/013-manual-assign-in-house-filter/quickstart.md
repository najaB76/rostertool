# Quickstart: In-House Volunteer Candidate Filtering

**Feature**: `013-manual-assign-in-house-filter`

## Verification Scenario
1. Open `/admin/roster` on week `2026-11-09` to `2026-11-15`.
2. Click any shift slot to open `ShiftAssignModal`.
3. Verify only volunteers with stay overlapping `2026-11-09` to `2026-11-15` are shown.
4. Verify past volunteers (departed on or before `2026-11-08`) are NOT listed.
5. Verify future volunteers (arriving on or after `2026-11-16`) are NOT listed.

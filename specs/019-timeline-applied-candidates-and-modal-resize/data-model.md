# Data Model: Timeline Applied Candidates Population & Resizable Modal Fix

**Feature**: `019-timeline-applied-and-modal-resize`
**Date**: 2026-10-27
**Status**: Completed

## Timeline Section Allocation Invariant

For any timeline entry with stay dates overlapping $[T_{start}, T_{end}]$:

1. **`reception` / `housekeeping`**:
   - `status === 'Active'` (currently on site / in da house)
   - Historical stays that were on-site during $[T_{start}, T_{end}]$
2. **`applied`**:
   - `status === 'Accepted'` (incoming accepted volunteers scheduled for future or active stay dates who have not yet checked in)
   - `status === 'Applied'` (unconfirmed applicants)
3. **`dailyAppliedCounts[D]`**:
   - Total count of entries in `applied` whose dates include $D$.
4. **`dailyConfirmedCounts[D]`**:
   - Total count of confirmed bed allocations on night $D$ (`status IN ('Active', 'Accepted')` with `arrivalDate <= D` and `(noEndDate || departureDate > D)`).

# Data Model: Timeline Hierarchy, Roster Assignment Accuracy, and Visual Enhancements

**Feature**: `021-timeline-roster-ux-improvements`
**Date**: 2026-10-27
**Status**: Completed

## Timeline Structure

1. **`reception` / `housekeeping`**:
   - Volunteers with `status === 'Active'` or `status === 'Accepted'`
   - Historical on-site stays whose stay dates overlap the timeline window
2. **`applied`**:
   - Volunteers with `status === 'Applied'` (unconfirmed applicant pool)
3. **`dailyConfirmedCounts`**:
   - Nightly bed demand for confirmed volunteers (`Active` and `Accepted`)
4. **`dailyAppliedCounts`**:
   - Daily applicant volume for candidates in `applied` (`status === 'Applied'`)

## Shift Assignment Eligibility Rule

For a shift on date $D$:
A volunteer $V$ is eligible to be listed as a candidate if and only if:
1. $V.status \in \{\text{'Active'}, \text{'Accepted'}\}$
2. $V.arrivalDate \le D$
3. $V.noEndDate = \text{true} \lor V.departureDate \ge D$

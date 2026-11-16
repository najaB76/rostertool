# Quickstart: Timeline Hierarchy, Roster Assignment Accuracy, and Visual Enhancements

**Feature**: `021-timeline-roster-ux-improvements`

## Verification Scenarios

### Scenario 1: Confirmed Staff in Reception/Housekeeping & Applied in Bottom Section
1. Open `/admin/timeline`.
2. Verify volunteers who have moved past 'Applied' (`Active` and `Accepted`) appear in Reception or Housekeeping rows.
3. Verify only volunteers in the `'Applied'` state appear in the bottom section ("Unconfirmed (Applied Candidates)").
4. Verify "Total CONFIRMED Volunteers" calculates confirmed bed demand.

### Scenario 2: Shift-Day In-House Candidate Filtering
1. Open the weekly roster. Click a shift on Wednesday `2026-11-18`.
2. Verify only volunteers who are or will be on-site on `2026-11-18` are shown.
3. Verify volunteers who departed on or before `2026-11-17` are not shown.

### Scenario 3: Sticky Name Column & Column Highlight
1. On `/admin/timeline`, scroll horizontally to week 4 or 5.
2. Verify the Name and Sex columns remain pinned to the left edge of the screen.
3. Click any date in the header row $\rightarrow$ verify that date column is highlighted vertically. Click again $\rightarrow$ highlight toggles off.

### Scenario 4: Training Status Highlight on Printable Roster
1. On `/admin/roster`, assign a volunteer with `inTraining: true` to a shift.
2. Click "Print / Share Roster".
3. Verify on `PrintableRosterView` that the volunteer's shift cell has a light yellow background (`#fef9c3`).

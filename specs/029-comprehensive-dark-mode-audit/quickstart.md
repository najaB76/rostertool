# Quickstart: Comprehensive Dark Mode Theme Audit and Contrast Fixes

**Feature**: `029-comprehensive-dark-mode-audit`

## Verification Scenarios

### Scenario 1: Buttons
1. Enable dark mode.
2. Verify secondary buttons have `#334155` background with `#f8fafc` white text (no light-on-light).
3. Verify primary action buttons (blue, green, red) retain their vibrant backgrounds with white text.

### Scenario 2: Weekly Roster Grid
1. In dark mode, open `/admin/roster`.
2. Inspect the day column headers: verify dark background (`#1e293b`) with crisp white day names and light gray dates.
3. Verify shift slot cells and assignment chips use dark surfaces with legible text.

### Scenario 3: Timeline All Columns
1. In dark mode, open `/admin/timeline`.
2. Scroll horizontally across all columns (Age, Source, Status, Arrival, Departing, Days).
3. Verify all columns have dark surfaces (`#1e293b` / `#0f172a`) with high-contrast text.

### Scenario 4: Volunteers, Headcount, Admin Users & Settings
1. On `/admin/volunteers`: verify portal link container is dark themed.
2. On `/admin/headcount`: verify period title text is bright white.
3. On `/admin/users`: verify admin names are bright white and cards are `#1e293b`.
4. On `/admin/settings`: verify settings cards and form sections have dark backgrounds and readable labels.

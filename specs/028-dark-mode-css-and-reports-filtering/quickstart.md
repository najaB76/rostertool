# Quickstart: Complete Dark Mode CSS Audit, Report Date Slicing, and Sortable Tables

**Feature**: `028-dark-mode-css-and-reports-filtering`

## Verification Scenarios

### Scenario 1: Dark Mode Contrast Audit
1. Enable Dark Mode via navigation header.
2. Visit `/admin/roster`: verify schedule cells and shift blocks are dark with legible white/light text.
3. Visit `/admin/volunteers`: verify volunteer cards have dark backgrounds (`#1e293b`) with light text.
4. Visit `/admin/timeline`: verify table cells and headers adapt to dark surfaces.
5. Open `VolunteerModal` and `StayHistoryModal`: verify dialogs use dark surfaces.

### Scenario 2: Reports Date Period Filtering
1. Open `/admin/reports`.
2. Click "This Year" preset: verify metrics update.
3. Click "Last Year" preset: verify metrics update for the previous year.
4. Select "All Time": verify metrics revert to full historical data.

### Scenario 3: Sortable Report Tables
1. In `/admin/reports`, click "By Country" tab.
2. Click "Avg Rating" header $\rightarrow$ verify rows sort descending.
3. Click "Avg Rating" header again $\rightarrow$ verify rows sort ascending.

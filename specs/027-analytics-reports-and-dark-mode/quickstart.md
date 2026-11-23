# Quickstart: Volunteer Analytics & Reporting, Timeline Datepicker, and Accessible Dark Mode

**Feature**: `027-analytics-reports-and-dark-mode`

## Verification Scenarios

### Scenario 1: Volunteer Analytics & Reporting Tab
1. Log in to the Admin interface.
2. In the top navigation bar, click `📊 Reports`.
3. Verify KPI summary cards display Total Volunteers, Total Stays, Average Rating, and Rehire Rate.
4. Switch through report views:
   - **By Country**: Verify bar chart and table show country counts and average ratings.
   - **By Continent**: Verify aggregation into Europe, Americas, Asia, Oceania, Africa.
   - **By Age**: Verify breakdown by age brackets.
   - **By Gender**: Verify ratings and counts for Male/Female.
   - **Rehire Ratios**: Verify Accept vs Possible vs Do Not Accept breakdown.

### Scenario 2: Timeline Datepicker
1. Navigate to `/admin/timeline`.
2. Locate the datepicker input in the header.
3. Select any date (e.g. `2024-06-15`).
4. Verify the timeline jumps immediately to that week and displays on-site volunteers.

### Scenario 3: Accessible Dark Mode & Flag Contrast
1. Click the dark mode toggle (☀️/🌙) in the navigation bar.
2. Verify all pages display dark backgrounds with legible light text.
3. Inspect country flags: verify flags have a subtle border preventing dark flags from blending in.
4. Refresh browser: verify dark mode preference is preserved.

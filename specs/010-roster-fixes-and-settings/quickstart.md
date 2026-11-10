# Quickstart & Verification Guide: Roster Fixes, Width Expansion & Housekeeping Settings

**Feature**: `010-roster-fixes-and-settings`
**Date**: 2026-10-27
**Status**: Completed

## 1. Automated Verification Scenarios

### Scenario A: Unassigning Staff and Volunteers (Bug Fix)
1. Go to `/admin/roster`.
2. On any shift with an assigned staff member, click the **"×"** remove icon.
3. Confirm "Remove this assignment?".
4. Verify the staff member is deleted from the shift slot (not duplicated!).
5. Repeat for an assigned volunteer: click **"×"**, confirm, and verify they are removed cleanly.

### Scenario B: Duplicate Assignment Prevention (Bug Fix)
1. Assign a staff member to a shift slot.
2. Attempt to assign the same staff member to that same slot again:
   - Verify the staff member appears at most once in that shift slot.
3. Attempt to assign the same volunteer to that same slot twice:
   - Verify they appear at most once.

### Scenario C: 95% Dynamic Viewport Width
1. Open `/admin/roster` on desktop.
2. Observe the roster layout expands to 95% of the screen width.
3. Verify all 7 days fit horizontally without side scrolling.

### Scenario D: Housekeeping Operational Settings
1. Navigate to `/admin/settings` from the top navigation.
2. Update:
   - Housekeepers needed per day: `4`
   - Housekeeping shifts per week: `5`
   - Start Time: `09:30`
   - End Time: `13:30`
3. Click "Save Settings".
4. Go to `/admin/roster`:
   - Verify Housekeeping slots now indicate `0 / 4` needed.
   - Click "Auto-Populate" $\to$ verify 4 housekeepers scheduled per day.

### Scenario E: Time-Off Start/End Date Defaulting
1. Open volunteer portal via magic link (`/portal?token=...`).
2. Click "Request Time Off".
3. Select Start Date: `2026-11-06`.
4. Observe End Date automatically fills with `2026-11-06`.
5. Notice the summary preview: `Requesting 1 day off (2026-11-06)`.

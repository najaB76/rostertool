# Quickstart & Verification Guide: Roster, Lifecycle & Headcount Refinements

**Feature**: `002-roster-lifecycle-refinements`
**Date**: 2026-10-27
**Status**: Completed

## 1. Automated Verification Scenarios

### Scenario A: Three-Shift Roster Verification
1. Open the weekly roster page: `http://localhost:3000/admin/roster`.
2. Select any week.
3. Inspect every day column from Monday to Sunday:
   - Verify every day has exactly 3 shift cards: Housekeeping, Reception Day, and Reception Evening.
   - Verify Monday through Thursday and Sunday show `16:00 - 00:00`.
   - Verify Friday and Saturday show `17:00 - 01:00`.
   - Verify zero redundant or inactive evening shifts appear.

### Scenario B: Full Volunteer Lifecycle Progression
1. Go to `http://localhost:3000/admin/volunteers`.
2. Click **"+ New Application"**:
   - Select Country from dropdown: type "Germany" $\to$ select "🇩🇪 Germany (DE)".
   - Select Source from dropdown: select "WorkAway".
   - Enter notes: "Applied via WorkAway, speaks fluent German & English".
   - Save.
3. Navigate to the **Applied** tab:
   - Click **"Accept"** on the applicant card.
   - Confirm stay dates and role.
   - Click **"Confirm Acceptance"**.
4. Navigate to the **Accepted** tab:
   - Verify volunteer appears with stay dates, country flag, and notes.
   - Click **"Mark as Arrived / Active"**.
5. Navigate to the **Active** tab:
   - Verify volunteer appears and is available for roster scheduling.
   - Click **"Depart"**: enter rating 5, qualitative notes, and set re-hire to "Accept".
6. Navigate to the **Departed** tab:
   - Verify volunteer is archived with exit review and notes.
   - Open modal and verify notes can still be viewed and updated.

### Scenario C: Headcount Calendar Navigation & Heatmap
1. Go to `http://localhost:3000/admin/headcount`.
2. Click **"< Previous Month"**, **"Next Month >"**, and **"Today"**; verify calendar dates update smoothly.
3. Click view toggle **"Quarter"**:
   - Verify 3 months display with Previous/Next Quarter navigation.
4. Click view toggle **"Year"**:
   - Verify 12 months display with Previous/Next Year navigation.
5. Click **"Compact Heatmap"**:
   - Verify days render as clean, colored blocks without date text or list noise.

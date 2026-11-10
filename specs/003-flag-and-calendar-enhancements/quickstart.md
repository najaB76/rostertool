# Quickstart & Verification Guide: Flag, Roster & Headcount Enhancements

**Feature**: `003-flag-and-calendar-enhancements`
**Date**: 2026-10-27
**Status**: Completed

## 1. Verification Scenarios

### Scenario A: Universal SVG Flag Graphic Verification
1. Open the application on any browser/platform (including Windows or Linux):
   - Roster page: `http://localhost:3000/admin/roster`
   - Volunteers page: `http://localhost:3000/admin/volunteers`
2. Inspect flags beside volunteer names (e.g. 🇫🇷, 🇩🇪, 🇧🇷, 🇬🇧).
3. Verify all flags render as **graphic colored images** (SVG vectors) rather than two-letter text boxes (like "FR" or "DE").

### Scenario B: First-Name Display on Daily Shift Grid
1. Open `http://localhost:3000/admin/roster`.
2. Observe volunteer shift cells:
   - "Elena Rostova" appears cleanly as **"Elena"** with her flag icon.
   - Hovering over "Elena" displays the tooltip: `"Elena Rostova (Housekeeping)"`.
   - Shift cell height and padding remain compact and readable.

### Scenario C: Magic Link Management
1. Navigate to `http://localhost:3000/admin/volunteers`.
2. Inspect any volunteer card on the **Active** or **Accepted** tab:
   - Notice the Magic Link section displaying the full portal URL.
   - Click **"Copy Link"**: notice visual confirmation (`"Copied!"`).
   - Click **"Reset Link"**: confirm dialog $\to$ verify token updates immediately in the URL.
3. Open the copied URL in a private browser window to confirm portal access.

### Scenario D: Monday-First Headcount Calendar Alignment
1. Navigate to `http://localhost:3000/admin/headcount`.
2. Select October 2026:
   - Verify column headers read: `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`.
   - October 1 (Thursday) is placed in Column 4 (`Thu`).
   - Columns 1–3 (`Mon`, `Tue`, `Wed`) are blank offset cells.
   - October 27 (Tuesday) sits squarely in **Column 2 (`Tue`)**.
3. Toggle "Compact Heatmap" mode: verify day cells retain Monday-first alignment.

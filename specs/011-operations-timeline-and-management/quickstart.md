# Quickstart & Verification Guide: Operations, Timeline & Volunteer Management

**Feature**: `011-operations-timeline-and-management`
**Date**: 2026-10-27
**Status**: Completed

## 1. Automated Verification Scenarios

### Scenario A: Reception Qualification & Shift Date Boundary Guards
1. Navigate to `/admin/roster`.
2. Click on an unassigned Reception Day or Evening shift slot.
3. Verify only reception-qualified volunteers (`isReceptionQualified = true`) and qualified staff appear in the dropdown. Non-reception volunteers must NOT be shown.
4. Pick a volunteer whose stay is from `2026-11-10` to `2026-11-24`.
5. Attempt to assign them to a shift on `2026-11-05` (before arrival).
6. Verify assignment is rejected with an explicit warning: *"Cannot assign shift outside volunteer stay dates"*.

---

### Scenario B: Shift Over-Allocation Confirmation Warning
1. On `/admin/roster`, assign a volunteer to 4 housekeeping shifts (16 hours).
2. Attempt to assign a 5th shift to the same volunteer in the same week.
3. Verify an override confirmation dialog appears:
   *"Volunteer already has 16 assigned hours this week (target: 16h). Do you want to assign this additional shift?"*
4. Click "Cancel": verify the slot remains unassigned.
5. Click "Confirm": verify the shift is successfully assigned (manager override honored).

---

### Scenario C: Volunteer Profile, Departure Modal & Rehire Badges
1. Navigate to `/admin/volunteers`.
2. Create or edit a volunteer:
   - Select Gender: `Female`
   - Select Source: `Worldpackers`
   - Check "No end date" (open-ended stay)
3. Observe profile card:
   - Name shows gender symbol: `Maria ♀`
   - Card displays calculated **Age** (e.g. `Age 21`) instead of full birth date.
4. Click "Mark as Departed" on an active volunteer:
   - Verify modal opens with interactive 5-star rating control, notes textarea, and Rehire status dropdown (`Accept`, `Possible`, `Don't Accept`).
   - Select 4 Stars, write *"Great attitude"*, select `Accept`. Submit.
5. Switch to the "Departed" tab:
   - Verify rating shows 4 visual stars (★★★★☆).
   - Verify rehire status shows a green badge `Accept`.

---

### Scenario D: Multi-Stay History & Re-Activate Volunteer
1. On the "Departed" tab, locate the departed volunteer.
2. Click "Re-activate":
   - Verify modal prompts for new Arrival Date and Departure Date.
   - Enter new dates for next season. Submit.
3. Verify volunteer transitions back to `Accepted` / `Active`.
4. Click "Stay History":
   - Verify past stay dates, 4-star rating, and comments are preserved.

---

### Scenario E: Volunteer Filters
1. In `/admin/volunteers`, open the filter bar.
2. Filter by Gender: `Female` $\to$ only female volunteers display.
3. Filter by Rehire Status: `Accept` $\to$ only re-hireable alumni display.
4. Filter by Rating: `4★+` $\to$ only volunteers with $\ge 4$ stars display.

---

### Scenario F: Staffing Timeline View
1. Click **"Timeline"** in the top navigation header (`/admin/timeline`).
2. Observe 3 categorized horizontal tiers:
   - Active & Accepted Reception staff
   - Active & Accepted Housekeeping staff
   - Applied (unconfirmed) candidates
3. Inspect rows: Gender symbol, Name with country flag, Nationality, Age, Source, Status, Arrival, Departure.
4. Verify horizontal calendar bars spanning at least 5 weeks.
5. Verify "Total Confirmed Staff Members" summary row shows daily totals with color coding matching headcount thresholds.
6. Use date navigation buttons to scroll backward and forward in time.

---

### Scenario G: Headcount & Global Date Format Settings
1. Navigate to `/admin/settings`.
2. Update Headcount targets: Baseline `11`, Low `8–10`, Critical `< 8`, Overbooked `> 11`.
3. Switch Date Format Preference to `DD-MM-YYYY`. Click "Save Settings".
4. Navigate to `/admin/roster` and `/admin/volunteers`:
   - Verify dates display in European format `DD-MM-YYYY`.
5. Return to `/admin/settings` and switch back to `YYYY-MM-DD`.

---

### Scenario H: Data Backup Export & Historical Import CLI Script
1. In `/admin/settings`, click "Download Database Backup".
2. Verify browser downloads `rostertool-backup.sqlite`.
3. In terminal, test historical migration script:
   ```bash
   npm run import:history -- sample-legacy.csv
   ```
4. Verify historical records are parsed and stored in `volunteers` and `volunteer_stays`.

---

### Scenario I: Volunteer Portal Day of Week Display
1. Open the volunteer portal (`/portal?token=...`).
2. Check "My Upcoming Shifts":
   - Verify dates are rendered with day of week (e.g., `Monday, 2026-11-09`).
3. Check "My Time Off Requests":
   - Verify dates are rendered with day of week (e.g., `Friday, 2026-11-13`).

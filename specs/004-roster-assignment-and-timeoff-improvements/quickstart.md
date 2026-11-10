# Quickstart & Verification Guide: Assignment Modal, Country Search & Multi-Day Time-Off

**Feature**: `004-roster-assignment-and-timeoff-improvements`
**Date**: 2026-10-27
**Status**: Completed

## 1. Automated Verification Scenarios

### Scenario A: Shift Assignment Modal
1. Navigate to `http://localhost:3000/admin/roster`.
2. Click **"+ Assign"** on an open Housekeeping shift:
   - Verify an interactive modal opens titled "Assign to Housekeeping".
   - Notice the shift date, time (10:00 - 14:00), and duration (4.0h).
   - Observe the candidate list showing active volunteers with flags and assigned hours.
   - Click a volunteer: verify they are assigned immediately, the modal closes, and their first name + flag appears on the cell.
3. Click **"+ Assign"** on an open Reception shift:
   - Verify both paid staff and reception-qualified volunteers are listed.

### Scenario B: Complete 250+ Searchable Country Picker
1. Navigate to `http://localhost:3000/admin/volunteers`.
2. Click **"+ New Application"**.
3. Click the Country Selector:
   - Notice the search filter input at the top.
   - Type "Jam" $\to$ observe **Jamaica (JM)** with its vector flag 🇯🇲.
   - Type "Barba" $\to$ observe **Barbados (BB)** with its flag 🇧🇧.
   - Type "Cur" $\to$ observe **Curaçao (CW)** with its flag 🇨🇼.
   - Type "Bah" $\to$ observe **Bahamas (BS)** with its flag 🇧🇸.
   - Select Jamaica $\to$ verify 🇯🇲 vector flag displays beside Jamaica in the trigger.

### Scenario C: Multi-Day Time-Off Request
1. Open the volunteer portal: `http://localhost:3000/portal?token=<token>`.
2. Click **"Request Time Off"**:
   - Select Start Date: `2026-11-06` (Friday).
   - Select End Date: `2026-11-08` (Sunday).
   - Enter reason: "Island sightseeing trip".
   - Submit.
3. Verify 3 daily requests are generated (Nov 6, Nov 7, Nov 8) with status `Pending`.

# Quickstart & Verification Guide: Time-Off Review & Assignment Guards

**Feature**: `005-timeoff-review-and-assignment-guards`
**Date**: 2026-10-27
**Status**: Completed

## 1. Automated Verification Scenarios

### Scenario A: Admin Time-Off Page Review
1. Open `http://localhost:3000/admin/time-off` from the top navigation bar.
2. Verify all pending requests are listed with volunteer name, country flag, requested dates, and reason.
3. Click **"Approve"**: verify the status updates to `Approved` and moves out of the Pending tab.
4. Click **"Decline"**: verify status updates to `Denied`.

### Scenario B: Shift Override Warning on Approved Time-Off
1. Ensure volunteer "Elena" has approved time-off on `2026-11-06`.
2. Go to the weekly roster for that week (`http://localhost:3000/admin/roster`).
3. Click **"+ Assign"** on an open Housekeeping shift on `2026-11-06`.
4. In `ShiftAssignModal`, observe Elena has a badge: `⚠️ Time Off Approved`.
5. Click **"Assign"** next to Elena:
   - A browser dialog prompts: `"Warning: Elena has approved time-off on 2026-11-06. Do you want to override and assign them anyway?"`
   - Click **Cancel**: verify no assignment is made.
   - Click **Assign** again and click **OK**: verify Elena is assigned to the shift.

### Scenario C: Volunteer Self-Service Time-Off Cancellation
1. Open the volunteer portal via magic link (`http://localhost:3000/portal?token=...`).
2. Under "My Time Off Requests", observe submitted requests.
3. Click **"Cancel Request"** on a pending or upcoming request.
4. Confirm cancellation.
5. Verify status updates to `Cancelled` and the day off is released.

### Scenario D: Reception Qualification Guard
1. Go to `http://localhost:3000/admin/roster`.
2. Click **"+ Assign"** on an open Reception Day or Reception Evening shift.
3. Observe volunteers who are NOT reception qualified (e.g. only Housekeeping):
   - Their "Assign" button is **disabled** (grayed out) with the label `"Not Reception Qualified"`.
   - Clicking does nothing.
4. Observe volunteers who ARE reception qualified: their "Assign" button is enabled.

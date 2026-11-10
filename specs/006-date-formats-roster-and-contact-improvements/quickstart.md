# Quickstart & Verification Guide: Date Formats, Roster Navigation & Volunteer Contacts

**Feature**: `006-date-formats-roster-and-contact-improvements`
**Date**: 2026-10-27
**Status**: Completed

## 1. Automated Verification Scenarios

### Scenario A: Date Format Consistency
1. Navigate to `/admin/time-off`.
2. Observe the date fields on every time-off card:
   - Requested Date displays as `YYYY-MM-DD` (e.g. `2026-11-06`).
   - Submitted date displays as `YYYY-MM-DD` (e.g. `2026-10-27`).
   - Zero occurrences of `DD/MM/YYYY`.

### Scenario B: Monday Roster Snapping & Navigation Buttons
1. Navigate to `/admin/roster`.
2. Inspect the date picker:
   - Pick a Wednesday (e.g. `2026-10-28`).
   - Observe the picker automatically snap to Monday `2026-10-26`.
3. Click **`Next Week →`**:
   - Verify the week jumps to `2026-11-02` (next Monday).
4. Click **`← Previous Week`**:
   - Verify the week steps back to `2026-10-26`.
5. Click **`This Week`**:
   - Verify the roster snaps to the current calendar week's Monday.
6. Verify the header displays: `Monday, YYYY-MM-DD to Sunday, YYYY-MM-DD`.

### Scenario C: Volunteer Email & Phone Capture
1. Navigate to `/admin/volunteers`.
2. Click **"+ New Application"**:
   - Enter Full Name: `Carlos Santana`.
   - Select Country: `🇲🇽 Mexico (MX)`.
   - Enter Email: `carlos@example.com`.
   - Enter Phone: `+52 55 1234 5678`.
   - Save.
3. Observe Carlos's volunteer card on the **Applied** tab:
   - Email is displayed with clickable link: `mailto:carlos@example.com`.
   - Phone is displayed with clickable link: `tel:+52 55 1234 5678`.
4. Click **"Edit / Notes"**: verify the email and phone fields are populated and editable.

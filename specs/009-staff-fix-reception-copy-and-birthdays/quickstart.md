# Quickstart & Verification Guide: Staff Assignment Fix, Reception Copy & Birthdays

**Feature**: `009-staff-fix-reception-copy-and-birthdays`
**Date**: 2026-10-27
**Status**: Completed

## 1. Automated Verification Scenarios

### Scenario A: Staff Shift Assignment (Bug Fix)
1. Go to `http://localhost:3000/admin/roster`.
2. Click **"+ Assign"** on an open Reception shift (e.g. Wednesday 8am - 4pm).
3. In `ShiftAssignModal`, scroll to "Permanent Paid Staff" and click **"Assign Staff"** next to `Hervé Blanc`.
4. Observe the modal closes.
5. Verify the cell on Wednesday now shows `Hervé` with the French flag 🇫🇷.
6. Verify clicking remove unassigns Hervé cleanly.

### Scenario B: Copy Previous Week's Reception Shifts
1. On `/admin/roster`, ensure Week 1 (e.g. Oct 19 - Oct 25) has assigned receptionists on Monday (e.g. Hervé on Day Reception, Chris on Evening Reception).
2. Advance to Week 2 (e.g. Oct 26 - Nov 01).
3. Click **"⚡ Auto-Populate"**.
4. Observe Week 2 auto-populates:
   - Monday Day Reception automatically has `Hervé 🇫🇷`.
   - Monday Evening Reception automatically has `Chris 🇮🇹`.
   - Housekeeping shifts are filled with active volunteers.

### Scenario C: Volunteer Preferred Name
1. Go to `/admin/volunteers`.
2. Click **"+ New Application"**:
   - Full Name: `Guilherme Silveira`.
   - Preferred Name: `Gui`.
   - Country: Brazil (BR) 🇧🇷.
   - Save.
3. Observe on their card: `Gui (Guilherme Silveira)`.
4. Assign Gui to a Housekeeping shift on the roster:
   - Verify the cell displays `Gui` with Brazilian flag 🇧🇷.
   - Open WhatsApp portrait view: verify `Gui 🇧🇷` is displayed.

### Scenario D: Date of Birth & 7-Day Birthday Alert
1. In the volunteer modal, set Guilherme's Date of Birth to 4 days from today's date (month & day).
2. Save and observe his volunteer card:
   - Shows a prominent festive banner: `🎂 Birthday in 4 days!`.
3. Set another volunteer's DOB to 3 months from now:
   - Verify no birthday cake icon is displayed.

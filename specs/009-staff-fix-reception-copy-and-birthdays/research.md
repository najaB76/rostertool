# Research & Technical Decisions: Staff Assignment Fix, Reception Copy & Birthdays

**Feature**: `009-staff-fix-reception-copy-and-birthdays`
**Date**: 2026-10-27
**Status**: Completed

## 1. Staff Shift Assignment Bug Fix

- **Decision**: Update `POST /api/admin/roster/assign` in `src/server/routes/admin-roster.ts` to check `if (!volunteerId && !staffId)` before unassigning.
- **Rationale**:
  - The previous code checked `if (volunteerId === null || staffId === null)`. When assigning a staff member, `volunteerId` is `null`, which triggered the unassign branch and wiped the slot instead of saving the staff assignment.
  - Ensuring `assignShift` cleanly updates `staff_id` and that `unassignShift` only executes when neither `volunteerId` nor `staffId` is provided permanently resolves this bug.
- **Alternatives Considered**:
  - *Separate endpoint for staff assignment*: Unnecessary complication; unifying `/assign` to accept either `volunteerId` or `staffId` is clean and RESTful.

---

## 2. Copy Previous Week's Reception Shifts During Auto-Populate

- **Decision**:
  - In `rosterService.autoPopulateRoster(weekStartDate)`:
    1. Query all reception shift assignments from the preceding week (`weekStartDate - 7 days`).
    2. For each day, copy the reception assignment (both AM and PM) forward to the corresponding day of the target week, provided the staff member or volunteer is still active and has no approved time-off / PTO on that day.
    3. Feed the copied assignments into the constraint solver as fixed pre-assignments, solving housekeeping and any unfilled shifts around them.
- **Rationale**:
  - Reception schedules are mostly fixed routines. Copying forward preserves team consistency and eliminates repetitive manual scheduling every week.
- **Alternatives Considered**:
  - *Manually clicking a "Copy Reception" button*: Automated copy during auto-populate fulfills the user request directly in 1 click.

---

## 3. Volunteer Preferred Name

- **Decision**:
  - Add `preferred_name: text('preferred_name')` to the `volunteers` table.
  - Expose "Preferred Name (Optional)" in `VolunteerModal.tsx`.
  - In all roster and cell displays (`RosterGrid`, `ShiftSlotCell`, `PrintableRosterView`), prioritize `preferredName` over legal first name when rendering.
- **Rationale**:
  - Allows volunteers to be known by their chosen names and nicknames while preserving their official legal passport name for records.

---

## 4. Date of Birth & 7-Day Birthday Cake Alert

- **Decision**:
  - Add `date_of_birth: text('date_of_birth')` to the `volunteers` table.
  - Add a reusable helper in `date-utils.ts`: `getBirthdayAlert(dob: string)`:
    - Calculates the volunteer's birthday in the current calendar year (and next year for December-to-January rollover).
    - If the birthday is between 0 and 7 days from today (inclusive), returns an alert object: `{ daysUntil: number, formattedBirthday: string }`.
  - On `AdminVolunteersPage.tsx`, render a festive birthday badge: `🎂 Birthday [Date] (in X days)!` on their card.
- **Rationale**:
  - Gives hostel managers advance notice (7 days) to prepare celebrations, group cards, or birthday cakes.

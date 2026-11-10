# Feature Specification: Roster Fixes, Width Expansion & Housekeeping Settings

**Feature Branch**: `010-roster-fixes-and-settings`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User description: "Bugs and improvements: 1. BUG: Clicking the X icon to remove a staff/volunteer from a shift doesn't remove them: it actually adds staff users a second time (This can be repeated multiple times), and fails to remove volunteers. 2. BUG: No staff member or volunteer should be listed more than once for a given shift. 3. The roster view has too much whitespace at the sides which results in sideways scrolling as the roster fills out. Allow the width of the DIV containing the roster to expand dynamically up to 95% of the screen width so that there is no need to scroll in most cases. 4. Add a settings page that allows changing the following: number of housekeepers needed per day (keep a default of 3), how many housekeeping shifts to assign per week (keep a default of 4), the housekeeping shift hours (keep a default of 10am to 2pm). 5. When a volunteer is requesting time off, when they select the start date, default the end date to the same date so that it's easier to select a single day off."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Shift Assignment Removal Bug Fix (Priority: P1)

As a hostel manager, when I click the "×" remove icon on any assigned volunteer or staff member on a shift cell, I want that person to be immediately unassigned and removed from the slot, rather than being duplicated or re-added.

**Why this priority**: Severe bug; clicking remove currently calls the assignment endpoint with the user's ID, which adds staff members again and duplicates assignments instead of deleting them.

**Independent Test**: Assign a staff member to a Reception shift. Click the "×" remove button on their name badge. Confirm removal. Verify the staff member is deleted from that shift slot and the cell updates to show they are removed. Assign a volunteer to a Housekeeping shift. Click "×" remove. Confirm. Verify the volunteer is removed from the shift.

**Acceptance Scenarios**:

1. **Given** an assigned staff member on a shift, **When** the manager clicks the "×" remove button and confirms, **Then** the staff member is removed from that shift slot.
2. **Given** an assigned volunteer on a shift, **When** the manager clicks the "×" remove button and confirms, **Then** the volunteer is removed from that shift slot.
3. **Given** an unassign action, **Then** the system calls a dedicated unassign endpoint (`POST /api/admin/roster/unassign`) that strictly deletes the target assignment record.

---

### User Story 2 - Duplicate Assignment Prevention Guard (Priority: P1)

As a hostel manager, I want the system to strictly prevent any volunteer or staff member from being assigned more than once to the same shift slot on the same date, so that duplicates can never appear on the roster.

**Why this priority**: Duplicate assignments distort staffing counts and create confusing schedules.

**Independent Test**: Attempt to assign staff member "Hervé" to Monday Reception Day. Attempt to assign "Hervé" a second time to the same shift slot. Verify the system blocks duplicate assignment. Inspect the database and roster view to confirm Hervé appears at most once in that slot.

**Acceptance Scenarios**:

1. **Given** a volunteer or staff member already assigned to a shift on date $D$, **When** attempting to assign that same person to that same shift definition on date $D$, **Then** the system ignores or rejects the duplicate assignment.
2. **Given** the database schema, **Then** unique constraints and assignment logic enforce uniqueness for both `(shift_definition_id, date, volunteer_id)` and `(shift_definition_id, date, staff_id)`.

---

### User Story 3 - Full-Width Dynamic Roster Layout (Priority: P1)

As a hostel manager viewing the weekly roster on a desktop or laptop monitor, I want the roster container to expand dynamically up to 95% of the screen width, so that all 7 daily columns fit comfortably without unnecessary horizontal scrolling.

**Why this priority**: The previous hardcoded 1200px width limit left massive unused whitespace margins on wide screens, cramming 7 columns and forcing awkward sideways scrolling.

**Independent Test**: Open `/admin/roster` on a standard 1080p or wide monitor. Observe the roster grid expands across 95% of the viewport width. Confirm all 7 days (Monday through Sunday) render side-by-side with zero horizontal scrolling required.

**Acceptance Scenarios**:

1. **Given** the weekly roster page, **When** viewed on screens wider than 1200px, **Then** the roster container expands up to 95% of screen width.
2. **Given** the expanded layout, **Then** each day column has sufficient breathing room to display multiple volunteer badges without clipping or overflow.

---

### User Story 4 - Housekeeping Operational Settings (Priority: P1)

As a hostel manager, I want a Settings page where I can customize the housekeeping requirements (number of housekeepers needed per day, housekeeping shifts per week per volunteer, and housekeeping shift start/end hours), so that auto-scheduling and roster staffing rules adapt to our hostel's operational needs.

**Why this priority**: Hostels have varying daily housekeeping requirements and working hours depending on season and occupancy.

**Independent Test**: Navigate to `/admin/settings`. Update "Housekeepers needed per day" from 3 to 4. Update "Housekeeping shift hours" to 10:00 – 14:00. Save settings. Go to `/admin/roster`: verify Housekeeping shift slots now require 4 staff (`0 / 4`). Run auto-populate: verify the solver schedules 4 housekeepers per day.

**Acceptance Scenarios**:

1. **Given** the admin navigation, **When** clicking "Settings", **Then** the user is taken to `/admin/settings`.
2. **Given** the settings page, **When** editing:
   - Housekeepers needed per day (default 3)
   - Shifts assigned per volunteer per week (default 4)
   - Shift start and end hours (default 10:00 to 14:00)
   **Then** saving updates `system_settings` and `shift_definitions`.
3. **Given** updated settings, **When** viewing the roster and running auto-populate, **Then** the new staffing caps and hours are immediately applied.

---

### User Story 5 - Automatic Time-Off End Date Defaulting (Priority: P2)

As a volunteer submitting a time-off request in the portal, when I pick a Start Date, I want the End Date to automatically default to the same date, so that requesting a single day off is effortless and requires only one date selection.

**Why this priority**: The vast majority of time-off requests are for a single day; requiring volunteers to pick both start and end dates separately is redundant friction.

**Independent Test**: In the volunteer portal, click "Request Time Off". Select Start Date: `2026-11-06`. Observe the End Date input is automatically populated with `2026-11-06`. The summary banner reads: `Requesting 1 day off (2026-11-06)`. If the volunteer wants a multi-day trip, they can still pick a different End Date.

**Acceptance Scenarios**:

1. **Given** the time-off request modal, **When** the volunteer selects or changes the Start Date, **Then** the End Date automatically updates to match the Start Date.
2. **Given** the matched dates, **Then** the day count preview displays 1 day.
3. **Given** a multi-day leave, **When** the volunteer subsequently edits the End Date, **Then** the multi-day range is respected.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a dedicated unassign endpoint `POST /api/admin/roster/unassign` that deletes the specific assignment matching `shiftDefinitionId`, `date`, and `volunteerId` (or `staffId`).
- **FR-002**: The frontend remove button (`handleRemoveClick`) MUST call `POST /api/admin/roster/unassign` and never call `/assign`.
- **FR-003**: The database and backend MUST strictly enforce uniqueness for shift assignments, preventing duplicate entries of the same volunteer or staff member for the same shift on the same date.
- **FR-004**: The main container for the administration layout (`.admin-main`) MUST expand dynamically up to `95%` of the viewport width.
- **FR-005**: The system MUST provide an `/admin/settings` page accessible to authenticated managers.
- **FR-006**: The settings page MUST allow viewing and editing:
  - `housekeepersPerDay` (default 3)
  - `housekeepingShiftsPerWeek` (default 4)
  - `housekeepingStartTime` (default "10:00")
  - `housekeepingEndTime` (default "14:00")
- **FR-007**: Saving housekeeping settings MUST update the Housekeeping shift definition in SQLite and be used by the auto-populate engine.
- **FR-008**: In `TimeOffModal`, selecting or changing the Start Date MUST immediately set the End Date to the same date.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of assignment removals succeed immediately on click (0 duplicates or failed deletions).
- **SC-002**: 0 duplicate assignments permitted in any shift slot across the entire system.
- **SC-003**: Roster grid container occupies 95% of screen width on displays > 1200px, eliminating horizontal scrolling.
- **SC-004**: Changes to housekeeping settings reflect immediately on the roster grid and solver in < 1 second.
- **SC-005**: Submitting a single-day time-off request requires only 1 date selection click.

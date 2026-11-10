# Feature Specification: Staff Assignment Fix, Reception Copy & Birthdays

**Feature Branch**: `009-staff-fix-reception-copy-and-birthdays`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User description: "One bug and some improvements: 1. BUG: Assigning staff to shifts doesn't work, on clicking the button to assign the dialog closes but the shift remains unassigned. 2. Reception shifts are mostly fixed so when auto populating a week's roster copy the previous week's reception shifts (both AM and PM). 3. Add a field for 'Preferred name' for volunteers for people whose official and preferred names do not match. 4. Add a field for date of birth to the volunteer's info page. 5. Display a birthday cake icon in their info card in the seven days leading up to and including their birthday so that management can plan any special events."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fix Staff Shift Assignment (Bug Fix) (Priority: P1)

As a hostel manager, when I open `ShiftAssignModal` and click "Assign Staff" on a staff member, I want the shift to be successfully assigned to that staff member and appear on the grid, so that permanent staff can be scheduled on reception shifts.

**Why this priority**: Core scheduling bug; currently assigning any staff member fails because the endpoint treated `volunteerId === null` as an unassign trigger.

**Independent Test**: Navigate to `/admin/roster`. Click "+ Assign" on an open Reception shift. Click "Assign Staff" next to a staff member (e.g. Hervé). Verify the modal closes, the weekly grid updates, and Hervé's name + flag appears assigned in the cell.

**Acceptance Scenarios**:

1. **Given** an open shift, **When** the manager assigns a staff member with `staffId` and `volunteerId: null`, **Then** the backend persists the staff assignment.
2. **Given** an assigned staff shift, **When** the roster grid reloads, **Then** the staff member's name and country flag are rendered in the cell.
3. **Given** an existing staff assignment, **When** clicking the remove button, **Then** the staff assignment is unassigned correctly.

---

### User Story 2 - Copy Previous Week's Reception Shifts During Auto-Populate (Priority: P1)

As a hostel manager, when I click "Auto-Populate" for a new week, I want the system to copy the previous week's reception assignments (both AM and PM) forward, so that stable reception coverage is preserved week-to-week without manual re-entry.

**Why this priority**: Reception shifts are mostly fixed; copying forward eliminates repetitive manual scheduling every week while ensuring available staff/volunteers keep their routine.

**Independent Test**: Schedule reception shifts for Week 1 (Monday to Sunday). Advance to Week 2. Click "⚡ Auto-Populate". Verify Week 2's reception slots (both Day and Evening) automatically inherit the assigned receptionists from Week 1 (provided they are available). Verify Housekeeping shifts are populated by the solver.

**Acceptance Scenarios**:

1. **Given** reception assignments on Week $N-1$, **When** running auto-populate for Week $N$, **Then** each day's reception assignments (AM and PM) are copied from the matching day of Week $N-1$.
2. **Given** a copied receptionist who has approved time-off or has departed in Week $N$, **Then** the system does not copy them to that conflicting date and leaves the slot for solver/manual assignment.
3. **Given** copied reception shifts, **Then** Housekeeping shifts are auto-populated around them respecting all rest and hour limits.

---

### User Story 3 - Volunteer Preferred Name Support (Priority: P1)

As a hostel manager, I want to capture a volunteer's "Preferred Name" (nickname/chosen name) and display it across the roster and volunteer cards, so that volunteers are addressed by their preferred identity rather than formal passport names.

**Why this priority**: Many international volunteers go by nicknames, chosen names, or westernized names that differ from their legal passport names.

**Independent Test**: In the volunteer modal, enter Full Name: `Guilherme Silveira` and Preferred Name: `Gui`. Save. Verify the volunteer card displays `Gui (Guilherme Silveira)`. Assign them to a shift: verify the cell and WhatsApp portrait roster display `Gui` + Brazilian flag 🇧🇷.

**Acceptance Scenarios**:

1. **Given** the volunteer modal, **When** creating or editing a volunteer, **Then** a "Preferred Name (Optional)" field is available.
2. **Given** a volunteer with a preferred name, **When** rendered on shift cells and the WhatsApp printable roster, **Then** the preferred name is displayed instead of the legal first name.
3. **Given** a volunteer without a preferred name, **When** rendered, **Then** the system falls back to their legal first name.

---

### User Story 4 - Date of Birth & Birthday Cake Alert (Priority: P1)

As a hostel manager, I want to record each volunteer's date of birth and see a birthday cake icon (`🎂`) on their card during the 7 days leading up to and including their birthday, so that management and team members can prepare celebrations, cards, or cakes.

**Why this priority**: Hostel community culture thrives on celebrating volunteer birthdays; early 7-day visibility ensures management doesn't miss anyone's special day.

**Independent Test**: Set a volunteer's Date of Birth to 3 days from today. Navigate to `/admin/volunteers`. Verify their card prominently displays `🎂 Birthday on [Date] (in 3 days)!`. For a volunteer whose birthday is 2 months away, verify no cake icon is shown.

**Acceptance Scenarios**:

1. **Given** the volunteer modal, **When** filling out details, **Then** an optional "Date of Birth" field (`YYYY-MM-DD`) is available.
2. **Given** a volunteer whose birthday is within 7 days (or today), **When** viewing `/admin/volunteers`, **Then** a prominent `🎂 Birthday [Date]` banner/badge is displayed on their card.
3. **Given** a volunteer whose birthday is more than 7 days away, **Then** no birthday badge is displayed.

---

## Edge Cases

- **Birthday year boundary rollover**: A volunteer whose birthday is on January 2 displays the birthday alert during the final days of December.
- **Unassigned previous week reception**: If a reception shift was open in Week $N-1$, it remains open or is solved normally in Week $N$.
- **Staff member inactive or on PTO**: If a staff member assigned in Week $N-1$ is inactive or has PTO in Week $N$, the copy routine skips them for that date.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST fix `POST /api/admin/roster/assign` so that providing `staffId` with `volunteerId: null` assigns the staff member rather than unassigning the shift slot.
- **FR-002**: During `auto-populate`, the system MUST query the preceding week's roster (`weekStartDate - 7 days`) and copy all reception shifts (Day Reception and Evening Reception) forward to the corresponding days of the target week for all available personnel.
- **FR-003**: The system MUST store `preferred_name: TEXT` on `volunteers`.
- **FR-004**: When displaying volunteer names on the roster grid, shift cells, and WhatsApp portrait view, the system MUST use `preferredName` if available, falling back to legal first name.
- **FR-005**: The system MUST store `date_of_birth: TEXT` on `volunteers` (`YYYY-MM-DD`).
- **FR-006**: On `AdminVolunteersPage`, the system MUST calculate if a volunteer's birthday occurs within 7 days from today (inclusive) and render a `🎂 Birthday` indicator on their profile card.

### Key Entities

- **Volunteer**: Updated with `preferredName` and `dateOfBirth`.
- **Roster Auto-Populate Pipeline**: Step 1 (Copy previous week reception) $\to$ Step 2 (Solve housekeeping & remaining slots).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of staff assignment clicks persist and render immediately on the roster grid (0% unassign failures).
- **SC-002**: Auto-populate preserves 100% of available previous week reception assignments without manual clicks.
- **SC-003**: Preferred names display across all roster views with zero regressions to flags or formatting.
- **SC-004**: 100% of volunteer birthdays within the 7-day window trigger the `🎂` birthday alert banner.

---

## Assumptions

- Auto-populate copy forward applies to shifts where the definition name contains "reception".
- Birthdays are celebrated annually regardless of birth year.

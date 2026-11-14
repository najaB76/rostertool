# Feature Specification: Timeline Interactivity, Historical Staffing, and Volunteer Edit Enhancements

**Feature Branch**: `018-timeline-interactivity-and-history-fixes`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User feedback from `feedback.txt`:
1. On the timeline view, make the volunteer name a hyperlink that opens the edit volunteer modal and refresh timeline on save.
2. On the timeline view, make the status pill a button allowing direct status changes (e.g. from 'In da house' to 'Departed' via departure modal, or 'Confirmed' to 'In da house', or 'Departed' to 'Confirmed'/'Active' prompting for new stay dates). Refresh timeline after any change.
3. Add a running total row for Applied volunteers in the same manner as the Active row.
4. When scrolling backwards in time the timeline must show the status of volunteers at that date window so management can see who was on staff together at any particular date.
5. Fix Source display: Setting source in details page shows as 'Other' on volunteer card and timeline.
6. Make VolunteerModal resizable and allow pressing Esc key to close it.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Historical Staffing & Point-in-Time Status on Timeline (Priority: P1)

As a hostel manager scrolling backwards in time on the Staffing Timeline, I want the timeline to include all volunteers who had an active stay during that historical window (even if their current status in the database is 'Departed') and show their point-in-time status as on-site for those dates, so that I can accurately audit and see who was on staff together at any point in history.

**Why this priority**: Previously, `/api/admin/timeline` only queried `status IN ('Active', 'Accepted', 'Applied')`, completely omitting departed alumni. Looking at past months rendered an empty timeline.

**Independent Test**:
- Ensure the database has a volunteer who completed a stay 3 months ago (e.g. July 2026) and is currently marked `Departed`.
- Navigate the timeline to that past date range (July 2026).
- Verify the volunteer appears in their role section (Reception or Housekeeping) with their stay bar rendered over July.
- Verify their stay is counted in the historical "Total CONFIRMED Volunteers" daily count for July.

**Acceptance Scenarios**:
1. **Given** a timeline window starting on date $T_{start}$ and ending on $T_{end}$, **When** fetching timeline data, **Then** the backend includes any volunteer whose stay dates (current stay or `volunteer_stays` history) overlap with $[T_{start}, T_{end}]$, regardless of their current status.
2. **Given** a volunteer who departed after the selected historical timeline window, **When** rendered in that historical window, **Then** their status pill reflects their point-in-time state (`In da house` / `Active` or `Confirmed` / `Accepted`).
3. **Given** historical dates, **When** calculating daily confirmed counts, **Then** all volunteers on site on that historical night are included in the bed count.

---

### User Story 2 - Interactive Timeline Actions (Name Link & Status Change) (Priority: P1)

As a hostel manager viewing the Staffing Timeline, I want to click on a volunteer's name to open their edit modal, and click on their status pill to directly transition their status (e.g. mark arrived, depart with rating/notes, or reactivate for a new stay), so that I can perform full volunteer lifecycle management directly from the timeline without switching pages.

**Why this priority**: Reduces friction in daily coordinator workflows by allowing instant edits and check-ins/check-outs directly on the calendar.

**Independent Test**:
- On `/admin/timeline`, click any volunteer's name. Verify `VolunteerModal` opens with their details loaded. Make a change, save, and verify the timeline immediately refreshes.
- Click the status pill of an 'In da house' volunteer. Select 'Depart'. Verify `DepartureModal` opens, submit rating/notes, and verify the timeline refreshes with updated status.
- Click 'Confirmed' status pill and mark as 'In da house'. Verify status updates immediately.

**Acceptance Scenarios**:
1. **Given** a volunteer row on the timeline, **When** clicking their name, **Then** `VolunteerModal` opens with their data.
2. **Given** saving changes in `VolunteerModal`, **When** the modal closes, **Then** the timeline refreshes automatically.
3. **Given** a status pill on the timeline, **When** clicked, **Then** an action menu opens:
   - For `Active` (`In da house`): Option to "Depart" (opens `DepartureModal`) or "Revert to Confirmed".
   - For `Accepted` (`Confirmed`): Option to "Mark Arrived (In da house)" or "Cancel".
   - For `Departed`: Option to "Re-activate (New Stay)" (opens `ReactivateModal`).
   - For `Applied`: Option to "Accept Application".
4. **Given** a successful status change, **When** completed, **Then** the timeline view refreshes immediately.

---

### User Story 3 - Running Daily Total Row for Applied Candidates (Priority: P2)

As a hostel manager planning future recruitment, I want a running daily total row beneath the Unconfirmed (Applied Candidates) section that tallies the number of applied candidates for each day, so that I can quickly assess applicant volume over upcoming weeks.

**Why this priority**: Managers need to visualize not only confirmed capacity but also applicant pipeline strength across the calendar.

**Independent Test**:
- Open `/admin/timeline` on a date window containing multiple applied candidates.
- Scroll to the bottom of the "Unconfirmed (Applied Candidates)" section.
- Verify a summary row labeled "Total APPLIED Candidates" displays the daily sum of candidates for each column.

**Acceptance Scenarios**:
1. **Given** the applied candidates section on the timeline, **When** rendered, **Then** a summary row titled "Total APPLIED Candidates" is displayed at the bottom of the section.
2. **Given** applied candidates with stay dates overlapping each day, **When** tallying counts, **Then** each day cell displays the exact count of unconfirmed candidates for that date.

---

### User Story 4 - Fix Volunteer Application Source Synchronization (Priority: P1)

As a hostel administrator, when I set or change a volunteer's Source (e.g. 'HelpX', 'WorkAway', 'Worldpackers') in `VolunteerModal`, I want that source to be saved and accurately displayed on both the volunteer card (`AdminVolunteersPage`) and the timeline view (`AdminTimelinePage`), instead of defaulting to 'Other'.

**Why this priority**: Recruitment channel attribution is corrupted when sources default to 'Other', making it impossible to evaluate partner channel effectiveness.

**Independent Test**:
- Open `VolunteerModal` for a volunteer. Set source to `HelpX`. Save.
- View the volunteer card in `/admin/volunteers`. Verify **Source: HelpX** is displayed (not 'Other').
- View `/admin/timeline`. Verify the Source column displays **HelpX** (not 'Other').

**Acceptance Scenarios**:
1. **Given** `VolunteerModal` saves `applicationSourceName`, **When** updating, **Then** the backend syncs both `volunteers.applicationSourceId` AND `volunteers.source`.
2. **Given** `AdminVolunteersPage` and `AdminTimelinePage`, **When** reading source, **Then** they display the resolved application source name rather than falling back to 'Other'.

---

### User Story 5 - Resizable & Esc-Dismissible Volunteer Modal (Priority: P2)

As a hostel administrator editing volunteer details, I want the `VolunteerModal` to be resizable by dragging its edge and easily dismissible by pressing the `Esc` key, so that I can view extensive notes comfortably and dismiss the modal quickly.

**Why this priority**: Enhances usability and keyboard ergonomics on desktop workstations.

**Independent Test**:
- Open `VolunteerModal`.
- Press the `Esc` key on the keyboard. Verify the modal closes immediately.
- Drag the resize handle at the corner of the modal. Verify the modal expands and shrinks smoothly with minimum size constraints.

**Acceptance Scenarios**:
1. **Given** `VolunteerModal` is open, **When** pressing `Esc`, **Then** the modal closes without saving changes.
2. **Given** `VolunteerModal`, **When** dragging the container border, **Then** the modal is resizable in both width and height (with minWidth 480px and minHeight 400px).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `/api/admin/timeline` MUST include historical volunteers whose current or historical stays (`volunteer_stays`) overlap with the requested timeline date range, regardless of their current status (`Departed`, `Active`, etc.).
- **FR-002**: Volunteers on the timeline MUST have their point-in-time status computed for the requested date window.
- **FR-003**: In `AdminTimelinePage.tsx`, volunteer names MUST be interactive links/buttons that open `VolunteerModal` with the selected volunteer's full data.
- **FR-004**: Saving changes in `VolunteerModal` when opened from the timeline MUST trigger an immediate refresh of the timeline data.
- **FR-005**: In `AdminTimelinePage.tsx`, status pills MUST be interactive buttons opening an action dropdown or modal to transition volunteer lifecycle status (`Active`, `Departed`, `Accepted`, `Cancelled`).
- **FR-006**: Transitioning status to `Departed` from the timeline MUST open `DepartureModal` to capture rating, review notes, and rehire recommendation.
- **FR-007**: Transitioning status from `Departed` to `Active` or `Accepted` from the timeline MUST open `ReactivateModal` to record the new stay dates.
- **FR-008**: In `AdminTimelinePage.tsx`, a summary row titled "Total APPLIED Candidates" MUST be added under the Unconfirmed section showing daily applicant totals.
- **FR-009**: The backend `volunteerService.updateVolunteer` and `createVolunteer` MUST synchronize `volunteers.source` with `applicationSourceName`.
- **FR-010**: `VolunteerModal.tsx` MUST support keyboard dismissal via `Esc` key.
- **FR-011**: `VolunteerModal.tsx` dialog box MUST have CSS `resize: both` enabled with appropriate minimum and maximum boundaries.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of historical volunteers with stays in past timeline windows appear in their respective roles when viewing past dates.
- **SC-002**: 100% of volunteer sources configured in `VolunteerModal` display their exact source name (e.g. "HelpX") on volunteer cards and timeline rows (0 instances of unexpected 'Other').
- **SC-013**: Pressing `Esc` in `VolunteerModal` closes the modal in < 50ms.
- **SC-004**: Clicking a status pill on the timeline allows full departure or re-activation without leaving the timeline page.
- **SC-005**: Daily applicant count row displays accurate daily totals for all calendar columns in the unconfirmed section.

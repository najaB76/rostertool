# Feature Specification: Hostel Volunteer Rostering

**Feature Branch**: `001-volunteer-rostering`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User description: "Tool for rostering volunteers to shifts working in a hostel with housekeeping and reception shifts, volunteer lifecycle tracking, auto-population with hard/soft constraints, time-off requests, magic-link volunteer portal, high-visibility country flag display, capacity management (12 baseline, 10–15 tolerance range) with an occupancy calendar view, extensible application sources (HelpEx, WorkAway, Worldpackers, Guest), and future re-application acceptance recommendations."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Weekly Rostering Grid & Shift Assignment (Priority: P1)

As a hostel manager, I want to view a weekly schedule (Monday through Sunday) showing all shift slots (Housekeeping, Reception AM/PM, and optional Graveyard) and manually assign available volunteers, so that daily hostel operations have complete and visible staffing coverage.

**Why this priority**: The visual roster is the operational core of the hostel. Without an intuitive weekly view and manual shift assignment capability, the manager cannot coordinate day-to-day work.

**Independent Test**: The manager can load an empty weekly grid (Mon–Sun), assign an active volunteer to a shift slot, see their name and national country flag rendered immediately in the cell, and observe unstaffed shifts highlighted for attention.

**Acceptance Scenarios**:

1. **Given** an active week beginning Monday, **When** the manager opens the weekly roster, **Then** all days (Monday to Sunday) are displayed with columns for Reception (Day Shift, Evening Shift, optional Graveyard) and Housekeeping slots.
2. **Given** an active volunteer with a designated nationality, **When** the manager assigns them to a shift slot, **Then** their name and national flag are displayed inside the shift cell.
3. **Given** a shift slot that requires minimum staffing (e.g. 3 housekeepers) with fewer volunteers assigned, **Then** the cell or row is prominently highlighted indicating an unstaffed or understaffed state.
4. **Given** an assigned shift slot, **When** the manager reassigns or removes the volunteer, **Then** the roster updates immediately and recalculates total assigned hours for the volunteer.

---

### User Story 2 - Automated Shift Population (Priority: P2)

As a hostel manager, I want an "Auto-Populate" option that fills unassigned shifts according to operational rules, availability, and fair distribution constraints, so that I can generate a balanced weekly roster in seconds instead of building it by hand.

**Why this priority**: Manual scheduling for 10–20+ volunteers across 7 days with differing arrival dates and roles is time-consuming and error-prone. Auto-population provides immediate operational efficiency.

**Independent Test**: With a pool of active volunteers, configured shift requirements, and approved time-off requests, clicking "Auto-Populate" fills open slots without violating any hard constraints (no overlapping shifts, respecting arrival/departure dates, meeting 16h weekly targets, pairing trainees with trainers).

**Acceptance Scenarios**:

1. **Given** open shifts for the upcoming week and a pool of active volunteers, **When** the manager triggers "Auto-Populate", **Then** the system assigns volunteers to open slots matching their target hours (16 hours/week, or pro-rated equivalent for mid-week arrivals).
2. **Given** a volunteer with approved time-off on a specific day, **When** "Auto-Populate" runs, **Then** that volunteer is not scheduled for any shifts on their requested days off.
3. **Given** a volunteer marked "in training", **When** "Auto-Populate" schedules them for a shift, **Then** a qualified trainer is scheduled concurrently on the exact same shift.
4. **Given** a volunteer assigned to a Friday evening shift ending past midnight, **When** "Auto-Populate" schedules Saturday shifts, **Then** the volunteer is not assigned to the 10:00 AM housekeeping shift to preserve mandatory turnaround rest.
5. **Given** a 14-day schedule window, **When** "Auto-Populate" optimizes assignments, **Then** it prioritizes allocating at least 3 consecutive days off for each volunteer across the 14-day rolling window.

---

### User Story 3 - Volunteer Lifecycle, Sources & Profile Management (Priority: P3)

As a hostel manager, I want to track volunteers through their full stay lifecycle (Applied, Accepted with arrival/departure dates, Active, Departed, Cancelled), capture how they applied (e.g., HelpEx, WorkAway, Worldpackers, Guest), record whether they should be accepted if they re-apply in the future, and edit their details at any time.

**Why this priority**: Accurate volunteer metadata, arrival/departure dates, source tracking, and past performance history are foundational to reliable staffing and decision-making.

**Independent Test**: The manager can create a volunteer applicant with an application source, accept them with dates, edit any profile field at any time, mark them departed with an exit review and future re-acceptance recommendation, and verify this indicator appears if the volunteer is viewed or re-applies.

**Acceptance Scenarios**:

1. **Given** a new volunteer applicant, **When** the manager adds them to the system, **Then** their name, contact details, nationality, comments, and application source (selectable from HelpEx, WorkAway, Worldpackers, Guest, or custom sources) are recorded with status `Applied`.
2. **Given** an applicant, **When** the manager confirms their stay, **Then** the status changes to `Accepted` with locked-in arrival and departure dates and assigned initial role.
3. **Given** an accepted volunteer whose arrival date is reached, **When** they arrive, **Then** their status transitions to `Active` and they become eligible for scheduling within their stay date range.
4. **Given** an active volunteer departing the hostel, **When** the manager marks them `Departed`, **Then** the manager records an exit rating, comments, and sets a future re-application acceptance recommendation (`Accept`, `Review Required`, or `Do Not Accept`).
5. **Given** any volunteer record, **When** the manager views their profile or application card, **Then** their past re-acceptance status and application source are clearly visible, and profile details remain editable at all times.

---

### User Story 4 - Volunteer Headcount Calendar & Capacity Management (Priority: P3)

As a hostel manager, I want a dedicated calendar view displaying the total number of accepted volunteers for each day—benchmarked against our normal baseline of 12 volunteers—with visual warnings for low counts (10–11) and overlap periods (13–15), so that I can maintain balanced capacity when accepting applications.

**Why this priority**: Keeping the volunteer count stable at 12 prevents hostel understaffing and room overbooking, while allowing controlled mid-week overlap during handover transitions.

**Independent Test**: The manager opens the Headcount Calendar and observes daily counts. Days with exactly 12 volunteers appear normal/green; days with 13–15 appear highlighted in yellow (overlap buffer); days with 10–11 appear highlighted in amber (low staffing buffer); days below 10 or above 15 display prominent critical alerts. When reviewing a pending application, date ranges with capacity alerts are flagged.

**Acceptance Scenarios**:

1. **Given** accepted and active volunteers with stay date ranges, **When** the manager navigates to the Headcount Calendar, **Then** every day displays the aggregate count of volunteers on site.
2. **Given** days where the volunteer count is between 13 and 15, **Then** the calendar displays a visual warning highlight indicating an allowable short overlap period.
3. **Given** days where the volunteer count drops to 10 or 11, **Then** the calendar displays a visual warning highlight indicating a low-capacity period requiring caution.
4. **Given** days where the volunteer count drops below 10 or exceeds 15, **Then** the calendar displays a critical alert badge.
5. **Given** an applicant with proposed arrival and departure dates, **When** the manager opens the acceptance modal, **Then** the system displays a preview of the resulting daily headcounts across the proposed stay, flagging any dates that enter overlap (13–15) or low (10–11) thresholds.

---

### User Story 5 - Volunteer Self-Service Portal & Time-Off Requests (Priority: P4)

As a volunteer, I want to access my personal schedule and the hostel weekly roster on my phone via a secure magic link, and submit requests for days off, so that I know my work commitments and can plan my personal travel in advance.

**Why this priority**: Volunteers need convenient, frictionless access to their schedules without remembering passwords, and management needs structured time-off requests instead of disjointed verbal messages.

**Independent Test**: A volunteer opens their unique magic link on a mobile device, views their upcoming shifts and the weekly hostel roster with names and national flags, and successfully submits a request for a day off that appears on the manager's review board.

**Acceptance Scenarios**:

1. **Given** a volunteer with an active stay, **When** they open their unique magic link URL, **Then** they see their personalized upcoming shifts and the full hostel weekly schedule without entering credentials.
2. **Given** a volunteer viewing their portal, **When** they submit a request for one or more specific days off with optional notes, **Then** the request is recorded with status `Pending` and visible to management.
3. **Given** a pending time-off request, **When** the manager approves or denies the request, **Then** the volunteer's portal updates to reflect the decision, and approved days off are locked against auto-rostering.
4. **Given** a compromised or lost magic link, **When** the manager clicks "Reset Link" on the volunteer's profile, **Then** a new secure link is generated and the old link is immediately invalidated.

---

### User Story 6 - Paid Staff Coverage & Staff PTO Handling (Priority: P5)

As a hostel manager, I want to assign regular paid staff members to daily reception shifts and designate paid staff PTO periods, so that volunteer coverage can be scheduled for reception day shifts during staff absences.

**Why this priority**: Reception day shifts (8am–6pm) are normally operated by paid staff; volunteer coverage is only required during paid staff PTO or unexpected absences.

**Independent Test**: The manager schedules a paid staff member on a reception day shift, marks that staff member on PTO for a given date, and observes the reception day slot become available for volunteer assignment.

**Acceptance Scenarios**:

1. **Given** a standard operating day, **When** viewing the reception day shift (8am–6pm), **Then** one of the 3 regular paid staff members is assigned.
2. **Given** a paid staff member scheduled for PTO, **When** the manager flags the staff member as absent for specific dates, **Then** the corresponding reception day shift is opened as an unassigned volunteer slot and highlighted.
3. **Given** an open reception day shift due to staff PTO, **When** the manager assigns a volunteer (or runs auto-populate), **Then** only volunteers with verified reception qualification are eligible for assignment.

---

## Edge Cases

- **Capacity overflow during overlap**: Multiple volunteers arriving before prior volunteers depart causes daily headcount to reach 14 or 15. The system allows this transition but highlights the dates prominently on both the Headcount Calendar and application acceptance view. If headcount would exceed 15, the system displays a blocking warning requiring explicit manager override.
- **Capacity drop below buffer**: Several volunteers depart within a short window, causing daily headcount to drop below 10. The system triggers a critical low-capacity alert to prompt scheduling paid coverage or expediting new applications.
- **Prior negative review on re-application**: When an applicant previously volunteered at the hostel and was marked "Do Not Accept" upon departure, their new application is automatically flagged with an alert banner preventing accidental acceptance.
- **Mid-week arrivals and departures**: When a volunteer arrives or departs mid-week (e.g., arrives Thursday), their weekly target hours for that week are automatically pro-rated relative to the remaining days of the rostering period.
- **Trainee scheduled without available trainer**: If auto-population cannot find an available trainer for a trainee on a required shift, the trainee is not scheduled alone; the slot is flagged for manager review.
- **Excessive concurrent time-off requests**: When multiple volunteers request the same date off causing available staff to fall below the minimum required shifts, the system schedules available volunteers up to their caps and leaves remaining slots flagged as unstaffed.
- **Shift turnaround violations**: Volunteers working evening shifts (ending at 00:00 or 01:00) or graveyard shifts cannot be scheduled for the 10:00 AM housekeeping shift the next morning.
- **Stay extension or early departure**: When a volunteer's departure date is modified, the daily headcount calendar immediately updates, and future shifts beyond the new departure date are automatically unassigned and flagged for management review.
- **Custom application source deletion**: If a manager deactivates or removes a custom application source, existing volunteers linked to that source retain their label as archived data.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render a weekly schedule grid running from Monday through Sunday, displaying all operational shifts:
  - Housekeeping (10:00–14:00, 7 days/week, minimum 3 volunteers/day default, configurable).
  - Reception Day Shift (08:00–18:00, 7 days/week).
  - Reception Evening Shift (16:00–00:00 Sun–Thu, 17:00–01:00 Fri–Sat).
  - Reception Graveyard Shift (Fri & Sat nights 00:00/01:00–08:00, togglable).
- **FR-002**: The system MUST prominently display the volunteer's national country flag (ISO 3166-1 alpha-2 standard) directly adjacent to the volunteer's name in all visual views, including weekly roster grid cells, shift detail modals, volunteer profile cards, headcount calendars, and dropdown selectors.
- **FR-003**: The system MUST visually highlight any shift slot or day where assigned staff is below the configured minimum coverage requirement.
- **FR-004**: The system MUST allow the manager to manually assign, reassign, or remove any volunteer or paid staff member from any shift slot at any time.
- **FR-005**: The system MUST provide an "Auto-Populate" feature that generates shift assignments for unassigned slots in the active week adhering strictly to hard constraints and optimizing soft constraints.
- **FR-006**: The auto-scheduling engine MUST enforce the following hard constraints:
  - No volunteer may be scheduled outside their active stay window (arrival date to departure date).
  - No volunteer may be scheduled on a date with an approved time-off request.
  - No volunteer may be scheduled for more than their weekly hour target (16 hours standard, or pro-rated equivalent for partial weeks).
  - Only volunteers with the reception qualification flag may be scheduled for reception shifts.
  - No volunteer may be scheduled for overlapping shifts or shifts with less than 9 hours turnaround rest between consecutive shifts.
- **FR-007**: The auto-scheduling engine MUST enforce trainee pairing: any volunteer flagged with `in_training` MUST be scheduled on the same shift as at least one volunteer flagged with `is_trainer`.
- **FR-008**: The auto-scheduling engine MUST optimize the following soft constraints:
  - Maximize the occurrence of at least 3 consecutive days off per volunteer within any rolling 14-day window.
  - Distribute weekend shifts (Friday, Saturday, Sunday) equitably among eligible volunteers.
- **FR-009**: The system MUST manage the volunteer lifecycle through five discrete states: `Applied`, `Accepted`, `Active`, `Departed`, and `Cancelled`.
- **FR-010**: The system MUST allow management to edit volunteer information at any time, including: full name, contact details (email, phone/WhatsApp), nationality, comments/notes, arrival date, departure date, primary role, reception qualification, `is_trainer` flag, `in_training` flag, application source, and future re-acceptance status.
- **FR-011**: The system MUST support tracking the application source for each volunteer, seeded with default options (`HelpEx`, `WorkAway`, `Worldpackers`, `Guest`), and provide management the ability to add and manage additional custom sources.
- **FR-012**: The system MUST include an explicit future re-application acceptance field (`Accept`, `Review Required`, `Do Not Accept`) on volunteer profiles and exit reviews, and flag any previous "Do Not Accept" volunteers if they re-apply.
- **FR-013**: The system MUST provide a Volunteer Headcount Calendar View displaying the aggregate daily total of accepted/active volunteers across calendar days and months.
- **FR-014**: The Headcount Calendar and application review flows MUST implement the following capacity benchmarks:
  - Baseline Target: Exactly 12 volunteers.
  - Overlap Buffer (13 to 15 volunteers): Displayed with a noticeable "Overlap" visual warning highlight.
  - Low Staffing Buffer (10 to 11 volunteers): Displayed with a noticeable "Low Capacity" visual warning highlight.
  - Understaffed (< 10 volunteers): Displayed with a critical alert badge.
  - Overcrowded (> 15 volunteers): Displayed with a critical capacity violation alert badge.
- **FR-015**: When considering or accepting a volunteer application, the system MUST display a capacity preview of the proposed stay dates indicating any dates that will fall into overlap (13–15), low (10–11), or critical (<10 / >15) headcount ranges.
- **FR-016**: The system MUST record an exit review (rating and qualitative notes) when transitioning a volunteer to `Departed`, preserving historic stay data.
- **FR-017**: The system MUST support scheduling of paid staff members for reception day shifts and allow marking paid staff on PTO for specific dates.
- **FR-018**: The system MUST provide a volunteer self-service portal accessible via a unique, secure, passwordless magic link that can be generated, copied, and revoked/reset by management.
- **FR-019**: The volunteer portal MUST allow volunteers to view their upcoming shifts, see the weekly hostel roster (including peer names and country flags), and submit requests for specific days off.
- **FR-020**: The system MUST provide management with an interface to review, approve, or deny pending volunteer time-off requests.

### Key Entities

- **Volunteer**: Represents a hostel volunteer worker.
  - Attributes: id, full_name, email, phone, nationality (ISO country code), status (Applied, Accepted, Active, Departed, Cancelled), arrival_date, departure_date, primary_role (Housekeeping, Reception), is_reception_qualified (boolean), is_trainer (boolean), in_training (boolean), application_source_id (reference to Application Source), future_acceptance_status (Accept, Review Required, Do Not Accept), magic_link_token, notes.
- **Application Source**: Source from which the volunteer applied.
  - Attributes: id, name (HelpEx, WorkAway, Worldpackers, Guest, or custom), is_active (boolean), created_at.
- **Staff Member**: Represents permanent paid hostel staff.
  - Attributes: id, full_name, role, contact_info.
- **Staff PTO**: Represents scheduled time-off for paid staff.
  - Attributes: id, staff_id, start_date, end_date, notes.
- **Shift Definition**: Operational shift template.
  - Attributes: id, name (Housekeeping, Reception Day, Reception Evening, Reception Graveyard), day_of_week, start_time, end_time, duration_hours, min_staff_required, eligible_roles, is_active.
- **Shift Assignment**: An instance of a volunteer or staff assigned to a specific shift on a specific calendar date.
  - Attributes: id, shift_id, date, volunteer_id (optional), staff_id (optional), is_training_shift (boolean), notes.
- **Time-Off Request**: Date-specific leave request submitted by a volunteer.
  - Attributes: id, volunteer_id, date, status (Pending, Approved, Denied), reason, reviewed_by, reviewed_at.
- **Stay Review**: Post-departure evaluation of a volunteer.
  - Attributes: id, volunteer_id, rating (1–5 scale), review_notes, future_acceptance_recommendation (Accept, Review Required, Do Not Accept), created_at.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The manager can trigger "Auto-Populate" and receive a complete, valid weekly schedule in under 5 seconds.
- **SC-002**: 100% of auto-generated rosters strictly respect all hard constraints (zero double-bookings, zero shifts on approved time-off, zero unpartnered trainees, zero rest violations).
- **SC-003**: 100% of volunteer representations across all views, dropdowns, headcount calendars, and schedule grids visibly display their national country flag.
- **SC-004**: Any understaffed or unassigned shift slot is visually highlighted and identifiable by the manager within 1 second of loading the schedule.
- **SC-005**: The Headcount Calendar renders daily volunteer totals and visual capacity warning highlights (10–11 low, 13–15 overlap, <10 critical, >15 critical) across a full month view in under 1 second.
- **SC-006**: During volunteer application review, the capacity impact indicator updates within 500ms of entering or changing proposed arrival and departure dates.
- **SC-007**: A volunteer opening their magic link on a smartphone can view their weekly schedule in under 2 seconds without entering credentials or navigating through more than one screen.
- **SC-008**: The manager can complete a manual shift adjustment or override in 2 clicks or fewer.

---

## Assumptions

- The standard rostering cycle starts on Monday and ends on Sunday.
- The standard target volunteer headcount is 12 volunteers; acceptable temporary turnover range is 10 to 15 volunteers.
- Standard volunteer workload target is 16 hours per week (equivalent to 4 housekeeping shifts or 2 reception evening shifts).
- Mid-week arrival pro-rating is calculated proportionally based on remaining days in the week divided by 7 multiplied by 16 hours, rounded to the nearest full shift.
- Standard minimum housekeeping coverage is 3 volunteers per day; this threshold is configurable per day or season by the manager.
- Magic link URLs are generated securely and can be sent to volunteers via email, WhatsApp, or messaging platforms directly by management.
- Internal hosting environment runs on a local Proxmox server accessible on the hostel's internal network or via a secure reverse proxy/VPN.

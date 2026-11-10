# Feature Specification: Time-Off Review & Assignment Guards

**Feature Branch**: `005-timeoff-review-and-assignment-guards`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User description: "Some more improvements: 1. Pending time off requests should be visible to management but they are not. Management should be able to approve or decline those requests and approved requests should be taken into consideration when assigning staff (both automatically and manually). If you attempt to manually assign a volunteer a shift on an approved day off there should be a warning asking for confirmation. 2. Volunteers should be able to cancel time off requests. 3. When manually assigning reception shifts the 'Assign' button should be disabled for volunteers who aren't reception qualified."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Management Time-Off Review & Approval Hub (Priority: P1)

As a hostel manager, I want a dedicated Time-Off page in the admin navigation where I can view, approve, or decline pending time-off requests from volunteers, so that all leave requests are managed centrally and structured.

**Why this priority**: Without a visible management review view, submitted time-off requests remain invisible and unapproved, breaking the scheduling loop.

**Independent Test**: Navigate to `/admin/time-off` via the top navigation bar. Observe all pending time-off requests listing volunteer names, flags, dates, and reasons. Click "Approve" on a request and verify its status updates to `Approved`. Click "Decline" on another request and verify its status updates to `Denied`.

**Acceptance Scenarios**:

1. **Given** submitted time-off requests from volunteers, **When** the manager navigates to the Time-Off section in the admin header, **Then** a dedicated table/board lists all requests with volunteer name, flag, requested date(s), reason, and submission time.
2. **Given** a pending request, **When** the manager clicks "Approve", **Then** the request status updates to `Approved` immediately.
3. **Given** a pending request, **When** the manager clicks "Decline", **Then** the request status updates to `Denied`.
4. **Given** the review hub, **When** switching tabs (`Pending`, `Approved`, `Denied`), **Then** the manager can audit historical time-off decisions.

---

### User Story 2 - Warning Confirmation for Shift Overrides on Approved Time-Off (Priority: P1)

As a hostel manager, when I attempt to manually assign a volunteer to a shift on a date when they have approved time-off, I want a warning confirmation prompt to appear, so that I do not accidentally schedule someone who is away unless intentional.

**Why this priority**: Prevents scheduling mistakes and human error while retaining full managerial override flexibility.

**Independent Test**: Have a volunteer with approved time-off on a specific date. Open the Shift Assignment Modal for that date. Notice the volunteer is flagged with `⚠️ Time Off Approved`. Click their "Assign" button: verify a warning dialog prompts: `"Warning: [Name] has approved time-off on this date. Are you sure you want to assign them anyway?"`. If cancelled, no assignment is made. If confirmed, the assignment is created.

**Acceptance Scenarios**:

1. **Given** a volunteer with approved time-off on `2026-11-06`, **When** the manager opens `ShiftAssignModal` for that date, **Then** a prominent `⚠️ Time Off Approved` badge is displayed next to the volunteer.
2. **Given** the flagged volunteer, **When** the manager clicks "Assign", **Then** the system displays a confirmation dialog warning of the approved time-off collision.
3. **Given** the warning dialog, **When** the manager clicks "Cancel", **Then** the action is aborted and no assignment is created.
4. **Given** the warning dialog, **When** the manager clicks "Confirm Override", **Then** the assignment is saved and the weekly roster is updated.

---

### User Story 3 - Volunteer Self-Service Time-Off Cancellation (Priority: P1)

As a volunteer, I want to cancel my pending or upcoming time-off requests directly from my portal, so that if my plans change I can release the request and make myself available for shifts again.

**Why this priority**: Volunteers' travel plans often change; allowing self-service cancellation eliminates unnecessary manager coordination and immediately frees up availability.

**Independent Test**: In the volunteer portal, view submitted time-off requests. Click "Cancel Request" on a pending or upcoming request. Confirm cancellation. Verify the request is cancelled, removed from active leave blocks, and reflected as cancelled on the manager's board.

**Acceptance Scenarios**:

1. **Given** the volunteer portal, **When** viewing "My Time Off Requests", **Then** each pending or upcoming request displays a "Cancel" button.
2. **Given** a request, **When** the volunteer clicks "Cancel" and confirms, **Then** the request is cancelled.
3. **Given** a cancelled request, **When** the manager views time-off or runs auto-scheduling, **Then** that date is no longer treated as blocked leave.

---

### User Story 4 - Reception Qualification Guard for Reception Shifts (Priority: P1)

As a hostel manager, when I open the shift assignment modal for a Reception shift, I want the "Assign" button to be strictly disabled for volunteers who are not reception qualified, so that unqualified volunteers cannot be placed on reception shifts by accident.

**Why this priority**: Reception shifts require customer focus, system training, and fluent English. Enforcing qualification guards at the UI level guarantees operational standards.

**Independent Test**: Open `ShiftAssignModal` for a Reception Day or Reception Evening shift. Observe volunteers without reception qualification. Verify their "Assign" button is disabled (grayed out and unclickable) with a badge indicating "Not Reception Qualified". Verify that for Housekeeping shifts, their "Assign" button remains fully enabled.

**Acceptance Scenarios**:

1. **Given** a Reception shift (`Reception Day` or `Reception Evening`), **When** viewed in `ShiftAssignModal`, **Then** the "Assign" button is disabled for all volunteers where `isReceptionQualified === false` and `primaryRole !== 'Reception'`.
2. **Given** an unqualified volunteer on a Reception shift, **When** hovering over the disabled button, **Then** a tooltip explains `"Volunteer is not reception qualified"`.
3. **Given** a Housekeeping shift, **When** viewed in `ShiftAssignModal`, **Then** the "Assign" button is enabled for all volunteers regardless of reception qualification.

---

## Edge Cases

- **Manager overriding approved time-off**: When a manager explicitly confirms overriding approved time-off, the assignment is created with a manager override note.
- **Cancelling one day of a multi-day trip**: Volunteers can cancel individual days of a multi-day trip or cancel the whole request.
- **Receptionist taking housekeeping shifts**: Reception-qualified volunteers can be assigned to both Reception and Housekeeping shifts.
- **Decline time-off notification**: When a manager declines a time-off request, the status updates to `Denied` and is clearly shown in red on the volunteer portal so the volunteer knows their request was not approved.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide an administrative Time-Off review page accessible via a top navigation link (`Time Off`) in the main layout.
- **FR-002**: The Time-Off review page MUST list all submitted volunteer time-off requests, including volunteer full name, graphic country flag, requested date, reason, status (`Pending`, `Approved`, `Denied`, `Cancelled`), and submission date.
- **FR-003**: The Time-Off review page MUST provide 1-click `Approve` and `Decline` action buttons for every pending time-off request.
- **FR-004**: The system MUST enforce that auto-populate strictly skips scheduling volunteers on dates with `Approved` time-off requests.
- **FR-005**: When manually scheduling a volunteer in `ShiftAssignModal`, if the volunteer has an `Approved` time-off request on that date:
  - The modal MUST display a prominent `⚠️ Time Off Approved` warning badge.
  - Clicking "Assign" MUST trigger a browser confirmation dialog alerting the manager of the approved time-off and asking for confirmation before proceeding.
- **FR-006**: The volunteer self-service portal MUST allow volunteers to cancel their pending or upcoming time-off requests via a "Cancel Request" action.
- **FR-007**: The backend MUST expose an authenticated endpoint `POST /api/portal/time-off/:id/cancel` that validates token ownership and marks the request as `Cancelled`.
- **FR-008**: In `ShiftAssignModal`, when the target shift is a Reception shift (`Reception Day` or `Reception Evening`), the "Assign" button MUST be strictly disabled (`disabled={true}`) for any volunteer who lacks reception qualification (`!isReceptionQualified && primaryRole !== 'Reception'`).
- **FR-009**: The disabled assign button MUST visually indicate that reception qualification is required and prevent click events from dispatching.

### Key Entities

- **Time-Off Request**: Expanded status values: `Pending`, `Approved`, `Denied`, `Cancelled`.
- **Shift Assignment Modal Context**: Evaluates qualification flags and approved time-off collision state per candidate.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A manager can navigate to the Time-Off section from any admin page in **1 click**.
- **SC-002**: A manager can approve or decline a pending time-off request in **1 click** with immediate status update.
- **SC-003**: 0% accidental assignments on approved time-off (100% of override attempts prompt for manager confirmation).
- **SC-004**: A volunteer can cancel an unwanted time-off request in **1 click** from their mobile portal.
- **SC-005**: 100% of reception shifts strictly prevent assigning unqualified volunteers (disabled button prevents submission).

---

## Assumptions

- The standard work week is Monday to Sunday.
- Manager override authority allows intentionally scheduling someone on their day off if both parties agreed offline.
- Volunteers can only cancel their own time-off requests matching their magic link token.

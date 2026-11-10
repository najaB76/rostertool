# Feature Specification: Date Formats, Roster Navigation & Volunteer Contacts

**Feature Branch**: `006-date-formats-roster-and-contact-improvements`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User description: "Three more improvements: 1. Date formats should be consistent. For example, on the Time off management page the Requested Date field is YYYY-MM-DD and the Submitted field is DD/MM/YYYY. 2. The work week is Monday to Sunday so on the roster page the date picker should only allow Mondays to be selected. 3. For volunteers we need to capture their email address and phone number on the data page."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Global Date Formatting Consistency (Priority: P1)

As a hostel manager, I want date displays across all pages to follow a single, standardized format (`YYYY-MM-DD`), so that dates are unambiguous, professional, and visually consistent across the application.

**Why this priority**: Inconsistent date formats (such as `YYYY-MM-DD` in one column and `DD/MM/YYYY` in an adjacent column on the Time-Off page) create confusion, especially in an international hostel environment with multicultural staff.

**Independent Test**: Navigate to `/admin/time-off`. Inspect both the "Requested Date" and "Submitted" fields. Verify both render consistently in `YYYY-MM-DD` format (e.g. `2026-11-06` and `2026-10-27`). Check the volunteers page, headcount page, and weekly roster to confirm uniform date formatting.

**Acceptance Scenarios**:

1. **Given** the Time-Off management page, **When** reviewing requests, **Then** both the requested dates and submission dates are formatted identically as `YYYY-MM-DD`.
2. **Given** volunteer profile cards, **When** viewing arrival and departure dates, **Then** dates display as `YYYY-MM-DD`.
3. **Given** any date throughout the management interface and volunteer portal, **When** rendered, **Then** it conforms to the standardized `YYYY-MM-DD` pattern.

---

### User Story 2 - Monday-Enforced Roster Navigation (Priority: P1)

As a hostel manager, when I view or navigate the weekly roster, I want the date picker to strictly enforce Monday-to-Sunday cycles and provide week navigation buttons (`← Previous Week`, `This Week`, `Next Week →`), so that the roster always starts on Monday and navigation is fast.

**Why this priority**: The hostel's operational schedule runs Monday through Sunday. Allowing non-Monday dates to be picked causes misaligned weekly views or confusing shift windows.

**Independent Test**: Open `/admin/roster`. Click the date input and pick a Wednesday (e.g. Oct 28). Verify the schedule automatically snaps to Monday (Oct 26). Click `Next Week →` and verify it advances exactly 7 days to next Monday. Click `← Previous Week` and verify it steps back 7 days. Click `This Week` and verify it returns to the current week's Monday.

**Acceptance Scenarios**:

1. **Given** the weekly roster page, **When** selecting any day of the week in the date picker, **Then** the value automatically snaps to the Monday of that week.
2. **Given** the weekly roster page, **When** clicking `Next Week →`, **Then** the roster advances by 7 days to the following Monday.
3. **Given** the weekly roster page, **When** clicking `← Previous Week`, **Then** the roster moves back by 7 days to the preceding Monday.
4. **Given** the weekly roster page, **When** clicking `This Week`, **Then** the roster jumps directly to the current calendar week's Monday.
5. **Given** the weekly roster header, **Then** the active date range is clearly labeled (e.g. `Monday, 2026-10-26 to Sunday, 2026-11-01`).

---

### User Story 3 - Volunteer Email & Phone Number Capture and Display (Priority: P1)

As a hostel manager, I want to capture each volunteer's email address and phone/WhatsApp number in the volunteer application modal and display them on their volunteer profile card, so that management has complete contact information at all times.

**Why this priority**: Volunteer coordinators need direct access to volunteer email addresses and WhatsApp/phone numbers to send magic links, confirm arrivals, and communicate logistics.

**Independent Test**: Open the volunteer application modal. Verify dedicated input fields for "Email Address" and "Phone / WhatsApp Number". Enter `maria@example.com` and `+55 11 98765-4321`. Save. Inspect the volunteer card on the management page: verify email and phone number are displayed with clickable `mailto:` and `tel:` links. Edit the volunteer and verify the values can be updated.

**Acceptance Scenarios**:

1. **Given** the "New Volunteer Application" modal, **When** filling out the form, **Then** inputs for Email Address and Phone / WhatsApp Number are available and validated.
2. **Given** an existing volunteer, **When** editing their profile, **Then** their email and phone number can be viewed and updated.
3. **Given** the volunteer list on `/admin/volunteers`, **When** viewing any volunteer card across any status tab, **Then** their email and phone number are clearly displayed.
4. **Given** a displayed email or phone number, **When** clicked, **Then** it triggers a mail client (`mailto:`) or phone/dialer (`tel:`).

---

## Edge Cases

- **Date snapping across year boundaries**: Selecting a date in late December or early January correctly computes the Monday of that week even if Monday was in the previous year.
- **Volunteers without email or phone number**: If contact info is omitted during quick draft creation, the volunteer card displays "No email" / "No phone" gracefully without breaking formatting.
- **Phone number formatting**: Accepts international dialing codes (e.g. `+44 7123 456789`, `+1 555-0199`) and trims whitespace.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST format all calendar dates consistently as `YYYY-MM-DD` across all client views, eliminating mixed date representations.
- **FR-002**: On the Time-Off review page, the submission timestamp MUST be formatted consistently as `YYYY-MM-DD` (or `YYYY-MM-DD HH:mm`) to match the requested date format.
- **FR-003**: The weekly roster page MUST strictly enforce that the active scheduling period begins on Monday:
  - If a user picks a non-Monday date in the date input, the system MUST automatically calculate and set the value to the Monday of that week.
- **FR-004**: The weekly roster page MUST provide navigation controls: `← Previous Week`, `This Week`, and `Next Week →`, advancing or retreating by exactly 7 days.
- **FR-005**: The weekly roster header MUST display the full weekly interval: `Monday, YYYY-MM-DD to Sunday, YYYY-MM-DD`.
- **FR-006**: The volunteer modal (`VolunteerModal`) MUST include dedicated form fields for:
  - Email Address (`<input type="email" name="email" ... />`)
  - Phone / WhatsApp Number (`<input type="tel" name="phone" ... />`)
- **FR-007**: When saving a new or existing volunteer, the system MUST persist `email` and `phone` to the database.
- **FR-008**: The volunteer cards on `AdminVolunteersPage` MUST display the volunteer's email address and phone number in the contact metadata section with active `mailto:` and `tel:` links.

### Key Entities

- **Volunteer Contact Info**: `email: TEXT`, `phone: TEXT` exposed in modal state and rendered on cards.
- **Roster Week Interval**: Normalized to `weekStartDate` (Monday) and `weekEndDate` (Sunday).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of user-facing dates across all admin and portal pages adhere to the `YYYY-MM-DD` format (0 occurrences of conflicting `DD/MM/YYYY` or `MM/DD/YYYY`).
- **SC-002**: Selecting any day in the roster date picker resolves to Monday in **0 clicks** of manual recalculation (automatic snap).
- **SC-003**: A manager can step forward or backward through weekly schedules in **1 click** using navigation buttons.
- **SC-004**: 100% of volunteers created or edited retain their email address and phone number, viewable directly from their profile card.

---

## Assumptions

- The operational roster week strictly starts on Monday (day 1) and ends on Sunday (day 0/7).
- Date standard is ISO 8601 `YYYY-MM-DD`.

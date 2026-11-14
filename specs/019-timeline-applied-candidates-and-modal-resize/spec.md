# Feature Specification: Timeline Applied Candidates Population & Resizable Modal Fix

**Feature Branch**: `019-timeline-applied-and-modal-resize`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User feedback from `feedback.txt`:
1. "DEFECT: Feature 18, User story 3. The volunteer rows are not being populated, so the running total is zero and it sates 'No applied candidates in this date window.' regardless of date. They should be shown for the dates that they have been accepted for."
2. "DEFECT: Feature 18, User Story 5 was only partially implemented. The dialog can be dismissed with the `Esc` key but is not resizable."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Populate Timeline Candidate Rows for Accepted & Applied Dates (Priority: P1)

As a hostel manager viewing the Staffing Timeline, I want the candidate section ("Unconfirmed / Applied Candidates") to display rows for all upcoming volunteers who have applied or been accepted for dates within the timeline window, with their stay bars drawn for the dates they have been accepted for and their daily totals calculated in the running total row, so that I can see my incoming volunteer pipeline and expected arrivals.

**Why this priority**: Coordinators accept volunteer applications weeks/months in advance. When candidates were previously placed in Active Reception/Housekeeping tiers instead of the incoming candidate section, the candidate section was permanently empty ("No applied candidates in this date window") and the running candidate total was zero regardless of date.

**Independent Test**:
- Create or accept a volunteer application for dates overlapping the timeline (e.g. Nov 15 to Nov 30) with status `Accepted` (or `Applied`).
- Open `/admin/timeline` on that date window.
- Verify the volunteer appears as a row in Section 4 with their stay bar rendered from Nov 15 to Nov 30.
- Verify the "Total APPLIED Candidates" running total row sums to $\ge 1$ for those dates.
- When the volunteer is marked arrived (`Active` / `In da house`), verify they move to their operational department (Reception or Housekeeping).

**Acceptance Scenarios**:
1. **Given** a volunteer who has been accepted (`status === 'Accepted'`) or applied (`status === 'Applied'`) with dates overlapping the timeline window, **When** `/api/admin/timeline` is fetched, **Then** they are populated in the candidate rows (`applied` entries) for the dates they have been accepted for.
2. **Given** candidates in the candidate section, **When** evaluating the "Total APPLIED Candidates" row, **Then** each day column displays the accurate count of incoming candidates on site/scheduled for that day.
3. **Given** on-site volunteers with `status === 'Active'` (`In da house`), **When** rendered, **Then** they appear in their operational department rows (Reception or Housekeeping).

---

### User Story 2 - Smooth & Reliable Drag-to-Resize for Volunteer Modal (Priority: P1)

As a hostel administrator editing volunteer details, I want to click and drag a visible corner resize handle on `VolunteerModal` to resize the dialog window smoothly in both width and height, so that I can expand the modal on my screen to view long application notes and history comfortably.

**Why this priority**: Native CSS `resize: both` was suppressed by the flex centering overlay and child overflow. A dedicated interactive resize grip ensures 100% reliable cross-browser resizing.

**Independent Test**:
- Open `VolunteerModal` on desktop.
- Click and drag the resize handle at the bottom-right corner of the modal.
- Verify that dragging increases or decreases both the width and height of the modal dialog box in real-time.
- Verify the modal adheres to sensible minimum boundaries (`minWidth: 480px`, `minHeight: 400px`).

**Acceptance Scenarios**:
1. **Given** `VolunteerModal` is displayed, **When** clicking and dragging the bottom-right resize handle, **Then** the modal width and height resize smoothly following the mouse cursor.
2. **Given** the modal is resized, **When** dragging stops, **Then** the custom dimensions persist while the modal remains open.
3. **Given** pressing `Esc`, **When** pressed, **Then** the modal immediately closes.

---

## Edge Cases

- **Mid-window Arrivals for Accepted Volunteers**: Stay bars begin on their accepted arrival date.
- **Candidates without Departure Date (No End Date)**: Shading extends indefinitely across all dates on or after arrival date.
- **Screen Boundary Constraints**: Resizing is capped so the modal does not exceed 95% of viewport width or height.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `/api/admin/timeline` MUST include volunteers with `status === 'Accepted'` and `status === 'Applied'` in the `applied` candidate entries for the dates they have been accepted for.
- **FR-002**: Volunteers with `status === 'Active'` (`In da house`) MUST be populated in `reception` or `housekeeping` tiers based on their `primaryRole`.
- **FR-003**: The "Total APPLIED Candidates" running total row MUST display the daily count of all candidates in the candidate section for each calendar day.
- **FR-004**: `VolunteerModal.tsx` MUST provide an interactive, visible drag-to-resize handle at the bottom-right corner that dynamically updates modal width and height during mouse drag events.
- **FR-005**: Modal resizing MUST respect constraints: `minWidth: 480px`, `minHeight: 400px`, `maxWidth: 95vw`, `maxHeight: 95vh`.
- **FR-006**: Pressing the `Escape` key in `VolunteerModal.tsx` MUST dismiss the modal.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of incoming accepted and applied volunteers with dates in the timeline window are rendered in the candidate section rows.
- **SC-002**: "Total APPLIED Candidates" daily count accurately reflects all candidates scheduled for each day (0 instances of empty 0 counts when accepted volunteers exist).
- **SC-003**: `VolunteerModal` responds to mouse drag on the resize handle with real-time resizing in < 16ms per frame.
- **SC-004**: Pressing `Esc` dismisses the modal immediately.

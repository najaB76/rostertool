# Feature Specification: Timeline Hierarchy, Roster Assignment Accuracy, and Visual Enhancements

**Feature Branch**: `021-timeline-roster-ux-improvements`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User feedback from `feedback.txt`:
1. The timeline isn't working as intended. The top section (Total Confirmed Volunteers) should include any candidates who have moved past the 'Applied' state and the bottom section should be candidates in the 'Applied' state (Unconfirmed volunteers). This is so that management have a view of the overall staffing levels, and the pool of potential volunteers to fill any future shortfalls. Ensure this does not affect the ability to scroll backwards and see past on-site staffing.
2. Ensure that when manually filling the roster, only and all volunteers who are or should be in house are shown for that day. Exclude any volunteers who have already departed by that day, and include volunteers who are accepted but not yet in house.
3. On the timeline view, when the user clicks a date in the header, highlight the column.
4. On the timeline view, fix the name column so that it remains visible as you scroll the timeline horizontally.
5. On the printable roster view, when a volunteer who still has the training status is added to the roster, make the cell background light yellow.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Timeline Tier Separation: Confirmed Staffing vs Unconfirmed Pipeline (Priority: P1)

As a hostel manager, I want the top sections of the Staffing Timeline (Reception & Housekeeping) and the "Total Confirmed Volunteers" row to include all volunteers who have moved past the 'Applied' state (`Active`, `Accepted`, and historical on-site stays), and the bottom section to contain exclusively candidates in the `'Applied'` state, so that management has an accurate view of confirmed staffing levels and a separate view of the unconfirmed candidate pool.

**Why this priority**: Conflating accepted candidates with unconfirmed applicants obscures overall confirmed staffing levels and prevents clean assessment of the true unconfirmed recruitment pipeline.

**Independent Test**:
- Ensure the database contains:
  1. Volunteer 1: `status: 'Active'` (In da house)
  2. Volunteer 2: `status: 'Accepted'` (Confirmed upcoming arrival)
  3. Volunteer 3: `status: 'Applied'` (Unconfirmed applicant)
- Open `/admin/timeline`.
- Verify Volunteers 1 & 2 appear in their respective operational departments (Reception or Housekeeping) and are counted in "Total CONFIRMED Volunteers".
- Verify Volunteer 3 appears exclusively in the bottom section ("Unconfirmed Applied Candidates") and is counted in the "Total APPLIED Candidates" row.
- Scroll backwards to past dates: Verify past on-site volunteers (currently `Departed`) still appear in Reception or Housekeeping for their historical stay dates.

**Acceptance Scenarios**:
1. **Given** volunteers with `status === 'Active'` or `status === 'Accepted'`, **When** `/api/admin/timeline` is fetched, **Then** they are segregated into `reception` or `housekeeping` tiers based on `primaryRole`.
2. **Given** the "Total CONFIRMED Volunteers" summary row, **When** calculating daily counts, **Then** it aggregates all on-site and accepted volunteers for overnight bed demand.
3. **Given** candidates with `status === 'Applied'`, **When** fetched, **Then** they appear exclusively in `applied` (the unconfirmed section).
4. **Given** historical dates, **When** scrolling backwards, **Then** historical stays remain visible in Reception or Housekeeping with accurate point-in-time staffing.

---

### User Story 2 - Shift-Day In-House Candidate Filter for Manual Assignment (Priority: P1)

As a hostel coordinator assigning volunteers to a shift on date $D$, I want the candidate picker (`ShiftAssignModal`) to display only and all volunteers who are or should be in house on date $D$, excluding any volunteers who departed prior to $D$, and including volunteers who are accepted for date $D$ even if they have not yet checked in, so that the candidate list is 100% relevant to that specific shift day.

**Why this priority**: Showing volunteers who already departed or who will not be on site causes scheduling errors and clutters the modal.

**Independent Test**:
- Open the weekly roster. Click a shift on Wednesday `2026-11-18`.
- In `ShiftAssignModal`, inspect the candidate list:
  - Volunteer A (Active, stay Nov 10–25): Visible.
  - Volunteer B (Accepted, stay Nov 16–30): Visible (accepted and will be in house on Nov 18).
  - Volunteer C (Departed Nov 15): NOT visible (departed prior to Nov 18).
  - Volunteer D (Accepted, stay Nov 20–30): NOT visible (arrives after Nov 18).

**Acceptance Scenarios**:
1. **Given** a shift slot on date $D$, **When** opening `ShiftAssignModal`, **Then** a volunteer is listed if and only if their stay covers date $D$ (`arrivalDate <= D` and `(noEndDate || departureDate >= D)`) and status is `Active` or `Accepted`.
2. **Given** a volunteer who departed before date $D$ (`departureDate < D`), **When** viewing candidates for date $D$, **Then** they are excluded.
3. **Given** a volunteer accepted for upcoming dates including date $D$ (`status === 'Accepted'`), **When** viewing candidates for date $D$, **Then** they are included.

---

### User Story 3 - Sticky Name Column on Timeline Grid (Priority: P2)

As a hostel coordinator scrolling horizontally through 5+ weeks of calendar days on the Staffing Timeline, I want the volunteer Name column (and Sex icon) to remain fixed and visible on the left side of the screen, so that I always know which volunteer's row I am viewing without having to scroll back and forth.

**Why this priority**: Navigating across 35+ day columns without visible names causes misinterpretation of rows and requires excessive horizontal scrolling.

**Independent Test**:
- Open `/admin/timeline`.
- Scroll horizontally to the far right (week 4 and 5).
- Verify the Sex and Name columns remain pinned to the left edge of the table and remain legible over the scrolling days.

**Acceptance Scenarios**:
1. **Given** the timeline table, **When** scrolled horizontally, **Then** the Sex column (Col A) and Name column (Col B) stick to the left edge with appropriate `position: sticky`, background `#fff`, and higher `z-index`.
2. **Given** table headers, **When** scrolled horizontally, **Then** the header cells for Sex and Name also remain pinned to the left.

---

### User Story 4 - Clickable Date Header Column Highlighting (Priority: P2)

As a hostel coordinator viewing the Staffing Timeline, I want to click any date in the header row to highlight that date's entire vertical column, so that I can easily inspect who is working, arriving, or departing on that particular day.

**Why this priority**: With 35+ columns and dozens of rows, visually tracking a single vertical column across multiple sections is difficult without a guide highlight.

**Independent Test**:
- Open `/admin/timeline`.
- Click on the header cell for Friday, Nov 13.
- Verify the entire column for Nov 13 receives a distinct vertical highlight (e.g. soft blue or amber background).
- Click another date (e.g. Sunday, Nov 15) and verify the highlight moves to Nov 15. Clicking the active date again toggles it off.

**Acceptance Scenarios**:
1. **Given** any date column header cell, **When** clicked, **Then** that date is marked as selected and all cells in that vertical column display highlighting.
2. **Given** an already highlighted date, **When** clicked again, **Then** the highlight is deselected.

---

### User Story 5 - Training Status Highlight on Printable Roster (Priority: P2)

As a hostel manager reviewing or printing the Weekly Roster, when an assigned volunteer has the training status (`inTraining === true`), I want their cell/chip background on the printable roster view (`PrintableRosterView`) to be shaded in light yellow, so that floor supervisors can immediately spot trainees during shift handovers.

**Why this priority**: Supervisors need visual cues on the print/WhatsApp roster to pair trainees with experienced mentors.

**Independent Test**:
- Assign a volunteer with `inTraining: true` to a shift on the roster.
- Click "Print / Share Roster".
- Verify on `PrintableRosterView` that the volunteer's assigned shift cell/badge has a light yellow background (e.g. `#fef9c3` / `#fef08a`) with a clear trainee indicator.

**Acceptance Scenarios**:
1. **Given** an assigned volunteer with `inTraining === true`, **When** rendered in `PrintableRosterView.tsx`, **Then** their cell background is shaded light yellow (`#fef9c3`).
2. **Given** an assigned volunteer with `inTraining === false`, **When** rendered, **Then** their cell background retains the standard clean white/slate styling.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `/api/admin/timeline` MUST route all volunteers with `status === 'Accepted'` and `status === 'Active'` (and historical on-site stays) to `reception` or `housekeeping` tiers based on `primaryRole`.
- **FR-002**: `/api/admin/timeline` MUST restrict `applied` entries exclusively to volunteers with `status === 'Applied'`.
- **FR-003**: The "Total CONFIRMED Volunteers" row MUST calculate overnight bed demand for all confirmed volunteers (`status === 'Active'` and `status === 'Accepted'`).
- **FR-004**: In `ShiftAssignModal.tsx`, the candidate list MUST filter candidates strictly for the selected shift date $D$:
  - A candidate MUST be included if and only if: `arrivalDate <= D` AND `(noEndDate === true || !departureDate || departureDate >= D)` AND `status IN ('Active', 'Accepted')`.
  - A volunteer departing before $D$ (`departureDate < D`) MUST be excluded.
  - A volunteer arriving after $D$ (`arrivalDate > D`) MUST be excluded.
- **FR-005**: In `AdminTimelinePage.tsx`, the Sex column (Col A) and Name column (Col B) MUST be sticky (`position: sticky`) so they remain pinned and visible during horizontal scrolling.
- **FR-006**: In `AdminTimelinePage.tsx`, clicking any date column header MUST toggle a vertical column highlight for that date across all table rows.
- **FR-007**: In `PrintableRosterView.tsx`, any shift assignment where the volunteer has `inTraining === true` MUST be rendered with a light yellow background (`#fef9c3`).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of `status === 'Accepted'` volunteers appear in Reception or Housekeeping on the timeline, and 100% of `status === 'Applied'` volunteers appear in the Unconfirmed section.
- **SC-002**: 100% of volunteers shown in `ShiftAssignModal` for shift date $D$ have stay dates covering date $D$ (0 departed or post-shift arrivals displayed).
- **SC-003**: Volunteer names remain visible and anchored on screen across 100% of the horizontal scroll range on `/admin/timeline`.
- **SC-004**: Clicking a date header toggles vertical column highlighting in < 50ms.
- **SC-005**: 100% of volunteers in training display a light yellow background on the printable roster view.

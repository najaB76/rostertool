# Feature Specification: Roster, Lifecycle & Headcount Refinements

**Feature Branch**: `002-roster-lifecycle-refinements`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User description: "The weekly roster page has four sections for every day. This doesn't make sense, it should have three: housekeeping, reception day and reception evening. There is no need to have the Fri-Sat evening reception under Sunday through Thursday and vice versa. There is no way to advance volunteers from the applied status to accepted, and likely no way to advance through the other states. When adding a volunteer the nationality should be a drop-down menu with the countries and flags. The source should be a dropdown as well. The notes field should be available in all statuses, not just at the departed stage as there is a need to have records of the application process and of things that happen while the volunteer is working. Add navigation buttons to the headcount page to make it easier to see month by month. Include an option to show less detail (just the colours, not the dates) by quarter and for the whole year, also with navigation buttons."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Clean Three-Shift Daily Roster View (Priority: P1)

As a hostel manager, I want each calendar day on the weekly roster to display exactly three operational shift slots (Housekeeping, Reception Day, and Reception Evening), so that the schedule is clear, uncluttered, and reflects the actual daily shift schedule.

**Why this priority**: The daily roster is the primary workspace for scheduling. Displaying non-applicable weekend evening shifts on weekdays (and vice versa) causes confusion and clutters the interface.

**Independent Test**: Load the weekly roster for any week. Verify that every column from Monday through Sunday contains exactly 3 shift slots:
- Monday–Thursday and Sunday: Housekeeping (10:00–14:00), Reception Day (08:00–18:00), and Reception Evening (16:00–00:00).
- Friday and Saturday: Housekeeping (10:00–14:00), Reception Day (08:00–18:00), and Reception Evening (17:00–01:00).

**Acceptance Scenarios**:

1. **Given** a weekday (e.g. Wednesday), **When** viewing the day's shifts on the roster grid, **Then** only Housekeeping, Reception Day, and the 16:00–00:00 Reception Evening shift are displayed.
2. **Given** a weekend day (Friday or Saturday), **When** viewing the day's shifts on the roster grid, **Then** only Housekeeping, Reception Day, and the 17:00–01:00 Reception Evening shift are displayed.
3. **Given** an unassigned evening shift on any day, **When** auto-populate runs, **Then** assignments are created specifically for that day's applicable evening shift without orphaned or duplicate slots.

---

### User Story 2 - Volunteer Lifecycle State Transitions (Priority: P1)

As a hostel manager, I want explicit, accessible actions to advance volunteers through their stay lifecycle (`Applied` $\to$ `Accepted` $\to$ `Active` $\to$ `Departed`, with `Cancelled` available when needed), so that I can manage incoming applications, confirm arrivals, and record departures.

**Why this priority**: The volunteer management workflow is blocked if applicants cannot be advanced to accepted or active status.

**Independent Test**: Create an applicant in `Applied` status. Click "Accept Volunteer", confirm their stay dates, and observe the volunteer move to the `Accepted` tab. Click "Mark Arrived / Activate", observe them move to `Active`. Click "Depart", record rating and notes, and verify they transition to `Departed`.

**Acceptance Scenarios**:

1. **Given** a volunteer in `Applied` status, **When** the manager clicks "Accept", **Then** the manager can confirm arrival/departure dates and the volunteer transitions to `Accepted`.
2. **Given** a volunteer in `Accepted` status, **When** the manager clicks "Mark as Active" (or their arrival date is reached), **Then** their status transitions to `Active` and they become eligible for scheduling.
3. **Given** a volunteer in `Active` status, **When** the manager clicks "Depart", **Then** the departure dialog captures their stay rating (1–5), review notes, and future re-application acceptance recommendation.
4. **Given** a volunteer in `Applied`, `Accepted`, or `Active` status, **When** the manager clicks "Cancel", **Then** after confirmation the status transitions to `Cancelled` and any future shifts are unassigned.

---

### User Story 3 - Country Flag & Source Dropdowns, Universal Notes (Priority: P2)

As a hostel manager, I want the volunteer creation and edit modal to feature a country flag dropdown for nationality, an application source dropdown, and an editable notes field accessible across all lifecycle stages, so that entering and maintaining volunteer data is fast, accurate, and comprehensive.

**Why this priority**: Selecting nationalities from a dropdown with visual country flags eliminates typing errors, source dropdowns standardize reporting, and universal notes allow logging interview details and on-stay feedback.

**Independent Test**: Open the "New Volunteer" modal. Select nationality from a dropdown showing country names and flags (e.g. 🇩🇪 Germany, 🇫🇷 France). Select application source from a dropdown list (HelpEx, WorkAway, Worldpackers, Guest, etc.). Enter notes and save. Re-open the volunteer profile in any status and verify the notes field is fully viewable and editable.

**Acceptance Scenarios**:

1. **Given** the volunteer modal, **When** selecting nationality, **Then** a dropdown displays countries sorted alphabetically with their national flag emoji/icon and country code.
2. **Given** the volunteer modal, **When** selecting application source, **Then** a dropdown displays known sources (`HelpEx`, `WorkAway`, `Worldpackers`, `Guest`, + custom) with an option to specify a new source.
3. **Given** a volunteer in ANY status (`Applied`, `Accepted`, `Active`, `Departed`, `Cancelled`), **When** viewing or editing their details, **Then** the notes field is visible and can be updated and saved.

---

### User Story 4 - Headcount Calendar Navigation & Multi-Scale Heatmaps (Priority: P2)

As a hostel manager, I want to navigate the Headcount Calendar month-by-month with Previous/Next buttons, and switch to compact Quarter (3 months) and Year (12 months) heatmap views showing just capacity colors, so that I can easily assess long-term volunteer turnover and capacity trends at a glance.

**Why this priority**: Long-term application planning requires seeing quarterly and annual occupancy patterns without overwhelming date-by-date text clutter.

**Independent Test**: Navigate to the Headcount page. Click "< Previous Month" and "Next Month >" to change months. Toggle "View: Quarter" and observe 3 months rendered. Toggle "Compact Heatmap" (less detail) and observe the calendar display color-coded cells without numeric text. Toggle "View: Year" to see all 12 months with annual navigation buttons.

**Acceptance Scenarios**:

1. **Given** the Month view of the Headcount Calendar, **When** clicking "Previous Month" or "Next Month", **Then** the calendar updates immediately to show the corresponding month.
2. **Given** the Headcount page, **When** the manager switches view scale to "Quarter", **Then** three consecutive months are displayed with previous/next quarter navigation.
3. **Given** the Headcount page, **When** the manager switches view scale to "Year", **Then** a 12-month calendar overview is displayed with previous/next year navigation.
4. **Given** Quarter or Year view, **When** the manager toggles "Compact / Low Detail", **Then** the view simplifies to show only the color indicators (green=optimal, yellow=overlap, amber=low, red=critical) without date numbers or volunteer lists.

---

## Edge Cases

- **Editing stay dates when advancing from Applied to Accepted**: If an applicant had estimated dates, the manager can modify the arrival and departure dates during the "Accept" workflow, which updates the capacity impact preview in real time.
- **Volunteer cancelling after being rostered**: When an `Accepted` or `Active` volunteer is transitioned to `Cancelled`, all future shift assignments associated with that volunteer are automatically removed and the shifts revert to unassigned (highlighted) status.
- **Custom application source creation**: When a manager enters a new source name in the dropdown, it is dynamically saved to `application_sources` so it appears in future dropdown selections.
- **Roster shifts across midnight**: Reception evening shifts on Friday/Saturday span from 17:00 to 01:00 (crossing midnight into Saturday/Sunday morning). The shift slot remains grouped under the shift start date (Friday or Saturday) while turnaround rest logic accounts for the 01:00 end time.
- **Heatmap navigation boundaries**: Navigating across year boundaries (e.g. from Q1 to previous Q4) correctly updates both the year and quarter index.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The weekly roster grid MUST display exactly three shifts for every day of the week:
  - Housekeeping (10:00–14:00, every day).
  - Reception Day (08:00–18:00, every day).
  - Reception Evening: 16:00–00:00 for Sunday through Thursday; 17:00–01:00 for Friday and Saturday.
- **FR-002**: The system MUST filter shift definitions by day-of-week so that Friday/Saturday evening shifts NEVER appear on Sunday–Thursday, and Sunday–Thursday evening shifts NEVER appear on Friday–Saturday.
- **FR-003**: The volunteer management interface MUST provide explicit state transition actions for each lifecycle phase:
  - `Applied`: "Accept" (sets/confirms dates and role $\to$ `Accepted`), "Cancel" ($\to$ `Cancelled`).
  - `Accepted`: "Mark Arrived / Activate" ($\to$ `Active`), "Cancel" ($\to$ `Cancelled`), "Edit".
  - `Active`: "Depart" (opens review dialog $\to$ `Departed`), "Cancel" ($\to$ `Cancelled`), "Edit".
  - `Departed` / `Cancelled`: "View / Edit Notes", "Re-open / Re-activate" (if needed).
- **FR-004**: The volunteer modal MUST provide a nationality dropdown selector with full country names, ISO codes, and national flags, replacing the raw text input.
- **FR-005**: The volunteer modal MUST provide an application source dropdown selector populated with active sources (`HelpEx`, `WorkAway`, `Worldpackers`, `Guest`, and previously added custom sources) and allow typing a new custom source.
- **FR-006**: The notes field MUST be accessible, visible, and editable in the volunteer modal and volunteer card across ALL lifecycle statuses (`Applied`, `Accepted`, `Active`, `Departed`, `Cancelled`).
- **FR-007**: The Headcount Calendar page MUST include navigation controls:
  - "Previous" button, "Next" button, and "Today / Current" button.
- **FR-008**: The Headcount Calendar MUST support three view scales:
  - **Month View**: Detailed monthly calendar view with day numbers and volunteer headcounts.
  - **Quarter View**: 3-month overview with previous/next quarter navigation.
  - **Year View**: 12-month annual overview with previous/next year navigation.
- **FR-009**: The Headcount Calendar MUST include a "Low Detail / Heatmap" view toggle for Quarter and Year views that renders compact color blocks representing capacity levels (Optimal, Low, Overlap, Critical) without date text or volunteer lists.

### Key Entities

- **Volunteer**: Updated state transition rules and lifecycle actions.
  - Status transitions: `Applied` $\to$ `Accepted` $\to$ `Active` $\to$ `Departed` (or `Cancelled`).
  - Notes field persists throughout all states.
- **Shift Definition**: Strict day-of-week linkage:
  - Sunday–Thursday Evening: `dayOfWeek` in `[0, 1, 2, 3, 4]`.
  - Friday–Saturday Evening: `dayOfWeek` in `[5, 6]`.
- **Country Metadata**: Canonical list of ISO 3166-1 countries with common names and flag representations.
- **Headcount View Model**: Supports `Month`, `Quarter`, and `Year` time horizons and `Detailed` vs `Compact / Heatmap` display modes.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every day column on the weekly roster displays exactly 3 shift slots (zero duplicate or inapplicable evening shifts).
- **SC-002**: A manager can advance an applicant from `Applied` to `Accepted` in 2 clicks or fewer.
- **SC-003**: 100% of country selections in the volunteer modal display both the country name and its national flag.
- **SC-004**: Notes entered during the `Applied` phase remain visible and editable when the volunteer is `Accepted`, `Active`, `Departed`, or `Cancelled`.
- **SC-005**: The manager can toggle between Month, Quarter, and Year headcount views in 1 click, with views rendering in under 300ms.
- **SC-006**: In compact heatmap mode, a full year of capacity data (365 days) fits cleanly on a standard desktop screen without vertical scrolling.

---

## Assumptions

- Standard week continues to run Monday to Sunday.
- Sunday through Thursday evening shift is 16:00–00:00 (8h); Friday and Saturday evening shift is 17:00–01:00 (8h).
- The 12-volunteer baseline, 10–11 low warning, 13–15 overlap warning, and <10 / >15 critical thresholds apply identically across Month, Quarter, and Year views.

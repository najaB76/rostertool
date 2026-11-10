# Feature Specification: Timeline View Volunteer-Only Scope & Country Column Removal

**Feature Branch**: `012-timeline-volunteers-and-flags`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User amendment: "Actually, an amendment to the last specification - since the flag is shown next to the volunteer name we can remove the column for country in the timeline view. The timeline should still exclude paid staff though and only include volunteers."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Exclude Paid Staff from Staffing Timeline (Priority: P1)

As a hostel manager using the Staffing Timeline view (`/admin/timeline`), I want the timeline to only show volunteers (in Reception, Housekeeping, and Applied sections) and exclude permanent paid staff, so that the timeline accurately reflects volunteer capacity, turnover, and volunteer headcount.

**Why this priority**: Paid staff are permanent employees with contracts, whereas the timeline view is explicitly intended for managing volunteer turnover, capacity, and bed/stay horizons. Including permanent staff inflates volunteer confirmed counts and clutters the volunteer timeline.

**Independent Test**:
- Open `/admin/timeline`.
- Inspect the Reception, Housekeeping, and Applied sections.
- Verify that permanent paid staff (records from `staff_users`, e.g., permanent receptionists or managers) do NOT appear in the timeline table.
- Verify that only active, accepted, and applied volunteers appear in their respective sections.
- Verify that the "Total Confirmed Volunteers" daily count only aggregates confirmed volunteers on site, without adding paid staff counts.

**Acceptance Scenarios**:
1. **Given** permanent paid staff in the database (`staff_users`), **When** viewing `/admin/timeline`, **Then** no paid staff members are listed in the Reception, Housekeeping, or Applied sections.
2. **Given** daily confirmed headcount totals on the timeline, **When** calculating daily totals for each date column, **Then** only confirmed volunteers (`status IN ('Active', 'Accepted')`) with active stay dates are counted.
3. **Given** the backend endpoint `GET /api/admin/timeline`, **When** queried, **Then** the payload contains exclusively volunteer records.

---

### User Story 2 - Remove Redundant Country Column & Display SVG Flag Beside Name (Priority: P1)

As a hostel manager viewing the Staffing Timeline on a desktop or laptop monitor, I want the separate "Country" column removed from the table since the authentic SVG country flag is already displayed right beside the volunteer's name, so that the table is cleaner and provides more horizontal breathing room for the 5+ week calendar days.

**Why this priority**: Displaying a separate country column is redundant when the vector national flag is already adjacent to the volunteer's name. Removing it satisfies Constitution Principle II while freeing up valuable horizontal table space.

**Independent Test**:
- Open `/admin/timeline`.
- Inspect the table headers and rows.
- Verify that there is NO standalone "Country" column in the table header or rows.
- Verify that Column B ("Name") displays the volunteer's name with their authentic vector SVG national flag (`CountryFlag`) immediately adjacent to it.
- Verify that hovering on the flag shows the country tooltip.

**Acceptance Scenarios**:
1. **Given** the timeline table, **When** rendered, **Then** the separate "Country" column is omitted.
2. **Given** each volunteer row, **When** rendered in the Name column, **Then** the authentic SVG flag (`country-flag-icons`) is displayed directly adjacent to their preferred/full name.
3. **Given** the removal of the Country column, **Then** the personnel details column headers span 7 columns (Sex, Name, Age, Source, Status, Arrival, Departing) instead of 8.

---

## Edge Cases

- **Volunteers without nationality**: Graceful fallback SVG globe icon rendered beside name.
- **Volunteers with long names**: The Name column maintains adequate min-width and flex alignment for name and flag without wrapping awkwardly.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The `/api/admin/timeline` endpoint MUST NOT query or include records from `staff_users`.
- **FR-002**: All sections of the timeline (`reception`, `housekeeping`, `applied`) MUST contain exclusively volunteer records (`volunteers` table).
- **FR-003**: The `dailyConfirmedCounts` on the timeline MUST only aggregate volunteers in `Active` and `Accepted` statuses on site for each date.
- **FR-004**: The timeline table MUST render authentic SVG vector flags (via `CountryFlag` / `country-flag-icons`) directly adjacent to every volunteer's name in compliance with Constitution Principle II.
- **FR-005**: The separate "Country" column MUST be removed from the timeline table layout to eliminate redundancy and expand horizontal calendar width.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 paid staff members appear on the `/admin/timeline` page or in `/api/admin/timeline` API responses.
- **SC-002**: 100% of volunteer rows on the timeline display verified SVG flags directly beside their name.
- **SC-003**: 0 redundant text-code columns appear in the timeline view.
- **SC-004**: Daily confirmed volunteer count accurately reflects only on-site volunteers with active stay dates.

---

## Assumptions

- Removing the Country column saves ~80px of horizontal space across all viewports, improving calendar column visibility.
- Volunteer nationalities remain visible and tooltip-accessible via the SVG flag adjacent to their name.

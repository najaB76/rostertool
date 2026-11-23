# Feature Specification: Complete Dark Mode CSS Audit, Report Date Slicing, and Sortable Tables

**Feature Branch**: `028-dark-mode-css-and-reports-filtering`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User feedback:
"BUG: Dark mode hasn't been completely implemented. The background of the volunteer cards, the weekly schedule, the timeline, etc. are still white. This is especially noticeable on the weekly roster as the text switches to a light colour in dark mode. Check the CSS for all elements to ensure that high contrast is maintained in both light and dark mode.
IMPROVEMENT: Add the ability to filter and slice the reports by date so that comparisons can be made between time periods (e.g. year-on-year).
IMPROVEMENT: Make the tables in the reports sortable by clicking on the column headers."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete Dark Mode Theme & High Contrast Across All Views (Priority: P1)

As a hostel staff member using dark mode on the Weekly Roster, Timeline, Volunteers, Headcount, or Settings pages, I want all component backgrounds (volunteer cards, schedule grid cells, timeline tables, and modals) to transition to dark surfaces (`#1e293b`, `#0f172a`) with dark borders (`#334155`) and crisp light text (`#f8fafc`), so that no white backgrounds remain and high text contrast is guaranteed across the entire application.

**Why this priority**: Components using inline `#fff` backgrounds created an unreadable low-contrast defect when the global text switched to white. Ensuring dark surfaces for all elements restores legibility and aesthetic polish.

**Independent Test**:
- Toggle dark mode on.
- Open `/admin/roster` $\rightarrow$ verify schedule cells and shift blocks have dark surfaces with readable text.
- Open `/admin/volunteers` $\rightarrow$ verify volunteer cards have dark backgrounds (`#1e293b`) and dark borders (`#334155`).
- Open `/admin/timeline` $\rightarrow$ verify timeline personnel details, sticky headers, and date cells render with dark backgrounds and high-contrast text.
- Open modals (`VolunteerModal`, `DepartureModal`, `StayHistoryModal`) $\rightarrow$ verify modal dialogs use dark surfaces.
- Toggle dark mode off $\rightarrow$ verify all views cleanly return to crisp light mode styling.

**Acceptance Scenarios**:
1. **Given** dark mode is enabled, **When** viewing any page or modal, **Then** 0 white backgrounds (`#fff`) or dark text on dark surfaces are rendered.
2. **Given** the weekly roster table, **When** rendered in dark mode, **Then** all shift cells, day headers, and volunteer chips maintain high-contrast text and dark backgrounds.
3. **Given** country flags, **When** displayed on dark surfaces, **Then** authentic flags remain clearly bounded with subtle light outlines per Constitution Principle II.

---

### User Story 2 - Date Filtering & Period Slicing for Reports (Priority: P1)

As a hostel director or coordinator reviewing `/admin/reports`, I want to filter analytics by date range (with quick presets like "All Time", "This Year", "Last Year", "Last 12 Months", or custom date inputs), so that I can analyze demographic shifts and compare volunteer performance and rehire ratios year-on-year.

**Why this priority**: Administrators need period-specific reporting to evaluate seasonal trends and recruitment policy changes over time.

**Independent Test**:
- Open `/admin/reports`.
- Select preset "This Year" $\rightarrow$ verify metrics, charts, and tables update to reflect stays and volunteers active during the current year.
- Select preset "Last Year" $\rightarrow$ verify metrics reflect the previous year.
- Select "Custom" and enter custom start and end dates $\rightarrow$ verify reports re-calculate for that exact interval.
- Select "All Time" $\rightarrow$ verify all historical records are included.

**Acceptance Scenarios**:
1. **Given** `/api/admin/reports`, **When** queried with `startDate` and `endDate`, **Then** the backend calculates KPIs and crosstabulations filtering stays and active volunteers within that window.
2. **Given** `AdminReportsPage.tsx`, **When** changing date filters, **Then** charts, KPI cards, and tables update immediately.

---

### User Story 3 - Interactive Column Sorting on Report Tables (Priority: P2)

As a coordinator analyzing report tables in `/admin/reports`, I want to click any column header (e.g., Country, Volunteer Count, Share %, Average Rating, Rated Stays, Rehire Rate) to sort ascending or descending, so that I can easily discover top and bottom performers across any metric.

**Why this priority**: Fixed table sorting restricts analysis. Allowing sorting by any column enables rapid discovery of highest-rated countries or lowest rehire rates.

**Independent Test**:
- Open `/admin/reports` $\rightarrow$ "By Country" tab.
- Click "Avg Rating" header $\rightarrow$ table sorts descending by rating with indicator `▼`.
- Click "Avg Rating" again $\rightarrow$ table sorts ascending with indicator `▲`.
- Click "Volunteers" header $\rightarrow$ table returns to volume sort.
- Test sorting on "By Continent", "By Age", "By Gender", and "Rehire Ratios" tables.

**Acceptance Scenarios**:
1. **Given** any report table, **When** clicking a column header, **Then** the table sorts by that column and displays the active sort direction arrow (`▲` or `▼`).
2. **Given** sorting on numerical columns (ratings, counts, percentages), **When** clicked, **Then** null values sort gracefully to the bottom.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `src/client/styles/main.css` MUST implement comprehensive dark mode rules targeting inline styles, cards, tables, inputs, and modals to replace `#fff`, `#f8fafc`, `#f1f5f9` backgrounds with `#1e293b` and `#0f172a`, and `#e2e8f0` borders with `#334155`.
- **FR-002**: In `AdminRosterPage.tsx`, `AdminTimelinePage.tsx`, `AdminVolunteersPage.tsx`, `VolunteerModal.tsx`, `DepartureModal.tsx`, `ReactivateModal.tsx`, and `StayHistoryModal.tsx`, text and cell styles MUST adapt to `isDark` or dark theme variables to maintain high contrast.
- **FR-003**: `ReportingService.getReports` MUST accept optional `startDate?: string` and `endDate?: string` query parameters to filter stays and volunteers.
- **FR-004**: `AdminReportsPage.tsx` MUST provide a date range selector with quick filter buttons ("All Time", "This Year", "Last Year", "Last 12 Months", "Custom") and custom date inputs.
- **FR-005**: All tables in `AdminReportsPage.tsx` MUST support interactive sorting on all columns with visual indicators.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 white background surfaces or low-contrast text elements present when dark mode is enabled across 100% of pages and modals.
- **SC-002**: Filtering reports by date period recalculates all metrics and charts in < 200ms.
- **SC-003**: 100% of report table columns can be sorted ascending and descending by clicking headers.
- **SC-004**: High contrast is preserved in both light mode and dark mode without visual regressions.

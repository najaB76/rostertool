# Feature Specification: Volunteer Analytics & Reporting, Timeline Datepicker, and Accessible Dark Mode

**Feature Branch**: `027-analytics-reports-and-dark-mode`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User feedback from `feedback.txt`:
1. IMPROVEMENT: Implement a toggleable dark mode for the UI. Ensure that flags remain visible while dark mode is enabled.
2. IMPROVEMENT: Add a datepicker to the timeline view to allow users to jump to a specific date rather than paging forwards/backwards. When a date is picked the timeline should reload and show the status as of the date selected.
3. NEW FEATURE: Add a reporting tab that allows for statistics and crosstabulations such as: number of volunteers by country, average rating by country, average rating by age, ratings by gender, average rating by continent, and rehire ratios by country. Reports should be available using tables and charts.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Volunteer Analytics & Reporting Tab (Priority: P1)

As a hostel director or coordinator, I want a dedicated "Reports" tab (`/admin/reports`) providing interactive charts and structured tables with key demographic and performance crosstabulations (volunteers by country, average rating by country, average rating by age bracket, ratings by gender, average rating by continent, and rehire ratios by country), so that management can make data-driven decisions on recruitment sources and staffing policies.

**Why this priority**: With hundreds of imported and ongoing volunteer records, leadership lacks consolidated insight into which countries, age groups, and recruitment channels produce the highest-rated volunteers and best rehire outcomes.

**Independent Test**:
- Open the navigation bar and click the new "Reports" link (`/admin/reports`).
- Verify summary KPI cards are displayed (Total Volunteers, Total Stays, Average Rating, Overall Rehire Rate).
- Inspect the crosstabulation views:
  1. **Volunteers by Country**: Table and horizontal bar chart sorted by volume.
  2. **Average Rating by Country**: Table and chart showing ratings (min 1 stay).
  3. **Average Rating by Age**: Breakdown across age brackets (e.g. 18-21, 22-25, 26-30, 31-40, 40+).
  4. **Ratings by Gender**: Average rating and count comparison for Male, Female, and Neutral.
  5. **Average Rating by Continent**: Grouped by Europe, Americas, Asia, Oceania, Africa.
  6. **Rehire Ratios by Country**: Stacked percentage / ratios of Accept vs Possible vs Do Not Accept.
- Verify toggle between chart view and tabular data view.

**Acceptance Scenarios**:
1. **Given** volunteer and stay records in SQLite, **When** `/api/admin/reports` is requested, **Then** it aggregates metrics across country, age, gender, continent, and rehire status.
2. **Given** the Reports page, **When** viewing reports, **Then** each metric is accompanied by an SVG chart and an exportable/sortable table.
3. **Given** countries with few records, **When** calculating averages, **Then** sample size ($N$) is clearly displayed adjacent to the average star rating.

---

### User Story 2 - Datepicker Jump Navigation on Staffing Timeline (Priority: P1)

As a coordinator viewing `/admin/timeline`, I want a datepicker input in the timeline header that lets me select any past or future date, so that the timeline instantly jumps to that specific date's week without having to click "Next week" or "Previous week" dozens of times.

**Why this priority**: Navigating across months or years of historical stays via pagination buttons is slow and tedious. A datepicker provides instantaneous point-in-time auditing.

**Independent Test**:
- Open `/admin/timeline`.
- Click the new Datepicker in the header navigation controls.
- Select `2024-06-15`.
- Verify the timeline immediately reloads and renders the 5-week window starting on the Monday of that week (`2024-06-10`), showing all volunteers on site as of that date.
- Select today's date $\rightarrow$ verify timeline returns to current week.

**Acceptance Scenarios**:
1. **Given** the timeline header, **When** rendered, **Then** a date picker input is visible next to the week stepping buttons.
2. **Given** a selected date, **When** changed, **Then** the timeline reloads starting from that date's Monday and highlights the selected target date.

---

### User Story 3 - Persistent Dark Mode with High-Visibility SVG Flags (Priority: P2)

As a hostel staff member working evening or night reception shifts, I want to toggle a high-contrast dark mode across the entire application, and I want country flags to remain crisp, distinct, and legible against dark surfaces, so that I can reduce eye strain in low-light environments without compromising identity recognition.

**Why this priority**: Reception shifts often occur in dim lighting; an accessible dark mode improves usability while adhering strictly to Constitution Principle II (authentic SVG flags with guaranteed visual clarity).

**Independent Test**:
- Click the dark mode toggle (moon/sun icon) in the top navigation bar.
- Verify the UI transitions to dark surfaces (`#0f172a`, `#1e293b`) with light text (`#f8fafc`).
- Inspect CountryFlag elements on Timeline, Volunteers, and Roster pages: verify flags have a subtle 1px border or backdrop so dark flags (e.g. Germany, Belgium) do not blend into the background.
- Refresh the page: verify the theme preference persists across sessions.

**Acceptance Scenarios**:
1. **Given** the dark mode toggle in the navigation bar, **When** clicked, **Then** the application switches between light and dark themes instantly without page reload.
2. **Given** dark mode is active, **When** country flags are rendered, **Then** they remain clearly bounded and legible with a soft light border (`rgba(255,255,255,0.2)`).
3. **Given** a user preference, **When** set, **Then** the choice is saved in `localStorage` and respected on subsequent visits.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A backend endpoint `GET /api/admin/reports` MUST be implemented, returning aggregated crosstabulations:
  - Volunteer count and percentage by country and continent.
  - Average departure star rating by country (with count $N$).
  - Average rating by age bracket (`<22`, `22-25`, `26-30`, `31-40`, `41+`).
  - Average rating and distribution by gender.
  - Average rating by continent (Europe, North America, South America, Asia, Oceania, Africa).
  - Rehire recommendation ratios (`Accept`, `Possible`, `Do Not Accept`) by country.
- **FR-002**: A new page `src/client/pages/AdminReportsPage.tsx` MUST be created and routed at `/admin/reports` with interactive SVG charts and data tables.
- **FR-003**: Navigation header MUST include a link to `/admin/reports` with a reports icon (`📊 Reports`).
- **FR-004**: In `AdminTimelinePage.tsx`, a datepicker `<input type="date">` MUST be added to the timeline navigation controls, allowing jumping to any date and auto-snapping to that week's Monday.
- **FR-005**: A global theme context `ThemeContext.tsx` and toggle button MUST be implemented supporting `'light'` and `'dark'` modes with `localStorage` persistence.
- **FR-006**: In `CountryFlag.tsx`, a subtle outline (`boxShadow: 0 0 0 1px rgba(255,255,255,0.25)`) MUST be applied in dark mode so flags with black or dark borders remain clearly visible against dark backgrounds.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `/api/admin/reports` aggregates all 400+ volunteers and stays in < 200ms.
- **SC-002**: Jumping to any date via the timeline datepicker loads the corresponding historical or future window in < 300ms.
- **SC-003**: 100% of country flags maintain visible contrast against dark surfaces.
- **SC-004**: Dark mode toggle persists across browser reloads without visual flicker.

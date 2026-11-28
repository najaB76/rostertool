# Feature Specification: Comprehensive Dark Mode Theme Audit and Contrast Fixes

**Feature Branch**: `029-comprehensive-dark-mode-audit`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User feedback from `feedback.txt`:
"BUG: Dark mode is still not being applied consistently. Specific issues:
- General: Buttons have light text on a light background
- Weekly roster: Column headers have light text on a light background
- Timeline: Only the gender and name columns have dark theme applied
- Volunteers: Magic link div doesn't have dark theming (the text input does)
- Headcount: Heading div has dark text on a dark background
- Admin users: Names can't be read as the text is almost the same colour as the background
- Settings: The settings form doesn't have dark mode style applied
Please check all pages to ensure that all elements respect light/dark mode selection and that visual contrast is maintained in both modes."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Global Buttons, Form Cards, and Settings Dark Mode (Priority: P1)

As an administrator using dark mode, I want all buttons, form containers, and the Settings page (`/admin/settings`) to render with dark surfaces (`#1e293b`, `#0f172a`), dark borders (`#334155`), and crisp high-contrast text, so that no buttons appear with light text on light backgrounds and the Settings form is fully dark themed.

**Why this priority**: Unstyled buttons and form containers in dark mode produce illegible light text on white/gray backgrounds, severely degrading usability.

**Independent Test**:
- Toggle dark mode on.
- Inspect navigation buttons, action buttons, and secondary buttons across all pages $\rightarrow$ verify all buttons have dark backgrounds (`#334155` / `#1e293b`) with light text (`#f8fafc`), or solid primary colors (blue/green) with white text.
- Open `/admin/settings` $\rightarrow$ verify all settings cards, form sections, and labels have dark surfaces and readable text.
- Toggle dark mode off $\rightarrow$ verify clean light mode appearance is preserved.

**Acceptance Scenarios**:
1. **Given** dark mode is enabled, **When** viewing any button, **Then** button text contrast against its background meets WCAG AA standards (no white text on light gray/white).
2. **Given** `/admin/settings`, **When** rendered in dark mode, **Then** all settings sections and forms use dark background surfaces (`#1e293b`) with high-contrast text.

---

### User Story 2 - Weekly Roster Grid Dark Mode Alignment (Priority: P1)

As a hostel coordinator viewing the Weekly Roster (`/admin/roster`) in dark mode, I want the day column headers and shift slot cells to display dark backgrounds (`#1e293b`, `#0f172a`) with bright white text (`#f8fafc`), so that column headers are immediately readable without light-on-light text artifacts.

**Why this priority**: The weekday headers in `RosterGrid.tsx` were rendered with hardcoded `#e4e4e7` (light gray) while global text switched to white, making day names invisible.

**Independent Test**:
- Open `/admin/roster` with dark mode active.
- Inspect the 7 weekday column headers $\rightarrow$ verify dark backgrounds (`#1e293b`) with bright white day names.
- Inspect shift cells and assignments list $\rightarrow$ verify dark surfaces with legible text.

**Acceptance Scenarios**:
1. **Given** dark mode is enabled on `/admin/roster`, **When** viewing the day headers, **Then** the header background is dark (`#1e293b` or `#0f172a`) with high-contrast white text (`#f8fafc`).
2. **Given** shift assignments, **When** rendered in dark mode, **Then** volunteer names and role tags are clearly legible.

---

### User Story 3 - Full Timeline Table Dark Theme Coverage (Priority: P1)

As a coordinator viewing `/admin/timeline` in dark mode, I want the entire timeline table—including Age, Source, Status, Arrival, Departing, and Day columns—to display with dark surfaces and light text, so that the dark theme applies across all columns rather than only the Sex and Name sticky columns.

**Why this priority**: Only sticky columns were previously targeted by CSS, leaving the remaining 40+ columns with white backgrounds, creating an inconsistent and fractured table view.

**Independent Test**:
- Open `/admin/timeline` in dark mode.
- Inspect all columns across the table (Sex, Name, Age, Source, Status, Arrival, Departing, and Day cells).
- Verify all table cells, header rows, and section headers display consistent dark theme backgrounds (`#1e293b`, `#0f172a`) with high-contrast text.

**Acceptance Scenarios**:
1. **Given** the timeline table in dark mode, **When** rendered, **Then** 100% of columns and rows render with dark background surfaces.
2. **Given** timeline data cells, **When** empty or active, **Then** borders and day numbers have crisp contrast against dark surfaces.

---

### User Story 4 - High-Contrast Text on Volunteers, Headcount, and Admin Users (Priority: P1)

As an administrator viewing `/admin/volunteers`, `/admin/headcount`, or `/admin/users` in dark mode, I want the volunteer portal magic link container, the headcount period title, and admin user names to render with bright, legible text on dark surfaces, so that no dark text on dark background occurs.

**Why this priority**: Hardcoded dark inline color styles (like `#18181b` and `#3f3f46`) resulted in near-invisible dark-on-dark text on headcount titles, admin user names, and magic link containers.

**Independent Test**:
- Open `/admin/volunteers` in dark mode $\rightarrow$ inspect the "Portal Link:" container $\rightarrow$ verify container div is dark themed and label is bright.
- Open `/admin/headcount` in dark mode $\rightarrow$ inspect the period title (e.g. "Week of Nov 23 - Nov 29, 2026") $\rightarrow$ verify title text is crisp white (`#f8fafc`).
- Open `/admin/users` in dark mode $\rightarrow$ inspect the admin users list $\rightarrow$ verify admin user names, usernames, and roles are brightly legible.

**Acceptance Scenarios**:
1. **Given** `/admin/volunteers` in dark mode, **When** viewing the magic link section, **Then** the container background and label adopt dark theme styling.
2. **Given** `/admin/headcount` in dark mode, **When** viewing the navigation toolbar, **Then** the period title displays in `#f8fafc`.
3. **Given** `/admin/users` in dark mode, **When** viewing admin user cards, **Then** user names display in `#f8fafc` with crisp contrast against `#1e293b`.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `src/client/styles/main.css` MUST apply comprehensive dark mode styles to all buttons, form containers, cards, tables, modals, and toolbars.
- **FR-002**: In `RosterGrid.tsx`, weekday column headers MUST adapt to dark mode with dark background (`#1e293b`) and `#f8fafc` text.
- **FR-003**: In `AdminTimelinePage.tsx`, all columns (Age, Source, Status, Arrival, Departing, Day cells, and header rows) MUST render dark backgrounds and light text in dark mode.
- **FR-004**: In `AdminVolunteersPage.tsx`, the magic link portal container and label MUST render with dark theme styles in dark mode.
- **FR-005**: In `AdminHeadcountPage.tsx`, the period title, capacity benchmark legend, and day cards MUST render with light text (`#f8fafc`) on dark backgrounds.
- **FR-006**: In `AdminUsersPage.tsx`, user cards, user names, and role labels MUST display light text on dark surfaces in dark mode.
- **FR-007**: In `AdminSettingsPage.tsx`, settings cards, fieldsets, and labels MUST render with dark surfaces and light text in dark mode.
- **FR-008**: All country flags MUST maintain crisp visible outlines (`boxShadow: 0 0 0 1px rgba(255,255,255,0.35)`) in dark mode per Constitution Principle II.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 occurrences of light text on light background or dark text on dark background across all 8 admin pages and modals.
- **SC-002**: 100% of table columns on `/admin/timeline` and `/admin/roster` have dark backgrounds in dark mode.
- **SC-003**: Text contrast ratio meets or exceeds WCAG AA (4.5:1 for normal text, 3:1 for large text) in both light and dark modes.

# Research & Technical Decisions: Complete Dark Mode CSS Audit, Report Date Slicing, and Sortable Tables

**Feature**: `028-dark-mode-css-and-reports-filtering`
**Date**: 2026-10-27
**Status**: Completed

## 1. Dark Mode CSS Architecture & Contrast Guarantees

- **Root Cause of Defect**:
  - Components rendered with inline styles (e.g. `style={{ backgroundColor: '#fff' }}`) overrode general CSS dark classes.
  - When text inherited the dark theme's `#f8fafc` color while backgrounds remained `#fff`, high-contrast readability was destroyed.
- **Decision**:
  - Implement comprehensive dark theme overrides in `src/client/styles/main.css` targeting cards, modals, tables, schedule cells, and inputs.
  - In `AdminRosterPage.tsx`, `AdminTimelinePage.tsx`, `AdminVolunteersPage.tsx`, and `AdminReportsPage.tsx`, adapt inline colors using `useTheme` or CSS classes (`surface-card`, `surface-muted`, `border-subtle`, `text-primary`, `text-secondary`) to guarantee WCAG AA contrast in both light and dark modes.

## 2. Date Filtering & Slicing for Reports

- **Decision**:
  - Accept `startDate?: string` and `endDate?: string` on `GET /api/admin/reports`.
  - In `ReportingService`, filter stays and volunteers whose stay dates overlap `[startDate, endDate]`:
    $$\text{arrivalDate} \le \text{endDate} \land (\text{noEndDate} \lor \text{departureDate} \ge \text{startDate})$$
  - In `AdminReportsPage.tsx`, provide quick presets ("All Time", "This Year", "Last Year", "Last 12 Months", "Custom") with two date inputs.

## 3. Sortable Report Tables

- **Decision**:
  - Implement dynamic sorting on each table in `AdminReportsPage.tsx`.
  - Clicking any column header toggles ascending/descending order with visual indicators (`▲`/`▼`).
  - Supports string sorting (`localeCompare`) and numerical sorting (placing nulls at the end).

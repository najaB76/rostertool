# Implementation Plan: Complete Dark Mode CSS Audit, Report Date Slicing, and Sortable Tables

**Branch**: `028-dark-mode-css-and-reports-filtering` | **Date**: 2026-10-27 | **Spec**: [specs/028-dark-mode-css-and-reports-filtering/spec.md](spec.md)

## Summary
1. Overhaul dark mode CSS in `src/client/styles/main.css` and components to eliminate all white background surfaces, ensuring high contrast across volunteer cards, weekly schedule, timeline, and modals.
2. Add date range filtering (`startDate`, `endDate`) to `ReportingService` and endpoint `GET /api/admin/reports`, and add preset date filters to `AdminReportsPage.tsx`.
3. Add interactive column sorting (`▲`/`▼`) to all tables in `AdminReportsPage.tsx`.

## Constitution Check
- **I. Test-First Engine & Invariants**: Date filtering tested via unit tests. **PASS**
- **II. Cultural Identity & High-Visibility Flags**: Flag contrast outline preserved. **PASS**
- **III. Self-Hosted Simplicity & Zero-Config**: Zero external charting or theme dependencies. **PASS**
- **IV. Human Override & Visual Highlighting**: WCAG AA contrast guaranteed in both themes. **PASS**

## Project Structure & File Roadmap
- `src/client/styles/main.css`: Comprehensive dark mode overrides for surfaces, tables, cards, and text.
- `src/server/services/reporting-service.ts`: Support `startDate` and `endDate` parameters.
- `src/server/routes/admin-reports.ts`: Pass query parameters to `reportingService.getReports`.
- `src/client/pages/AdminReportsPage.tsx`: Add date filter presets/inputs and sortable column headers.
- `tests/api/reports.test.ts`: Test date-filtered reports.

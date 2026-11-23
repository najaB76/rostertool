# Implementation Plan: Volunteer Analytics & Reporting, Timeline Datepicker, and Accessible Dark Mode

**Branch**: `027-analytics-reports-and-dark-mode` | **Date**: 2026-10-27 | **Spec**: [specs/027-analytics-reports-and-dark-mode/spec.md](spec.md)

## Summary
1. Build `ReportingService` and register `GET /api/admin/reports` with demographic, performance, continent, age, gender, and rehire crosstabulations.
2. Implement `AdminReportsPage.tsx` with responsive SVG charts and data tables.
3. Add a datepicker input to `AdminTimelinePage.tsx` allowing instant navigation to any target date.
4. Implement `ThemeContext.tsx`, dark mode stylesheet variables, a navigation toggle, and flag contrast protection in `CountryFlag.tsx`.

## Constitution Check
- **I. Test-First Engine & Invariants**: Analytics formulas verified with automated unit/integration tests. **PASS**
- **II. Cultural Identity & High-Visibility Flags**: Flags receive contrast outlines in dark mode so identity recognition is never compromised. **PASS**
- **III. Self-Hosted Simplicity & Zero-Config**: Zero external charting libraries; native SVG charts and SQLite computation. **PASS**
- **IV. Human Override & Visual Highlighting**: Clean visual charts and theme preference persistence. **PASS**

## Project Structure & File Roadmap
- `src/server/services/reporting-service.ts`: Core analytics aggregation logic.
- `src/server/routes/admin-reports.ts`: Fastify route for reports.
- `src/server/index.ts`: Register admin reports route.
- `src/client/context/ThemeContext.tsx`: React theme provider and persistent hook.
- `src/client/components/CountryFlag.tsx`: Contrast outline for dark mode.
- `src/client/pages/AdminReportsPage.tsx`: Interactive reports dashboard with SVG charts and tables.
- `src/client/pages/AdminTimelinePage.tsx`: Datepicker input in navigation controls.
- `src/client/App.tsx`: Navigation header link to Reports and Theme Toggle button.
- `tests/api/reports.test.ts`: Integration test for reports calculation.

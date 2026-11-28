# Implementation Plan: Comprehensive Dark Mode Theme Audit and Contrast Fixes

**Branch**: `029-comprehensive-dark-mode-audit` | **Date**: 2026-10-27 | **Spec**: [specs/029-comprehensive-dark-mode-audit/spec.md](spec.md)

## Summary
Audit and update CSS and components across all 8 pages and modals to resolve dark mode contrast defects on buttons, weekly roster day headers, all timeline columns, volunteer portal link containers, headcount period titles, admin user names, and settings forms.

## Constitution Check
- **I. Test-First Engine & Invariants**: UI tests and production build pass. **PASS**
- **II. Cultural Identity & High-Visibility Flags**: Contrast outline for flags guaranteed in dark mode. **PASS**
- **III. Self-Hosted Simplicity & Zero-Config**: Zero external theme frameworks; pure CSS. **PASS**
- **IV. Human Override & Visual Highlighting**: Full contrast fidelity in both themes. **PASS**

## Project Structure & File Roadmap
- `src/client/styles/main.css`: Comprehensive dark mode overrides for buttons, tables, headers, and cards.
- `src/client/components/RosterGrid.tsx`: Assign `.roster-day-header` and dark-aware styling.
- `src/client/pages/AdminTimelinePage.tsx`: Ensure dark background styling across all columns (Age, Source, Status, Arrival, Leaving, Day cells).
- `src/client/pages/AdminVolunteersPage.tsx`: Style portal link container with dark theme.
- `src/client/pages/AdminHeadcountPage.tsx`: Style period title and benchmarks with dark theme.
- `src/client/pages/AdminUsersPage.tsx`: Style admin user names and cards with dark theme.
- `src/client/pages/AdminSettingsPage.tsx`: Style settings cards and form containers with dark theme.

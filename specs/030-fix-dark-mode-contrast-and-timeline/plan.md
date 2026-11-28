# Implementation Plan: Dark Mode Contrast, Timeline Cell Fills, and Active State Differentiation

**Branch**: `030-fix-dark-mode-contrast-and-timeline` | **Date**: 2026-10-27 | **Spec**: [specs/030-fix-dark-mode-contrast-and-timeline/spec.md](spec.md)

## Summary
1. Fix timeline day cell fills in dark mode by tagging occupied cells (`.timeline-occupied`) and scoping background overrides to empty cells only.
2. Restore semantic color coding on timeline status change buttons and dropdown actions in both light and dark mode.
3. Ensure primary action buttons ("Save", "Submit") are visually distinct from neutral cancel buttons, and highlight the active filter tab on `/admin/volunteers`.
4. Implement semantic dark-mode status pill styles (fixing light-on-light text on `Cancelled`).

## Constitution Check
- **I. Test-First Engine & Invariants**: UI tests and production build pass. **PASS**
- **II. Cultural Identity & High-Visibility Flags**: **PASS**
- **III. Self-Hosted Simplicity & Zero-Config**: **PASS**
- **IV. Human Override & Visual Highlighting**: Full WCAG AA contrast fidelity guaranteed in both themes. **PASS**

## Project Structure & File Roadmap
- `src/client/styles/main.css`: Scoped timeline cell fill rules, semantic status button/pill dark rules, active tab highlights, and button hierarchy classes (`.btn-primary`, `.btn-cancel`, `.btn-danger`).
- `src/client/pages/AdminTimelinePage.tsx`: Add `.timeline-occupied` class and semantic classes for status buttons and dropdown menus.
- `src/client/pages/AdminVolunteersPage.tsx`: Add semantic classes for status pills (`.status-pill-*`) and active tabs (`.tab-button.active`).
- `src/client/components/VolunteerModal.tsx`, `DepartureModal.tsx`, `ReactivateModal.tsx`, `StayHistoryModal.tsx`: Apply `.btn-primary` and `.btn-cancel` classes.
- `tests/client/theme.test.ts`: Automated test verifying dark mode style rules and contrast classes.

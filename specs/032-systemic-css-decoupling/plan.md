# Implementation Plan: Systemic CSS Decoupling and Universal Dark Mode Theme Architecture

**Branch**: `032-systemic-css-decoupling` | **Date**: 2026-10-27 | **Spec**: [specs/032-systemic-css-decoupling/spec.md](spec.md)

## Summary
1. Define unified design tokens and modal classes (`.modal-overlay`, `.modal-card`, `.modal-title`, `.form-input`, `.form-select`, etc.) in `main.css`.
2. Refactor `VolunteerModal.tsx` to use `.modal-overlay`, `.modal-card`, and `.modal-title`, resolving the white-on-white heading regression.
3. Refactor remaining modals (`DepartureModal.tsx`, `ReactivateModal.tsx`, `StayHistoryModal.tsx`, `ChangePinModal.tsx`) to use `.modal-overlay` and `.modal-card`.
4. Refactor views (`AdminVolunteersPage.tsx`, `AdminHeadcountPage.tsx`, `AdminUsersPage.tsx`, `AdminSettingsPage.tsx`) to replace inline color/surface styling with CSS classes.
5. Clean up `main.css` to eliminate brittle inline attribute selectors (`[style*="..."]`).
6. Validate all test suites and production build.

## Constitution Check
- **I. Test-First Engine & Invariants**: Full test suite and production build pass. **PASS**
- **II. Cultural Identity & High-Visibility Flags**: **PASS**
- **III. Self-Hosted Simplicity & Zero-Config**: **PASS**
- **IV. Human Override & Visual Highlighting**: Full visual contrast guaranteed in both themes. **PASS**

## Project Structure & File Roadmap
- `src/client/styles/main.css`: Core design tokens, modal classes, form classes, and removal of brittle `[style*="..."]` selectors.
- `src/client/components/VolunteerModal.tsx`: Apply `.modal-overlay`, `.modal-card`, `.modal-title`, `.form-label`, `.form-input`.
- `src/client/components/DepartureModal.tsx`: Apply `.modal-overlay`, `.modal-card`, `.modal-title`.
- `src/client/components/ReactivateModal.tsx`: Apply `.modal-overlay`, `.modal-card`, `.modal-title`.
- `src/client/components/StayHistoryModal.tsx`: Apply `.modal-overlay`, `.modal-card`, `.modal-title`.
- `src/client/components/ChangePinModal.tsx`: Apply `.modal-overlay`, `.modal-card`, `.modal-title`.
- `src/client/pages/AdminVolunteersPage.tsx`: Apply `.filter-bar`, `.volunteer-card`, `.portal-link-box`.
- `src/client/pages/AdminHeadcountPage.tsx`: Apply `.headcount-toolbar`, `.legend-banner`.
- `src/client/pages/AdminUsersPage.tsx`: Apply `.admin-user-card`, `.admin-user-form`.
- `src/client/pages/AdminSettingsPage.tsx`: Apply `.settings-card`.

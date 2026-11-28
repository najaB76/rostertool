# Feature Specification: Systemic CSS Decoupling and Universal Dark Mode Theme Architecture

**Feature Branch**: `032-systemic-css-decoupling`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User feedback:
"Check the entire interface codebase to ensure that all HTML elements obtain their styling via classes and stylesheet and that there are no inline styles being applied directly to elements. This is to ensure that light/dark mode is applied consistently across the entire application and avoid visual glitches - for example the 'Edit Volunteer' dialog has regressed to using light text for headings against a light background when in dark mode, this was previously correctly using light text on a dark backround."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Modal Dialog Theme Decoupling & Regression Resolution (Priority: P1)

As an administrator opening any modal dialog (including "Edit Volunteer", "Confirm Departure", "Re-activate", "Stay History", "Change PIN", and "Assign Shift") in dark mode, I want the modal overlay and modal card to reliably display dark surfaces (`#1e293b`) with crisp white headings (`#f8fafc`) and labels, completely eliminating the regression where headings render as white text on a white background.

**Why this priority**: Brittle attribute selectors (`[style*="background: #fff"]`) fail when compound inline styles are serialized by browsers, causing severe contrast regressions where white text renders on a white background.

**Independent Test**:
- Enable dark mode.
- Open `VolunteerModal` ("Edit Volunteer"):
  - Verify modal card background is `#1e293b`.
  - Verify heading `<h3>` ("Edit Volunteer") and section titles are bright `#f8fafc` text.
  - Verify labels, text inputs, date pickers, select dropdowns, and textareas have dark backgrounds (`#0f172a`) and light text.
  - Verify primary action button ("Save Volunteer") is bold blue (`#2563eb`) with white text and "Cancel" is neutral dark slate (`#334155`).
- Open `DepartureModal`, `ReactivateModal`, `StayHistoryModal`, and `ChangePinModal` in dark mode:
  - Verify every modal renders dark surfaces with high-contrast text.
- Switch to light mode:
  - Verify every modal renders clean white surfaces (`#ffffff`) with high-contrast dark text (`#0f172a`).

**Acceptance Scenarios**:
1. **Given** dark mode is active, **When** `VolunteerModal` is opened, **Then** modal card renders with dark background (`#1e293b`) and headings display in `#f8fafc`, with zero white-on-white text.
2. **Given** all 6 application modals, **When** rendered in both light and dark modes, **Then** all dialog containers, headers, and inputs obtain their styles exclusively from CSS classes with contrast ratio $\ge 4.5:1$.

---

### User Story 2 - Elimination of Brittle Inline Styles Across All Admin Views (Priority: P1)

As an administrator navigating across all views (`/admin/volunteers`, `/admin/timeline`, `/admin/headcount`, `/admin/roster`, `/admin/users`, `/admin/settings`, `/admin/reports`), I want all visual components (cards, toolbars, tables, filter bars, pills, buttons) to receive their presentation from structured CSS stylesheet classes rather than hardcoded inline style attributes, so that light and dark modes apply consistently with zero visual anomalies.

**Why this priority**: Relying on inline styles causes style leakage, unmaintainable code, and theme divergence where different pages render identical elements inconsistently.

**Independent Test**:
- Audit HTML markup on all pages in browser DevTools.
- Verify elements use semantic CSS classes (`.card`, `.toolbar`, `.filter-bar`, `.modal-card`, `.btn-primary`, etc.) instead of hardcoded inline styles for colors and surfaces.
- Toggle between light and dark themes on every view:
  - `/admin/volunteers`: Verify filter bar, volunteer cards, thumbnails, tags, and magic link containers render with consistent theme colors.
  - `/admin/timeline`: Verify sticky columns, table headers, and occupied bars render with consistent theme colors.
  - `/admin/headcount`: Verify period toolbar, benchmark legend, and day cards render with consistent theme colors.
  - `/admin/roster`: Verify day headers, shift cells, and staff chips render with consistent theme colors.
  - `/admin/users`: Verify user cards, role badges, and action buttons render with consistent theme colors.
  - `/admin/settings`: Verify form cards, fieldsets, and export buttons render with consistent theme colors.

**Acceptance Scenarios**:
1. **Given** any page in the application, **When** inspected in DevTools, **Then** surfaces, typography colors, and borders are driven by CSS classes and CSS custom properties rather than inline styles.
2. **Given** theme toggling on any view, **When** switched, **Then** all elements update their presentation instantly and consistently without visual glitches.

---

### User Story 3 - Centralized CSS Variable Architecture (Priority: P2)

As a developer and maintainer, I want a centralized, robust design token architecture in `src/client/styles/main.css` using CSS custom properties (`--bg-app`, `--bg-card`, `--bg-modal`, `--bg-input`, `--text-main`, `--text-muted`, `--border-color`, `--border-focus`), completely eliminating fragile CSS attribute selector hacks like `div[style*="background: #fff"]`.

**Why this priority**: Eliminating fragile attribute selectors prevents future theme regressions and ensures new components automatically inherit full light/dark theme compliance.

**Independent Test**:
- Inspect `src/client/styles/main.css`.
- Verify the removal of brittle attribute selectors (`[style*="background: #fff"]`, `[style*="position: fixed"] > div[...]`).
- Verify all components consume CSS variables and semantic classes.

**Acceptance Scenarios**:
1. **Given** `main.css`, **When** examined, **Then** fragile attribute selectors targeting inline styles are removed in favor of semantic class selectors and CSS variables.
2. **Given** automated tests and production build, **When** executed, **Then** all 82+ tests pass with zero regressions.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `VolunteerModal.tsx` MUST use CSS classes `.modal-overlay`, `.modal-card`, `.modal-header`, `.modal-body`, `.modal-footer` instead of inline surface and text color styles.
- **FR-002**: In `VolunteerModal.tsx`, headings (`<h3>`, `<strong>`) MUST display `#f8fafc` on dark surfaces (`#1e293b`) in dark mode, completely resolving the white-on-white text regression.
- **FR-003**: All application modals (`DepartureModal.tsx`, `ReactivateModal.tsx`, `StayHistoryModal.tsx`, `ChangePinModal.tsx`, `ShiftAssignModal.tsx`) MUST use `.modal-overlay` and `.modal-card` CSS classes.
- **FR-004**: In `main.css`, fragile attribute selectors (such as `div[style*="background: #fff"]` and `div[style*="position: fixed"] > div[...]`) MUST be removed and replaced with explicit class selectors.
- **FR-005**: All form controls (`input`, `select`, `textarea`, `label`) across all pages MUST use CSS classes (`.form-label`, `.form-input`, `.form-select`, `.form-textarea`) and inherit theme tokens.
- **FR-006**: Cards and toolbars in `AdminVolunteersPage.tsx`, `AdminHeadcountPage.tsx`, `AdminUsersPage.tsx`, `AdminSettingsPage.tsx`, and `AdminReportsPage.tsx` MUST derive their surface colors from CSS classes.
- **FR-007**: Contrast ratio for all text elements MUST meet or exceed WCAG AA standards (4.5:1 for body text, 3:1 for large text and headers) in both light and dark themes.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 occurrences of white text on white background or dark text on dark background across all modals and views.
- **SC-002**: 100% of modals utilize `.modal-overlay` and `.modal-card` class-based styling.
- **SC-003**: 0 brittle CSS attribute selectors targeting inline color or background styles remaining in `main.css`.
- **SC-004**: 100% of automated tests pass (`npm test`) and production build compiles cleanly without errors.

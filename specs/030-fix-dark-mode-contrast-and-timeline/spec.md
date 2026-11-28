# Feature Specification: Dark Mode Contrast, Timeline Cell Fills, and Active State Differentiation

**Feature Branch**: `030-fix-dark-mode-contrast-and-timeline`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User feedback from `feedback.txt`:
1. DEFECT: Enabling dark mode breaks the timeline view. The TD elements for occupied days do not have a fill when dark mode is enabled, only the TDs for the departure days have styling applied.
2. DEFECT: Enabling dark mode breaks the timeline view. When dark mode is enabled the status change buttons lose their colour coding and all render as light text on a dark background, as do the actions on the menu.
3. DEFECT: In dark mode there is no visual differentiation of the 'Active' state - so the 'Save' button is the same colour as the 'Cancel' button and the active tab on the volunteer management page isn't highlighted.
4. DEFECT: The status pill on the volunteer management page renders poorly in dark mode - e.g. the 'Cancelled' status renders as light text on a light background.
5. MANDATE: Test ALL elements across ALL pages to ensure that visual contrast is maintained in both light and dark mode.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Timeline Occupancy Bar Fills & Status Button Colors (Priority: P1)

As a hostel coordinator using dark mode on `/admin/timeline`, I want the day cells for occupied stays to retain their solid volunteer bar colors and departure day patterns, and I want the volunteer status change buttons and dropdown action items to maintain their semantic color coding (green for In da house, blue for Confirmed, red for Departed, yellow for Applied/Unconfirmed), so that the timeline remains an intuitive visual Gantt chart in dark mode.

**Why this priority**: A blunt `!important` rule on table cells previously wiped out all occupied stay fills, and a blanket button rule stripped all color coding from status buttons, breaking core timeline functionality.

**Independent Test**:
- Open `/admin/timeline` with dark mode active.
- Inspect occupied day cells: verify each active stay displays its unique solid color fill (`barColor`) and departure checkout day displays its diagonal hatched pattern.
- Inspect the volunteer status button (Col F):
  - "In da house": Dark green background (`#14532d`) with bright green text (`#86efac`) and border (`#166534`).
  - "Confirmed": Dark blue background (`#1e3a8a`) with bright blue text (`#93c5fd`) and border (`#1d4ed8`).
  - "Departed": Dark red background (`#7f1d1d`) with bright red text (`#fca5a5`) and border (`#991b1b`).
  - "Not confirmed": Dark amber background (`#713f12`) with bright yellow text (`#fde047`) and border (`#854d0e`).
- Click a status button to open the dropdown menu: verify each action ("🚪 Depart", "✓ Mark Arrived", "✕ Cancel", "🔄 Re-activate") retains its distinctive text color against the dark menu surface (`#1e293b`).

**Acceptance Scenarios**:
1. **Given** dark mode on `/admin/timeline`, **When** rendering occupied day cells, **Then** solid `barColor` fills are preserved without being overridden by dark background rules.
2. **Given** status dropdown buttons and menu items on `/admin/timeline`, **When** rendered in dark mode, **Then** each status retains its semantic color coding with high-contrast text.

---

### User Story 2 - Visual Differentiation of Active States & Primary Buttons (Priority: P1)

As an administrator using dark mode, I want the active tab on `/admin/volunteers` (and other tabbed interfaces) to be prominently highlighted with a distinct active indicator, and I want Primary action buttons ("Save", "Save Volunteer", "Submit") to be visually distinct from Secondary/Cancel buttons, so that users can instantly identify which tab is selected and which button performs the main action.

**Why this priority**: When all buttons and tabs received the identical `#334155` background in dark mode, users could not discern the selected filter tab or tell "Save" from "Cancel".

**Independent Test**:
- Open `/admin/volunteers` in dark mode.
- Inspect the filter tabs ("All", "In da house", "Confirmed", "Applied", "Departed", "Cancelled"):
  - Active tab: Rendered with vibrant blue background (`#2563eb`) and crisp white text (`#fff`).
  - Inactive tabs: Rendered with muted dark background (`#1e293b`) and light text (`#94a3b8`).
- Open `VolunteerModal`, `DepartureModal`, or `ReactivateModal` in dark mode:
  - "Save Volunteer" / "Confirm": Rendered in vibrant primary blue (`#2563eb`) or green (`#16a34a`) with white text.
  - "Cancel": Rendered in neutral dark gray (`#334155`) with muted text (`#cbd5e1`) and border (`#475569`).

**Acceptance Scenarios**:
1. **Given** filter tabs on `/admin/volunteers`, **When** a tab is selected, **Then** it displays a distinct active highlight (`#2563eb`) clearly distinguishing it from unselected tabs.
2. **Given** modal and form actions, **When** rendered in dark mode, **Then** primary/submit buttons have distinct, vivid accent colors and cancel/secondary buttons have neutral styling.

---

### User Story 3 - Status Pills & Comprehensive Contrast Across All Views (Priority: P1)

As an administrator viewing volunteer cards on `/admin/volunteers`, I want status pills (`Active`, `Accepted`, `Applied`, `Departed`, `Cancelled`) to render with dark-tinted backgrounds and high-contrast text in dark mode (specifically preventing light text on light gray for `Cancelled`), and I want all text elements across all pages to satisfy WCAG AA contrast standards in both light and dark modes.

**Why this priority**: `Cancelled` status pills previously displayed white text on light gray `#f4f4f5`, rendering them unreadable. Ensuring semantic dark-mode pills guarantees consistent, professional legibility.

**Independent Test**:
- Open `/admin/volunteers` in dark mode.
- Inspect status pills:
  - `Active`: Dark green `#14532d` bg, `#86efac` text, `#166534` border.
  - `Accepted`: Dark blue `#1e3a8a` bg, `#93c5fd` text, `#1d4ed8` border.
  - `Applied`: Dark amber `#713f12` bg, `#fde047` text, `#854d0e` border.
  - `Departed`: Dark slate `#334155` bg, `#cbd5e1` text, `#475569` border.
  - `Cancelled`: Dark red `#450a0a` bg, `#fca5a5` text, `#7f1d1d` border.
- Verify text is clearly legible with contrast ratio $\ge 4.5:1$.
- Switch back to light mode: verify light mode status pills retain their original pastel backgrounds with dark text.

**Acceptance Scenarios**:
1. **Given** `/admin/volunteers` in dark mode, **When** viewing the `Cancelled` status pill, **Then** it renders with dark red background (`#450a0a`) and bright red text (`#fca5a5`), eliminating light-on-light artifacts.
2. **Given** any text element across all views, **When** rendered in either light or dark mode, **Then** contrast ratio is $\ge 4.5:1$.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: In `AdminTimelinePage.tsx`, occupied day cells (`td`) MUST render their solid `barColor` fills in dark mode without being overridden by generic dark background rules.
- **FR-002**: In `AdminTimelinePage.tsx`, the volunteer status button and status action menu items MUST maintain their semantic color coding (green, blue, amber, red) with dark-tinted backgrounds and bright text in dark mode.
- **FR-003**: In `AdminVolunteersPage.tsx`, the active status filter tab MUST be prominently highlighted with a primary accent background (`#2563eb`) and white text.
- **FR-004**: In all modals and forms, Primary action buttons MUST be styled with vibrant accent backgrounds (`#2563eb` or `#16a34a`) and Cancel buttons with neutral dark gray (`#334155`).
- **FR-005**: In `AdminVolunteersPage.tsx`, status pills (`Active`, `Accepted`, `Applied`, `Departed`, `Cancelled`) MUST render with dark-tinted backgrounds and high-contrast text in dark mode.
- **FR-006**: In `src/client/styles/main.css`, generic button and table cell rules MUST NOT clobber component-specific semantic colors or active state highlights.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of occupied stay day cells on `/admin/timeline` display their solid volunteer bar colors in dark mode.
- **SC-002**: 100% of status buttons and menu items on `/admin/timeline` retain their semantic color coding in dark mode.
- **SC-003**: Active filter tab on `/admin/volunteers` is visually distinct with a contrast difference $\ge 3:1$ from inactive tabs.
- **SC-004**: 0 occurrences of light text on light background (including `Cancelled` status pills) or dark text on dark background in both light and dark modes.

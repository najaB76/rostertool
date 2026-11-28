# Research & Technical Decisions: Dark Mode Contrast, Timeline Cell Fills, and Active State Differentiation

**Feature**: `030-fix-dark-mode-contrast-and-timeline`
**Date**: 2026-10-27
**Status**: Completed

## 1. Timeline Occupancy Day Cell Fill Fix

- **Root Cause**:
  - In `main.css`, a broad selector `html.dark .timeline-table tbody tr.timeline-row td` set `background-color: #1e293b !important`.
  - This `!important` rule wiped out the inline `background: barColor` styling on all occupied day cells, rendering them as dark background cells with no fill.
  - Departure day cells only appeared filled because they used `repeating-linear-gradient` as a background image.
- **Decision**:
  - Tag occupied day cells with class `timeline-occupied` and empty day cells with `timeline-empty`.
  - In `main.css`, scope the dark background rule strictly to `td:not(.timeline-occupied)` so that `barColor` fills remain 100% visible and vibrant in dark mode.

## 2. Timeline Status Button & Menu Action Color Coding

- **Root Cause**:
  - A generic dark mode button selector stripped background and text colors from status change buttons (`In da house`, `Confirmed`, `Departed`, `Not confirmed`) and action menu buttons.
- **Decision**:
  - Define semantic classes `.status-btn-active`, `.status-btn-accepted`, `.status-btn-departed`, and `.status-btn-applied`.
  - Under `html.dark`, provide dark-tinted backgrounds with bright saturated text colors (`#14532d` / `#86efac`, `#1e3a8a` / `#93c5fd`, `#7f1d1d` / `#fca5a5`, `#713f12` / `#fde047`).
  - Style `.timeline-status-menu` with `#1e293b` surface and style action items with distinct colors (`#4ade80` for green actions, `#f87171` for red actions, `#60a5fa` for blue actions).

## 3. Active State & Button Hierarchy Differentiation

- **Root Cause**:
  - The active filter tab on `/admin/volunteers` used an inline background that got homogenized with all other buttons into `#334155`.
  - Modal "Save" and "Cancel" buttons shared the same background, destroying button hierarchy.
- **Decision**:
  - Implement `.tab-button.active` with primary blue accent (`#2563eb !important`, `#fff` text) in both light and dark modes.
  - Implement `.btn-primary` (`#2563eb` with white text) and `.btn-cancel` (`#334155` with `#cbd5e1` text) across all modals and forms.

## 4. Status Pill Semantic Dark Styling

- **Root Cause**:
  - `Cancelled` status pill used light gray `#f4f4f5` background with white text in dark mode.
- **Decision**:
  - Implement `.status-pill-cancelled` with dark red `#450a0a` background and bright red `#fca5a5` text.
  - Apply corresponding dark-tinted semantic styles to `Active`, `Accepted`, `Applied`, and `Departed`.

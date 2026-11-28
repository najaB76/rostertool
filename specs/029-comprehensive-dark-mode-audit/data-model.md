# Data Model: Comprehensive Dark Mode Theme Audit and Contrast Fixes

**Feature**: `029-comprehensive-dark-mode-audit`
**Date**: 2026-10-27
**Status**: Completed

## Visual Contrast Invariants

For all components in both Light and Dark themes:
1. **Normal Text Contrast**: Contrast ratio $\ge 4.5:1$ against surface background.
2. **Large Text & Headers Contrast**: Contrast ratio $\ge 3:1$ against surface background.
3. **Country Flags**: Maintain minimum 1px contrast outline (`rgba(255,255,255,0.35)`) in dark mode per Constitution Principle II.

## Dark Mode Component Mapping

| Component / Element | Class / Identifier | Dark Surface | Dark Text | Dark Border |
|---|---|---|---|---|
| Buttons (Secondary) | `button` | `#334155` | `#f8fafc` | `#475569` |
| Roster Day Header | `.roster-day-header` | `#1e293b` | `#f8fafc` | `#334155` |
| Timeline Table Cells | `.timeline-cell` / `th, td` | `#1e293b` / `#0f172a` | `#f8fafc` | `#334155` |
| Volunteer Cards | `.volunteer-card` | `#1e293b` | `#f8fafc` | `#334155` |
| Portal Link Box | `.portal-link-box` | `#0f172a` | `#f8fafc` | `#334155` |
| Headcount Period Bar | `.headcount-period-bar` | `#1e293b` | `#f8fafc` | `#334155` |
| Admin User Card | `.admin-user-card` | `#1e293b` | `#f8fafc` | `#334155` |
| Settings Form Cards | `.settings-card` | `#1e293b` | `#f8fafc` | `#334155` |

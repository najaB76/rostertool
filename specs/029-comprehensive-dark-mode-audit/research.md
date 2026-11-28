# Research & Technical Decisions: Comprehensive Dark Mode Theme Audit and Contrast Fixes

**Feature**: `029-comprehensive-dark-mode-audit`
**Date**: 2026-10-27
**Status**: Completed

## 1. Concrete Dark Mode Defect Analysis & Systematic Solutions

### Defect 1: General Buttons (Light Text on Light Background)
- **Root Cause**: `html.dark body { color: #f8fafc; }` turned text white globally, but default browser button backgrounds or buttons with `#f4f4f5` / `#f8fafc` remained light gray.
- **Solution**: In `main.css`, style `html.dark button` with a dark slate background (`#334155`), light text (`#f8fafc`), and border (`#475569`), while preserving vivid primary button colors (blue `#3b82f6`, green `#10b981`, red `#ef4444`).

### Defect 2: Weekly Roster Column Headers
- **Root Cause**: `RosterGrid.tsx` used hardcoded `backgroundColor: '#e4e4e7'` (light gray) while day names turned white.
- **Solution**: Apply class `roster-day-header` and style in `main.css` under `html.dark` with `background-color: #1e293b !important`, border `#334155`, and text `#f8fafc`.

### Defect 3: Timeline Full-Width Columns
- **Root Cause**: In `AdminTimelinePage.tsx`, only the Sex and Name sticky columns had dark background rules. Columns D–I (Age, Source, Status, Arrival, Leaving) and day cells lacked global dark overrides.
- **Solution**: Ensure all `th` and `td` cells in the timeline table receive `background-color: #1e293b !important` (or `#0f172a !important` for headers and sticky columns) and `#f8fafc` text in dark mode.

### Defect 4: Volunteers Magic Link Div
- **Root Cause**: The magic link container had `background: '#f8fafc'` with hardcoded label `color: '#475569'`.
- **Solution**: Style `.portal-link-box` in dark mode with `background-color: #0f172a !important`, border `#334155`, and label `#94a3b8 !important`.

### Defect 5: Headcount Heading Div
- **Root Cause**: `AdminHeadcountPage.tsx` used `color: '#18181b'` on `periodTitle` and `#3f3f46` on labels.
- **Solution**: Assign class `headcount-period-title` and override with `color: #f8fafc !important` in dark mode.

### Defect 6: Admin Users Names Unreadable
- **Root Cause**: `AdminUsersPage.tsx` used dark text colors for user names and usernames on dark surfaces.
- **Solution**: Style admin user cards with `background-color: #1e293b !important`, `border-color: #334155 !important`, and names with `color: #f8fafc !important`.

### Defect 7: Settings Form
- **Root Cause**: Cards and fieldsets in `AdminSettingsPage.tsx` used inline `#fff` backgrounds without dark mode container rules.
- **Solution**: Add class `.settings-card` and style with `background-color: #1e293b !important`, border `#334155`, and high-contrast labels.

# Implementation Plan: Roster Fixes, Width Expansion & Housekeeping Settings

**Branch**: `010-roster-fixes-and-settings` | **Date**: 2026-10-27 | **Spec**: [specs/010-roster-fixes-and-settings/spec.md](spec.md)

**Input**: Feature specification from `specs/010-roster-fixes-and-settings/spec.md`

## Summary

Deliver critical fixes and administrative operational enhancements:
1. **BUG FIX 1: Assignment Removal**: Implement `POST /api/admin/roster/unassign` and wire the "×" remove icon in `AdminRosterPage.tsx` directly to it, ensuring staff and volunteers are cleanly deleted rather than re-assigned.
2. **BUG FIX 2: Duplicate Prevention**: Guard against duplicate staff or volunteer assignments on the same shift slot and clean up existing duplicate rows.
3. **95% Screen Width Layout**: Update `.admin-main` in `src/client/styles/main.css` to `max-width: 95%` so all 7 daily columns fit without horizontal scrolling.
4. **Housekeeping Operational Settings**: Add `system_settings` table, endpoints `GET/POST /api/admin/settings`, and `AdminSettingsPage` to configure housekeepers per day (default 3), shifts per week (default 4), and shift hours (default 10:00–14:00).
5. **Time-Off Start/End Date Defaulting**: In `TimeOffModal.tsx`, automatically update `endDate` to match `startDate` upon selection.

## Technical Context

**Language/Version**: Node.js (v22 LTS) & TypeScript 5.8+

**Primary Dependencies**: Fastify 5.x, React 19, Vite 8, Drizzle ORM

**Storage**: SQLite (`data/rostertool.sqlite`) with WAL mode

**Testing**: Vitest (`npm test`)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Gate | Requirement | Architecture Compliance | Status |
|---|---|---|---|
| **I. Test-First Engine & Invariants** | Unassign and duplicate prevention preserve relational integrity. | Solver and manual UI enforce single assignment per person per slot. | **PASS** |
| **II. Cultural Identity & High-Visibility Flags** | Flags preserved in expanded layout. | 95% width gives flags and names more horizontal breathing room. | **PASS** |
| **III. Self-Hosted Simplicity & Zero-Config** | Settings stored in embedded SQLite without external config services. | `system_settings` key-value table stored locally. | **PASS** |
| **IV. Human Override & Visual Highlighting** | Removal and settings give managers full operational control. | 1-click unassign works reliably; settings customize solver parameters. | **PASS** |
| **V. Low-Friction Magic-Link Access** | Time-off date defaulting reduces clicks for single-day requests. | 1-click single-day leave submission in portal. | **PASS** |

---

## Project Structure & File Modifications

### Database & Backend (`src/server/`)
- `src/server/db/schema.ts`: Add `systemSettings` table and unique constraint on `(shift_definition_id, date, staff_id)`.
- `src/server/db/client.ts`: Auto-migrate `system_settings` table, unique index, and deduplicate existing rows.
- `src/server/routes/admin-roster.ts`: Implement `POST /api/admin/roster/unassign`.
- `src/server/services/roster-service.ts`: Duplicate guard in `assignShift` and clean `unassignShift`.
- `src/server/routes/admin-settings.ts`: New route for `GET` and `POST /api/admin/settings`.
- `src/server/index.ts`: Register `adminSettingsRoutes`.
- `tests/api/roster.test.ts`: Add tests for unassign and duplicate assignment prevention.

### Client UI (`src/client/`)
- `src/client/styles/main.css`: Update `.admin-main` max-width to `95%`.
- `src/client/pages/AdminRosterPage.tsx`: Point `handleRemoveClick` to `/api/admin/roster/unassign`.
- `src/client/components/TimeOffModal.tsx`: Default `endDate` to match `startDate` on change.
- `src/client/pages/AdminSettingsPage.tsx`: New settings management screen.
- `src/client/App.tsx`: Add "Settings" navigation link and register `/admin/settings` route.

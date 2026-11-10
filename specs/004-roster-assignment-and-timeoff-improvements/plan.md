# Implementation Plan: Assignment Modal, Country Search & Multi-Day Time-Off

**Branch**: `004-roster-assignment-and-timeoff-improvements` | **Date**: 2026-10-27 | **Spec**: [specs/004-roster-assignment-and-timeoff-improvements/spec.md](spec.md)

**Input**: Feature specification from `specs/004-roster-assignment-and-timeoff-improvements/spec.md`

## Summary

Deliver three usability improvements:
1. Replace browser `prompt` dialogs for shift assignments with an interactive **`ShiftAssignModal`** displaying eligible candidates with flags, roles, weekly hours, and 1-click assignment.
2. Expand the country catalog in `src/client/data/countries.ts` to include **all 260+ nations and territories** (with comprehensive Caribbean coverage) and implement a search-select menu.
3. Support **multi-day date-range time-off requests** in the volunteer portal and backend.

## Technical Context

**Language/Version**: Node.js (v22 LTS) & TypeScript 5.8+

**Primary Dependencies**: Fastify 5.x, React 19, Vite 8, `country-flag-icons`

**Storage**: SQLite (`data/rostertool.sqlite`) with WAL mode

**Testing**: Vitest (`npm test`)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Gate | Requirement | Architecture Compliance | Status |
|---|---|---|---|
| **I. Test-First Engine & Invariants** | Constraint solver unaffected; multi-day time off maps to date records. | Pure engine continues to evaluate date-by-date time off without breaking changes. | **PASS** |
| **II. Cultural Identity & High-Visibility Flags** | Full global coverage with graphic SVG flags. | Expanded to all 266 countries/territories with graphic SVG flags. | **PASS** |
| **III. Self-Hosted Simplicity & Zero-Config** | Embedded SQLite, offline self-contained assets. | All country data and vector flags are local static assets; zero external dependencies. | **PASS** |
| **IV. Human Override & Visual Highlighting** | Fast, intuitive manual assignment. | Replaces typing IDs with a 1-click candidate modal. | **PASS** |
| **V. Low-Friction Magic-Link Access** | Frictionless portal requests. | Volunteers can request multi-day leave in 1 submission. | **PASS** |

---

## Project Structure & File Modifications

### Backend (`src/server/`)
- `src/server/routes/portal.ts`: Update `POST /api/portal/time-off` to support `{ startDate, endDate, reason }` in addition to single `date`.
- `tests/api/portal.test.ts`: Add test for multi-day time-off submission.

### Client UI (`src/client/`)
- `src/client/data/countries.ts`: Expand dataset to all 266 ISO 3166-1 alpha-2 countries and territories (full Caribbean coverage).
- `src/client/components/CountrySelect.tsx`: Upgrade to searchable select with real-time text filter.
- `src/client/components/ShiftAssignModal.tsx`: New component listing eligible volunteers/staff with flags, hours, conflict flags, and 1-click assignment.
- `src/client/pages/AdminRosterPage.tsx`: Replace `window.prompt` assignment flow with `ShiftAssignModal`.
- `src/client/components/TimeOffModal.tsx`: Add Start Date and End Date range inputs with total day count calculation.

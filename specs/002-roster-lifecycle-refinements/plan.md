# Implementation Plan: Roster, Lifecycle & Headcount Refinements

**Branch**: `002-roster-lifecycle-refinements` | **Date**: 2026-10-27 | **Spec**: [specs/002-roster-lifecycle-refinements/spec.md](spec.md)

**Input**: Feature specification from `specs/002-roster-lifecycle-refinements/spec.md`

## Summary

Refine the hostel rostering tool to address usability feedback:
1. Fix daily shift definitions so every day shows exactly 3 shifts (Housekeeping, Reception Day, and the day-appropriate Reception Evening shift).
2. Implement guided volunteer lifecycle state advancement (`Applied` $\to$ `Accepted` $\to$ `Active` $\to$ `Departed` / `Cancelled`) with direct action buttons.
3. Replace free-text inputs with structured dropdowns for nationalities (with country names and flags) and application sources.
4. Ensure the notes field is fully accessible and editable across all volunteer statuses.
5. Enhance the Headcount Calendar with month/quarter/year navigation and a compact heatmap mode.

## Technical Context

**Language/Version**: Node.js (v22 LTS) & TypeScript 5.8+

**Primary Dependencies**: Fastify 5.x, Drizzle ORM, better-sqlite3, React 19, Vite 8, Vitest

**Storage**: SQLite (`data/rostertool.sqlite`) with WAL mode

**Testing**: Vitest (`npm test`)

**Deployment**: Native Proxmox LXC Container via systemd (`rostertool.service`)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Gate | Requirement | Architecture Compliance | Status |
|---|---|---|---|
| **I. Test-First Rostering & Engine** | Shift day filtering and constraint solving must remain deterministic and pure. | Day-of-week filtering logic in `roster-service.ts` and `seed.ts` is verified by unit & route tests. | **PASS** |
| **II. Cultural Identity & High-Visibility Flags** | Country flags displayed in dropdowns, cards, and roster cells. | Canonical country metadata provides flag emojis and names for all ISO countries in dropdowns and cards. | **PASS** |
| **III. Self-Hosted Simplicity & Zero-Config** | Embedded SQLite, native Proxmox LXC, no external dependencies. | No new external dependencies added; country catalog is local static TypeScript data. | **PASS** |
| **IV. Human Override & Visual Highlighting** | Lifecycle transitions remain manager-controlled; understaffed & capacity highlights preserved. | Explicit action buttons give the manager full control over state progression. | **PASS** |
| **V. Low-Friction Magic-Link Access** | Magic links generated upon acceptance and remain valid. | Token generation triggered during acceptance transition. | **PASS** |

---

## Project Structure & File Modifications

### Backend (`src/server/`)
- `src/server/db/seed.ts`: Update shift definition seed data to ensure proper day-of-week filtering for evening shifts.
- `src/server/services/roster-service.ts`: Enforce day-of-week filtering so each day contains exactly 3 shift slots.
- `src/server/services/volunteer-service.ts`: Add `acceptVolunteer`, `activateVolunteer`, `cancelVolunteer`, and source listing methods.
- `src/server/routes/admin-volunteers.ts`: Expose `/api/admin/volunteers/:id/accept`, `activate`, `cancel`, and sources endpoint.

### Client UI (`src/client/`)
- `src/client/data/countries.ts`: Comprehensive static list of ISO 3166-1 countries with flags and names.
- `src/client/components/CountrySelect.tsx`: Country picker dropdown with country names and flags.
- `src/client/components/VolunteerModal.tsx`: Integrate country & source dropdowns, ensure notes field is universal across all states.
- `src/client/pages/AdminVolunteersPage.tsx`: Add explicit lifecycle transition buttons on volunteer cards for each status tab (`Accept`, `Activate`, `Depart`, `Cancel`, `Edit`).
- `src/client/components/RosterGrid.tsx`: Ensure clean 3-shift display per day column.
- `src/client/components/HeadcountCalendar.tsx`: Multi-scale rendering (Month, Quarter, Year) with compact heatmap mode.
- `src/client/pages/AdminHeadcountPage.tsx`: Add navigation controls (`Previous`, `Today`, `Next`), view scale toggle, and compact heatmap toggle.

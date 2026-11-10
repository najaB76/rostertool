# Implementation Plan: Staff Assignment Fix, Reception Copy & Birthdays

**Branch**: `009-staff-fix-reception-copy-and-birthdays` | **Date**: 2026-10-27 | **Spec**: [specs/009-staff-fix-reception-copy-and-birthdays/spec.md](spec.md)

**Input**: Feature specification from `specs/009-staff-fix-reception-copy-and-birthdays/spec.md`

## Summary

Deliver one critical bug fix and three operational enhancements:
1. **BUG FIX**: Fix staff assignment logic in `src/server/routes/admin-roster.ts` and `roster-service.ts` so staff members can be assigned without being erroneously unassigned.
2. **Auto-Populate Reception Copy Forward**: When auto-populating a week, automatically copy the preceding week's reception shifts (AM & PM) forward for all active, available personnel, then solve housekeeping.
3. **Preferred Name Support**: Add `preferred_name` to volunteers and prioritize it in all roster and cell displays.
4. **Date of Birth & Birthday Cake Alert**: Add `date_of_birth` to volunteers and display `🎂 Birthday` alert on volunteer cards 7 days prior to and on their birthday.

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
| **I. Test-First Engine & Invariants** | Staff assignment and solver constraints remain robust and tested. | Reception copy acts as pre-assignments; solver validates constraints. | **PASS** |
| **II. Cultural Identity & High-Visibility Flags** | Preferred name and staff assignments render with country flags. | Flags remain rendered alongside preferred names across all views. | **PASS** |
| **III. Self-Hosted Simplicity & Zero-Config** | Birthday alert calculated locally without external calendar APIs. | Pure local Date math in `date-utils.ts`. | **PASS** |
| **IV. Human Override & Visual Highlighting** | Birthday icon highlights celebration opportunities. | `🎂` icon alerts management to plan special events. | **PASS** |
| **V. Low-Friction Magic-Link Access** | Preferred name and DOB integrate into existing volunteer service. | Schema extensions maintain backwards compatibility with existing tokens. | **PASS** |

---

## Project Structure & File Modifications

### Database & Backend (`src/server/`)
- `src/server/db/schema.ts`: Add `preferredName` and `dateOfBirth` to `volunteers`.
- `src/server/db/client.ts`: Auto-migrate `preferred_name` and `date_of_birth` columns if missing.
- `src/server/routes/admin-roster.ts`: Fix assignment check condition (`if (!volunteerId && !staffId)`).
- `src/server/services/roster-service.ts`:
  - Enhance `assignShift` for staff assignments.
  - Implement reception copy routine in `autoPopulateRoster`.
- `tests/api/roster.test.ts`: Add tests for staff assignment and reception copy forward.

### Client UI (`src/client/`)
- `src/client/utils/date-utils.ts`: Add `getBirthdayAlert` helper.
- `src/client/components/VolunteerModal.tsx`: Add Preferred Name and Date of Birth inputs.
- `src/client/pages/AdminVolunteersPage.tsx`: Render Preferred Name, Date of Birth, and `🎂` birthday alert.
- `src/client/components/ShiftSlotCell.tsx`: Display preferred name when available.
- `src/client/components/PrintableRosterView.tsx`: Display preferred name when available.

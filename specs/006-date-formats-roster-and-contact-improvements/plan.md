# Implementation Plan: Date Formats, Roster Navigation & Volunteer Contacts

**Branch**: `006-date-formats-roster-and-contact-improvements` | **Date**: 2026-10-27 | **Spec**: [specs/006-date-formats-roster-and-contact-improvements/spec.md](spec.md)

**Input**: Feature specification from `specs/006-date-formats-roster-and-contact-improvements/spec.md`

## Summary

Deliver three usability and consistency improvements:
1. Standardize date displays to `YYYY-MM-DD` across all pages (especially unifiying Requested Date and Submitted date on the Time-Off page).
2. Enforce Monday-only scheduling on the weekly roster with automatic Monday snapping on date selection and `← Previous Week` / `This Week` / `Next Week →` navigation buttons.
3. Capture volunteer email addresses and phone/WhatsApp numbers in `VolunteerModal` and display them on volunteer cards with `mailto:` and `tel:` links.

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
| **I. Test-First Engine & Invariants** | Roster scheduling cycle remains Monday-to-Sunday. | Date picker enforces Monday as the week start. | **PASS** |
| **II. Cultural Identity & High-Visibility Flags** | Flags preserved in all views. | Flags remain adjacent to volunteer names. | **PASS** |
| **III. Self-Hosted Simplicity & Zero-Config** | No extra external dependencies. | Built using pure React state and standard HTML attributes. | **PASS** |
| **IV. Human Override & Visual Highlighting** | Fast week-by-week review. | 1-click week navigation accelerates roster review. | **PASS** |
| **V. Low-Friction Magic-Link Access** | Direct volunteer contact. | Capturing phone/email enables direct link distribution. | **PASS** |

---

## Project Structure & File Modifications

### Client UI (`src/client/`)
- `src/client/components/VolunteerModal.tsx`: Add form inputs for `email` and `phone`.
- `src/client/pages/AdminVolunteersPage.tsx`: Render email and phone metadata with `mailto:` and `tel:` links on volunteer cards.
- `src/client/pages/AdminRosterPage.tsx`: Implement `snapToMonday`, add `← Previous Week`, `This Week`, and `Next Week →` buttons, and format header range.
- `src/client/pages/AdminTimeOffPage.tsx`: Standardize submission date formatting to `YYYY-MM-DD`.

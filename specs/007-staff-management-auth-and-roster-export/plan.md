# Implementation Plan: Staff Management, Admin Auth & Printable Roster

**Branch**: `007-staff-management-auth-and-roster-export` | **Date**: 2026-10-27 | **Spec**: [specs/007-staff-management-auth-and-roster-export/spec.md](spec.md)

**Input**: Feature specification from `specs/007-staff-management-auth-and-roster-export/spec.md`

## Summary

Deliver three major administrative and operational capabilities:
1. **Staff Management Screen**: Dedicated `/admin/staff` screen allowing managers to add, edit, and remove paid staff (full name, nationality flag, and role) and store `nationality` in SQLite.
2. **Management Authentication**: Simple Username/PIN protection for all `/admin/*` routes with `/login` page and header logout.
3. **WhatsApp / Screenshot Portrait Roster View**: A vertical portrait roster view precisely matching `WhatsApp Image 2026-10-25 at 16.01.45.jpeg` (Day, Day Receptionist, Night Receptionist, and Housekeeping grid with country flags).

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
| **I. Test-First Engine & Invariants** | Staff assignments integrate seamlessly with solver and manual overrides. | Staff records persist with role and nationality for assignment checks. | **PASS** |
| **II. Cultural Identity & High-Visibility Flags** | Flags mandatory on all staff and printable views. | Staff table and WhatsApp view render SVG country flags beside every name. | **PASS** |
| **III. Self-Hosted Simplicity & Zero-Config** | Username/PIN authentication runs offline without third-party services. | Zero external auth providers; built with embedded SQLite / Fastify tokens. | **PASS** |
| **IV. Human Override & Visual Highlighting** | WhatsApp portrait layout accelerates distribution. | Delivers the exact format already familiar to the team. | **PASS** |
| **V. Low-Friction Magic-Link Access** | Volunteer portal remains passwordless and unblocked. | `/portal` remains token-authenticated without username/PIN prompts. | **PASS** |

---

## Project Structure & File Modifications

### Database & Backend (`src/server/`)
- `src/server/db/schema.ts`: Add `nationality: text('nationality').notNull().default('ES')` to `staffUsers`.
- `src/server/routes/admin-staff.ts`: Implement `POST`, `PUT`, `DELETE` endpoints for staff CRUD.
- `src/server/routes/auth.ts`: New route for `POST /api/auth/login` and `GET /api/auth/verify`.
- `src/server/services/roster-service.ts`: Include `nationality` on assigned staff objects.
- `tests/api/staff.test.ts`: Add tests for staff CRUD and nationality.

### Client UI (`src/client/`)
- `src/client/pages/LoginPage.tsx`: New login screen for Username and PIN.
- `src/client/components/ProtectedRoute.tsx`: Route guard checking admin session.
- `src/client/pages/AdminStaffPage.tsx`: New screen to list, create, edit, and delete staff with CountrySelect.
- `src/client/components/PrintableRosterView.tsx`: Portrait roster view matching WhatsApp screenshot layout.
- `src/client/pages/AdminRosterPage.tsx`: Add button to toggle/open WhatsApp Screenshot View.
- `src/client/App.tsx`: Protect `/admin/*` routes with `ProtectedRoute`, register `/login` and `/admin/staff`, and add Logout button.

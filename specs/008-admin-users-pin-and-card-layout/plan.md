# Implementation Plan: Admin Users, PIN Change & Card Layout

**Branch**: `008-admin-users-pin-and-card-layout` | **Date**: 2026-10-27 | **Spec**: [specs/008-admin-users-pin-and-card-layout/spec.md](spec.md)

**Input**: Feature specification from `specs/008-admin-users-pin-and-card-layout/spec.md`

## Summary

Deliver four management and interface refinements:
1. **Admin Users Management**: Create SQLite `admin_users` table with seed migration, API endpoints (`GET`, `POST`, `PUT`, `DELETE /api/admin/users`), and `AdminUsersPage` screen.
2. **Self-Service PIN Change**: Implement `POST /api/auth/change-pin` and a `ChangePinModal` in the navigation header.
3. **Structured Two-Line Volunteer Card Layout**: Separate operational/stay info onto Line 1 and contact details (email/phone) onto Line 2.
4. **Staff Roles Update**: Replace `Shift Supervisor` with `Assistant Manager` in `AdminStaffPage` and role definitions.

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
| **I. Test-First Engine & Invariants** | Solver and rostering rules remain unaffected. | Auth and UI changes wrap around engine without altering scheduling invariants. | **PASS** |
| **II. Cultural Identity & High-Visibility Flags** | Flags preserved on cards and staff screens. | Visual separation highlights nationality flags on Line 1. | **PASS** |
| **III. Self-Hosted Simplicity & Zero-Config** | SQLite-backed multi-user credentials without external identity providers. | Pure relational database table and local token verification. | **PASS** |
| **IV. Human Override & Visual Highlighting** | Self-service PIN change and management delegation. | Granular administrative credentials and easy PIN rotation. | **PASS** |
| **V. Low-Friction Magic-Link Access** | Volunteer portal remains separate and unhindered. | Admin users table only governs `/admin/*` operations. | **PASS** |

---

## Project Structure & File Modifications

### Database & Backend (`src/server/`)
- `src/server/db/schema.ts`: Define `adminUsers` table (`id`, `username`, `pin`, `createdAt`).
- `src/server/db/client.ts`: Ensure `admin_users` table creation and default `admin` / `1234` seed on startup.
- `src/server/routes/auth.ts`: Update login to query `adminUsers`, add `POST /api/auth/change-pin`, and mount `/api/admin/users` CRUD endpoints.
- `tests/api/auth.test.ts`: Add tests for multi-admin CRUD, login, and self-service PIN change.

### Client UI (`src/client/`)
- `src/client/pages/AdminUsersPage.tsx`: New management screen for listing, adding, editing, and deleting admin users.
- `src/client/components/ChangePinModal.tsx`: Dialog to update the logged-in user's PIN.
- `src/client/pages/AdminVolunteersPage.tsx`: Organize volunteer card metadata into two distinct rows (Line 1: role/source/dates, Line 2: email/phone).
- `src/client/pages/AdminStaffPage.tsx`: Replace "Shift Supervisor" with "Assistant Manager" in role choices.
- `src/client/App.tsx`: Add "Admin Users" link, "Change PIN" button in header, and register `/admin/users` route.

# Research & Technical Decisions: Staff Management, Admin Auth & Printable Roster

**Feature**: `007-staff-management-auth-and-roster-export`
**Date**: 2026-10-27
**Status**: Completed

## 1. Staff Management Architecture & Nationality Persistence

- **Decision**:
  - Add `nationality: text('nationality').notNull().default('ES')` to `staff_users` table in SQLite schema.
  - Implement full CRUD in `src/server/routes/admin-staff.ts` (`GET`, `POST`, `PUT`, `DELETE`).
  - Build `AdminStaffPage.tsx` with searchable `CountrySelect` so managers can assign staff members accurate nationality flags (e.g. French 🇫🇷, Italian 🇮🇹, British 🇬🇧).
  - Update `src/server/services/roster-service.ts` to return `nationality` on staff assignments.
- **Rationale**:
  - As observed in `WhatsApp Image 2026-10-25 at 16.01.45.jpeg`, paid staff members like receptionists have country flags rendered next to their names in the official schedule just like volunteers.
- **Alternatives Considered**:
  - *Hardcoding staff names*: Inflexible; hostels frequently add seasonal supervisors and receptionists.

---

## 2. Simple Username & PIN Management Authentication

- **Decision**:
  - Implement lightweight session-token authentication in Fastify (`/api/auth/login`, `/api/auth/verify`).
  - Default credentials: Username `admin`, PIN `1234` (overridable via `ADMIN_PIN` environment variable).
  - Protect all `/admin/*` client pages via a `ProtectedRoute` wrapper in `App.tsx`.
  - Store token in `localStorage` under `admin_token`.
  - Add a "Logout" button in the admin header.
  - Volunteer magic link portal (`/portal?token=...`) remains unauthenticated by design.
- **Rationale**:
  - Fits the user's specific mandate: "a simple username/PIN combination is enough security for this scenario". Zero external OAuth or cloud identity dependencies.
- **Alternatives Considered**:
  - *Complex OAuth / Auth0*: Overkill, requires cloud connection and third-party account configuration, violating Self-Hosted Simplicity (Principle III).

---

## 3. WhatsApp / Screenshot Portrait Roster View

- **Decision**:
  - Create a dedicated component `PrintableRosterView.tsx` matching the visual layout of `WhatsApp Image 2026-10-25 at 16.01.45.jpeg`.
  - Features:
    - Vertical portrait layout designed specifically for mobile smartphone screens and WhatsApp image sharing.
    - Exact color scheme: Orange `#ea580c` for Reception (8am–4pm), Blue `#0284c7` for Night Shift (4pm–12am), Gray `#e2e8f0` for Housekeeping (10am–2pm).
    - 7 rows for Monday through Sunday.
    - Two reception columns (Day and Evening) and a structured multi-cell grid for Housekeepers.
    - First name only + graphic vector country flags next to every single name.
    - Single-click print/PDF stylesheet support (`@media print`).
- **Rationale**:
  - Matches the exact operational workflow used by the hostel for distributing weekly rosters on WhatsApp.

# Research & Technical Decisions: Admin Users, PIN Change & Card Layout

**Feature**: `008-admin-users-pin-and-card-layout`
**Date**: 2026-10-27
**Status**: Completed

## 1. Database-Backed Admin Users & Authentication

- **Decision**:
  - Introduce `admin_users` table in SQLite (`id`, `username`, `pin`, `created_at`).
  - Seed default account `admin` / `1234` on first run if table is empty.
  - Update authentication logic in `src/server/routes/auth.ts` to query `admin_users`.
  - Expose CRUD endpoints under `/api/admin/users`:
    - `GET /api/admin/users`: list accounts (excluding PINs).
    - `POST /api/admin/users`: add new admin.
    - `PUT /api/admin/users/:id`: edit username or reset PIN.
    - `DELETE /api/admin/users/:id`: delete admin (safeguarded against deleting sole admin or self).
- **Rationale**:
  - Replaces hardcoded single-user login with multi-user persistence so multiple hostel managers have individual accounts.
- **Alternatives Considered**:
  - *Storing multiple users in environment variables*: Inflexible; managers cannot add or edit accounts from the UI.

---

## 2. Self-Service PIN Change

- **Decision**:
  - Implement `POST /api/auth/change-pin`:
    - Checks bearer token to identify the current user.
    - Compares `currentPin` with stored PIN.
    - Updates `pin` in `admin_users`.
  - Build `ChangePinModal.tsx` accessible from the admin header navigation.
- **Rationale**:
  - Gives every manager autonomy to update their own credentials securely.

---

## 3. Two-Line Volunteer Card Information Structure

- **Decision**:
  - Reorganize volunteer metadata into two clean, structured rows:
    - **Line 1 (Operational & Stay Info)**: Role, Application Source, Stay Dates, and qualification badges.
    - **Line 2 (Contact Info)**: Email address and Phone number with active clickable links.
- **Rationale**:
  - Fixes irregular line-wrapping when contact info was mixed on the same line as stay dates, ensuring clean vertical rhythm across all volunteer cards.

---

## 4. Staff Roles Update

- **Decision**:
  - In `AdminStaffPage.tsx`: remove `Shift Supervisor` and add `Assistant Manager`.
  - Allowed roles: `Receptionist`, `Senior Receptionist`, `Assistant Manager`, `Hostel Manager`, `General Staff`.
- **Rationale**:
  - Aligns with the hostel's operational staffing titles.

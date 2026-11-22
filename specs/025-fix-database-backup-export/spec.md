# Feature Specification: Database Backup Export Authentication and Integrity Fix

**Feature Branch**: `025-fix-database-backup-export`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User feedback:
"BUG: Attempting to export the database using the UI feature results in an error: `{"error":"Unauthorized: Session expired or invalid"}`. Users must be able to export the database."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Authenticated Database Backup Download & Standalone Integrity (Priority: P1)

As an authenticated hostel administrator in the Settings page (`/admin/settings`), I want to click the "Download Database Backup (.sqlite)" button to reliably export and download a copy of the self-hosted SQLite database without encountering a `401 Unauthorized: Session expired or invalid` error, and I want the downloaded file to have all WAL data checkpointed so that it is a valid, standalone SQLite backup.

**Why this priority**: Database backup is a critical disaster recovery and data portability feature. A raw top-level browser navigation does not send HTTP Bearer authorization headers, breaking the export endpoint under centralized admin auth guards. Additionally, un-checkpointed WAL files risk producing corrupt or incomplete standalone database backups.

**Independent Test**:
- Log into the Admin panel with valid credentials.
- Navigate to `/admin/settings` $\rightarrow$ Data Management & Backup.
- Click "Download Database Backup (.sqlite)".
- Verify the download begins immediately without throwing 401 or blanking the page.
- Verify the downloaded file is a valid SQLite file with all tables (including newly imported volunteers and stays).
- Test unauthenticated access (e.g. invalid or missing token) $\rightarrow$ verify 401 is returned.

**Acceptance Scenarios**:
1. **Given** an authenticated admin session, **When** clicking "Download Database Backup (.sqlite)", **Then** the client performs an authenticated download with Bearer auth, receiving the `.sqlite` file as an attachment.
2. **Given** SQLite operating in WAL mode, **When** `/api/admin/backup/export` is invoked, **Then** the server executes a WAL checkpoint (`wal_checkpoint(TRUNCATE)`) prior to streaming the database file to guarantee complete standalone data integrity.
3. **Given** an unauthenticated request or expired token, **When** accessing the backup export endpoint, **Then** it returns 401 Unauthorized.
4. **Given** a download failure or network error, **When** clicking export, **Then** the UI displays a clear error alert without breaking page state.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: In `AdminSettingsPage.tsx`, `handleDownloadBackup` MUST initiate an authenticated request using `fetch` with the active Bearer token, rather than an unauthenticated top-level browser navigation (`window.location.href`).
- **FR-002**: Upon receiving the binary file response, `AdminSettingsPage.tsx` MUST create a blob URL and trigger an automatic browser file download preserving the timestamped filename from `Content-Disposition`.
- **FR-003**: In `admin-backup.ts`, before streaming the SQLite file, the server MUST execute `sqliteDb.pragma('wal_checkpoint(TRUNCATE)')` to flush all changes from WAL into the database file.
- **FR-004**: The `/api/admin/backup/export` endpoint MUST remain protected by `requireAdminAuth`.
- **FR-005**: In `admin-backup.ts`, the server MUST expose the `Content-Disposition` header in CORS/headers so the client can extract the backup filename.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of authenticated backup export attempts download a valid, uncorrupted `.sqlite` file in < 2 seconds.
- **SC-002**: 0 `401 Unauthorized` errors when triggering database backup downloads from an active admin session.
- **SC-003**: Exported `.sqlite` file contains 100% of all committed database records without requiring companion `-wal` or `-shm` files.

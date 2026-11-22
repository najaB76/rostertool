# Quickstart: Database Backup Export Authentication and Integrity Fix

**Feature**: `025-fix-database-backup-export`

## Verification Scenarios

### Scenario 1: Authenticated Backup Export
1. Log in to the application as an admin.
2. Navigate to `/admin/settings` $\rightarrow$ Data Management & Backup.
3. Click "Download Database Backup (.sqlite)".
4. Verify the button indicates downloading state.
5. Verify the browser triggers a file download named `rostertool-backup-*.sqlite`.
6. Inspect the downloaded file with `sqlite3` to confirm all tables and records exist.

### Scenario 2: Unauthenticated Access Rejection
1. Execute `curl -i http://localhost:3000/api/admin/backup/export` without authorization.
2. Verify HTTP response is `401 Unauthorized: Session expired or invalid`.

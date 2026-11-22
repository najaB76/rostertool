# Data Model & Protocol: Database Backup Export Authentication and Integrity Fix

**Feature**: `025-fix-database-backup-export`
**Date**: 2026-10-27
**Status**: Completed

## HTTP Endpoint

- **Method**: `GET`
- **Path**: `/api/admin/backup/export`
- **Headers**:
  - Request: `Authorization: Bearer <session_token>`
  - Response:
    - `Content-Type: application/octet-stream`
    - `Content-Disposition: attachment; filename="rostertool-backup-<ISO_TIMESTAMP>.sqlite"`
    - `Access-Control-Expose-Headers: Content-Disposition`

## Database Synchronization Invariant

Prior to streaming the database file:
```sql
PRAGMA wal_checkpoint(TRUNCATE);
```
All WAL frames are merged into `rostertool.sqlite` and the WAL file size is reset to 0.

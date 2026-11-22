# Research & Technical Decisions: Database Backup Export Authentication and Integrity Fix

**Feature**: `025-fix-database-backup-export`
**Date**: 2026-10-27
**Status**: Completed

## 1. Root Cause & Solution for 401 Unauthorized on Database Export

- **Root Cause**:
  - In `AdminSettingsPage.tsx`, the backup download was triggered using `window.location.href = '/api/admin/backup/export'`.
  - Top-level browser navigations do NOT include HTTP `Authorization: Bearer <token>` headers that are normally attached to AJAX requests via the global `fetch` interceptor in `App.tsx`.
  - Consequently, Fastify's centralized `preHandler` hook executed `requireAdminAuth` which found no Authorization header and returned `401 Unauthorized: Session expired or invalid`.
- **Decision**:
  - In `AdminSettingsPage.tsx`, replace `window.location.href` with an authenticated `fetch('/api/admin/backup/export')` request.
  - The request will automatically receive the `Authorization: Bearer <token>` header from the client interceptor.
  - Convert the binary response to a Blob (`await res.blob()`), create a temporary Object URL (`window.URL.createObjectURL(blob)`), extract the filename from `Content-Disposition`, and trigger download via a programmatic click.
  - Display an export loading state during download and show user-friendly error alerts if download fails.

## 2. WAL Mode Standalone Integrity Checkpoint

- **Root Cause**:
  - The application runs SQLite in WAL (Write-Ahead Logging) mode (`data/rostertool.sqlite-wal`).
  - Streaming `data/rostertool.sqlite` directly without a checkpoint means uncheckpointed transactions remain in the `-wal` file and are absent from the exported `.sqlite` file.
- **Decision**:
  - In `src/server/routes/admin-backup.ts`, before streaming the file, execute `sqliteDb.pragma('wal_checkpoint(TRUNCATE)')` on the underlying `better-sqlite3` instance.
  - This flushes all transactions into the main `.sqlite` file and truncates the WAL file, guaranteeing complete standalone integrity for the downloaded backup.

# Implementation Plan: Database Backup Export Authentication and Integrity Fix

**Branch**: `025-fix-database-backup-export` | **Date**: 2026-10-27 | **Spec**: [specs/025-fix-database-backup-export/spec.md](spec.md)

## Summary
1. Fix `handleDownloadBackup` in `AdminSettingsPage.tsx` to use authenticated `fetch` with Bearer auth, convert response to Blob, and trigger browser file download.
2. In `src/server/routes/admin-backup.ts`, perform `sqliteDb.pragma('wal_checkpoint(TRUNCATE)')` prior to streaming the SQLite database file to ensure complete standalone data integrity.
3. Expose `Content-Disposition` header in the response and handle error responses gracefully.
4. Add automated test verifying authenticated backup export and checkpointing.

## Constitution Check
- **I. Test-First Engine & Invariants**: Tested via unit and integration tests. **PASS**
- **II. Cultural Identity & High-Visibility Flags**: **PASS**
- **III. Self-Hosted Simplicity & Zero-Config**: Direct SQLite streaming with zero cloud dependencies. **PASS**
- **IV. Human Override & Visual Highlighting**: Clean error handling in UI. **PASS**

## Project Structure & File Roadmap
- `src/server/routes/admin-backup.ts`: Add `wal_checkpoint(TRUNCATE)` and header exposure.
- `src/client/pages/AdminSettingsPage.tsx`: Implement authenticated fetch blob download with loading state.
- `tests/api/backup.test.ts`: Add integration test verifying 401 on unauthenticated access and 200 with valid SQLite header on authenticated access.

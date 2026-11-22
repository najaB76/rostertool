# Tasks: Database Backup Export Authentication and Integrity Fix

**Input**: Design documents from `/specs/025-fix-database-backup-export/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`
**Status**: Ready for implementation

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

---

## Phase 1: Setup

- [x] T001 [P] Verify project dependencies and environment in `package.json`

---

## Phase 2: User Story 1 - Authenticated Database Backup Download & Standalone Integrity (Priority: P1)

**Goal**: Enable authenticated admins to download database backups via `fetch` blob download with Bearer auth and ensure complete standalone data integrity via WAL checkpointing.

**Independent Test**: Call `/api/admin/backup/export` without token $\rightarrow$ verify 401. Call with token $\rightarrow$ verify 200, valid SQLite file stream, and WAL flushed to main database file. Test download button in UI $\rightarrow$ verify file downloads without errors.

### Tests for User Story 1

- [x] T002 [P] [US1] Create integration test in `tests/api/backup.test.ts` verifying 401 when unauthenticated and 200 with SQLite binary stream when authenticated

### Implementation for User Story 1

- [x] T003 [US1] Update `src/server/routes/admin-backup.ts` to execute `wal_checkpoint(TRUNCATE)` before streaming and expose `Content-Disposition` header
- [x] T004 [US1] Update `src/client/pages/AdminSettingsPage.tsx` to download backup via authenticated `fetch`, handle blob response, trigger browser download, and display loading state

**Checkpoint**: User Story 1 complete - database backup download works seamlessly with authenticated session and standalone integrity.

---

## Phase 3: Polish & Validation

**Purpose**: End-to-end verification and regression prevention

- [x] T005 [P] Execute quickstart validation scenarios from `specs/025-fix-database-backup-export/quickstart.md`
- [x] T006 Run full automated test suite (`npm test`) and production build check (`npm run build`)

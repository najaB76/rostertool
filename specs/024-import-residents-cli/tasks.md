# Tasks: Volunteer JSON Import CLI Tool

**Input**: Design documents from `/specs/024-import-residents-cli/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`
**Status**: Ready for implementation

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

---

## Phase 1: Setup

- [x] T001 [P] Register `"import:residents": "tsx scripts/import-residents.ts"` script in `package.json`

---

## Phase 2: User Story 1 - Import Historical & Active Residents from JSON via CLI (Priority: P1)

**Goal**: Implement a robust, idempotent CLI import script that reads `residents.json`, validates records, maps dates to statuses, inserts into `volunteers` and `volunteer_stays`, and supports `--dry-run`.

**Independent Test**: Execute `scripts/import-residents.ts` on sample records and verify `--dry-run` performs 0 writes, live run populates records with correct statuses and stays, and subsequent runs do not create duplicate volunteers.

### Tests for User Story 1

- [x] T002 [P] [US1] Create automated unit and idempotence tests in `tests/engine/import-residents.test.ts`

### Implementation for User Story 1

- [x] T003 [P] [US1] Support sub-region country flags (`GB-SCT` $\rightarrow$ `GB_SCT`, `GB-ENG` $\rightarrow$ `GB_ENG`) in `src/client/components/CountryFlag.tsx`
- [x] T004 [US1] Implement `scripts/import-residents.ts` with CLI argument parsing, `--dry-run`, data validation, status derivation, and SQLite database import
- [x] T005 [US1] Execute `npm run import:residents` on `residents.json` to populate the database

**Checkpoint**: User Story 1 complete - all resident records imported into SQLite with stay history.

---

## Phase 3: Polish & Validation

**Purpose**: End-to-end verification and regression prevention

- [x] T006 [P] Execute quickstart validation scenarios from `specs/024-import-residents-cli/quickstart.md`
- [x] T007 Run full automated test suite (`npm test`) and production build check (`npm run build`)

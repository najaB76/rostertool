# Implementation Plan: Volunteer JSON Import CLI Tool

**Branch**: `024-import-residents-cli` | **Date**: 2026-10-27 | **Spec**: [specs/024-import-residents-cli/spec.md](spec.md)

## Summary
Implement a standalone TypeScript CLI tool `scripts/import-residents.ts` to parse, validate, and import legacy resident records from `residents.json` into SQLite (`volunteers` and `volunteer_stays`), derive status automatically from dates, handle `--dry-run`, support regional sub-code flags (`GB-SCT`, `GB-ENG`) in `CountryFlag.tsx`, and verify via automated unit tests.

## Constitution Check
- **I. Test-First Engine & Invariants**: Tested via unit tests with sample payloads. **PASS**
- **II. Cultural Identity & High-Visibility Flags**: Normalizes `GB-SCT` and `GB-ENG` to display Scottish and English flags. **PASS**
- **III. Self-Hosted Simplicity & Zero-Config**: Zero external service dependencies; uses SQLite directly. **PASS**
- **IV. Human Override & Visual Highlighting**: CLI command with `--dry-run` inspection mode. **PASS**

## Project Structure & File Roadmap
- `scripts/import-residents.ts`: CLI script with parsing, validation, and idempotent DB import.
- `src/client/components/CountryFlag.tsx`: Support hyphenated sub-codes like `GB-SCT` $\rightarrow$ `GB_SCT`.
- `package.json`: Add `"import:residents": "tsx scripts/import-residents.ts"` script.
- `tests/engine/import-residents.test.ts`: Automated tests for mapping, dry-run, idempotence, and stay records.

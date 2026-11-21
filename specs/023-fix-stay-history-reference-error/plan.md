# Implementation Plan: Fix Stay History Modal ReferenceError

**Branch**: `023-fix-stay-history-reference-error` | **Date**: 2026-10-27 | **Spec**: [specs/023-fix-stay-history-reference-error/spec.md](spec.md)

## Summary
Fix `ReferenceError: loadVolunteers is not defined` in `AdminVolunteersPage.tsx` by replacing the identifier with the defined `fetchVolunteers` callback.

## Constitution Check
- **I. Test-First Engine & Invariants**: Verified with client build and integration tests. **PASS**
- **II. Cultural Identity & High-Visibility Flags**: **PASS**
- **III. Self-Hosted Simplicity & Zero-Config**: **PASS**
- **IV. Human Override & Visual Highlighting**: **PASS**

## Project Structure & File Roadmap
- `src/client/pages/AdminVolunteersPage.tsx`: Replace `loadVolunteers` with `fetchVolunteers` on `StayHistoryModal`.

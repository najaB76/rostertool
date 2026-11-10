# Implementation Plan: In-House Volunteer Candidate Filtering for Manual Shift Assignment

**Branch**: `013-manual-assign-in-house-filter` | **Date**: 2026-10-27 | **Spec**: [specs/013-manual-assign-in-house-filter/spec.md](spec.md)

## Summary
Update manual shift assignment candidate selection in `ShiftAssignModal.tsx` and volunteer service so that candidate lists strictly filter out volunteers who are not in-house during the active roster week.

## Constitution Check
- **I. Test-First Engine & Invariants**: Candidate selection preserves stay invariants. **PASS**
- **II. Cultural Identity & High-Visibility Flags**: Flags preserved beside candidate names. **PASS**
- **III. Self-Hosted Simplicity & Zero-Config**: **PASS**
- **IV. Human Override & Visual Highlighting**: In-house candidates highlighted. **PASS**

## Project Structure & File Roadmap
- `src/client/components/ShiftAssignModal.tsx`: Compute week boundaries from `shift.date` and filter out volunteers not in-house during that week.
- `src/server/services/volunteer-service.ts` & `src/server/routes/admin-volunteers.ts`: Add optional query parameters `inHouseStart` and `inHouseEnd` to filter volunteers.
- `tests/api/volunteers.test.ts`: Add test verifying in-house date filtering on volunteers endpoint.

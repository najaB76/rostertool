# Implementation Plan: Headcount In-House Synchronization and Record Deletion

**Branch**: `026-headcount-sync-delete-records` | **Date**: 2026-10-27 | **Spec**: [specs/026-headcount-sync-delete-records/spec.md](spec.md)

## Summary
1. Refactor `HeadcountService.getDailyHeadcounts` to align its in-house volunteer calculation logic with `admin-timeline.ts`, including volunteers with `noEndDate`, point-in-time confirmed stays, and overnight bed departure rules.
2. Implement atomic cascading deletion of volunteers (`DELETE /api/admin/volunteers/:id`) purging all related stays, reviews, shifts, and time-off requests.
3. Implement deletion of individual stay records (`DELETE /api/admin/volunteers/:id/stays/:stayId`).
4. Add user-friendly "Delete Volunteer" buttons with confirmation on `AdminVolunteersPage.tsx` and `VolunteerModal.tsx`.
5. Add "Delete Stay" buttons with confirmation in `StayHistoryModal.tsx`.

## Constitution Check
- **I. Test-First Engine & Invariants**: Parity between headcount and timeline verified by integration tests. Zero-orphan invariant verified by tests. **PASS**
- **II. Cultural Identity & High-Visibility Flags**: **PASS**
- **III. Self-Hosted Simplicity & Zero-Config**: **PASS**
- **IV. Human Override & Visual Highlighting**: Confirmatory deletion dialogs prevent accidental loss. **PASS**

## Project Structure & File Roadmap
- `src/server/services/headcount-service.ts`: Align daily headcount calculation with timeline confirmed in-house logic.
- `src/server/services/volunteer-service.ts`: Add `deleteVolunteer` and `deleteStay` methods.
- `src/server/routes/admin-volunteers.ts`: Register `DELETE /:id` and `DELETE /:id/stays/:stayId`.
- `src/client/pages/AdminVolunteersPage.tsx`: Add Delete Volunteer button.
- `src/client/components/VolunteerModal.tsx`: Add Delete Volunteer button in modal.
- `src/client/components/StayHistoryModal.tsx`: Add Delete Stay button per stay record.
- `tests/api/headcount-sync.test.ts`: Test parity between timeline and headcount endpoints.
- `tests/api/volunteer-deletion.test.ts`: Test cascading deletion with zero orphans.

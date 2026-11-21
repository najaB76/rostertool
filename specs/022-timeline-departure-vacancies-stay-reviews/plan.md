# Implementation Plan: Timeline Departure Date Integrity, Daily Vacancies Row, and Editable Stay Reviews

**Branch**: `022-timeline-departure-vacancies-stay-reviews` | **Date**: 2026-10-27 | **Spec**: [specs/022-timeline-departure-vacancies-stay-reviews/spec.md](spec.md)

## Summary
1. Fix departure date becoming null when scrolling forward on the timeline by ensuring the authoritative stay dates in `volunteers` take precedence over un-synchronized null records in `volunteer_stays`, and synchronizing updates in `updateVolunteer`.
2. Add a "Vacancies (vs Target)" calculation row below "Total CONFIRMED Volunteers" on `/admin/timeline`.
3. Add `PUT /api/admin/volunteers/:id/stays/:stayId` in `admin-volunteers.ts` and an inline review editor in `StayHistoryModal.tsx` allowing coordinators to edit star ratings and review notes.

## Constitution Check
- **I. Test-First Engine & Invariants**: Tested via unit and integration tests. **PASS**
- **II. Cultural Identity & High-Visibility Flags**: **PASS**
- **III. Self-Hosted Simplicity & Zero-Config**: Zero external dependencies. **PASS**
- **IV. Human Override & Visual Highlighting**: Vacancies row highlights bed recruitment needs and reviews can be corrected directly. **PASS**

## Project Structure & File Roadmap
- `src/server/routes/admin-timeline.ts`: Prioritize authoritative volunteer dates over duplicate null stays.
- `src/server/services/volunteer-service.ts`: Synchronize stay dates in `updateVolunteer` and implement `updateStayReview`.
- `src/server/routes/admin-volunteers.ts`: Register `PUT /:id/stays/:stayId`.
- `src/client/pages/AdminTimelinePage.tsx`: Render "Vacancies (vs Target)" row.
- `src/client/components/StayHistoryModal.tsx`: Add inline edit review controls.
- `tests/api/timeline.test.ts`: Add test verifying departure date does not revert to null on forward scroll.
- `tests/api/volunteers-stays.test.ts`: Add test verifying stay review can be edited via PUT.

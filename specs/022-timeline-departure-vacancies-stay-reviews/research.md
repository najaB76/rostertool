# Research & Technical Decisions: Timeline Departure Date Integrity, Daily Vacancies Row, and Editable Stay Reviews

**Feature**: `022-timeline-departure-vacancies-stay-reviews`
**Date**: 2026-10-27
**Status**: Completed

## 1. Root Cause & Solution for Departure Date Null Overwrite

- **Root Cause**:
  - In `src/server/routes/admin-timeline.ts`, `stays` were collected from both `v` (current dates in `volunteers`) and `allStays` (historical records in `volunteer_stays`).
  - When a volunteer's departure date was originally unset or modified, an older un-synchronized record in `volunteer_stays` retained `departureDate: null`.
  - When scrolling forward beyond the real departure date, the real stay was skipped (`stay.departureDate < timelineStart`), but the un-synchronized null record was picked up as an open-ended stay, setting `departureDate: null` and rendering `'????'` indefinitely across all future weeks.
- **Decision**:
  - In `admin-timeline.ts`, if a record in `volunteer_stays` shares the same `arrivalDate` as `v.arrivalDate`, skip the historical copy because `v`'s current record on `volunteers` is the authoritative record for that arrival date.
  - In `volunteer-service.ts` (`updateVolunteer`), synchronize updates to `departureDate`, `arrivalDate`, and `noEndDate` into the matching stay in `volunteer_stays`.

## 2. Daily Vacancies Calculation Row

- **Decision**:
  - Add a row directly beneath "Total CONFIRMED Volunteers" in `AdminTimelinePage.tsx`:
    `Vacancies (vs Target ${baseline})`
  - For each day:
    `vacancies = Math.max(0, baseline - confirmedVolunteers)`
  - Render with soft green vacancy styling (`#dcfce7` / `#15803d`) and tooltip showing `(Target: ${baseline}, Confirmed: ${count})`.

## 3. Editable Past Stay Reviews

- **Decision**:
  - Add `PUT /api/admin/volunteers/:id/stays/:stayId` in `admin-volunteers.ts`.
  - In `volunteer-service.ts`, implement `updateStayReview(stayId, data)` to update `departureRating`, `departureNotes`, and `rehireStatus` on `volunteer_stays` (and `stay_reviews`).
  - In `StayHistoryModal.tsx`, provide an "Edit Review" button per stay allowing coordinators to update the star rating (1-5), departure notes, and rehire status inline.

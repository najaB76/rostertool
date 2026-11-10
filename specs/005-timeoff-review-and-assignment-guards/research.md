# Research & Technical Decisions: Time-Off Review & Assignment Guards

**Feature**: `005-timeoff-review-and-assignment-guards`
**Date**: 2026-10-27
**Status**: Completed

## 1. Administrative Time-Off Review Page

- **Decision**: Create `src/client/pages/AdminTimeOffPage.tsx` and add a `Time Off` link to the main navigation header in `src/client/App.tsx`.
- **Rationale**:
  - The backend endpoints `GET /api/admin/time-off` and `POST /api/admin/time-off/:id/review` already exist in `src/server/routes/admin-timeoff.ts`, but were missing a dedicated administrative interface in the React frontend.
  - Management needs to see pending requests immediately, inspect the volunteer's country flag, requested dates, and trip reason, and approve or decline with a single click.
- **Alternatives Considered**:
  - *Embedding time-off inside the volunteer modal*: Fragmented; managers would have to open every volunteer modal individually to discover pending requests.

---

## 2. Shift Override Warning on Approved Time-Off

- **Decision**: In `src/client/components/ShiftAssignModal.tsx`, intercept the candidate assignment click if the volunteer has approved time-off on that calendar date.
- **Rationale**:
  - Human error is a major cause of scheduling conflicts.
  - When a manager clicks `Assign` on a volunteer with an approved day off, a browser confirmation dialog alerts:
    `"Warning: [Name] has approved time-off on [Date]. Do you want to override and assign them anyway?"`.
  - Clicking Cancel aborts the assignment; clicking OK allows intentional overrides agreed upon offline.
- **Alternatives Considered**:
  - *Hard disabling assignment for approved time-off*: Rejected; managers need override authority in emergency understaffing situations where a volunteer agreed to help out.

---

## 3. Volunteer Self-Service Time-Off Cancellation

- **Decision**: Expose `POST /api/portal/time-off/:id/cancel` in `src/server/routes/portal.ts` and add a "Cancel Request" button on `src/client/pages/VolunteerPortalPage.tsx`.
- **Rationale**:
  - Volunteers whose travel plans change should be able to release their leave requests without manager intervention.
  - The endpoint verifies token ownership (`request.params.id` must belong to the authenticated volunteer), updates status to `'Cancelled'`, and frees the volunteer for shift scheduling.
- **Alternatives Considered**:
  - *Hard deleting the record*: Rejected; maintaining a `'Cancelled'` status preserves audit history for both management and the volunteer.

---

## 4. Reception Qualification Guard

- **Decision**: In `src/client/components/ShiftAssignModal.tsx`, strictly disable the "Assign" button (`disabled={true}`, `cursor: not-allowed`, background `#e2e8f0`) for volunteers who are not reception-qualified when assigning a Reception shift (`Reception Day` or `Reception Evening`).
- **Rationale**:
  - Reception shifts require English fluency and customer focus training.
  - Disabling the button directly at the UI layer prevents accidental placement of unqualified volunteers while keeping the candidate visible for transparency.
  - On Housekeeping shifts, the button remains active for all volunteers.

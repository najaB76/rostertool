# Implementation Plan: Time-Off Review & Assignment Guards

**Branch**: `005-timeoff-review-and-assignment-guards` | **Date**: 2026-10-27 | **Spec**: [specs/005-timeoff-review-and-assignment-guards/spec.md](spec.md)

**Input**: Feature specification from `specs/005-timeoff-review-and-assignment-guards/spec.md`

## Summary

Implement four scheduling integrity and leave management improvements:
1. Build an administrative Time-Off review page (`AdminTimeOffPage`) linked in the main header with 1-click Approve/Decline actions.
2. Add a browser confirmation dialog warning when manually assigning a volunteer on a date with approved time-off.
3. Allow volunteers to cancel their pending/upcoming time-off requests directly in the self-service portal.
4. Strictly disable the "Assign" button for volunteers who are not reception-qualified when assigning Reception shifts.

## Technical Context

**Language/Version**: Node.js (v22 LTS) & TypeScript 5.8+

**Primary Dependencies**: Fastify 5.x, React 19, Vite 8, Drizzle ORM

**Storage**: SQLite (`data/rostertool.sqlite`) with WAL mode

**Testing**: Vitest (`npm test`)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Gate | Requirement | Architecture Compliance | Status |
|---|---|---|---|
| **I. Test-First Engine & Invariants** | Approved time-off collisions strictly handled; qualification invariants preserved. | Solver and manual UI enforce qualification and time-off rules. | **PASS** |
| **II. Cultural Identity & High-Visibility Flags** | Flags visible in time-off hub. | Volunteer country flags rendered alongside names in the time-off review table. | **PASS** |
| **III. Self-Hosted Simplicity & Zero-Config** | Embedded SQLite, offline self-contained. | Pure relational queries in existing `time_off_requests` schema. | **PASS** |
| **IV. Human Override & Visual Highlighting** | Overrides remain possible with explicit confirmation. | Warning prompt prevents accidental double-bookings while preserving manager authority. | **PASS** |
| **V. Low-Friction Magic-Link Access** | Self-service cancellation via magic token. | Portal cancellation authenticated securely via token without passwords. | **PASS** |

---

## Project Structure & File Modifications

### Backend (`src/server/`)
- `src/server/routes/portal.ts`: Expose `POST /api/portal/time-off/:id/cancel` (token validated).
- `tests/api/portal.test.ts`: Add test for volunteer time-off cancellation.

### Client UI (`src/client/`)
- `src/client/App.tsx`: Add "Time Off" link to header navigation and register `/admin/time-off` route.
- `src/client/pages/AdminTimeOffPage.tsx`: New management view listing time-off requests with Approve and Decline actions and status filtering.
- `src/client/pages/VolunteerPortalPage.tsx`: Add "Cancel Request" action for pending/upcoming time-off requests.
- `src/client/components/ShiftAssignModal.tsx`:
  - Add override warning confirmation when assigning on approved time-off.
  - Disable "Assign" button for reception-unqualified volunteers on Reception shifts.

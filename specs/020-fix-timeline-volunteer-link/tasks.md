# Tasks: Fix Volunteer by ID Route for Timeline Hyperlink

**Input**: Design documents from `/specs/020-fix-timeline-volunteer-link/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`
**Status**: Ready for implementation

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

---

## Phase 1: Setup

- [x] T001 [P] Verify project dependencies and environment in `package.json`

---

## Phase 2: User Story 1 - Click Volunteer Name to Load and Edit Volunteer Data (Priority: P1)

**Goal**: Implement `GET /api/admin/volunteers/:id` and `POST /api/admin/volunteers/:id` in the API router so clicking volunteer name hyperlinks on `/admin/timeline` successfully fetches the volunteer's record and opens `VolunteerModal` without 404 errors.

**Independent Test**: Query `GET /api/admin/volunteers/:id` with a valid volunteer ID $\rightarrow$ returns 200 with volunteer details. Query with invalid ID $\rightarrow$ returns 404 `{ error: 'Volunteer not found' }`. On `/admin/timeline`, click any volunteer name link $\rightarrow$ `VolunteerModal` opens populated with their data and 0 console errors.

### Tests for User Story 1

- [x] T002 [P] [US1] Add integration test in `tests/api/volunteers.test.ts` verifying `GET /api/admin/volunteers/:id` returns 200 with details and 404 for invalid ID, and `POST /api/admin/volunteers/:id` updates details

### Implementation for User Story 1

- [x] T003 [US1] Register `fastify.get('/:id')` and `fastify.post('/:id')` in `src/server/routes/admin-volunteers.ts` calling `volunteerService.getVolunteerById` and `volunteerService.updateVolunteer`

**Checkpoint**: User Story 1 complete - volunteer by ID endpoint is operational and timeline name hyperlinks open `VolunteerModal` without 404s.

---

## Phase 3: Polish & Validation

**Purpose**: End-to-end verification and regression prevention

- [x] T004 [P] Execute quickstart validation scenarios from `specs/020-fix-timeline-volunteer-link/quickstart.md`
- [x] T005 Run full automated test suite (`npm test`) and production build check (`npm run build`)

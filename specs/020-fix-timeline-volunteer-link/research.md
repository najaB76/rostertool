# Research & Technical Decisions: Fix Volunteer by ID Route for Timeline Hyperlink

**Feature**: `020-fix-timeline-volunteer-link`
**Date**: 2026-10-27
**Status**: Completed

## 1. Missing `GET /:id` Route in `admin-volunteers.ts`

- **Decision**:
  - Add `fastify.get('/:id')` to `src/server/routes/admin-volunteers.ts`.
  - Call `volunteerService.getVolunteerById(request.params.id)`.
  - Return HTTP 200 with the full volunteer object (including stay history and resolved source), or HTTP 404 `{ error: 'Volunteer not found' }` if absent.
  - Also register `fastify.post('/:id')` mirroring `fastify.put('/:id')` for flexible client updates.
- **Rationale**:
  - `AdminTimelinePage.tsx` expects to fetch individual volunteer records via `GET /api/admin/volunteers/:id`.
  - Previously, `admin-volunteers.ts` only exposed `GET /`, causing all requests to specific volunteer IDs to hit a Fastify 404 route handler.

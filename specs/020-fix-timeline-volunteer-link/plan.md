# Implementation Plan: Fix Volunteer by ID Route for Timeline Hyperlink

**Branch**: `020-fix-timeline-volunteer-link` | **Date**: 2026-10-27 | **Spec**: [specs/020-fix-timeline-volunteer-link/spec.md](spec.md)

## Summary
Add `GET /api/admin/volunteers/:id` and `POST /api/admin/volunteers/:id` endpoints to `src/server/routes/admin-volunteers.ts` to allow fetching and editing individual volunteer records directly, eliminating the 404 error when clicking name hyperlinks on the timeline.

## Constitution Check
- **I. Test-First Engine & Invariants**: Tested via unit and integration tests. **PASS**
- **II. Cultural Identity & High-Visibility Flags**: **PASS**
- **III. Self-Hosted Simplicity & Zero-Config**: Zero external dependencies. **PASS**
- **IV. Human Override & Visual Highlighting**: Enables direct timeline inspection and edits. **PASS**

## Project Structure & File Roadmap
- `src/server/routes/admin-volunteers.ts`: Register `GET /:id` and `POST /:id` routes.
- `tests/api/volunteers.test.ts`: Add test verifying `GET /api/admin/volunteers/:id` returns 200 with volunteer details and 404 for invalid ID.

# Implementation Plan: Volunteer Profile Pictures and CSS Style Decoupling

**Branch**: `031-volunteer-profile-pictures-and-css` | **Date**: 2026-10-27 | **Spec**: [specs/031-volunteer-profile-pictures-and-css/spec.md](spec.md)

## Summary
1. Add `profile_picture` column to `volunteers` table in schema and startup migration.
2. Update backend services (`volunteer-service.ts`) and routes to support `profilePicture`.
3. Create `ImageLightboxModal` component with `(✕)` close control, backdrop click dismiss, and `Escape` keyboard dismiss.
4. Implement photo upload, preview, update, and remove in `VolunteerModal.tsx` and display thumbnail next to preferred name.
5. Display profile picture thumbnail on volunteer cards in `AdminVolunteersPage.tsx` with click-to-lightbox.
6. Replace repetitive inline styles with semantic CSS classes and variables in `src/client/styles/main.css`.

## Constitution Check
- **I. Test-First Engine & Invariants**: Full test suite and production build pass. **PASS**
- **II. Cultural Identity & High-Visibility Flags**: Unaffected; thumbnail integrates cleanly alongside name and country flag. **PASS**
- **III. Self-Hosted Simplicity & Zero-Config**: Base64 Data URLs stored in SQLite; no external storage or S3 buckets needed. **PASS**
- **IV. Human Override & Visual Highlighting**: Lightbox overlay dismissible via multiple accessible methods. **PASS**

## Project Structure & File Roadmap
- `src/server/db/schema.ts`: Add `profilePicture` column to `volunteers` table.
- `src/server/db/client.ts`: Add PRAGMA migration for `profile_picture`.
- `src/server/services/volunteer-service.ts`: Handle `profilePicture` in create and update methods.
- `src/client/components/ImageLightboxModal.tsx`: New component for full-sized image view with keyboard and click dismissal.
- `src/client/components/VolunteerModal.tsx`: Integrate profile picture upload/update/remove and thumbnail next to preferred name.
- `src/client/pages/AdminVolunteersPage.tsx`: Render thumbnail next to preferred name on cards and connect lightbox.
- `src/client/styles/main.css`: Add styles for thumbnail, upload placeholder, remove button, lightbox modal, and decouple inline styles.
- `tests/api/volunteers.test.ts`: Add tests for profile picture persistence.

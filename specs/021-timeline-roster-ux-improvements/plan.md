# Implementation Plan: Timeline Hierarchy, Roster Assignment Accuracy, and Visual Enhancements

**Branch**: `021-timeline-roster-ux-improvements` | **Date**: 2026-10-27 | **Spec**: [specs/021-timeline-roster-ux-improvements/spec.md](spec.md)

## Summary
Align the timeline hierarchy so confirmed staff (`Active` and `Accepted`) populate Reception and Housekeeping with overall confirmed totals while candidates in the `'Applied'` state populate the bottom unconfirmed pool, refine manual shift assignment candidate filtering to strictly match the shift date's in-house presence, add sticky name columns and date column highlighting to the timeline, and style trainee shift assignments with light yellow on the printable roster.

## Constitution Check
- **I. Test-First Engine & Invariants**: Candidate filtering and timeline tiers verified with tests. **PASS**
- **II. Cultural Identity & High-Visibility Flags**: Authentic SVG flags preserved in sticky name column. **PASS**
- **III. Self-Hosted Simplicity & Zero-Config**: Zero external dependencies. **PASS**
- **IV. Human Override & Visual Highlighting**: Trainee yellow background and clickable date column highlighting. **PASS**

## Project Structure & File Roadmap
- `src/server/routes/admin-timeline.ts`: Place `Active` and `Accepted` volunteers into `reception` or `housekeeping`, and `Applied` volunteers into `applied`.
- `src/client/components/ShiftAssignModal.tsx`: Filter candidate volunteers strictly against `shift.date` presence.
- `src/client/pages/AdminTimelinePage.tsx`: Add `position: sticky` to Sex and Name columns, and implement clickable date column highlighting.
- `src/client/components/PrintableRosterView.tsx`: Style trainee shift assignments with light yellow background (`#fef9c3`).
- `tests/api/timeline.test.ts`: Verify `Accepted` volunteers appear in Reception/Housekeeping and `Applied` in applied section.

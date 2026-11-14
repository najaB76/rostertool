# Implementation Plan: Timeline Applied Candidates Population & Resizable Modal Fix

**Branch**: `019-timeline-applied-and-modal-resize` | **Date**: 2026-10-27 | **Spec**: [specs/019-timeline-applied-candidates-and-modal-resize/spec.md](spec.md)

## Summary
1. Update `src/server/routes/admin-timeline.ts` so that incoming accepted and applied volunteers are populated in `appliedEntries`, showing their stay bars for the dates they have been accepted for, and driving the `dailyAppliedCounts` running total row.
2. Update `src/client/components/VolunteerModal.tsx` to add an interactive mouse-drag resize handle at the bottom-right corner for reliable cross-browser dialog resizing.

## Constitution Check
- **I. Test-First Engine & Invariants**: Candidate timeline allocation and daily counts verified in tests. **PASS**
- **II. Cultural Identity & High-Visibility Flags**: **PASS**
- **III. Self-Hosted Simplicity & Zero-Config**: Zero external library dependencies. **PASS**
- **IV. Human Override & Visual Highlighting**: Candidate visibility and interactive resize ergonomics. **PASS**

## Project Structure & File Roadmap
- `src/server/routes/admin-timeline.ts`: Include `Accepted` and `Applied` volunteers in `appliedEntries`.
- `src/client/components/VolunteerModal.tsx`: Add interactive mouse-drag resize handler and corner grip.
- `tests/api/timeline.test.ts`: Add test asserting `Accepted` volunteers appear in `appliedEntries` for their accepted dates and drive `dailyAppliedCounts`.

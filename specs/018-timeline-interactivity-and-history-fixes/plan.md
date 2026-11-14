# Implementation Plan: Timeline Interactivity, Historical Staffing, and Volunteer Edit Enhancements

**Branch**: `018-timeline-interactivity-and-history-fixes` | **Date**: 2026-10-27 | **Spec**: [specs/018-timeline-interactivity-and-history-fixes/spec.md](spec.md)

## Summary
Implement interactive timeline features (name link to edit modal, status pill actions), historical point-in-time staffing when scrolling back in time, daily running total for applied candidates, fix volunteer source synchronization bug, and make the volunteer edit modal resizable and Esc-dismissible.

## Constitution Check
- **I. Test-First Engine & Invariants**: Historical timeline and stay boundaries strictly verified in tests. **PASS**
- **II. Cultural Identity & High-Visibility Flags**: Authentic SVG flags preserved adjacent to names. **PASS**
- **III. Self-Hosted Simplicity & Zero-Config**: Zero external service dependencies. **PASS**
- **IV. Human Override & Visual Highlighting**: Full direct manipulation and lifecycle transitions on timeline. **PASS**

## Project Structure & File Roadmap
- `src/server/services/volunteer-service.ts`: Synchronize `source` and `applicationSourceName` during update and create.
- `src/server/routes/admin-timeline.ts`: Query volunteers with active or historical stays in the requested window, compute point-in-time status, calculate `dailyAppliedCounts`.
- `src/client/pages/AdminTimelinePage.tsx`: Make volunteer names clickable, make status pills interactive buttons with action dropdown (integrating `DepartureModal` and `ReactivateModal`), add "Total APPLIED Candidates" row.
- `src/client/components/VolunteerModal.tsx`: Add `resize: both` and keyboard `Escape` dismissal listener.
- `tests/api/timeline.test.ts`: Add tests for historical stays and `dailyAppliedCounts`.

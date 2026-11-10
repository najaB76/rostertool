# Implementation Plan: Dynamic Headcount Capacity Settings Integration

**Branch**: `014-headcount-settings-sync` | **Date**: 2026-10-27 | **Spec**: [specs/014-headcount-settings-sync/spec.md](spec.md)

## Summary
Connect the Capacity Management (`/admin/headcount`) page and backend `HeadcountService` to dynamic `system_settings` thresholds, eliminating hardcoded benchmarks in the legend banner and status calculation.

## Constitution Check
- **I. Test-First Engine & Invariants**: Tested in `headcount.test.ts`. **PASS**
- **II. Cultural Identity & High-Visibility Flags**: **PASS**
- **III. Self-Hosted Simplicity & Zero-Config**: **PASS**
- **IV. Human Override & Visual Highlighting**: Visual indicators driven by live settings. **PASS**

## Project Structure & File Roadmap
- `src/server/services/headcount-service.ts`: Query `systemSettings` and dynamically compute `status`.
- `src/client/pages/AdminHeadcountPage.tsx`: Fetch settings and dynamically render Capacity Benchmarks banner.
- `tests/api/headcount.test.ts`: Add test verifying dynamic status calculation.

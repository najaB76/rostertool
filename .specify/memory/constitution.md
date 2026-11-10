<!--
Sync Impact Report:
- Version change: [CONSTITUTION_VERSION] -> 1.0.0
- List of modified principles:
  - [PRINCIPLE_1_NAME] -> I. Test-First Rostering & Constraint Engine (NON-NEGOTIABLE)
  - [PRINCIPLE_2_NAME] -> II. Cultural Identity & High-Visibility Country Flags (NON-NEGOTIABLE)
  - [PRINCIPLE_3_NAME] -> III. Self-Hosted Simplicity & Zero-Config Persistence
  - [PRINCIPLE_4_NAME] -> IV. Human-in-the-Loop Override & Highlighting
  - [PRINCIPLE_5_NAME] -> V. Low-Friction Magic-Link Access
- Added sections:
  - Technology & Operational Constraints
  - Quality Standards & Validation Gates
- Removed sections: None
- Templates requiring updates:
  - .specify/templates/plan-template.md: ✅ aligned
  - .specify/templates/spec-template.md: ✅ aligned
  - .specify/templates/tasks-template.md: ✅ aligned
- Follow-up TODOs: None
-->

# RosterTool Constitution

## Core Principles

### I. Test-First Rostering & Constraint Engine (NON-NEGOTIABLE)
All scheduling logic (hard constraints: arrival/departure dates, approved time-off requests, 16h/week standard or pro-rated targets, role qualifications, turnaround rest between shifts, trainer-trainee pairing; soft constraints: 3 consecutive days off per 14-day rolling window, weekend shift balancing) MUST be developed Test-First (TDD). Tests MUST be written and verified failing before implementation. The rostering solver MUST be deterministic, pure, and decoupled from persistence and presentation layers.

### II. Cultural Identity & High-Visibility Country Flags (NON-NEGOTIABLE)
Volunteers in the hostel originate from across the globe, and visual nationality cues are central to community and roster readability. Every visual representation of a volunteer—including weekly roster tables, shift assignments, application lists, profile cards, and selector dropdowns—MUST prominently display the volunteer's country flag (using ISO 3166-1 alpha-2 codes rendered via emoji or crisp SVG icons) directly adjacent to their name, conforming to the visual convention demonstrated in `WhatsApp Image 2026-10-25 at 16.01.45.jpeg`. Nationality is a mandatory field for all volunteers.

### III. Self-Hosted Simplicity & Zero-Config Persistence
The system is built with Node.js and TypeScript, designed specifically for self-hosted operation on internal Proxmox infrastructure (via Linux container, VM, or Docker). Data persistence MUST use an embedded, file-based database (SQLite) with WAL mode enabled to ensure zero-maintenance operations, trivial file-based backups, and zero external database daemon dependencies.

### IV. Human-in-the-Loop Override & Visual Highlighting
Auto-scheduling is an assistive tool, not an autonomous authority. Management MUST be able to manually assign, reassign, or clear any shift slot at any time. Any shift that fails to meet required staffing levels (e.g., minimum 3 housekeepers, unassigned reception shifts) MUST be prominently visually highlighted on the weekly grid to enable management to quickly intervene and offer additional paid shifts. Volunteer profiles, dates, and notes MUST remain editable across all lifecycle phases.

### V. Low-Friction Magic-Link Access
Volunteers are temporary hostel residents and must not be burdened with password registration workflows. Volunteer self-service (viewing personal and hostel weekly rosters, submitting time-off requests) MUST be secured via unique, revocable, and management-resettable magic links (cryptographic tokens). Management operations are protected under an administrative authentication session.

## Technology & Operational Constraints

- **Stack:** Node.js, TypeScript, modern lightweight web frontend (React/Vite).
- **Storage:** SQLite with WAL mode, managed via a type-safe query builder or ORM.
- **Rostering Cycle:** Monday through Sunday weekly periods.
- **Shift Definitions:**
  - Housekeeping: 10:00–14:00 (4 hours), 7 days/week, minimum 3 volunteers/day (configurable). Standard workload: 4 shifts/week = 16 hours.
  - Reception Day: 08:00–18:00 (10 hours). Normally covered by 1 of 3 paid staff; volunteer-coverable during paid staff PTO.
  - Reception Evening: 16:00–00:00 (Sun–Thu) / 17:00–01:00 (Fri–Sat) (8 hours). Standard volunteer workload: 2 shifts/week = 16 hours.
  - Reception Graveyard: Fri & Sat nights 00:00/01:00–08:00 (7–8 hours). Optional / seasonal.
- **Volunteer Lifecycle States:** `Applied` -> `Accepted` (arrival & departure dates locked, pro-rated mid-week shifts) -> `Active` (eligible for rostering) -> `Departed` (review & notes captured) / `Cancelled`.
- **Volunteer Capacity Baseline:** Target 12 volunteers at all times; operational tolerance buffer between 10 (low staffing warning) and 15 (short overlap warning during mid-week turnover).
- **Target Deployment:** Self-hosted internal Proxmox server (Linux LXC / VM / Docker).
- **Client Form Factor:** Responsive desktop interface for management and mobile-optimized viewport for volunteer portal.

## Quality Standards & Validation Gates

- **Type Safety:** Strict TypeScript enabled (`noImplicitAny: true`, strict null checks). No unsafe `any` casts.
- **Rostering Engine Verification:** 100% test pass rate on automated scheduling scenarios covering:
  - Hard constraint compliance (no double booking, no scheduling on approved time-off, respecting stay dates).
  - Trainee/trainer concurrent scheduling on the same shift.
  - Mid-week pro-rated hour targets.
  - Minimum turnaround rest between night shifts and morning shifts.
  - Soft constraint scoring (3 days off per 14 days, weekend fairness).
- **Visual Polish & Flags:** All volunteer selectors and grid cells must gracefully render country flags with fallback to country code or globe icon if an unknown country is entered.

## Governance

- The Constitution supersedes all ad-hoc conventions and represents non-negotiable architectural invariants.
- Amendments require updating this document with an incremented version number, updating the Sync Impact Report, and verifying all dependent templates remain compliant.
- Semantic Versioning:
  - MAJOR: Incompatible changes to core principles, shift structure, or governance rules.
  - MINOR: Additions of new principles, shift types, or constraint rules.
  - PATCH: Wording refinements, typo corrections, or clarifications.

**Version**: 1.0.0 | **Ratified**: 2026-10-27 | **Last Amended**: 2026-10-27

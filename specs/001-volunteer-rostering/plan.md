# Implementation Plan: Hostel Volunteer Rostering

**Branch**: `001-volunteer-rostering` | **Date**: 2026-10-27 | **Spec**: [specs/001-volunteer-rostering/spec.md](spec.md)

**Input**: Feature specification from `/specs/001-volunteer-rostering/spec.md`

## Summary

Build an internal web application for hostel volunteer management and weekly shift rostering. The system features a decoupled, deterministic constraint-satisfaction rostering engine (supporting hard constraints like stay dates, 16h weekly caps, pro-rated mid-week arrivals, turnaround rest, and trainee/trainer pairing; plus soft constraints like 3 consecutive days off in 14 days and weekend fairness). It includes a full volunteer lifecycle tracker, application source taxonomy, future re-application acceptance recommendations, a daily headcount capacity calendar (12 target baseline, 10–11 low warning, 13–15 overlap warning), visual unstaffed shift highlighting, prominent country flag display for all volunteers, and a passwordless magic-link volunteer self-service portal.

## Technical Context

**Language/Version**: Node.js (v20+ LTS / v22) & TypeScript 5.x

**Primary Dependencies**: Fastify (backend HTTP framework & static file server), Drizzle ORM (type-safe SQLite query engine), React 18+ & Vite (frontend SPA)

**Storage**: SQLite with Write-Ahead Logging (`better-sqlite3`, WAL mode enabled) stored in `data/rostertool.sqlite`

**Testing**: Vitest (pure engine unit tests, schema migrations, and REST API route tests)

**Target Platform**: Linux server / Proxmox LXC container or Docker container

**Project Type**: Fullstack Web Application (Pure Domain Engine + Backend API + Frontend SPA)

**Performance Goals**: Auto-populate weekly schedule in < 5 seconds; headcount calendar response in < 500ms; client shift adjustment in 2 clicks or fewer

**Constraints**: Embedded single-process deployment; zero external database daemons; offline-capable on local hostel network; crisp country flag rendering across all client platforms

**Scale/Scope**: ~10–20 active volunteers, 3 paid staff, ~20–30 shift slots/week, single-hostel internal deployment

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Gate | Requirement | Architecture Compliance | Status |
|---|---|---|---|
| **I. Test-First Rostering & Constraint Engine** | Scheduling engine must be pure, deterministic, decoupled from DB/HTTP, and developed TDD. | The constraint solver lives in `src/engine/` as pure functions accepting plain input objects and returning structured outputs with diagnostic audit logs. 100% test coverage before UI wiring. | **PASS** |
| **II. Cultural Identity & High-Visibility Flags** | Country flags displayed adjacent to volunteer names in all views, grids, and selectors. | Volunteers store ISO 3166-1 alpha-2 codes. Frontend uses an SVG-based flag component with fallback to guarantee crisp rendering on Windows/Linux/mobile without external CDN. | **PASS** |
| **III. Self-Hosted Simplicity & Zero-Config** | Embedded SQLite with WAL mode, single-binary / container deployable on Proxmox. | Uses `better-sqlite3` with WAL mode and Drizzle ORM. Zero external DB daemons. File-based backups via `.sqlite` copy. | **PASS** |
| **IV. Human Override & Visual Highlighting** | Management can override any slot; unstaffed or under-capacity slots must be visually highlighted. | Manual assignment mutations supported at any time. Weekly grid and Headcount Calendar compute coverage gaps and flag understaffed/overlap states immediately. | **PASS** |
| **V. Low-Friction Magic-Link Access** | Passwordless volunteer portal via resettable cryptographic URL tokens. | Cryptographically random tokens generated on volunteer acceptance, accessible without passwords, revocable/regenerable by management. | **PASS** |

*Post-Phase 1 Design Re-Check: All gates verified. No architectural violations.*

---

## Project Structure

### Documentation (this feature)

```text
specs/001-volunteer-rostering/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Technical decisions & rationale
├── data-model.md        # Relational schema, SQLite tables & lifecycle state machine
├── quickstart.md        # Prerequisites, setup, testing, and verification scenarios
├── contracts/
│   ├── api-spec.json    # OpenAPI 3.0 specification (Admin + Volunteer Portal)
│   └── rostering-engine-contract.md # Pure engine domain types & interface
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── tasks.md             # Generated in Phase 2 (/speckit.tasks)
```

### Source Code (repository root)

```text
rostertool/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── drizzle.config.ts
├── data/
│   └── rostertool.sqlite       # Local SQLite database with WAL
├── src/
│   ├── engine/                 # Principle I: Pure, decoupled rostering solver
│   │   ├── types.ts            # Rostering engine domain contracts
│   │   ├── solver.ts           # Backtracking heuristic CSP solver
│   │   ├── hard-constraints.ts # Date bounds, hours cap, pro-rating, rest, pairing
│   │   ├── soft-constraints.ts # 3-day rest bonus, weekend fairness scoring
│   │   └── pro-rate.ts         # Mid-week arrival hour calculation
│   ├── server/                 # Backend API (Fastify)
│   │   ├── index.ts            # Entrypoint & server bootstrap
│   │   ├── db/
│   │   │   ├── schema.ts       # Drizzle SQLite schema definitions
│   │   │   ├── client.ts       # better-sqlite3 connection with WAL
│   │   │   ├── migrate.ts      # Migration runner
│   │   │   └── seed.ts         # Shift definitions & default sources
│   │   ├── routes/
│   │   │   ├── admin-volunteers.ts
│   │   │   ├── admin-roster.ts
│   │   │   ├── admin-headcount.ts
│   │   │   ├── admin-timeoff.ts
│   │   │   └── portal.ts       # Magic-link authenticated endpoints
│   │   └── services/
│   │       ├── volunteer-service.ts
│   │       ├── roster-service.ts
│   │       └── headcount-service.ts
│   └── client/                 # Frontend SPA (React + TypeScript)
│       ├── index.html
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       │   ├── CountryFlag.tsx # Principle II: Crisp ISO flag renderer
│       │   ├── RosterGrid.tsx  # Weekly Mon-Sun visual grid with highlights
│       │   ├── HeadcountCalendar.tsx # 12-target, overlap & low warning calendar
│       │   ├── VolunteerModal.tsx    # Add/edit volunteer & stay preview
│       │   ├── TimeOffModal.tsx
│       │   └── ShiftSlotCell.tsx
│       ├── pages/
│       │   ├── AdminRosterPage.tsx
│       │   ├── AdminVolunteersPage.tsx
│       │   ├── AdminHeadcountPage.tsx
│       │   └── VolunteerPortalPage.tsx # Mobile-optimized portal
│       └── styles/
│           └── main.css        # Vanilla responsive styling
└── tests/
    ├── engine/
    │   ├── hard-constraints.test.ts
    │   ├── soft-constraints.test.ts
    │   ├── trainer-pairing.test.ts
    │   ├── pro-rating.test.ts
    │   └── solver.test.ts
    └── api/
        ├── volunteers.test.ts
        ├── roster.test.ts
        └── portal.test.ts
```

**Structure Decision**: Web application layout combining a pure domain `src/engine/` core with a Fastify `src/server/` API and Vite React `src/client/` frontend. This delivers strict compliance with Constitution Principles I, II, III, IV, and V.

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| None | N/A | N/A |

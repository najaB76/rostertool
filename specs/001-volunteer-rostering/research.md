# Research & Technical Decisions: Hostel Volunteer Rostering

**Feature**: `001-volunteer-rostering`
**Date**: 2026-10-27
**Status**: Completed

## 1. Backend Runtime & Web Framework

- **Decision**: Node.js (v20+ LTS / v22) with TypeScript and **Fastify**.
- **Rationale**: 
  - Fastify has first-class TypeScript support, built-in schema validation (via TypeBox or Zod), structured logging, and minimal runtime overhead.
  - Serves both REST API endpoints and static compiled frontend assets seamlessly from a single Node process, simplifying Proxmox self-hosting.
- **Alternatives Considered**:
  - *Express*: Widespread but requires extra boilerplate for type safety, async error handling, and manual validation wiring.
  - *NestJS*: Heavy architectural abstraction and reflection-based dependency injection, violating Principle III (Simplicity).

---

## 2. Database & Data Persistence

- **Decision**: **SQLite** via `better-sqlite3` with Write-Ahead Logging (`PRAGMA journal_mode = WAL;`) and **Drizzle ORM** (or Kysely).
- **Rationale**:
  - Mandated by Principle III: Embedded, file-based persistence for zero-config operation and trivial backups (copying a single `.sqlite` file on Proxmox).
  - `better-sqlite3` is synchronous, rock-solid, and fastest SQLite driver in Node.js.
  - WAL mode allows concurrent reads during writes and avoids database locks.
  - Drizzle ORM provides 100% type safety, schema definitions in TypeScript, automatic migrations, and zero query overhead.
- **Alternatives Considered**:
  - *PostgreSQL*: Requires external daemon, credentials management, and ongoing maintenance on Proxmox; unnecessary for hostel scale (~10-20 volunteers, hundreds of shifts/year).
  - *Prisma*: Heavy client generation binary, slower cold starts, and excessive schema overhead.

---

## 3. Auto-Rostering Constraint Solver Architecture

- **Decision**: **Pure Deterministic Heuristic Constraint Satisfaction Problem (CSP) Engine** with two-phase evaluation:
  1. *Phase 1 (Hard Filtering)*: Candidate domain reduction per shift slot:
     - Active stay date boundaries ($Arrival \le Date \le Departure$).
     - Mid-week pro-rated weekly target hours check ($CurrentHours + ShiftHours \le MaxTargetHours$).
     - Role eligibility (e.g., reception shifts require `is_reception_qualified`).
     - Blackout collisions (no approved time-off requests on $Date$).
     - Minimum rest turnaround ($\ge 9$ hours between consecutive shifts; e.g. evening shift ending $\ge 00:00$ precludes next morning's $10:00$ HK shift).
     - Trainer pairing: If candidate is `in_training`, slot assignment must concurrently pair with an available candidate having `is_trainer = true`.
  2. *Phase 2 (Soft Optimization & Scoring)*: Priority heuristics for slot assignment:
     - Least-Assigned First: Volunteers furthest below their target weekly hours are prioritized.
     - 14-day Rolling Rest window: High penalty for breaking the "at least 3 consecutive days off in 14 days" rule.
     - Weekend shift fairness: Equalizes distribution of Friday, Saturday, and Sunday shifts.
- **Rationale**:
  - Hostels have small discrete staff pools (10–15 volunteers, ~20–30 slots/week). A deterministic heuristic backtracking solver runs in milliseconds (< 50ms), producing reproducible, explainable schedules and clear diagnostic rejection reasons.
  - Decoupled from HTTP and DB layers as mandated by Principle I and Principle II.
- **Alternatives Considered**:
  - *External SAT/SMT Solvers (Z3, GLPK)*: Native C/Wasm bindings add operational complexity to container builds on Proxmox without meaningful gain for ~30 slots/week.
  - *Randomized Genetic Algorithms*: Non-deterministic output, difficult to explain to management, and hard to test deterministically.

---

## 4. Cultural Identity & Country Flag Display

- **Decision**: Standardized **ISO 3166-1 alpha-2** country code storage (e.g. `FR`, `BR`, `US`, `DE`), rendered in the frontend via inline SVG country flag components / CSS sprite (`flag-icons` or country-flag SVG package) with Unicode regional indicator emoji fallback.
- **Rationale**:
  - Mandated by Principle II: Country flags are non-negotiable and must display adjacent to names in every view, matching `WhatsApp Image 2026-10-25 at 16.01.45.jpeg`.
  - Windows desktop browsers historically have poor rendering for Unicode flag emojis (often rendering two-letter codes instead of flags). Using lightweight SVG flag icons guarantees 100% crisp, uniform rendering across Proxmox client machines, Windows, Linux, macOS, iOS, and Android.
- **Alternatives Considered**:
  - *Raw emoji text only*: Unreliable rendering on Windows desktop management terminals.
  - *External image CDN (e.g. flagcdn)*: Violates self-hosted offline reliability principle if external internet is degraded.

---

## 5. Authentication & Access Control

- **Decision**:
  - **Management Access**: Session-based authentication with secure HTTP-only cookies protected by an admin master password or PIN defined in local server configuration / `.env`.
  - **Volunteer Portal Access**: Unique, cryptographically secure 256-bit URL tokens (`magic_link_token`, e.g. `https://hostel.local/portal?token=abc123...`). Management can view, copy, or regenerate/revoke the token at any time.
- **Rationale**:
  - Principle V mandates zero-friction volunteer access without password management.
  - Volunteers can bookmark their link on their phone during their 2–8 week hostel stay.
  - Resettable tokens give management immediate revocation control if a phone is lost or shared.
- **Alternatives Considered**:
  - *Email-based OTP / magic link email sending*: Hostels frequently do not run local SMTP mail servers and volunteer emails often fail spam filtering. A direct copyable link for WhatsApp/messaging is far more practical.
  - *Standard username/password for volunteers*: High support overhead for short-term volunteers forgetting credentials.

---

## 6. Frontend Architecture & Styling

- **Decision**: **React (TypeScript) + Vite**, with clean, responsive **Vanilla CSS / CSS Modules**.
- **Rationale**:
  - Delivers a snappy desktop grid for management with drag-and-drop or 2-click shift assignment, and a mobile-first responsive layout for the volunteer portal.
  - Avoids bloated CSS utility dependencies, ensuring fast builds and lightweight assets.
- **Alternatives Considered**:
  - *Server-Side Rendered (EJS/Pug)*: Clunky interactive experience for drag-and-drop scheduling, weekly grid manipulation, and instant headcount calculations.
  - *Next.js*: Unnecessary server-side rendering complexity and Node server overhead for an internal hostel tool.

---

## 7. Capacity & Headcount Tracking Architecture

- **Decision**:
  - Daily headcount aggregated dynamically via indexed SQL date-range queries:
    `SELECT date, COUNT(*) FROM volunteers WHERE status IN ('Accepted', 'Active') AND arrival_date <= date AND departure_date >= date GROUP BY date;`
  - In-memory calculation for interactive application stay previews: when management alters arrival/departure dates on a pending application, client/server evaluates the delta vector against active headcounts.
  - Color thresholds:
    - `< 10`: Critical alert (Understaffed)
    - `10 - 11`: Low capacity warning highlight (Amber)
    - `12`: Nominal target baseline (Green / Neutral)
    - `13 - 15`: Short turnover overlap warning highlight (Yellow)
    - `> 15`: Critical alert (Overcrowded)
- **Rationale**: Provides instantaneous (< 10ms) calendar rendering and real-time visual feedback during application reviews.

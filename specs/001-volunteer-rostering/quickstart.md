# Quickstart & Verification Guide: Hostel Volunteer Rostering

**Feature**: `001-volunteer-rostering`
**Date**: 2026-10-27
**Status**: Completed

## 1. Prerequisites

- **Node.js**: v22.x LTS (Node.js 22 is required for better-sqlite3 13+ and vitest 5+)
- **Package Manager**: `npm` (v10+)
- **System**: Linux, macOS, or Proxmox LXC/VM with standard build tools (`gcc`, `g++`, `make` for `better-sqlite3` native compilation)

---

## 2. Setup & Installation

From the repository root:

```bash
# Install backend and frontend dependencies
npm install

# Run database migrations to initialize SQLite schema
npm run db:migrate

# Seed standard shifts (Housekeeping 10-2, Reception Day 8-6, Reception Evening 4-12/5-1)
# and initial application sources (HelpEx, WorkAway, Worldpackers, Guest)
npm run db:seed
```

The database is stored locally in `data/rostertool.sqlite` with WAL mode enabled.

---

## 3. Running Automated Tests (TDD Verification)

Verify all unit and contract tests pass before starting the server:

```bash
# Run pure constraint engine unit tests
npm run test:engine

# Run all backend unit & integration tests
npm run test
```

### Key Automated Test Suites:
- `tests/engine/hard-constraints.test.ts`: Proves no double booking, respects stay arrival/departure dates, enforces 16h weekly caps, validates 9h turnaround rest.
- `tests/engine/trainer-pairing.test.ts`: Proves any volunteer with `in_training = true` is strictly scheduled with an `is_trainer = true` partner.
- `tests/engine/pro-rating.test.ts`: Proves mid-week arrivals (e.g. Thursday) are pro-rated to appropriate shift counts.
- `tests/engine/soft-constraints.test.ts`: Proves 3-consecutive-days-off optimization across 14-day rolling windows and weekend fairness.
- `tests/api/volunteers.test.ts`: Proves CRUD, magic link token generation, and capacity checking.

---

## 4. Running the Development Server

To run both backend API and React frontend in development mode:

```bash
npm run dev
```

- **Management App**: `http://localhost:3000/admin`
- **Volunteer Portal**: `http://localhost:3000/portal?token=<token>`
- **API Health**: `http://localhost:3000/api/health`

---

## 5. End-to-End Manual Verification Scenarios

### Scenario A: Volunteer Application to Acceptance Flow
1. Navigate to `http://localhost:3000/admin/volunteers`.
2. Click **"New Application"**.
3. Enter:
   - Full Name: `Elena Rostova`
   - Nationality: `DE` (Germany)
   - Application Source: `WorkAway`
   - Stay Dates: Next Monday to 4 weeks later.
4. Verify German flag 🇩🇪 displays immediately next to Elena's name.
5. In the stay preview, observe the daily capacity counts update in real time without exceeding 15.
6. Click **"Accept Volunteer"**.
7. Observe Elena's magic link token generated and copyable.

### Scenario B: Auto-Populating the Weekly Schedule
1. Navigate to `http://localhost:3000/admin/roster`.
2. Select next week's Monday-to-Sunday view.
3. Observe empty shift slots with red/amber understaffed highlighting.
4. Click **"Auto-Populate"**.
5. Observe:
   - Slots filled within < 1 second.
   - Housekeeping shifts filled with $\ge 3$ volunteers.
   - Evening reception shifts filled with qualified reception volunteers.
   - Each cell displays the volunteer's full name alongside their country flag.
   - If an `in_training` volunteer is assigned, an `is_trainer` volunteer is present on the same shift.

### Scenario C: Volunteer Portal & Time-Off Request
1. Copy Elena's magic link from her profile.
2. Open an incognito browser tab and navigate to `http://localhost:3000/portal?token=...`.
3. Verify mobile-friendly layout displays Elena's personal upcoming shifts and the hostel weekly overview.
4. Click **"Request Day Off"**, select next Wednesday, and enter reason: "Visiting national park".
5. Return to the management tab: notice the pending time-off notification.
6. Click **"Approve"**.
7. Re-run or view the roster: verify Elena is not scheduled on Wednesday.

### Scenario D: Headcount Calendar Capacity Warnings
1. Navigate to `http://localhost:3000/admin/headcount`.
2. Observe color-coded days:
   - Green (12 volunteers)
   - Yellow "Overlap" warning (13–15 volunteers)
   - Amber "Low Capacity" warning (10–11 volunteers)
   - Red alert (< 10 or > 15 volunteers)

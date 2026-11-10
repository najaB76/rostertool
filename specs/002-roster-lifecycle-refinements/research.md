# Research & Technical Decisions: Roster, Lifecycle & Headcount Refinements

**Feature**: `002-roster-lifecycle-refinements`
**Date**: 2026-10-27
**Status**: Completed

## 1. Daily Shift Filtering for Three-Shift Roster

- **Decision**: Update `shift_definitions` filtering so that each day evaluates its applicable shifts dynamically:
  - Housekeeping (10:00–14:00, 7 days/week)
  - Reception Day (08:00–18:00, 7 days/week)
  - Reception Evening (Sun–Thu 16:00–00:00 on days 0, 1, 2, 3, 4; Fri–Sat 17:00–01:00 on days 5, 6)
- **Rationale**:
  - In `seed.ts`, the evening shifts were created without day-of-week restrictions, which caused both evening shifts to render every day (totaling 4 shifts per day).
  - Adding an `applicableDays` column (or explicit day check in `roster-service.ts` and `seed.ts`) guarantees that Monday through Thursday and Sunday only load the 16:00–00:00 shift, and Friday and Saturday only load the 17:00–01:00 shift.
  - This guarantees every day column on the roster grid displays exactly **3 shift sections**.
- **Alternatives Considered**:
  - *Hardcoding shift slots in UI*: Fragile; would bypass backend constraint solver and cause desyncs during auto-populate.
  - *Merging both into a single definition with variable hours*: Complicates solver start/end time rest checks.

---

## 2. Volunteer Lifecycle State Transitions

- **Decision**: Implement explicit transition endpoints in `src/server/routes/admin-volunteers.ts` and corresponding action buttons on `AdminVolunteersPage.tsx`:
  - `POST /api/admin/volunteers/:id/accept`: Validates stay dates, updates status to `Accepted`, generates/returns magic link token.
  - `POST /api/admin/volunteers/:id/activate`: Updates status to `Active`.
  - `POST /api/admin/volunteers/:id/cancel`: Updates status to `Cancelled` and clears future shift assignments.
  - `POST /api/admin/volunteers/:id/depart`: Captures rating, exit notes, future re-acceptance recommendation, updates status to `Departed`, and clears future shifts.
- **Rationale**:
  - Management needs unambiguous, 1-click or 2-click buttons on the volunteer cards to progress volunteers through the lifecycle.
  - Clear state transitions ensure volunteers only appear in active scheduling when appropriate.
- **Alternatives Considered**:
  - *Only generic PUT /api/admin/volunteers/:id*: Requires manager to manually select status from a dropdown without guided date confirmation or review capture.

---

## 3. Country Flag Dataset & Structured Dropdowns

- **Decision**: Provide a canonical in-app country catalog module (`src/client/data/countries.ts`) mapping ISO 3166-1 alpha-2 codes to country names and flag emojis (e.g., `US: { name: 'United States', flag: '🇺🇸' }`, `FR: { name: 'France', flag: '🇫🇷' }`, `BR: { name: 'Brazil', flag: '🇧🇷' }`, `DE: { name: 'Germany', flag: '🇩🇪' }`, etc.).
- **Rationale**:
  - Free-text input of 2-letter codes is error-prone. A structured dropdown allows typing or scrolling country names with immediate flag previews, satisfying Constitution Principle II.
  - Bundled as pure static data (< 15KB) with zero runtime network dependencies, preserving self-hosted offline reliability.
- **Alternatives Considered**:
  - *External REST Countries API*: Violates offline self-hosted independence if internet is unavailable.

---

## 4. Headcount Navigation & Multi-Scale Heatmaps

- **Decision**:
  - Add navigation controls: `< Previous`, `Today`, and `Next >` parameterized by active view scale.
  - Support three view scales:
    - **Month**: Standard 7-column calendar grid for the selected month.
    - **Quarter**: 3-month overview (Q1: Jan–Mar, Q2: Apr–Jun, Q3: Jul–Sep, Q4: Oct–Dec) with quarter navigation.
    - **Year**: 12-month annual overview (Jan–Dec) with annual navigation.
  - **Compact Heatmap Mode**: A toggle switch that strips verbose numbers and text, rendering days as compact square color tiles colored by capacity status:
    - Green (`#22c55e`): Optimal (12)
    - Yellow (`#eab308`): Overlap buffer (13–15)
    - Amber (`#f97316`): Low buffer (10–11)
    - Red (`#ef4444`): Critical (<10 or >15)
  - In compact Year view, all 365 days fit into a dense grid (e.g. 52 weeks x 7 days or 12 month mini-calendars) completely within a single desktop screen.
- **Rationale**:
  - Directly matches manager feedback: long-term volunteer intake planning requires rapid visual recognition of turnover valleys and overlap peaks without text clutter.

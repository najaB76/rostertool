# Tasks: Date Formats, Roster Navigation & Volunteer Contacts

**Input**: Design documents from `/specs/006-date-formats-roster-and-contact-improvements/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `.specify/memory/constitution.md`

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story mapping ([US1], [US2], [US3])
- Exact file paths included in all tasks

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify dependencies and environment for feature 006

- [x] T001 [P] Verify project dependencies and environment for feature 006 in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create shared date formatting helper for global UI consistency

- [x] T002 [P] Create universal date formatting helper `formatDate` in `src/client/utils/date-utils.ts`

**Checkpoint**: Foundation ready - uniform date formatter available.

---

## Phase 3: User Story 1 - Global Date Formatting Consistency (Priority: P1)

**Goal**: Standardize date displays across all pages to `YYYY-MM-DD`, eliminating mixed formats on the Time-Off and volunteer pages.

**Independent Test**: Navigate to `/admin/time-off`. Verify both Requested Date and Submitted date display in `YYYY-MM-DD` format (e.g. `2026-11-06` and `2026-10-27`).

### Implementation for User Story 1

- [x] T003 [US1] Standardize all date and timestamp renderings to `YYYY-MM-DD` in `src/client/pages/AdminTimeOffPage.tsx`
- [x] T004 [US1] Standardize date displays in `src/client/pages/AdminVolunteersPage.tsx` and `src/client/pages/VolunteerPortalPage.tsx`

**Checkpoint**: User Story 1 complete - all dates formatted uniformly as `YYYY-MM-DD`.

---

## Phase 4: User Story 2 - Monday-Enforced Roster Navigation (Priority: P1)

**Goal**: Automatically snap selected dates to Monday and provide 1-click week navigation buttons (`← Previous Week`, `This Week`, `Next Week →`).

**Independent Test**: On `/admin/roster`, pick a Wednesday and verify it snaps to Monday. Click `Next Week →` and verify it advances by 7 days. Click `This Week` and verify it jumps to current week's Monday.

### Implementation for User Story 2

- [x] T005 [US2] Implement automatic Monday-snapping for date selection in `src/client/pages/AdminRosterPage.tsx`
- [x] T006 [US2] Add `← Previous Week`, `This Week`, and `Next Week →` navigation buttons and display formatted weekly interval in `src/client/pages/AdminRosterPage.tsx`

**Checkpoint**: User Story 2 complete - Monday-only roster navigation active.

---

## Phase 5: User Story 3 - Volunteer Email & Phone Capture and Display (Priority: P1)

**Goal**: Capture volunteer email and phone/WhatsApp in `VolunteerModal` and display them on volunteer cards with clickable `mailto:` and `tel:` links.

**Independent Test**: Create or edit a volunteer, enter email `test@example.com` and phone `+1 555-0123`. Save. Verify email and phone appear on their card as clickable links.

### Implementation for User Story 3

- [x] T007 [US3] Add email and phone number input fields to `src/client/components/VolunteerModal.tsx`
- [x] T008 [US3] Display email and phone with `mailto:` and `tel:` links on volunteer cards in `src/client/pages/AdminVolunteersPage.tsx`

**Checkpoint**: User Story 3 complete - volunteer contact details captured and accessible.

---

## Phase 6: Polish & Validation

**Purpose**: End-to-end verification, build check, and test coverage

- [x] T009 [P] Run end-to-end quickstart verification scenarios from `specs/006-date-formats-roster-and-contact-improvements/quickstart.md`
- [x] T010 Execute full automated test suite (`npm test`) and production build (`npm run build`)

---

## Dependencies & Execution Order

```
Phase 1: Setup
     │
     ▼
Phase 2: Foundational (date-utils.ts)
     │
     ├──────────────────────┬──────────────────────┐
     ▼                      ▼                      ▼
Phase 3: US1 (P1)      Phase 4: US2 (P1)      Phase 5: US3 (P1)
Consistent Dates       Monday Roster Nav      Volunteer Contacts
     │                      │                      │
     └──────────────────────┴──────────┬───────────┘
                                       ▼
                              Phase 6: Polish & Validation
```

### Parallel Opportunities

- **Phase 3 & Phase 4**: Date standardization and roster navigation can be developed independently.
- **Phase 5**: Volunteer contact inputs in `VolunteerModal.tsx` and card display can run in parallel with roster navigation.

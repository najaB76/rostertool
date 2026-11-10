# Tasks: Staff Management, Admin Auth & Printable Roster

**Input**: Design documents from `/specs/007-staff-management-auth-and-roster-export/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `.specify/memory/constitution.md`

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story mapping ([US1], [US2], [US3])
- Exact file paths included in all tasks

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify dependencies and environment for feature 007

- [x] T001 [P] Verify project dependencies and environment for feature 007 in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema and backend foundations for staff nationality and assignments

- [x] T002 Add `nationality` column to `staffUsers` in `src/server/db/schema.ts` and ensure database compatibility in `src/server/db/client.ts`
- [x] T003 Return staff `nationality` in shift assignment joins in `src/server/services/roster-service.ts`

**Checkpoint**: Foundation ready - staff users support country flags on shifts.

---

## Phase 3: User Story 1 - Staff Management Screen (Priority: P1)

**Goal**: Provide a full management screen to add, edit, and remove paid staff members with country flags.

**Independent Test**: Navigate to `/admin/staff`. Add a staff member with name "Hervé Blanc", nationality "FR", role "Receptionist". Verify they appear with French flag 🇫🇷. Edit role and verify update. Remove staff member and verify deletion.

### Tests for User Story 1

- [x] T004 [P] [US1] Unit and integration tests for staff CRUD endpoints in `tests/api/staff.test.ts`

### Implementation for User Story 1

- [x] T005 [US1] Implement `POST`, `PUT`, `DELETE` endpoints for staff members in `src/server/routes/admin-staff.ts`
- [x] T006 [US1] Build `AdminStaffPage` component with add/edit/delete modal and CountrySelect in `src/client/pages/AdminStaffPage.tsx`
- [x] T007 [US1] Add `Staff` navigation link in `src/client/App.tsx` and register `/admin/staff` route

**Checkpoint**: User Story 1 complete - staff management screen fully operational.

---

## Phase 4: User Story 2 - Simple Username & PIN Management Authentication (Priority: P1)

**Goal**: Protect all `/admin/*` routes with a simple Username and PIN login screen while keeping `/portal` public.

**Independent Test**: Open an incognito browser window, visit `/admin/roster`, verify redirect to `/login`. Submit invalid PIN and verify error. Submit `admin` / `1234` and verify redirect to `/admin/roster` with a Logout button. Click Logout and verify redirect to `/login`. Verify `/portal?token=...` works without login.

### Implementation for User Story 2

- [x] T008 [P] [US2] Implement `POST /api/auth/login` and `GET /api/auth/verify` routes in `src/server/routes/auth.ts`
- [x] T009 [US2] Build `LoginPage` component with Username and PIN inputs in `src/client/pages/LoginPage.tsx`
- [x] T010 [US2] Create `ProtectedRoute` route guard and Logout button in `src/client/App.tsx` protecting all `/admin/*` routes

**Checkpoint**: User Story 2 complete - administration routes secured.

---

## Phase 5: User Story 3 - WhatsApp & Printable Portrait Roster View (Priority: P1)

**Goal**: Render a portrait roster view matching the layout in `WhatsApp Image 2026-10-25 at 16.01.45.jpeg` for easy screenshotting and sharing on WhatsApp.

**Independent Test**: On `/admin/roster`, click "📱 WhatsApp / Screenshot View". Verify portrait table with orange (Day Reception), blue (Night Shift), and gray (Housekeeping) headers. Verify 7 Monday-Sunday rows with first names and country flags. Click Print / Save PDF.

### Implementation for User Story 3

- [x] T011 [US3] Build `PrintableRosterView` portrait component with orange/blue/gray headers, Monday-Sunday rows, and vector country flags in `src/client/components/PrintableRosterView.tsx`
- [x] T012 [US3] Integrate WhatsApp / Screenshot view button and modal/toggle in `src/client/pages/AdminRosterPage.tsx`

**Checkpoint**: User Story 3 complete - WhatsApp portrait screenshot view available.

---

## Phase 6: Polish & Validation

**Purpose**: End-to-end verification, build check, and test coverage

- [x] T013 [P] Run end-to-end quickstart verification scenarios from `specs/007-staff-management-auth-and-roster-export/quickstart.md`
- [x] T014 Execute full automated test suite (`npm test`) and production build (`npm run build`)

---

## Dependencies & Execution Order

```
Phase 1: Setup
     │
     ▼
Phase 2: Foundational (Staff nationality schema & roster service)
     │
     ├──────────────────────┬──────────────────────┐
     ▼                      ▼                      ▼
Phase 3: US1 (P1)      Phase 4: US2 (P1)      Phase 5: US3 (P1)
Staff Management Page  Username/PIN Auth      WhatsApp Portrait View
     │                      │                      │
     └──────────────────────┴──────────┬───────────┘
                                       ▼
                              Phase 6: Polish & Validation
```

### Parallel Opportunities

- **Phase 3 & Phase 4**: `AdminStaffPage` and `LoginPage` can be developed independently.
- **Phase 4 & Phase 5**: Authentication endpoints and `PrintableRosterView` can run in parallel.

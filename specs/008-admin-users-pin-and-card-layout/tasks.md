# Tasks: Admin Users, PIN Change & Card Layout

**Input**: Design documents from `/specs/008-admin-users-pin-and-card-layout/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `.specify/memory/constitution.md`

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story mapping ([US1], [US2], [US3], [US4])
- Exact file paths included in all tasks

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify dependencies and environment for feature 008

- [x] T001 [P] Verify project dependencies and environment for feature 008 in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema and database persistence for admin users

- [x] T002 Add `adminUsers` table to `src/server/db/schema.ts` and initialize table with default `admin` / `1234` seed in `src/server/db/client.ts`
- [x] T003 Update authentication in `src/server/routes/auth.ts` to query `adminUsers` table and track authenticated session userId

**Checkpoint**: Foundation ready - admin user credentials backed by SQLite database.

---

## Phase 3: User Story 1 - Multi-Admin User Management (Priority: P1)

**Goal**: Allow administrators to view, add, edit, and delete other administrative users.

**Independent Test**: Navigate to `/admin/users`. Create `manager_sarah` with PIN `5678`. Verify they appear in the list. Log in as `manager_sarah`. Attempt deleting self (blocked). Log back in as `admin`, edit `manager_sarah`, and delete account.

### Tests for User Story 1

- [x] T004 [P] [US1] Unit and integration tests for admin user CRUD in `tests/api/auth.test.ts`

### Implementation for User Story 1

- [x] T005 [US1] Implement `GET`, `POST`, `PUT`, `DELETE` routes for `/api/admin/users` in `src/server/routes/auth.ts`
- [x] T006 [US1] Build `AdminUsersPage` component with add/edit/delete modals in `src/client/pages/AdminUsersPage.tsx`
- [x] T007 [US1] Add `Admin Users` navigation link in `src/client/App.tsx` and register `/admin/users` route

**Checkpoint**: User Story 1 complete - admin users CRUD interface operational.

---

## Phase 4: User Story 2 - Self-Service PIN Change (Priority: P1)

**Goal**: Allow any logged-in administrator to change their own PIN after verifying their current PIN.

**Independent Test**: Click "Change PIN" in the header. Enter current PIN `1234`, new PIN `4321`, confirm `4321`. Save. Log out and confirm login with old PIN fails while new PIN succeeds.

### Implementation for User Story 2

- [x] T008 [P] [US2] Implement `POST /api/auth/change-pin` endpoint in `src/server/routes/auth.ts`
- [x] T009 [US2] Build `ChangePinModal` component in `src/client/components/ChangePinModal.tsx`
- [x] T010 [US2] Add "Change PIN" button in `AdminLayout` header in `src/client/App.tsx`

**Checkpoint**: User Story 2 complete - self-service PIN change active.

---

## Phase 5: User Story 3 - Structured Two-Line Volunteer Card Layout (Priority: P1)

**Goal**: Structure volunteer card metadata into two distinct rows: Line 1 for role/source/dates, Line 2 for email/phone.

**Independent Test**: Navigate to `/admin/volunteers`. Inspect cards across all tabs. Verify Line 1 displays Role, Source, and Stay Dates, and Line 2 displays Email and Phone Number.

### Implementation for User Story 3

- [x] T011 [US3] Reorganize volunteer metadata into two distinct rows (Line 1: role/source/dates/badges, Line 2: email/phone) in `src/client/pages/AdminVolunteersPage.tsx`

**Checkpoint**: User Story 3 complete - volunteer cards formatted with uniform two-line layout.

---

## Phase 6: User Story 4 - Updated Staff Roles (Assistant Manager) (Priority: P1)

**Goal**: Add "Assistant Manager" and remove "Shift Supervisor" from staff roles.

**Independent Test**: Navigate to `/admin/staff`. Open "+ Add Staff Member" modal. Verify "Assistant Manager" is selectable and "Shift Supervisor" is removed.

### Implementation for User Story 4

- [x] T012 [US4] Add "Assistant Manager" and remove "Shift Supervisor" in `src/client/pages/AdminStaffPage.tsx`

**Checkpoint**: User Story 4 complete - staff roles reflect updated management hierarchy.

---

## Phase 7: Polish & Validation

**Purpose**: End-to-end verification, build check, and test coverage

- [x] T013 [P] Run end-to-end quickstart verification scenarios from `specs/008-admin-users-pin-and-card-layout/quickstart.md`
- [x] T014 Execute full automated test suite (`npm test`) and production build (`npm run build`)

---

## Dependencies & Execution Order

```
Phase 1: Setup
     │
     ▼
Phase 2: Foundational (admin_users table & auth route update)
     │
     ├──────────────────────┬──────────────────────┬──────────────────────┐
     ▼                      ▼                      ▼                      ▼
Phase 3: US1 (P1)      Phase 4: US2 (P1)      Phase 5: US3 (P1)      Phase 6: US4 (P1)
Admin Users Page       Self PIN Change        2-Line Volunteer Cards Staff Roles Update
     │                      │                      │                      │
     └──────────────────────┴──────────┬───────────┴──────────────────────┘
                                       ▼
                              Phase 7: Polish & Validation
```

### Parallel Opportunities

- **Phase 3 & Phase 4**: `AdminUsersPage` and `ChangePinModal` can be developed in parallel.
- **Phase 5 & Phase 6**: Volunteer card layout adjustments and staff roles update can run concurrently.

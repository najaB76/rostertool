# Tasks: Complete Session Timeout & Universal Admin Auth Guards

**Input**: Design documents from `/specs/017-session-timeout-auth-guards/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`
**Status**: Ready for implementation

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

---

## Phase 1: Setup

- [x] T001 [P] Verify project dependencies and environment in `package.json`

---

## Phase 2: User Story 1 - Universal Server-Side Protection for All Admin Routes (Priority: P1)

**Goal**: Ensure 100% of `/api/admin/*` routes reject requests lacking a valid admin session token with `401 Unauthorized`.

**Independent Test**: Send unauthenticated GET requests to `/api/admin/roster`, `/api/admin/volunteers`, `/api/admin/headcount`, `/api/admin/timeline`, `/api/admin/time-off`, `/api/admin/staff`, `/api/admin/settings`, `/api/admin/backup/export`, and `/api/admin/users`. All must return `401 Unauthorized`.

### Tests for User Story 1

- [x] T002 [P] [US1] Create integration tests in `tests/api/auth-guard.test.ts` asserting all `/api/admin/*` endpoints reject requests without a valid token with 401

### Implementation for User Story 1

- [x] T003 [US1] Implement centralized Fastify `preHandler` hook in `src/server/index.ts` enforcing `isValidAdminToken` on all routes under `/api/admin/*`

**Checkpoint**: User Story 1 complete - all admin endpoints are secured on the backend.

---

## Phase 3: User Story 2 - Inactivity Session Expiration & Automatic Logout (Priority: P1)

**Goal**: Inactivity timeout (30 minutes) with sliding expiration on server, and client-side automatic redirect to `/login` upon expiration or 401 response.

**Independent Test**: After 30 minutes of inactivity (or setting `lastActiveAt` > 30 minutes in the past), any navigation or API call fails with 401, clears `localStorage`, and redirects to `/login?expired=1`.

### Implementation for User Story 2

- [x] T004 [P] [US2] Update `src/server/routes/auth.ts` to track `lastActiveAt`, enforce `SESSION_INACTIVITY_TIMEOUT_MS` (30m), implement sliding expiration, and reject expired sessions in `/api/auth/verify`
- [x] T005 [P] [US2] Implement transparent `window.fetch` interceptor in `src/client/App.tsx` to automatically attach `Authorization: Bearer <token>` to all `/api/admin/*` requests and catch 401 responses to clear `localStorage` and redirect to `/login?expired=1`
- [x] T006 [US2] Update `src/client/components/ProtectedRoute.tsx` to verify session token freshness against `/api/auth/verify` on route navigation
- [x] T007 [P] [US2] Add client-side user activity listener and 30-minute idle timer in `src/client/App.tsx` that triggers auto-logout on prolonged inactivity
- [x] T008 [P] [US2] Update `src/client/pages/LoginPage.tsx` to display a notification when `?expired=1` is present in the URL query parameters

**Checkpoint**: User Story 2 complete - inactive sessions expire smoothly and take user to login screen.

---

## Phase 4: Polish & Validation

**Purpose**: End-to-end verification and regression prevention

- [x] T009 [P] Execute quickstart validation scenarios from `specs/017-session-timeout-auth-guards/quickstart.md`
- [x] T010 Run full automated test suite (`npm test`) and production build check (`npm run build`)

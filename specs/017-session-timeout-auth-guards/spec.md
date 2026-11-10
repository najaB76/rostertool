# Feature Specification: Complete Session Timeout & Universal Admin Auth Guards

**Feature Branch**: `017-session-timeout-auth-guards`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User bug report: "FIX: It doesn't appear that session timeout is completely implemented. If I leave the application for a while without interacting with it I can load all the pages except for the Admin users page. I expect that reloading or navigating to a new page would take me to the login screen."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Universal Server-Side Protection for All Admin Routes (Priority: P1)

As a hostel administrator, I want all `/api/admin/*` endpoints (Roster, Volunteers, Headcount, Timeline, Time-Off, Staff, Settings, Backup, and Users) to strictly require a valid, non-expired session token, so that unauthorized users cannot load data or perform actions on any admin page.

**Why this priority**: Previously, only `/api/admin/users` checked authentication on the server. All other `/api/admin/*` endpoints were unprotected, allowing expired sessions or unauthenticated requests to read and modify sensitive operational data.

**Independent Test**:
- Attempt to make a `GET` request to `/api/admin/roster`, `/api/admin/volunteers`, `/api/admin/headcount`, `/api/admin/timeline`, `/api/admin/time-off`, `/api/admin/staff`, `/api/admin/settings`, `/api/admin/backup/export`, and `/api/admin/users` without a valid `Authorization: Bearer <token>` header.
- Verify that **100%** of these endpoints reject the request with `401 Unauthorized`.
- Send a valid token and verify all endpoints succeed.

**Acceptance Scenarios**:
1. **Given** an unauthenticated request to any endpoint under `/api/admin/*`, **When** processed by the server, **Then** the server responds with HTTP status `401 Unauthorized`.
2. **Given** a request with an invalid or expired token, **When** processed, **Then** the server responds with HTTP status `401 Unauthorized`.
3. **Given** a request to public endpoints (`/api/auth/login`, `/api/portal/*`, `/api/health`), **When** processed, **Then** no admin token is required.

---

### User Story 2 - Inactivity Session Expiration & Automatic Logout (Priority: P1)

As a hostel administrator, when I leave the management application idle without interacting with it for more than 30 minutes, I want my session to expire automatically so that reloading or navigating to any page immediately redirects me to the login screen.

**Why this priority**: Hostel computers are often situated at front desk counters where staff or visitors can access unattended screens. Auto-logout on inactivity is critical for security and privacy.

**Independent Test**:
- Log in to the application as an admin user.
- Simulate session inactivity exceeding the 30-minute threshold (or set last active timestamp back in time).
- Reload the page or click any navigation tab (e.g. Weekly Roster, Timeline, Headcount, Volunteers, Time Off, Settings).
- Verify that the application immediately redirects to `/login` and displays a session expired notification.
- Verify that all cached session credentials in `localStorage` are cleared.

**Acceptance Scenarios**:
1. **Given** an active admin session, **When** no requests or interactions occur for 30 minutes, **Then** the session is marked expired and purged on the server.
2. **Given** an expired session, **When** any API request is dispatched, **Then** the server returns `401 Unauthorized`.
3. **Given** a `401 Unauthorized` response from any API call, **When** received by the frontend, **Then** the frontend clears the stored token and navigates to `/login`.
4. **Given** page reload or route transition in `ProtectedRoute`, **When** the session token is verified with `/api/auth/verify` and found invalid or expired, **Then** the user is immediately redirected to `/login`.
5. **Given** continuous user interaction within the 30-minute window, **When** actions occur, **Then** the session's expiration window is automatically refreshed (sliding expiration).

---

## Edge Cases

- **Server Restart**: In-memory sessions are cleared; on next API request or page navigation, client receives 401 and smoothly redirects to `/login` without crashing.
- **Client Clock Skew**: Expiration is determined authoritatively by server timestamp.
- **Volunteer Portal**: Magic-link authentication on `/portal` is unaffected by admin session expiration.
- **Multiple Tabs**: Logging out or expiring in one tab redirects any subsequent action in other tabs to `/login`.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The server MUST enforce authentication on ALL routes matching `/api/admin/*`.
- **FR-002**: An admin session MUST expire after 30 minutes of inactivity.
- **FR-003**: The server MUST update the session's `lastActiveAt` timestamp upon each authenticated request (sliding session expiration).
- **FR-004**: Any request to `/api/admin/*` with an expired or missing token MUST return HTTP `401 Unauthorized` with `{ error: 'Unauthorized: Session expired or invalid' }`.
- **FR-005**: The `/api/auth/verify` endpoint MUST validate token freshness against the inactivity expiration threshold.
- **FR-006**: The frontend `ProtectedRoute` component MUST verify token validity against `/api/auth/verify` and redirect to `/login` if invalid or expired.
- **FR-007**: A global API response interceptor / fetch wrapper MUST catch any HTTP `401` response, purge `admin_token` and `admin_username` from `localStorage`, and redirect to `/login`.
- **FR-008**: The client MUST track user activity (clicks, keypresses) and proactively trigger logout when inactivity exceeds 30 minutes.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of `/api/admin/*` routes return `401 Unauthorized` when accessed without a valid token.
- **SC-002**: Navigating to or reloading any admin page after 30 minutes of inactivity redirects to `/login` in < 200ms.
- **SC-003**: 0 sensitive admin pages can be viewed or interacted with once a session has timed out.
- **SC-004**: Continuous user interaction successfully keeps the session active without unexpected logouts.

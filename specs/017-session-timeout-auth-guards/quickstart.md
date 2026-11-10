# Quickstart: Complete Session Timeout & Universal Admin Auth Guards

**Feature**: `017-session-timeout-auth-guards`

## Verification Scenarios

### Scenario 1: Unauthorized API Requests are Rejected
1. Clear authorization headers or cookies.
2. Attempt to `GET /api/admin/roster`, `GET /api/admin/volunteers`, or `GET /api/admin/timeline`.
3. Verify all endpoints return `401 Unauthorized`.

### Scenario 2: Inactivity Session Timeout
1. Log in via `/login`.
2. Wait or advance time past 30 minutes of inactivity.
3. Reload or navigate to `/admin/volunteers` or `/admin/roster`.
4. Verify user is redirected to `/login?expired=1` with an expiration message.
5. Verify `localStorage` token is cleared.

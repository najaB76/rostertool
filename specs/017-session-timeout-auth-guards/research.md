# Research & Technical Decisions: Complete Session Timeout & Universal Admin Auth Guards

**Feature**: `017-session-timeout-auth-guards`
**Date**: 2026-10-27
**Status**: Completed

## 1. Centralized Server-Side Admin Authentication Hook

- **Decision**: In `src/server/index.ts`, register a server-wide `preHandler` hook targeting all routes starting with `/api/admin`:
  ```typescript
  fastify.addHook('preHandler', async (request, reply) => {
    if (request.url.startsWith('/api/admin')) {
      const authHeader = request.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (request.query as any)?.token;
      const session = getSessionFromToken(token);
      if (!session) {
        return reply.status(401).send({ error: 'Unauthorized: Session expired or invalid' });
      }
      (request as any).session = session;
    }
  });
  ```
- **Rationale**:
  - Centralizes security in a single hook; prevents future routes from accidentally being left unprotected.
  - Automatically protects Roster, Volunteers, Headcount, Timeline, Time-Off, Staff, Settings, Backup, and Users.
  - Excludes public routes (`/api/auth/login`, `/api/auth/verify`, `/api/portal/*`, `/api/health`).

## 2. Inactivity Timeout with Sliding Expiration

- **Decision**:
  - In `src/server/routes/auth.ts`, update `AdminSession`:
    ```typescript
    export interface AdminSession {
      userId: string;
      username: string;
      lastActiveAt: number; // Unix timestamp ms
    }
    export const SESSION_INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
    ```
  - `getSessionFromToken(token)` checks if `Date.now() - session.lastActiveAt > SESSION_INACTIVITY_TIMEOUT_MS`.
  - If expired, delete session and return `null`.
  - If valid, update `session.lastActiveAt = Date.now()` (sliding window).

## 3. Transparent Client-Side Request & Response Interceptor

- **Decision**: Wrap `window.fetch` in `src/client/App.tsx` (or an initialization module):
  - Automatically attaches `Authorization: Bearer <token>` to all `/api/admin/*` requests if not already present.
  - Automatically intercepts any `401 Unauthorized` responses from `/api/admin/*`, clears `localStorage.removeItem('admin_token')` and `admin_username`, and redirects to `/login?expired=1`.
- **Rationale**:
  - Ensures existing components throughout the app make authenticated calls without needing manual boilerplate additions.
  - Immediate, global logout handling upon token expiration or invalidation.

## 4. ProtectedRoute Navigation & Idle Timer

- **Decision**:
  - `ProtectedRoute.tsx` verifies the token with `/api/auth/verify` on route transitions. If 401 is received, it purges credentials and redirects to `/login`.
  - A client-side activity listener (`mousedown`, `keydown`, `touchstart`) resets an idle timer. If no input occurs for 30 minutes, it clears storage and redirects to `/login?expired=1`.

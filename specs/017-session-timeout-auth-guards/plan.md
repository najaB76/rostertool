# Implementation Plan: Complete Session Timeout & Universal Admin Auth Guards

**Branch**: `017-session-timeout-auth-guards` | **Date**: 2026-10-27 | **Spec**: [specs/017-session-timeout-auth-guards/spec.md](spec.md)

## Summary
Secure all `/api/admin/*` routes with a centralized server-side authentication hook, implement a 30-minute inactivity sliding session timeout on the server, and provide transparent client-side request/response interception to automatically attach authorization tokens and redirect to `/login` upon session expiration.

## Constitution Check
- **I. Test-First Engine & Invariants**: Enforces authentication invariants on all admin endpoints. **PASS**
- **II. Cultural Identity & High-Visibility Flags**: **PASS**
- **III. Self-Hosted Simplicity & Zero-Config**: In-memory token management with sliding timeout, zero external dependencies. **PASS**
- **IV. Human Override & Visual Highlighting**: User-friendly session timeout notification on login screen. **PASS**

## Project Structure & File Roadmap
- `src/server/routes/auth.ts`: Add `lastActiveAt` and `SESSION_INACTIVITY_TIMEOUT_MS` (30m) to session management.
- `src/server/index.ts`: Add centralized `preHandler` hook enforcing `isValidAdminToken` on all `/api/admin/*` routes.
- `src/client/App.tsx`: Install global `window.fetch` interceptor to attach bearer token to `/api/admin/*` and auto-redirect to `/login` on 401. Add client inactivity listener.
- `src/client/components/ProtectedRoute.tsx`: Verify token freshness on route navigation.
- `src/client/pages/LoginPage.tsx`: Display user-friendly notification when redirected with `?expired=1`.
- `tests/api/auth-guard.test.ts`: Integration test verifying all `/api/admin/*` routes return 401 without auth and expire after inactivity.

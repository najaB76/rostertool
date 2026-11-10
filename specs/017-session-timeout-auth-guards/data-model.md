# Data Model: Complete Session Timeout & Universal Admin Auth Guards

**Feature**: `017-session-timeout-auth-guards`
**Date**: 2026-10-27
**Status**: Completed

## Session State Structure

```typescript
export interface AdminSession {
  userId: string;
  username: string;
  lastActiveAt: number; // Unix timestamp in milliseconds
}

export const SESSION_INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
```

### Inactivity State Transitions

1. **Session Created**: `lastActiveAt = Date.now()`
2. **Session Accessed (within 30 mins)**: `lastActiveAt = Date.now()`
3. **Session Inactive (> 30 mins)**: Token purged from `activeSessions`; any subsequent access returns `401 Unauthorized`.
4. **Session Logout**: Token immediately purged from `activeSessions`.

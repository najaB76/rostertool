# Quickstart: Fix Volunteer by ID Route for Timeline Hyperlink

**Feature**: `020-fix-timeline-volunteer-link`

## Verification Scenarios

### Scenario 1: Fetching Volunteer by ID
1. Query `GET /api/admin/volunteers/:id` with a valid ID.
2. Verify HTTP `200 OK` is returned with full volunteer data and stays.
3. Query `GET /api/admin/volunteers/nonexistent-id`.
4. Verify HTTP `404 Not Found` with `{ error: 'Volunteer not found' }`.

### Scenario 2: Clicking Name Hyperlink on Timeline
1. Open `/admin/timeline`.
2. Click any volunteer's name.
3. Verify `VolunteerModal` opens populated with their name, role, notes, and dates without 404 errors in the console.

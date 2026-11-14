# Feature Specification: Fix Volunteer by ID Route for Timeline Hyperlink

**Feature Branch**: `020-fix-timeline-volunteer-link`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User bug report: "BUG: The name hyperlink on the timeline view is not working. It generates a 404 error in the browser console, eg: `index-D2eFtRU8.js:11 Fetch failed loading: GET \"http://192.168.20.94:3000/api/admin/volunteers/abc48f15-10db-455b-8990-962891f26a64\".`"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Click Volunteer Name to Load and Edit Volunteer Data (Priority: P1)

As a hostel manager viewing the Staffing Timeline, when I click on any volunteer's name hyperlink, I want the system to fetch their full volunteer record from the server and open the `VolunteerModal` populated with their details, so that I can edit notes, roles, and stay dates seamlessly without encountering a 404 error.

**Why this priority**: The name hyperlink currently fails with a 404 error because the backend route `GET /api/admin/volunteers/:id` was missing from the API router.

**Independent Test**:
- Open `/admin/timeline`.
- Click on any volunteer's name.
- Verify the network tab sends `GET /api/admin/volunteers/:id` and receives HTTP `200 OK` with the volunteer's complete details.
- Verify `VolunteerModal` opens populated with their name, role, contact info, notes, and dates.
- Save changes and verify the updated data persists and the timeline refreshes without error.

**Acceptance Scenarios**:
1. **Given** a volunteer ID in the database, **When** sending `GET /api/admin/volunteers/:id`, **Then** the server returns HTTP `200 OK` with the volunteer object and stay history.
2. **Given** an invalid or nonexistent volunteer ID, **When** sending `GET /api/admin/volunteers/:id`, **Then** the server returns HTTP `404 Not Found` with `{ error: 'Volunteer not found' }`.
3. **Given** clicking a volunteer name link on `/admin/timeline`, **When** clicked, **Then** `VolunteerModal` opens populated with the volunteer's data (0 console 404 errors).
4. **Given** updating volunteer data in `VolunteerModal` from the timeline, **When** submitting the form, **Then** the update is accepted via both `PUT /api/admin/volunteers/:id` and `POST /api/admin/volunteers/:id`.

---

## Edge Cases

- **Nonexistent ID**: Returns structured JSON 404 `{ error: 'Volunteer not found' }`.
- **Static Route Precedence**: Requesting `GET /api/admin/volunteers/sources` must continue to return the application sources list and not be captured as an ID parameter.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The backend `adminVolunteersRoutes` MUST implement `GET /api/admin/volunteers/:id` calling `volunteerService.getVolunteerById(id)`.
- **FR-002**: If the volunteer does not exist, `GET /api/admin/volunteers/:id` MUST return HTTP `404 Not Found`.
- **FR-003**: The backend `adminVolunteersRoutes` MUST support updating a volunteer via both `PUT /api/admin/volunteers/:id` and `POST /api/admin/volunteers/:id`.
- **FR-004**: The timeline view `handleOpenEdit` handler MUST successfully fetch `/api/admin/volunteers/:id` and open `VolunteerModal`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 HTTP 404 errors when clicking volunteer name hyperlinks on `/admin/timeline`.
- **SC-002**: 100% of volunteer records can be fetched by ID via `GET /api/admin/volunteers/:id`.
- **SC-003**: `VolunteerModal` opens with full data populated in < 150ms upon clicking a volunteer name link.

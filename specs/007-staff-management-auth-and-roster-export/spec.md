# Feature Specification: Staff Management, Admin Auth & Printable Roster

**Feature Branch**: `007-staff-management-auth-and-roster-export`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User description: "Some further improvements: 1. We need a screen that allows us to edit the staff users (name, nationality and role) and add/remove staff users as necessary. 2. The management pages require authentication, a simple username/PIN combination is enough security for this scenario. 3. We need a "printable" roster view - not literally printable but something that could be sent as a screenshot. The layout should be portrait with three columns (day, reception, housekeeping) and each row having the day name, the names of the day and evening receptionists, and names of the assigned housekeepers. All the names should have their flag next to them. Use the image `WhatsApp Image 2026-10-25 at 16.01.45.jpeg` for example of the current layout."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Staff Management Screen (Priority: P1)

As a hostel manager, I want a dedicated Staff management screen where I can view, add, edit, and remove paid staff members (including their full name, nationality, and role), so that the roster assignment engine has accurate staff records with country flags.

**Why this priority**: Paid staff members (e.g. permanent receptionists, shift managers) work alongside volunteers; managers need full CRUD capability to update staff details and nationality flags.

**Independent Test**: Navigate to `/admin/staff`. Click "+ Add Staff Member". Enter Name: `Hervé Blanc`, Nationality: `FR` (France), Role: `Receptionist`. Save. Verify Hervé appears in the staff list with his French flag 🇫🇷. Edit his role to `Senior Receptionist`. Save and verify update. Click "Delete", confirm, and verify he is removed.

**Acceptance Scenarios**:

1. **Given** the admin navigation, **When** clicking "Staff", **Then** the user is taken to `/admin/staff` showing a list of all active staff members with their full name, country flag, and role.
2. **Given** the staff page, **When** clicking "+ Add Staff Member", **Then** a modal opens with fields for Full Name, Nationality (using searchable CountrySelect), and Role.
3. **Given** a new staff member saved, **Then** they become available for shift assignment in `ShiftAssignModal` with their name and country flag.
4. **Given** an existing staff member, **When** clicking "Edit", **Then** their name, nationality, and role can be modified.
5. **Given** an existing staff member, **When** clicking "Remove" and confirming, **Then** their record is deleted or deactivated.

---

### User Story 2 - Simple Username & PIN Management Authentication (Priority: P1)

As a hostel manager, I want all management pages (`/admin/*`) to be protected by a simple Username and PIN login, so that unauthorized guests and public users cannot view or edit schedules, volunteer data, or staff records.

**Why this priority**: Basic security is necessary to protect volunteer personal details (emails, phone numbers, passport nationalities) and shift schedules from unauthorized tampering.

**Independent Test**: Open an incognito browser window and navigate to `http://localhost:3000/admin/roster`. Verify automatic redirection to `/login`. Enter username `admin` and PIN `1234`. Submit. Verify successful login and redirection to `/admin/roster`. Verify a "Logout" button exists in the header; clicking Logout ends the session and returns to `/login`. Verify the volunteer portal (`/portal?token=...`) remains accessible without credentials.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor, **When** attempting to visit any `/admin/*` URL, **Then** the browser immediately redirects to `/login`.
2. **Given** the login screen, **When** entering valid Username and PIN, **Then** an authenticated session token is stored and the manager is redirected to the requested page.
3. **Given** the login screen, **When** entering invalid credentials, **Then** a clear error message is shown ("Invalid Username or PIN").
4. **Given** an authenticated manager, **When** clicking "Logout" in the navigation bar, **Then** the session is cleared and the user is redirected to `/login`.
5. **Given** a volunteer using their magic link (`/portal?token=...`), **When** accessing their portal, **Then** no username/PIN is required.

---

### User Story 3 - WhatsApp & Printable Portrait Roster View (Priority: P1)

As a hostel manager, I want a portrait "printable / screenshot" roster view matching the layout in `WhatsApp Image 2026-10-25 at 16.01.45.jpeg` (three columns: Day, Reception with Day & Evening subcolumns, Housekeeping grid, all with country flags), so that I can take a clean screenshot or export a PDF to share on WhatsApp with the entire hostel team.

**Why this priority**: Managers share the weekly roster in the team WhatsApp group. The current horizontal desktop grid requires horizontal scrolling on mobile phones; a portrait view matching the reference layout makes weekly schedules instantly readable on smartphones.

**Independent Test**: Navigate to `/admin/roster`. Click "📱 WhatsApp / Screenshot View". Verify a portrait-oriented, high-contrast roster table opens displaying:
- Top headers: Orange for Day Reception (`Reception 8am – 4pm`), Blue for Evening/Night Shift (`Night Shift 4pm – 12am`), Gray for Housekeeping (`Housekeeping 10am – 2pm`).
- 7 daily rows (Monday to Sunday) with Day name and date.
- Middle columns with Day and Evening receptionist names + flags.
- Right column displaying the grid of assigned housekeepers, each with first name + flag.
- Print / Copy / Back buttons for easy export.

**Acceptance Scenarios**:

1. **Given** the weekly roster page, **When** clicking "📱 WhatsApp / Screenshot View", **Then** the view switches to a vertical portrait layout matching the reference image.
2. **Given** the portrait roster view, **Then** the header displays:
   - Reception Day shift with orange background and shift hours.
   - Night/Evening shift with blue background and shift hours.
   - Housekeeping with gray background and shift hours.
3. **Given** each daily row from Monday to Sunday, **Then** the first name and vector country flag of each assigned person are prominently displayed.
4. **Given** the housekeeping column, **Then** assigned volunteers are organized in a compact, readable grid with their vector flags.
5. **Given** the portrait view, **Then** it fits completely within a mobile screenshot or single printable page.

---

## Edge Cases

- **Session Expiry**: Expired session tokens gracefully redirect to `/login` with a helpful message.
- **PIN Configuration**: The management PIN can be configured via environment variable `ADMIN_PIN` or defaults to `1234` for zero-config setups.
- **Unstaffed Shifts in Screenshot View**: If a shift slot is unassigned, it displays `— Open —` in muted text instead of leaving an empty void.
- **Weekend Night Shift Hours**: When Saturday/Sunday have different night shift hours (e.g. 5pm - 1am), the column header or cell accurately reflects the active time window.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide an administrative Staff page accessible via `/admin/staff` and linked in the main navigation.
- **FR-002**: The Staff management page MUST support:
  - Viewing all staff members with full name, nationality (with vector SVG flag), and role.
  - Adding a new staff member with name, nationality (searchable CountrySelect), and role.
  - Editing an existing staff member's details.
  - Deleting/removing a staff member with confirmation.
- **FR-003**: The database schema MUST store `nationality` for `staff_users` so their flags render on shift assignments.
- **FR-004**: The system MUST protect all `/admin/*` web routes and `/api/admin/*` API routes with Username/PIN authentication.
- **FR-005**: The system MUST provide a `/login` page with Username and PIN inputs.
- **FR-006**: A "Logout" action MUST be present in the administration header, clearing authentication credentials.
- **FR-007**: The volunteer magic-link portal (`/portal`) MUST remain exempt from Username/PIN authentication.
- **FR-008**: The weekly roster page MUST provide a "📱 WhatsApp / Screenshot View" button.
- **FR-009**: The WhatsApp / Screenshot view MUST render in portrait orientation with:
  - Three primary sections: Day Column, Reception Section (Day & Night/Evening subcolumns), and Housekeeping Section.
  - Distinctive column header colors: Orange for Day Reception, Blue for Night/Evening Reception, Gray for Housekeeping.
  - 7 daily rows (Monday through Sunday) showing day name and date.
  - Every assigned person displayed with their First Name and graphic vector SVG country flag.
  - Housekeeping assignments rendered in a clean multi-cell grid.

### Key Entities

- **Staff User**: `id`, `fullName`, `nationality`, `role`, `isActive`, `createdAt`.
- **Admin Session**: Authenticated token stored in client storage and verified on protected endpoints.
- **Portrait Roster View Model**: Normalized daily slots mapping `dayReception`, `nightReception`, and `housekeepers: []`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A manager can add, edit, or delete a staff member in **under 30 seconds**.
- **SC-002**: 100% of `/admin/*` routes strictly require authentication; unauthenticated visits redirect to `/login` in **0 user actions**.
- **SC-003**: Entering valid Username and PIN authenticates in **< 1 second**.
- **SC-004**: The portrait WhatsApp roster view renders all 7 days with flags and shifts on a single screen without horizontal scrolling.

---

## Assumptions

- Default admin username is `admin`, default PIN is `1234` (configurable via `ADMIN_PIN` environment variable).
- WhatsApp screenshot sharing is the primary format used by management to distribute schedules to the volunteer team.

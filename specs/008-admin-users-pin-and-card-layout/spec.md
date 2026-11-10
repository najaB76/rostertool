# Feature Specification: Admin Users, PIN Change & Card Layout

**Feature Branch**: `008-admin-users-pin-and-card-layout`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User description: "Some more improvements: 1. An admin user should be able to list, add, edit, and remove other admin users. 2. An admin user should be able to change their own PIN. 3. On the volunteer card info card can we put the role, source, and stay dates on one line and the email address and phone number on a second line so that they look more consistent. 4. In the staff roles can you add 'Assistant Manager' and remove 'Shift Supervisor'."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Multi-Admin User Management (Priority: P1)

As a hostel administrator, I want to view, add, edit, and delete other administrative users, so that multiple managers can each have their own login credentials without sharing a single master account.

**Why this priority**: Individual manager accounts ensure accountability, simplify onboarding/offboarding of management staff, and avoid sharing credentials.

**Independent Test**: Log in as `admin`. Navigate to "Admin Users" (`/admin/users`). Verify the current admin account is listed. Click "+ Add Admin User", enter Username: `sarah`, PIN: `5678`. Save. Verify `sarah` appears in the list. Log out and log in as `sarah` with PIN `5678` $\to$ verify successful authentication. Edit `sarah` to change username or reset PIN. Delete a test admin user $\to$ verify removal. Verify deleting the last admin or the currently active user is prevented.

**Acceptance Scenarios**:

1. **Given** an authenticated admin, **When** clicking "Admin Users" in the navigation, **Then** all administrative user accounts are listed.
2. **Given** the admin users page, **When** clicking "+ Add Admin User", **Then** a modal allows creating a new user with Username and PIN.
3. **Given** an existing admin user, **When** clicking "Edit", **Then** their username or PIN can be updated.
4. **Given** an existing admin user, **When** clicking "Remove" and confirming, **Then** the user is removed from the database.
5. **Given** the list of admin users, **When** an admin attempts to delete the last remaining admin or their own currently logged-in account, **Then** the action is blocked with an explanatory error.

---

### User Story 2 - Self-Service PIN Change (Priority: P1)

As an authenticated hostel administrator, I want to change my own PIN directly from the interface, so that I can maintain personal security without requiring another administrator to reset it for me.

**Why this priority**: Password and PIN rotation is a standard personal security control for administrative staff.

**Independent Test**: While logged in, click "Change PIN" in the top navigation bar. Enter current PIN `1234`, new PIN `4321`, and confirm new PIN `4321`. Submit $\to$ verify success toast. Log out and attempt logging in with old PIN `1234` $\to$ verify rejected. Log in with new PIN `4321` $\to$ verify accepted.

**Acceptance Scenarios**:

1. **Given** an authenticated admin, **When** clicking "Change PIN" in the header, **Then** a modal opens with Current PIN, New PIN, and Confirm New PIN inputs.
2. **Given** the PIN change form, **When** submitting with an incorrect Current PIN, **Then** an error message is displayed ("Current PIN is incorrect").
3. **Given** the PIN change form, **When** New PIN and Confirm New PIN do not match, **Then** submission is prevented with an error ("New PINs do not match").
4. **Given** valid inputs, **When** submitted, **Then** the user's PIN is updated in the database and a success message is shown.

---

### User Story 3 - Structured Two-Line Volunteer Card Layout (Priority: P1)

As a hostel manager, I want the volunteer profile cards on the Volunteers page to organize work/stay details on Line 1 and contact information on Line 2, so that every card has a clean, uniform, and easily scannable layout.

**Why this priority**: Displaying role, application source, stay dates, email, and phone in a single wrapping row resulted in jagged, irregular wrapping across cards. Separating operational dates from contact info standardizes visual hierarchy.

**Independent Test**: Navigate to `/admin/volunteers`. Inspect volunteer cards across all tabs (`Applied`, `Accepted`, `Active`, etc.):
- **Line 1**: Shows `Role: [role]  •  Source: [source]  •  Stay Dates: [arrival] → [departure]` and qualification badges.
- **Line 2**: Shows `✉️ [email]` and `📞 [phone]` with active links.
- Confirm consistent vertical alignment and padding across all cards.

**Acceptance Scenarios**:

1. **Given** the volunteer list on `/admin/volunteers`, **When** viewing any volunteer card, **Then** Line 1 exclusively displays Role, Source, Stay Dates, and qualification badges.
2. **Given** any volunteer card, **When** viewing Line 2, **Then** it cleanly displays Email and Phone Number with active `mailto:` and `tel:` links.
3. **Given** a volunteer without email or phone, **When** rendered, **Then** Line 2 gracefully displays "No email" and "No phone" in muted text without breaking alignment.

---

### User Story 4 - Updated Staff Roles (Assistant Manager) (Priority: P1)

As a hostel manager, I want the staff role selection to include "Assistant Manager" and remove "Shift Supervisor", so that staff titles accurately reflect hostel management structure.

**Why this priority**: Operational alignment with hostel staffing hierarchy; Assistant Managers oversee shifts and reception duties.

**Independent Test**: Navigate to `/admin/staff`. Click "+ Add Staff Member". Open the "Role" dropdown:
- Verify **"Assistant Manager"** is available.
- Verify **"Shift Supervisor"** is no longer present.
- Verify available options: `Receptionist`, `Senior Receptionist`, `Assistant Manager`, `Hostel Manager`, `General Staff`.

**Acceptance Scenarios**:

1. **Given** the Staff management screen, **When** adding or editing a staff member, **Then** the role selector includes "Assistant Manager" and excludes "Shift Supervisor".
2. **Given** existing staff records, **When** viewing staff with the Assistant Manager role, **Then** their role badge displays "Assistant Manager".

---

## Edge Cases

- **Initial Admin Bootstrapping**: If no admin users exist in the database (e.g. fresh installation), the system automatically creates the default `admin` with PIN `1234`.
- **Username Uniqueness**: Attempting to add an admin with an existing username (case-insensitive) returns an error.
- **Self-Deletion Guard**: An admin cannot delete their own account while currently logged into it.
- **Minimum Admin Count**: Deleting the sole remaining administrator is strictly forbidden.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST store administrator accounts in an `admin_users` table with `id`, `username`, `pin`, and `createdAt`.
- **FR-002**: The system MUST seed a default `admin` account with PIN `1234` if no admin users exist.
- **FR-003**: The system MUST provide an Admin Users screen (`/admin/users`) allowing authenticated administrators to list, create, edit, and delete other admin users.
- **FR-004**: The system MUST provide a self-service "Change PIN" dialog in the navigation header allowing the logged-in administrator to update their PIN after validating their current PIN.
- **FR-005**: On `AdminVolunteersPage`, each volunteer profile card MUST render metadata in two separate lines:
  - **Line 1**: Role, Application Source, Stay Dates (arrival → departure), and role qualification badges.
  - **Line 2**: Email Address and Phone / WhatsApp Number with active clickable links (`mailto:` and `tel:`).
- **FR-006**: In `AdminStaffPage` and staff data models, the staff role choices MUST include "Assistant Manager" and MUST NOT include "Shift Supervisor".

### Key Entities

- **Admin User**: `id: TEXT`, `username: TEXT UNIQUE`, `pin: TEXT`, `createdAt: TEXT`.
- **Volunteer Card Layout**: Multi-line structured metadata container.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An administrator can create a new admin user in **under 20 seconds**.
- **SC-002**: An administrator can update their personal PIN in **under 15 seconds**.
- **SC-003**: 100% of volunteer cards render with consistent two-line metadata across all lifecycle tabs.
- **SC-004**: "Shift Supervisor" is 0% present and "Assistant Manager" is 100% available across all staff forms.

---

## Assumptions

- Admin PINs are numeric strings (typically 4–8 digits).
- The default seed credentials remain `admin` / `1234` for zero-config onboarding.

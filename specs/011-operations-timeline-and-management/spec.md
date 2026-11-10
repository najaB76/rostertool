# Feature Specification: Hostel Operations, Staffing Timeline & Volunteer Management Enhancements

**Feature Branch**: `011-operations-timeline-and-management`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User feedback from hostel management covering manual rostering guards, volunteer management enhancements (gender, departure modal, rehire status, age, multiple stays, filters), configurable headcount and date format settings, spreadsheet-style staffing timeline view, data backup and historical CLI import, and day of week display on volunteer portal shifts/time-off requests.

---

## Clarifications

### Session 2026-10-27
- Q: In what format will the historical spreadsheet data (`STAFF.ods` / Excel) be provided, and should the one-time import be executed via a standalone CLI script or an administrative web upload? → A: Option A (Data is exported from the spreadsheet to CSV and imported via a standalone CLI migration script).
- Q: Where should the Timeline view be placed in the admin navigation header? → A: Option A (New dedicated top-level navigation tab "Timeline" in the main top header).
- Q: How should the expected weekly shift quota be evaluated when triggering the over-allocation warning? → A: Option B (Display current assigned hours vs target hours in the confirmation dialog and allow the manager to override for shift recovery).
- Q: Displaying day of the week on the volunteer portal? → A: Display day of week name (e.g. `Monday` or `Mon`) alongside the formatted date for upcoming shifts and time-off requests.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manual Rostering Assignment Guards & Over-Allocation Warnings (Priority: P1)

As a hostel manager creating the weekly roster manually, I want:
1. Shift candidate lists for reception shifts to strictly exclude non-reception trained volunteers,
2. An informative confirmation modal displaying a volunteer's current assigned weekly hours versus their target hours whenever assigning a volunteer who has already reached or exceeded their expected weekly hours (while still allowing me to confirm and proceed to recover shifts from prior weeks),
3. A strict guard preventing assignments on dates before a volunteer's arrival or after their departure.

**Why this priority**: Prevents scheduling errors, respects legal/stay boundaries, and prevents accidental over-allocation of volunteers.

**Independent Test**:
- Open `/admin/roster` and click an unassigned Reception shift slot. Verify only reception-qualified volunteers and staff appear in the dropdown.
- Assign a volunteer who already has 16 or more assigned hours for the week. Verify a modal dialog displays: *"Volunteer currently has 16 assigned hours (target: 16h). Do you want to assign this additional shift?"* with Confirm and Cancel buttons.
- Attempt to assign a volunteer to a date before their arrival or after their departure. Verify the action is blocked with an explicit error message.

**Acceptance Scenarios**:
1. **Given** a Reception shift slot, **When** opening the assign candidate list, **Then** only volunteers with `isReceptionQualified === true` and qualified staff are displayed.
2. **Given** a volunteer who has reached or exceeded their target weekly hours, **When** a manager selects them for an additional shift, **Then** the system presents a confirmation dialog with their current hours and target hours, allowing the manager to either proceed or cancel.
3. **Given** a volunteer whose stay is from Date $A$ to Date $B$, **When** attempting to assign them to a shift on Date $< A$ or Date $> B$, **Then** the system rejects the assignment with an explanatory warning.

---

### User Story 2 - Volunteer Management, Departure Modal, Rehire Badges & Stay History (Priority: P1)

As a hostel volunteer coordinator, I want to:
1. Set an indeterminate departure date with a "No end date" checkbox,
2. Record volunteer Gender (`Male`, `Female`, `Neutral`, `Unspecified`) and display the appropriate symbol (♂, ♀, ⚧, ⚪) next to their name,
3. Capture departure reviews using a modal dialog containing a 5-star rating control, comments textbox, and a 3-way rehire status (`Accept`, `Possible`, `Don't Accept`),
4. View star ratings (★) and color-coded rehire badges (Green for `Accept`, Yellow for `Possible`, Red for `Don't Accept`) on the "Departed" cards,
5. See volunteer **Age** calculated from date of birth directly on list cards (keeping full date of birth inside details),
6. Track multiple stays for repeat volunteers, showing the latest stay on their card with a link to view past stays, and enabling a "Re-activate" modal for departed volunteers to register a new stay,
7. Filter volunteers across tabs by star rating, nationality, rehire eligibility, gender, and date range.

**Why this priority**: Elevates volunteer relationship management, improves operational evaluation, and properly handles returning alumni volunteers.

**Independent Test**:
- In volunteer create/edit, toggle "No end date"; verify departure date becomes optional/indeterminate.
- Select gender `Female`; verify `♀` displays next to preferred name on the card.
- Click "Mark as Departed" on an active volunteer; verify a modal opens with a 5-star rating picker, comment area, and Rehire status dropdown (`Accept`, `Possible`, `Don't Accept`).
- Go to the "Departed" tab; verify the card shows yellow stars (e.g. ★★★★☆) and a color-coded status badge (`Accept` in green, `Possible` in yellow, `Don't Accept` in red).
- Click "Re-activate" on a departed volunteer; verify a modal prompts for new arrival and departure dates, creating a new stay record and moving the volunteer to `Accepted` or `Active`.
- Filter the volunteer list by Gender `Male` and Nationality `FR`; verify the list filters reactively.

**Acceptance Scenarios**:
1. **Given** a volunteer with an open-ended stay, **When** "No end date" is checked, **Then** departure date is saved as open-ended and displayed as "Indeterminate" or "???" in rosters/timelines.
2. **Given** volunteer profile cards, **When** rendered, **Then** preferred name is accompanied by the gender symbol and age (e.g., `Steven ♂ (Age 40)`).
3. **Given** an active volunteer completing their stay, **When** clicking "Mark as Departed", **Then** a modal captures star rating (1–5), comments, and rehire status (`Accept`, `Possible`, `Don't Accept`) without browser alert popups.
4. **Given** a departed volunteer returning for another season, **When** clicking "Re-activate", **Then** the user can enter new arrival/departure dates, preserving the previous stay history.
5. **Given** volunteer list tabs, **When** applying filters (rating, nationality, rehire status, gender, stay dates), **Then** matching volunteers are displayed instantly.

---

### User Story 3 - Visual Staffing Timeline View (Priority: P1)

As a hostel manager, I want a dedicated **Staffing Timeline View** accessed via a new "Timeline" top-level navigation tab (matching the spreadsheet format in `image.png`), that displays a horizontal calendar timeline across at least 5 weeks, organized into Reception, Housekeeping, and Applied sections, showing daily occupancy bars and daily confirmed staff totals.

**Why this priority**: Critical for visual capacity planning, identifying upcoming turnover gaps, and monitoring staffing balance across multiple weeks at a glance.

**Independent Test**:
- Click "Timeline" in the top navigation header (`/admin/timeline`).
- Verify 3 categorized horizontal sections:
  1. Active & Accepted Reception staff
  2. Active & Accepted Housekeeping staff
  3. Applied (unconfirmed) candidates
- Verify columns on each row: Gender, Preferred Name with country flag, Nationality, Age, Source (e.g. Worldpackers, HelpX, Email), Status, Arrival date, Leaving date.
- Verify daily columns spanning at least 5 weeks with colored bars representing each staff member's stay.
- Verify a summary row calculates "Total Confirmed Staff Members" for each day with color coding matching headcount thresholds.
- Scroll horizontally or navigate backwards/forwards in time to inspect staffing on past and future dates.

**Acceptance Scenarios**:
1. **Given** the navigation header, **When** clicking "Timeline", **Then** the timeline view opens at `/admin/timeline` showing volunteers and staff segregated into Reception, Housekeeping, and Applied groups.
2. **Given** each day column, **When** evaluating confirmed volunteers/staff on site, **Then** the "Total Confirmed Staff" row shows the exact count color-coded by staffing health.
3. **Given** the calendar grid, **When** scrolling horizontally or jumping dates, **Then** at least 5 weeks are visible with seamless timeline bar rendering.

---

### User Story 4 - Configurable Headcount Targets & Global Date Format in Settings (Priority: P2)

As an administrator, I want to configure headcount thresholds and UI date formats on the `/admin/settings` page:
- Headcount targets: Baseline Target (default 11), Low Staffing (< 11 and > 8), Overbooked (> 11), Critical (< 8).
- Date format preference: choice between `YYYY-MM-DD` (ISO) and `DD-MM-YYYY` (European).

**Why this priority**: Adapts the software to seasonal capacity adjustments and international staff reading preferences.

**Independent Test**:
- Go to `/admin/settings`.
- Update Baseline Target to 12, Low Staffing to 9-11, Critical to < 9, Overbooked to > 12.
- Switch date format from `YYYY-MM-DD` to `DD-MM-YYYY`. Save settings.
- Navigate to `/admin/roster` and `/admin/volunteers`: verify dates are formatted as `DD-MM-YYYY`.
- Verify the headcount and timeline views adopt the new color threshold criteria.

**Acceptance Scenarios**:
1. **Given** the Settings page, **When** editing headcount parameters, **Then** the values persist and drive indicator badges across Headcount and Timeline views.
2. **Given** the Date Format setting, **When** toggled between `YYYY-MM-DD` and `DD-MM-YYYY`, **Then** all displayed dates conform globally to the chosen format.

---

### User Story 5 - Data Backup Export & Historical Data Migration (Priority: P2)

As a hostel owner/administrator, I want to export system data for safe backups and have a CLI migration script to import historical spreadsheet records into the system.

**Why this priority**: Protects against data loss and facilitates transitioning from legacy Excel/Calc spreadsheets (`STAFF.ods`).

**Independent Test**:
- In the admin interface, click "Export Backup"; verify a complete downloadable SQLite database or JSON snapshot is generated.
- Run the historical data import CLI script with a sample CSV dataset; verify volunteers, stay dates, and roles are imported cleanly without duplicates.

**Acceptance Scenarios**:
1. **Given** an admin user, **When** requesting a data backup, **Then** an export package containing all application tables is downloaded.
2. **Given** legacy volunteer records in CSV format, **When** processed through the historical import CLI script, **Then** past and current volunteer stays are populated into the database.

---

### User Story 6 - Day Names on Volunteer Portal Upcoming Shifts & Time-Off Requests (Priority: P2)

As a volunteer viewing my schedule and time-off requests on the portal page, I want the day of the week name (e.g., `Monday` or `Mon`) displayed next to the date for upcoming shifts and time-off requests, so that I immediately know what day of the week my obligations and leaves fall on without consulting an external calendar.

**Why this priority**: Improves schedule comprehension and eliminates attendance confusion for volunteers.

**Independent Test**:
- Open the volunteer portal (`/portal?token=...`).
- Verify each upcoming shift item displays the day name next to the date (e.g., `Monday, 2026-11-09` or `Mon, 09-11-2026`).
- Verify each time-off request item displays the day name next to the request date (e.g., `Friday, 2026-11-13`).

**Acceptance Scenarios**:
1. **Given** a volunteer viewing "My Upcoming Shifts" on `/portal`, **When** shifts are rendered, **Then** each item displays the day name (e.g., `Monday` or `Mon`) alongside the formatted date.
2. **Given** a volunteer viewing "My Time Off Requests" on `/portal`, **When** requests are rendered, **Then** each item displays the day name (e.g., `Friday` or `Fri`) alongside the formatted date.

---

## Edge Cases

- **Volunteers with "No end date" on Timeline**: How is the timeline bar rendered when there is no departure date? The bar should render continuously across the visible horizon with an open-ended indicator arrow or `???` symbol.
- **Mid-week arrivals and departures**: Shift assignment picker MUST disallow selecting dates prior to arrival or after departure, even if the weekly roster covers Monday–Sunday.
- **Repeat volunteers with overlapping stays**: System MUST prevent overlapping stay date ranges for the same volunteer record.
- **Date format ambiguity**: Regardless of the display format (`DD-MM-YYYY` or `YYYY-MM-DD`), the underlying API contracts and database storage MUST strictly remain ISO `YYYY-MM-DD`.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Manual Rostering
- **FR-001**: Candidate selector for Reception shifts MUST filter out volunteers where `isReceptionQualified` is false.
- **FR-002**: When manually assigning a volunteer whose assigned hours for the week already meet or exceed their target hours (e.g. $\ge 16$ hours), the system MUST display a confirmation dialog showing their current assigned weekly hours and target hours, allowing the manager to confirm the override (e.g., to recover a missed shift from a previous week) or cancel.
- **FR-003**: The system MUST reject any shift assignment where the shift date is before the volunteer's arrival date or after their departure date.

#### Volunteer Management & Stays
- **FR-004**: Volunteer records MUST support a `noEndDate` boolean flag, allowing the departure date to be optional/null.
- **FR-005**: Volunteer profiles MUST support a `gender` field with values `Male`, `Female`, `Neutral`, `Unspecified`, and display corresponding symbols (`♂`, `♀`, `⚧`, `⚪`).
- **FR-006**: Marking a volunteer as Departed MUST open a modal dialog to capture a 1–5 star rating, qualitative notes, and a rehire status of `Accept`, `Possible`, or `Don't Accept`.
- **FR-007**: Departed volunteer cards MUST display the rating as filled/empty stars and the rehire status as a color-coded tag (Green: Accept, Yellow: Possible, Red: Don't Accept).
- **FR-008**: Volunteer list cards MUST display computed **Age** instead of the full birth date. Full birth date MUST only appear when opening the profile details modal.
- **FR-009**: The system MUST support multiple stays per volunteer via a `volunteer_stays` relationship, retaining past stay histories and review ratings.
- **FR-010**: The Departed tab MUST offer a "Re-activate" action that opens a modal to specify new arrival and departure dates for a returning stay.
- **FR-011**: Volunteer list tabs (`Accepted`, `Active`, `Departed`) MUST provide filter controls for rating, nationality, rehire eligibility, gender, and date range.
- **FR-012**: Volunteer profiles MUST support a `source` field (e.g., `Worldpackers`, `HelpX`, `Former staff`, `Email`, `Direct`).

#### Settings & Preferences
- **FR-013**: System Settings MUST allow administrators to customize headcount threshold targets:
  - Baseline Target (default: 11)
  - Low Staffing lower/upper bounds (default: 8 to 10)
  - Critical lower bound (default: < 8)
  - Overbooked lower bound (default: > 11)
- **FR-014**: System Settings MUST allow selecting global date format display (`YYYY-MM-DD` or `DD-MM-YYYY`).

#### Staffing Timeline View
- **FR-015**: The application MUST provide a `/admin/timeline` view, accessible via a new top-level navigation tab ("Timeline") in the admin header, partitioned into:
  1. Active & Accepted Reception staff
  2. Active & Accepted Housekeeping staff
  3. Applied (unconfirmed) candidates
- **FR-016**: The timeline view MUST display rows containing Gender symbol, Preferred Name, Nationality flag, Age, Source, Status, Arrival Date, Departure Date, and day-by-day stay bar segments.
- **FR-017**: The timeline view MUST display a summary row for "Total Confirmed Staff Members" per day, with color coding driven by the configured headcount thresholds.
- **FR-018**: The timeline view MUST render a date horizon of at least 5 consecutive weeks and support fluid horizontal scrolling/navigation into past and future dates.

#### Data Management
- **FR-019**: The system MUST provide an authenticated endpoint and UI button to download a data backup.
- **FR-020**: The system MUST provide a standalone CLI migration script (`scripts/import-historical-data.ts`) to parse exported spreadsheet records (CSV format) and populate volunteer profiles and stay records into SQLite without duplication.

#### Volunteer Portal
- **FR-021**: In the volunteer portal page (`/portal`), all upcoming shift cards and time-off request items MUST display the day of the week name (e.g. `Monday` or `Mon`) alongside the formatted date.

---

### Key Entities *(include if feature involves data)*

- **Volunteer**:
  - `id`: unique identifier
  - `fullName`, `preferredName`, `nationality`, `email`, `phone`
  - `dateOfBirth`: date string (used to compute age)
  - `gender`: `Male` | `Female` | `Neutral` | `Unspecified`
  - `source`: `Worldpackers` | `HelpX` | `Former staff` | `Email` | `Friend` | `Other`
  - `primaryRole`: `Housekeeping` | `Reception`
  - `isReceptionQualified`: boolean
  - `status`: `Applied` | `Accepted` | `Active` | `Departed` | `Cancelled`

- **VolunteerStay**:
  - `id`: unique identifier
  - `volunteerId`: foreign key to Volunteer
  - `arrivalDate`: date string
  - `departureDate`: date string (nullable if `noEndDate` is true)
  - `noEndDate`: boolean
  - `departureRating`: integer (1 to 5, nullable until departed)
  - `departureNotes`: text
  - `rehireStatus`: `Accept` | `Possible` | `Don't Accept`
  - `createdAt`, `updatedAt`

- **HeadcountSettings**:
  - `headcount_baseline`: number (default 11)
  - `headcount_low_min`: number (default 8)
  - `headcount_low_max`: number (default 10)
  - `headcount_critical`: number (default 8)
  - `headcount_overbooked`: number (default 11)
  - `date_format_preference`: `'YYYY-MM-DD'` | `'DD-MM-YYYY'` (default `'YYYY-MM-DD'`)

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of candidate dropdowns for Reception shifts exclude volunteers not trained for reception.
- **SC-002**: 0 shift assignments permitted outside of a volunteer's arrival and departure date bounds.
- **SC-003**: Staffing timeline loads and displays 5+ weeks of schedule bars across all three tiers in < 500ms.
- **SC-004**: Departure review recording time reduced from multiple browser prompts to a single modal dialog submission.
- **SC-005**: 100% of returning repeat volunteers retain their historical stay records, ratings, and notes upon re-activation.
- **SC-006**: Changing date format preference updates all displayed dates throughout the interface instantly.
- **SC-007**: 100% of upcoming shifts and time-off requests in the volunteer portal clearly display the corresponding day of the week name next to the date.

---

## Assumptions

- **Timeline Bar Colors**: Distinct colors for volunteer stay bars on the timeline view can be deterministically or procedurally assigned based on volunteer ID/name to clearly distinguish overlapping stays.
- **Historical Import**: As noted by management, historical import of spreadsheet data is a one-time administrative setup task executed via CLI script from a CSV export.
- **Age Calculation**: Age is dynamically computed based on today's date and the volunteer's `dateOfBirth`. If `dateOfBirth` is missing, age is displayed as `??` or `-`.
- **Shift Over-Allocation Warning Threshold**: The expected number of shifts per week defaults to the configured setting (e.g. 4 housekeeping shifts or 16 hours), with any assignment beyond that triggering the override warning prompt displaying current assigned hours.
- **Day of Week Format**: The day name on the volunteer portal uses the localized full or abbreviated day name (e.g., `Monday` or `Mon`) followed by the date conforming to the date format setting.

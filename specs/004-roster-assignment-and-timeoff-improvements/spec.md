# Feature Specification: Roster Assignment, Country Search & Multi-Day Time-Off

**Feature Branch**: `004-roster-assignment-and-timeoff-improvements`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User description: "Three more improvements: 1. The country drop down only includes a small subset of countries, there are many missing - for example there are no Caribbean countries on the list. We get volunteers from all over. Make the country selection a search select menu including all the countries/territories/regions that there are flags for. 2. When the volunteer wants to select time off they should be able to request multiple days in one request. 3. The process for manually populating the roster is more complex than it needs to be. When the user clicks on the assign display a modal that lists the appropriate staff/volunteer rather than asking for s/v and the id number."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Interactive Shift Assignment Modal (Priority: P1)

As a hostel manager, when I click "+ Assign" on any shift cell in the weekly roster, I want an interactive modal to appear displaying eligible active volunteers and staff members, so that I can schedule someone in one click without typing codes, letters, or ID numbers.

**Why this priority**: Replacing awkward text prompts with an intuitive person-picker modal drastically speeds up day-to-day roster adjustments and eliminates manual input errors.

**Independent Test**: Click "+ Assign" on an open Housekeeping shift. Verify a clean modal opens displaying the shift name and date, listing all active volunteers with their flags, primary roles, and current assigned weekly hours, plus available staff members. Click a volunteer's name and verify they are assigned to the shift immediately.

**Acceptance Scenarios**:

1. **Given** any shift slot on the weekly roster, **When** the manager clicks "+ Assign", **Then** a modal opens displaying the shift title, time window, date, and a list of available candidates.
2. **Given** the candidate list in the assignment modal, **When** reviewing candidates, **Then** each candidate displays their first name, full name, country flag, assigned hours this week (e.g. `8 / 16h`), and role qualifications.
3. **Given** a volunteer who has already reached their weekly hour cap or has an approved time-off request on that date, **When** viewed in the assignment modal, **Then** they are visually marked as unavailable or flagged with a warning.
4. **Given** a Reception shift, **When** the assignment modal opens, **Then** both regular paid staff members and reception-qualified volunteers are clearly presented.
5. **Given** any candidate in the modal, **When** the manager clicks "Assign", **Then** the assignment is saved, the modal closes, and the roster grid updates immediately.

---

### User Story 2 - Comprehensive Searchable Country & Territory Select (Priority: P1)

As a hostel manager, I want the nationality selector in the volunteer modal to be a searchable dropdown containing all global countries, overseas territories, and regions with flags (including all Caribbean nations and territories), so that I can quickly search and accurately assign nationality for volunteers from anywhere in the world.

**Why this priority**: Volunteers at international hostels travel from every continent, island nation, and autonomous territory. A restricted list of ~70 countries excludes volunteers from the Caribbean, Pacific, Africa, and overseas territories.

**Independent Test**: Open the volunteer application modal. Type "Jam" into the country search input and observe "🇯🇲 Jamaica" appear. Search for "Barba" $\to$ "🇧🇧 Barbados", "Cur" $\to$ "🇨🇼 Curaçao", "Bah" $\to$ "🇧🇸 Bahamas", "Puer" $\to$ "🇵🇷 Puerto Rico", "Trin" $\to$ "🇹🇹 Trinidad & Tobago". Select a country and verify the vector flag and ISO code save properly.

**Acceptance Scenarios**:

1. **Given** the volunteer modal, **When** clicking the country selector, **Then** a searchable dropdown opens containing all 250+ standard ISO countries, territories, and regions.
2. **Given** the country selector open, **When** typing in the search box, **Then** the list filters in real time matching country names or 2-letter codes.
3. **Given** Caribbean and island nations/territories (e.g. Jamaica, Barbados, Bahamas, Saint Lucia, Aruba, Martinique, Cayman Islands, Dominican Republic, Trinidad and Tobago), **When** searched, **Then** all are selectable with their authentic flag graphics.
4. **Given** a selected country, **When** the volunteer is saved, **Then** the volunteer's card and roster cells display the vector flag.

---

### User Story 3 - Multi-Day Time-Off Requests in Volunteer Portal (Priority: P2)

As a volunteer using the self-service portal, I want to submit time-off requests spanning multiple consecutive days (or a start date and end date range) in a single request, so that I can request a travel break or long weekend without submitting multiple individual forms.

**Why this priority**: Volunteers taking trips or days off typically travel for 2 to 5 consecutive days. Forcing them to submit single-day requests repeatedly creates frustration and clutter.

**Independent Test**: Log into the volunteer portal via magic link. Click "Request Time Off". Select a Start Date (e.g. Friday) and an End Date (e.g. Sunday). Enter a reason ("Visiting waterfalls") and submit. Verify that the request is recorded for that full date range, appears on the volunteer portal, and displays as a multi-day request on the manager's review board.

**Acceptance Scenarios**:

1. **Given** the volunteer portal, **When** opening the "Request Time Off" dialog, **Then** the form allows selecting a Start Date and an End Date (or selecting multiple dates).
2. **Given** a date range where Start Date $\le$ End Date, **When** the volunteer submits the request, **Then** the system creates leave requests for all dates within the range with `Pending` status.
3. **Given** the manager's Time-Off Review board, **When** viewing the submitted request, **Then** the full date range (e.g. `2026-11-06 to 2026-11-08 (3 days)`) is displayed.
4. **Given** manager approval, **When** approved, **Then** all dates in the requested range are locked against auto-scheduling and flagged on the weekly roster.

---

## Edge Cases

- **Selecting single-day time off in multi-day form**: If a volunteer only needs one day off, setting Start Date equal to End Date (or leaving End Date blank) creates a single-day request.
- **Overlapping time-off submissions**: If a volunteer submits a range that partially overlaps with an existing pending or approved request, the system only creates records for unrequested dates in the range, avoiding duplicate entries.
- **Assignment modal candidate filtering**: If an active volunteer is already assigned to a different shift on the same date, the assignment modal indicates they are already working that day (double-booking warning).
- **Search accents and diacritics**: Searching country names like "Curacao" matches "Curaçao", and "Reunion" matches "Réunion".
- **Custom application source persistence**: If a manager selects "+ Other" in the source selector and enters a new source, it persists in the database and immediately becomes available for future selections.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Clicking "+ Assign" on any shift cell in the weekly roster MUST display an interactive Shift Assignment Modal instead of browser prompt dialogs.
- **FR-002**: The Shift Assignment Modal MUST display the target shift name, date, start time, end time, and current staffing ratio.
- **FR-003**: The Shift Assignment Modal MUST list all active volunteers with their graphic country flag, primary role, qualifications (Reception Qualified, Trainer, In Training), and current scheduled hours for that week.
- **FR-004**: The Shift Assignment Modal MUST list regular paid staff members for assignment to reception shifts.
- **FR-005**: The Shift Assignment Modal MUST visually highlight or warn if a candidate has an approved time-off request on that date or is already assigned to another shift that day.
- **FR-006**: Clicking any candidate in the Shift Assignment Modal MUST assign them to the shift, close the modal, and refresh the weekly grid immediately.
- **FR-007**: The country selector in the volunteer modal MUST be an interactive, searchable select menu including all countries, territories, and regions with vector flags (all 250+ ISO 3166-1 alpha-2 codes, with full Caribbean and island coverage).
- **FR-008**: The country search menu MUST provide real-time fuzzy/text filtering on country name and ISO country code.
- **FR-009**: The Time-Off Request form in the volunteer portal MUST allow selecting a date range (Start Date and End Date) or multiple dates in a single submission.
- **FR-010**: Submitting a multi-day time-off request MUST create pending records for all dates in the selected range under a shared request group or reason.
- **FR-011**: The manager's Time-Off review interface MUST group or display multi-day requests with total day count and date range, allowing 1-click approval or denial for the entire range.

### Key Entities

- **Shift Assignment Candidate**: View model representing volunteer/staff eligibility, current week assigned hours, and conflict status for a specific shift slot.
- **Country Catalog**: Expanded dataset of 250+ countries, territories, and dependencies mapped to ISO 3166-1 alpha-2 codes and names.
- **Time-Off Request**: Supports date ranges (`startDate`, `endDate`, and multi-day batching).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A manager can assign a volunteer or staff member to an open shift in **1 click** from the assignment modal (zero manual typing).
- **SC-002**: 100% of sovereign nations, Caribbean island nations, and overseas territories (250+ entries) are searchable and selectable with graphic SVG flags.
- **SC-003**: Typing a query into the country search menu filters the list in under **100ms**.
- **SC-004**: A volunteer can request up to 14 consecutive days of time off in a **single submission** in under 15 seconds.
- **SC-005**: A manager can approve or deny a multi-day time-off request in **1 click**.

---

## Assumptions

- The standard volunteer week runs Monday through Sunday.
- Time-off date ranges are inclusive of both Start Date and End Date.
- All 250+ country and territory vector flags are supported locally via `country-flag-icons`.

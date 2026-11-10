# Feature Specification: Flag, Roster & Headcount Enhancements

**Feature Branch**: `003-flag-and-calendar-enhancements`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User description: "Four improvements: 1. The font that is used doesn't have flag emojis so only shows the two letter codes - this is both in the roster view and in the volunteer info page. 2. On the daily calendar it is enough to show just first names. 3. How are magic links managed? There doesn't seem to be an option, the link should be shown on the volunteer's info page with an option for management to regenerate the link. 4. On the headcount page the blocks are arranged in seven item rows as if they are calendar but the blocks don't align to actual days. For example today is Tuesday October 27th but the 27th is the seventh block in the row which would be expected to be Sunday with a Monday to Sunday work week. In other words, Mondays should be in the first column of the grid."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Graphic SVG Flag Rendering on All Platforms (Priority: P1)

As a hostel manager, I want volunteer nationalities to display as crisp graphic flags on all devices and operating systems (including Windows and Linux terminals lacking emoji flag fonts), so that the national flags are always visually recognizable instead of rendering as two-letter text codes.

**Why this priority**: Displaying authentic country flags is a foundational visual requirement established in Constitution Principle II and modeled after the hostel's operational roster layout. Many desktop browsers and OS environments render Unicode regional indicators as raw letters (e.g. "US" or "DE") instead of flags.

**Independent Test**: Load the weekly roster and volunteer management pages in any browser on Windows, Linux, or macOS. Verify that all volunteer country indicators display as full-color graphic flags (using embedded/inline SVG assets) rather than two-letter text boxes.

**Acceptance Scenarios**:

1. **Given** any volunteer displayed on the weekly roster grid, **When** viewing their name, **Then** their national flag is displayed as a graphical flag next to their name regardless of host system font support.
2. **Given** the volunteer list and modal dropdown, **When** browsing volunteers or selecting a country, **Then** graphical flags are displayed beside country names and codes.
3. **Given** an invalid or unknown country code, **When** the flag component renders, **Then** a graceful fallback globe icon is displayed.

---

### User Story 2 - Compact First-Name Display on Daily Shift Grid (Priority: P1)

As a hostel manager, I want the weekly roster shift cards to display only the first name of each scheduled volunteer alongside their flag, so that shift cells remain clean, legible, and compact without awkward text wrapping.

**Why this priority**: Hostel shift boards typically refer to volunteers by their first name (e.g. "Hervé 🇫🇷", "Chris 🇫🇷", "Brenda 🇦🇷", "Marcelo 🇧🇷"). Full names cause visual clutter in compact daily cells.

**Independent Test**: Load the weekly schedule with volunteers having multi-word names (e.g., "Elena Rostova", "Jean-Luc Picard"). Verify that the shift cards display "Elena 🇩🇪" and "Jean-Luc 🇫🇷", while the full name remains accessible in tooltips and volunteer profile cards.

**Acceptance Scenarios**:

1. **Given** a volunteer with full name "Elena Rostova" assigned to a shift, **When** viewing the weekly roster cell, **Then** the cell displays "Elena" accompanied by her graphic country flag.
2. **Given** a volunteer with a single name or hyphenated first name, **When** viewing their shift slot, **Then** their primary first name is displayed cleanly.
3. **Given** a shift slot, **When** hovering over the volunteer's name, **Then** a tooltip reveals their complete full name and role.

---

### User Story 3 - Magic Link Display & Management on Volunteer Cards (Priority: P1)

As a hostel manager, I want to see each volunteer's unique magic link URL directly on their profile card with "Copy Link" and "Regenerate Link" options, so that I can easily distribute schedule links via WhatsApp/email and reset them if compromised.

**Why this priority**: Volunteers access their self-service schedules via magic links. Without visible link management, managers cannot easily share links with incoming volunteers or revoke compromised tokens.

**Independent Test**: Open the volunteer management page. Verify that each active or accepted volunteer card displays their portal link. Click "Copy Link" and verify the URL is copied to the clipboard. Click "Regenerate Link", confirm the reset, and verify a fresh URL is generated and the old token is invalidated.

**Acceptance Scenarios**:

1. **Given** an accepted or active volunteer, **When** viewing their card on the management page, **Then** their personalized portal URL is displayed with a "Copy Link" button.
2. **Given** a volunteer with an existing magic link, **When** the manager clicks "Regenerate Link", **Then** the system invalidates the previous token, generates a new secure token, and updates the displayed URL immediately.
3. **Given** an invalidated magic link, **When** anyone attempts to access the portal using the old URL, **Then** access is denied with an appropriate unauthorized message.

---

### User Story 4 - Monday-Aligned Headcount Calendar Grid (Priority: P2)

As a hostel manager, I want the Headcount Calendar grid to align strictly to a Monday-to-Sunday work week with day-of-week headers (Mon, Tue, Wed, Thu, Fri, Sat, Sun), so that calendar days fall on their true days of the week.

**Why this priority**: Presenting calendar blocks without weekday alignment causes confusion (e.g., Tuesday the 27th appearing in the Sunday column), violating basic calendar conventions.

**Independent Test**: Navigate to the Headcount page for October 2026. Verify that column 1 is Monday, column 2 is Tuesday, and October 27th falls in Column 2 (Tuesday), with the first days of the month offset appropriately by empty padding cells.

**Acceptance Scenarios**:

1. **Given** the Headcount Calendar grid, **When** viewing any month, **Then** column headers are displayed in order: `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`.
2. **Given** a month whose first day is not Monday (e.g. Thursday), **When** the calendar renders, **Then** the first row contains empty offset cells for Monday, Tuesday, and Wednesday, with Day 1 placed accurately in the Thursday column.
3. **Given** Tuesday October 27, 2026, **When** inspecting its position on the calendar grid, **Then** it is located in Column 2 (`Tue`).
4. **Given** the compact heatmap mode for Month, Quarter, or Year, **When** rendered, **Then** all days retain their correct Monday-to-Sunday weekday column alignment.

---

## Edge Cases

- **System clipboard permissions**: If the browser blocks automatic clipboard copying, the UI falls back to highlighting the magic link URL inside a selectable text field for manual copying.
- **Volunteers with duplicate first names on the same shift**: If two volunteers on the same shift share a first name (e.g. "Chris M." and "Chris D."), the initial of their last name is appended to disambiguate.
- **Months starting on Sunday**: Because the rostering cycle is Monday–Sunday, Sunday is the 7th column. A month starting on Sunday will have 6 leading offset cells (Mon–Sat).
- **Leap years and February alignment**: Correctly renders 29 days in leap years with proper weekday offsets across year and quarter views.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render country flags as graphical SVG elements (or high-resolution vector assets) rather than relying on operating system Unicode emoji fonts, ensuring universal rendering across Windows, Linux, Android, iOS, and macOS.
- **FR-002**: The system MUST provide an SVG flag component that maps ISO 3166-1 alpha-2 country codes to crisp, standardized flag graphics with a fallback globe icon for unrecognized codes.
- **FR-003**: The weekly roster shift cells MUST display the volunteer's first name (or first name + last initial when duplicate first names occur on the same shift) alongside their graphical country flag.
- **FR-004**: Hovering over any volunteer's name on the weekly roster MUST display a tooltip showing their full name, nationality, and primary role.
- **FR-005**: Every volunteer card on `AdminVolunteersPage` MUST prominently display the volunteer's self-service magic link URL.
- **FR-006**: The volunteer card MUST provide a "Copy Link" button that copies the portal URL directly to the user's clipboard and provides visual feedback ("Copied!").
- **FR-007**: The volunteer card MUST provide a "Regenerate Link" button that calls the backend token reset endpoint, updates the token in the database, and refreshes the displayed URL in real time.
- **FR-008**: The Headcount Calendar grid MUST have 7 columns starting with Monday and ending with Sunday (`Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`).
- **FR-009**: The Headcount Calendar MUST calculate the weekday of the 1st day of each month and prepend the appropriate number of empty padding cells (0 for Monday, 1 for Tuesday, ..., 6 for Sunday) so that every calendar date aligns strictly to its true day of the week.
- **FR-010**: Compact heatmap view modes (Quarter and Year) MUST preserve the Monday-through-Sunday column structure for each month block.

### Key Entities

- **Country Flag Graphic Asset**: Standalone vector/SVG representations for all ISO 3166-1 alpha-2 codes.
- **Volunteer**: Magic link token representation exposed on profile with reset action.
- **Headcount Day Cell**: Expanded with weekday offset metadata (`dayOfWeekIndex: 0..6` where 0 = Monday).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of country flags render as graphical color flags on all platforms without displaying two-letter letter boxes (e.g. "US").
- **SC-002**: Daily shift slots display names with a character count reduction of $\ge 40\%$, keeping shift cards legible and unclipped on desktop displays.
- **SC-003**: A manager can copy a volunteer's magic link in 1 click from their profile card.
- **SC-004**: Regenerating a magic link takes under 1 second and immediately displays the new URL.
- **SC-005**: 100% of calendar dates on the Headcount page fall under the exact weekday header matching their real-world calendar day (e.g. Oct 27, 2026 is strictly under `Tue`).

---

## Assumptions

- The work week is strictly Monday through Sunday.
- Host machine running the client web browser may not have emoji color fonts installed (common on enterprise Windows and standard Linux installations).
- Magic links point to `/portal?token=<token>` on the host origin.

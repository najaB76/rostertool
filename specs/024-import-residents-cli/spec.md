# Feature Specification: Volunteer JSON Import CLI Tool

**Feature Branch**: `024-import-residents-cli`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User feedback:
"NEW: Returning to the volunteer import question, I have exported the data from the existing system and the file is available to analyse the structure to make an import tool. This is a one-off import so a CLI tool is preferred rather than adding clutter to the UI. The file is @residents.json. The requirement is to build a CLI tool to import the data into the volunteers table."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Import Historical & Active Residents from JSON via CLI (Priority: P1)

As a hostel administrator, I want to execute a command-line script (e.g. `npm run import:residents` or `npx tsx scripts/import-residents.ts [file]`) that reads `residents.json`, validates the data, and imports all records into the `volunteers` table and `volunteer_stays` table without duplicating existing volunteers, so that our historical and current volunteer roster is fully populated from the legacy export without adding UI clutter.

**Why this priority**: Importing existing resident data is essential for accurate staffing records, past stay history, and point-in-time auditing. A CLI tool is lightweight, reproducible, and keeps the web UI clean.

**Independent Test**:
- Create a test JSON file with sample records:
  1. Record with past dates (`arrival_date: '2024-03-01', departure_date: '2024-04-15'`, rating: 4, accept: 'Yes').
  2. Record currently in house (`arrival_date: '2026-11-01', departure_date: '2026-12-15'`).
  3. Record who never arrived (`arrival_date: null, departure_date: null`).
- Run the CLI tool with `--dry-run`: verify records are parsed and validated without DB modification.
- Run the CLI tool without `--dry-run`: verify all records are inserted with correct status (`Departed`, `Active`, `Cancelled`), stay records, and rehire statuses.
- Re-run the CLI tool: verify it is idempotent (updates or skips without creating duplicate volunteer records).

**Acceptance Scenarios**:
1. **Given** `residents.json`, **When** the CLI tool is executed with `--dry-run`, **Then** it logs the count of valid records, status breakdown, and makes 0 writes to the database.
2. **Given** valid resident records, **When** imported, **Then**:
   - `fullName` combines `given_names` and `family_name`.
   - `gender` maps `'M'` $\rightarrow$ `'Male'`, `'F'` $\rightarrow$ `'Female'`.
   - `status` is automatically derived based on dates (`Cancelled` if null arrival, `Departed` if departure in past, `Active` if currently on site, `Accepted` if arrival in future).
   - `futureAcceptance` maps `'Yes'` $\rightarrow$ `'YES'`, `'No'` $\rightarrow$ `'NO'`, `'Up to you'` $\rightarrow$ `'CONDITIONAL'`.
   - `volunteer_stays` records are created for any volunteer with an arrival date, preserving `departureRating` (star rating), `departureNotes`, and `rehireStatus`.
3. **Given** country codes with sub-regions like `GB-SCT` and `GB-ENG`, **When** rendered with `CountryFlag`, **Then** `CountryFlag` normalizes hyphenated sub-codes to match `country-flag-icons` (e.g. `GB_SCT`, `GB_ENG`) displaying authentic regional flags.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A standalone TypeScript CLI script `scripts/import-residents.ts` MUST be created to import `residents.json` into SQLite via Drizzle ORM.
- **FR-002**: The CLI script MUST accept an optional file path argument (defaulting to `residents.json`) and an optional `--dry-run` flag.
- **FR-003**: The script MUST validate and sanitize each resident record:
  - Generate full name as `${r.given_names} ${r.family_name}`.
  - Map gender `'M'` to `'Male'`, `'F'` to `'Female'`, and fallback to `'Unspecified'`.
  - Derive volunteer status:
    - If `arrival_date == null`: `'Cancelled'`.
    - Else if `arrival_date > today`: `'Accepted'`.
    - Else if `departure_date == null || departure_date >= today`: `'Active'`.
    - Else: `'Departed'`.
  - Set `noEndDate` to `true` if `arrival_date` is non-null and `departure_date` is null.
- **FR-004**: For any record with an `arrival_date`, the script MUST insert a corresponding row into `volunteer_stays` with `departureRating`, `departureNotes`, and `rehireStatus`.
- **FR-005**: The script MUST be idempotent: if a volunteer with the same `fullName` already exists, it updates their record and stays rather than inserting a duplicate.
- **FR-006**: In `package.json`, an `npm run import:residents` script MUST be registered.
- **FR-007**: `CountryFlag.tsx` MUST support hyphenated ISO sub-codes (e.g. `GB-SCT`, `GB-ENG`) by checking `code.replace('-', '_')` to display Scottish and English flags.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the 404 records in `residents.json` can be imported in < 3 seconds without errors or duplicates.
- **SC-002**: 100% of volunteers with past stays have corresponding `volunteer_stays` entries populated with star ratings and review notes.
- **SC-003**: Executing `--dry-run` produces 0 modifications to `volunteers` or `volunteer_stays`.
- **SC-004**: Scottish (`GB-SCT`) and English (`GB-ENG`) residents display authentic regional flags via `CountryFlag`.

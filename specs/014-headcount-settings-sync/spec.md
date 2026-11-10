# Feature Specification: Dynamic Headcount Capacity Settings Integration

**Feature Branch**: `014-headcount-settings-sync`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User bug report: "FIX: The headcount page is ignoring the headcount settings. Changing the 'Headcount Target', 'Critical Lower Bound', 'Low Staffing (min)' and 'Low Staffing (Max)' values has no impact on the Headcount tab where the values do not change."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Headcount Page Reflects Configured Capacity Settings (Priority: P1)

As a hostel administrator, when I modify the capacity settings on `/admin/settings` (Baseline Target, Low Staffing min/max, Critical Alert, and Overbooked thresholds), I want the Headcount page (`/admin/headcount`) and its legend banner to dynamically use and display these updated threshold values, so that capacity planning and health indicators reflect current operational targets.

**Why this priority**: Currently, the Headcount page displays hardcoded benchmarks ("12 volunteers", "10–11", "<10 or >15") and the backend headcount service evaluates status using hardcoded integers, completely ignoring changes made in Settings.

**Independent Test**:
1. Open `/admin/settings`.
2. Update:
   - Baseline Target: `14`
   - Low Staffing (Min): `9`
   - Low Staffing (Max): `12`
   - Critical Lower Bound: `7`
   - Overbooked Threshold: `15`
3. Click "Save Settings".
4. Navigate to `/admin/headcount`.
5. Verify the Capacity Benchmarks banner displays:
   - *Baseline Target (14 volunteers)*
   - *Low Staffing (9–12)*
   - *Critical Alert (<7)*
   - *Overbooked (>15)*
6. Verify calendar heatmap days calculate health colors according to these updated thresholds (e.g. count of 14 is highlighted as optimal green; count of 11 is highlighted as low staffing warning).

**Acceptance Scenarios**:
1. **Given** customized headcount settings in `system_settings`, **When** visiting `/admin/headcount`, **Then** the Capacity Benchmarks legend banner displays the configured values instead of hardcoded numbers.
2. **Given** daily volunteer occupancy counts, **When** evaluating daily health statuses (`CRITICAL_LOW`, `LOW_WARNING`, `OPTIMAL`, `OVERLAP_WARNING`), **Then** the backend and calendar use the stored settings thresholds dynamically.
3. **Given** any future changes to settings on `/admin/settings`, **When** returning to `/admin/headcount`, **Then** the page immediately reflects the updated benchmarks without hardcoded caching.

---

## Edge Cases

- **Missing or Partial Settings in Database**: System MUST fall back to configured default benchmarks (Baseline 11, Low Min 8, Low Max 10, Critical 8, Overbooked 11).
- **Inverted Bounds (e.g. Min > Max)**: Sanitized so that the lower number is treated as minimum and higher as maximum.
- **Volunteers with "No end date"**: Counted as active for all dates on or after their arrival date.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The `/admin/headcount` frontend page MUST fetch and display the configured capacity benchmarks (`headcountBaseline`, `headcountLowMin`, `headcountLowMax`, `headcountCritical`, `headcountOverbooked`) from `system_settings`.
- **FR-002**: The Capacity Benchmarks legend banner in `/admin/headcount` MUST NOT hardcode numbers and MUST dynamically render the active settings:
  - Baseline Target (`${settings.headcountBaseline} volunteers`)
  - Low Staffing (`${settings.headcountLowMin}–${settings.headcountLowMax}`)
  - Critical Alert (`<${settings.headcountCritical}`)
  - Overbooked (`>${settings.headcountOverbooked}`)
- **FR-003**: The backend `HeadcountService.getDailyHeadcounts` MUST query `system_settings` to obtain active thresholds and dynamically calculate each day's status:
  - `count < critical` $\to$ `CRITICAL_LOW`
  - `count >= lowMin && count <= lowMax` $\to$ `LOW_WARNING`
  - `count === baseline` $\to$ `OPTIMAL`
  - `count > overbooked` $\to$ `CRITICAL_HIGH`
- **FR-004**: The `/api/admin/headcount` endpoint MUST preserve its array payload response format for backward compatibility while honoring dynamic threshold calculations.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of benchmark numbers displayed on `/admin/headcount` match the current values saved on `/admin/settings`.
- **SC-002**: 0 hardcoded benchmark numbers ("12", "10-11", "<10 or >15") remain in `AdminHeadcountPage.tsx` or `headcount-service.ts`.
- **SC-003**: Changing any headcount threshold in settings immediately reflects in the headcount page legend and heatmap color evaluations on next page load.

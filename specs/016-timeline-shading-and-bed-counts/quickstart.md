# Quickstart: Timeline Shading & Bed Count Capacity Adjustments

**Feature**: `016-timeline-shading-and-bed-counts`

## Verification Scenarios
1. Open `/admin/timeline`.
2. Inspect cells in volunteer stay bars:
   - Verify no '1' or '0' text is rendered.
   - Verify active days have solid intense color.
   - Verify checkout/departure day has a distinct hatched/lighter appearance.
3. Inspect `dailyConfirmedCounts`:
   - On a volunteer's departure date, verify they are NOT included in the overnight confirmed volunteer count.

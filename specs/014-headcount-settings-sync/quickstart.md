# Quickstart: Dynamic Headcount Settings Integration

**Feature**: `014-headcount-settings-sync`

## Verification Scenario
1. Navigate to `/admin/settings` and set:
   - Baseline Target: `14`
   - Low Staffing Min: `9`
   - Low Staffing Max: `12`
   - Critical Alert: `7`
   - Overbooked: `15`
2. Save settings.
3. Navigate to `/admin/headcount`.
4. Verify the Capacity Benchmarks banner shows:
   - Baseline Target (14 volunteers)
   - Low Staffing (9–12)
   - Critical Alert (<7)
   - Overbooked (>15)

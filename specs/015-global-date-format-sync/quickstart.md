# Quickstart: Global Date Format Synchronization

**Feature**: `015-global-date-format-sync`

## Verification Scenario
1. Go to `/admin/settings`.
2. Set Date Format: `DD-MM-YYYY`. Click Save.
3. Check:
   - `/admin/volunteers`: Stay dates format as `DD-MM-YYYY` (e.g. `09-11-2026`).
   - `/admin/roster`: Day headers and week range format as `DD-MM-YYYY`.
   - `/admin/timeline`: Arrival/departure columns format as `DD-MM-YYYY`.
   - `/admin/headcount`: Period subtitle formats as `DD-MM-YYYY`.
   - `/admin/time-off`: Request dates format as `DD-MM-YYYY`.
4. Switch back to `YYYY-MM-DD` and verify all revert.

# Quickstart: Volunteer JSON Import CLI Tool

**Feature**: `024-import-residents-cli`

## CLI Usage

### Dry-run validation (0 writes):
```bash
npm run import:residents -- --dry-run
```
or
```bash
npx tsx scripts/import-residents.ts residents.json --dry-run
```

### Full database import:
```bash
npm run import:residents
```
or
```bash
npx tsx scripts/import-residents.ts residents.json
```

## Expected Output
```text
✓ Validated 404 resident records.
Breakdown:
  - Departed: 394
  - Active: 6
  - Cancelled: 4
  - Accepted: 0
✓ Imported 404 volunteers and 400 stays into SQLite database.
```

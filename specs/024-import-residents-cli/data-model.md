# Data Model: Volunteer JSON Import CLI Tool

**Feature**: `024-import-residents-cli`
**Date**: 2026-10-27
**Status**: Completed

## Source JSON Schema (`residents.json`)

```typescript
export interface ResidentJsonRecord {
  given_names: string;
  family_name: string;
  preferred_name: string | null;
  date_of_birth: string | null;
  gender: 'M' | 'F' | string;
  country: string;
  arrival_date: string | null;
  departure_date: string | null;
  primary_role: 'Housekeeping' | 'Reception' | string;
  reception_qualified: boolean;
  star_rating: number; // 0 to 5
  accept_new_application: 'Yes' | 'No' | 'Up to you' | string;
  notes: string | null;
}
```

## Target Entity Mapping

1. **`volunteers` Table**:
   - `id`: UUID v4
   - `fullName`: `${given_names} ${family_name}`
   - `preferredName`: `preferred_name`
   - `dateOfBirth`: `date_of_birth`
   - `gender`: 'Male' | 'Female' | 'Unspecified'
   - `nationality`: `country` (e.g. 'AR', 'ES', 'GB-SCT', 'GB-ENG')
   - `primaryRole`: `primary_role`
   - `isReceptionQualified`: `Boolean(reception_qualified)`
   - `status`: Derived from `arrival_date` and `departure_date`
   - `arrivalDate`: `arrival_date`
   - `departureDate`: `departure_date`
   - `noEndDate`: Boolean
   - `futureAcceptance`: 'YES' | 'NO' | 'CONDITIONAL'
   - `source`: 'Former staff'
   - `notes`: `notes`

2. **`volunteer_stays` Table** (if `arrival_date` is non-null):
   - `id`: UUID v4
   - `volunteerId`: `volunteers.id`
   - `arrivalDate`: `arrival_date`
   - `departureDate`: `departure_date`
   - `noEndDate`: Boolean
   - `departureRating`: `star_rating > 0 ? star_rating : null`
   - `departureNotes`: `notes`
   - `rehireStatus`: 'Accept' | 'Possible' | 'Don\'t Accept'

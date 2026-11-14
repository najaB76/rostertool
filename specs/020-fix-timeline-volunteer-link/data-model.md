# Data Model: Fix Volunteer by ID Route for Timeline Hyperlink

**Feature**: `020-fix-timeline-volunteer-link`
**Date**: 2026-10-27
**Status**: Completed

## Volunteer Detail Schema (`GET /api/admin/volunteers/:id`)

```typescript
export interface VolunteerDetailResponse {
  id: string;
  fullName: string;
  preferredName: string | null;
  dateOfBirth: string | null;
  email: string | null;
  phone: string | null;
  nationality: string;
  gender: string;
  source: string;
  applicationSourceName: string;
  status: 'Active' | 'Accepted' | 'Applied' | 'Departed' | 'Cancelled';
  primaryRole: 'Reception' | 'Housekeeping';
  arrivalDate: string | null;
  departureDate: string | null;
  noEndDate: boolean;
  isReceptionQualified: boolean;
  isTrainer: boolean;
  inTraining: boolean;
  notes: string | null;
  staysCount: number;
  stays: {
    id: string;
    volunteerId: string;
    arrivalDate: string;
    departureDate: string | null;
    noEndDate: boolean;
    departureRating: number | null;
    departureNotes: string | null;
    rehireStatus: string | null;
  }[];
}
```

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db } from '../src/server/db/client.js';
import { volunteers, volunteerStays } from '../src/server/db/schema.js';
import { eq } from 'drizzle-orm';

export interface ResidentJsonRecord {
  given_names: string;
  family_name: string;
  preferred_name: string | null;
  date_of_birth: string | null;
  gender: string;
  country: string;
  arrival_date: string | null;
  departure_date: string | null;
  primary_role: string;
  reception_qualified: boolean;
  star_rating: number;
  accept_new_application: string;
  notes: string | null;
}

export function parseResidentStatus(arrivalDate: string | null, departureDate: string | null, today: string): 'Active' | 'Departed' | 'Accepted' | 'Cancelled' {
  if (!arrivalDate) return 'Cancelled';
  if (arrivalDate > today) return 'Accepted';
  if (!departureDate || departureDate >= today) return 'Active';
  return 'Departed';
}

export function mapGender(g: string): 'Male' | 'Female' | 'Unspecified' {
  if (!g) return 'Unspecified';
  const upper = g.trim().toUpperCase();
  if (upper === 'M' || upper === 'MALE') return 'Male';
  if (upper === 'F' || upper === 'FEMALE') return 'Female';
  return 'Unspecified';
}

export function mapFutureAcceptance(accept: string): 'YES' | 'NO' | 'CONDITIONAL' {
  if (!accept) return 'YES';
  const lower = accept.trim().toLowerCase();
  if (lower === 'no') return 'NO';
  if (lower === 'up to you' || lower === 'conditional' || lower === 'possible') return 'CONDITIONAL';
  return 'YES';
}

export function mapRehireStatus(accept: string): 'Accept' | 'Possible' | "Don't Accept" {
  if (!accept) return 'Accept';
  const lower = accept.trim().toLowerCase();
  if (lower === 'no') return "Don't Accept";
  if (lower === 'up to you' || lower === 'conditional' || lower === 'possible') return 'Possible';
  return 'Accept';
}

export async function importResidents(filePath: string, options: { dryRun?: boolean; today?: string } = {}) {
  const absPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`File not found: ${absPath}`);
  }

  const raw = fs.readFileSync(absPath, 'utf8');
  const records: ResidentJsonRecord[] = JSON.parse(raw);
  const today = options.today || new Date().toISOString().split('T')[0];

  const summary = {
    total: records.length,
    active: 0,
    departed: 0,
    accepted: 0,
    cancelled: 0,
    staysRecorded: 0,
    created: 0,
    updated: 0,
    dryRun: Boolean(options.dryRun)
  };

  for (const r of records) {
    const status = parseResidentStatus(r.arrival_date, r.departure_date, today);
    if (status === 'Active') summary.active++;
    else if (status === 'Departed') summary.departed++;
    else if (status === 'Accepted') summary.accepted++;
    else if (status === 'Cancelled') summary.cancelled++;

    if (r.arrival_date) summary.staysRecorded++;
  }

  console.log(`\n📋 Parsing ${summary.total} resident records from ${filePath}`);
  console.log(`   - Active:    ${summary.active}`);
  console.log(`   - Departed:  ${summary.departed}`);
  console.log(`   - Accepted:  ${summary.accepted}`);
  console.log(`   - Cancelled: ${summary.cancelled}`);
  console.log(`   - Stays:     ${summary.staysRecorded}`);

  if (options.dryRun) {
    console.log(`\n[DRY RUN] Completed validation with 0 database modifications.`);
    return summary;
  }

  for (const r of records) {
    const fullName = `${r.given_names} ${r.family_name}`.trim();
    const status = parseResidentStatus(r.arrival_date, r.departure_date, today);
    const gender = mapGender(r.gender);
    const futureAcceptance = mapFutureAcceptance(r.accept_new_application);
    const noEndDate = Boolean(r.arrival_date && !r.departure_date);
    const role = (r.primary_role === 'Reception') ? 'Reception' : 'Housekeeping';

    // Check if volunteer exists by fullName
    const existing = await db.select().from(volunteers).where(eq(volunteers.fullName, fullName)).get();
    let volId: string;

    if (existing) {
      volId = existing.id;
      await db.update(volunteers).set({
        preferredName: r.preferred_name || existing.preferredName,
        dateOfBirth: r.date_of_birth || existing.dateOfBirth,
        gender,
        nationality: r.country || existing.nationality,
        primaryRole: role,
        isReceptionQualified: Boolean(r.reception_qualified),
        status,
        arrivalDate: r.arrival_date,
        departureDate: r.departure_date,
        noEndDate,
        futureAcceptance,
        notes: r.notes || existing.notes,
        updatedAt: new Date().toISOString()
      }).where(eq(volunteers.id, volId));
      summary.updated++;
    } else {
      volId = crypto.randomUUID();
      await db.insert(volunteers).values({
        id: volId,
        fullName,
        preferredName: r.preferred_name || null,
        dateOfBirth: r.date_of_birth || null,
        gender,
        nationality: r.country || 'ES',
        primaryRole: role,
        isReceptionQualified: Boolean(r.reception_qualified),
        status,
        arrivalDate: r.arrival_date,
        departureDate: r.departure_date,
        noEndDate,
        source: 'Former staff',
        futureAcceptance,
        notes: r.notes || null,
        magicLinkToken: crypto.randomUUID()
      });
      summary.created++;
    }

    // Insert or update stay record if arrival_date exists
    if (r.arrival_date) {
      const existingStays = await db.select().from(volunteerStays).where(eq(volunteerStays.volunteerId, volId));
      const matchingStay = existingStays.find(s => s.arrivalDate === r.arrival_date);

      const rating = (typeof r.star_rating === 'number' && r.star_rating > 0) ? r.star_rating : null;
      const rehireStatus = mapRehireStatus(r.accept_new_application);

      if (matchingStay) {
        await db.update(volunteerStays).set({
          departureDate: r.departure_date,
          noEndDate,
          departureRating: rating,
          departureNotes: r.notes || matchingStay.departureNotes,
          rehireStatus
        }).where(eq(volunteerStays.id, matchingStay.id));
      } else {
        await db.insert(volunteerStays).values({
          id: crypto.randomUUID(),
          volunteerId: volId,
          arrivalDate: r.arrival_date,
          departureDate: r.departure_date,
          noEndDate,
          departureRating: rating,
          departureNotes: r.notes || null,
          rehireStatus
        });
      }
    }
  }

  console.log(`\n✓ Database import complete: ${summary.created} volunteers created, ${summary.updated} updated, ${summary.staysRecorded} stays recorded.\n`);
  return summary;
}

// CLI entry point
if (process.argv[1]?.endsWith('import-residents.ts') || process.argv[1]?.endsWith('import-residents.js')) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const targetFile = args.find(a => !a.startsWith('--')) || 'residents.json';

  importResidents(targetFile, { dryRun })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Import failed:', err);
      process.exit(1);
    });
}

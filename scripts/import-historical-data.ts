import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db } from '../src/server/db/client.js';
import { volunteers, volunteerStays } from '../src/server/db/schema.js';
import { eq } from 'drizzle-orm';

function parseDate(dateStr: string): string | null {
  if (!dateStr || dateStr.trim() === '' || dateStr.includes('?') || dateStr.toLowerCase().includes('late') || dateStr.toLowerCase().includes('mid')) {
    return null;
  }
  const str = dateStr.trim();
  // If DD/MM/YY or DD/MM/YYYY
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      let day = parts[0].padStart(2, '0');
      let month = parts[1].padStart(2, '0');
      let year = parts[2];
      if (year.length === 2) {
        year = parseInt(year, 10) > 70 ? `19${year}` : `20${year}`;
      }
      return `${year}-${month}-${day}`;
    }
  }
  // If YYYY-MM-DD
  if (str.includes('-')) {
    return str;
  }
  return null;
}

function parseGender(sex: string): 'Male' | 'Female' | 'Neutral' | 'Unspecified' {
  const s = (sex || '').trim().toUpperCase();
  if (s === 'M' || s === 'MALE') return 'Male';
  if (s === 'F' || s === 'FEMALE') return 'Female';
  if (s === 'N' || s === 'NEUTRAL') return 'Neutral';
  return 'Unspecified';
}

function parseCountryCode(countryStr: string): string {
  const c = (countryStr || '').trim();
  if (c.length >= 2) {
    return c.slice(0, 2).toUpperCase();
  }
  return 'ES';
}

function parseStatus(statusStr: string): 'Active' | 'Accepted' | 'Applied' | 'Departed' {
  const s = (statusStr || '').trim().toLowerCase();
  if (s.includes('in da house') || s.includes('active')) return 'Active';
  if (s.includes('confirmed') && !s.includes('not')) return 'Accepted';
  if (s.includes('not confirmed') || s.includes('applied')) return 'Applied';
  return 'Active';
}

export async function importHistoricalData(filePath: string) {
  const absPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`File not found: ${absPath}`);
  }

  const content = fs.readFileSync(absPath, 'utf8');
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  if (lines.length < 2) {
    console.log('CSV file is empty or missing data rows.');
    return;
  }

  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  console.log(`Processing ${lines.length - 1} records from ${filePath}...`);

  let importedVols = 0;
  let importedStays = 0;
  let currentRole = 'Housekeeping';

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (row.length === 0 || row.every(c => c === '')) continue;

    // Check if section divider row
    if (row[0].toLowerCase().includes('reception') || row[1]?.toLowerCase().includes('reception')) {
      currentRole = 'Reception';
      continue;
    }
    if (row[0].toLowerCase().includes('housekeeping') || row[1]?.toLowerCase().includes('housekeeping')) {
      currentRole = 'Housekeeping';
      continue;
    }

    // Map columns: Sex, Name, Country, Age, Source, Status, Arrival, Departing
    const sex = row[0] || '';
    const name = row[1] || '';
    if (!name) continue;

    const country = row[2] || 'ES';
    const source = row[4] || 'Spreadsheet import';
    const status = parseStatus(row[5]);
    const arrivalDate = parseDate(row[6]) || '2026-11-01';
    const departureRaw = row[8] || '';
    const departureDate = parseDate(departureRaw);
    const noEndDate = !departureDate || departureRaw.includes('?');

    const gender = parseGender(sex);
    const nationality = parseCountryCode(country);
    const isReceptionQualified = currentRole === 'Reception';

    // Find or create volunteer
    const existing = await db.select().from(volunteers).where(eq(volunteers.fullName, name)).get();
    let volId: string;

    if (!existing) {
      volId = crypto.randomUUID();
      const token = crypto.randomBytes(32).toString('hex');

      await db.insert(volunteers).values({
        id: volId,
        fullName: name,
        preferredName: name,
        nationality,
        gender,
        source,
        status,
        arrivalDate,
        departureDate: noEndDate ? null : departureDate,
        noEndDate,
        primaryRole: currentRole,
        isReceptionQualified,
        magicLinkToken: token,
        notes: `Imported from legacy historical spreadsheet (${filePath})`
      });
      importedVols++;
    } else {
      volId = existing.id;
    }

    // Create stay record
    await db.insert(volunteerStays).values({
      id: crypto.randomUUID(),
      volunteerId: volId,
      arrivalDate,
      departureDate: noEndDate ? null : departureDate,
      noEndDate,
      departureNotes: `Historical stay imported from ${filePath}`
    });
    importedStays++;
  }

  console.log(`✓ Migration complete: ${importedVols} new volunteers created, ${importedStays} stays recorded.`);
  return { importedVols, importedStays };
}

// CLI runner if invoked directly
if (process.argv[1]?.endsWith('import-historical-data.ts') || process.argv[1]?.endsWith('import-historical-data.js')) {
  const targetFile = process.argv[2] || 'scripts/sample-legacy.csv';
  importHistoricalData(targetFile)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Import failed:', err);
      process.exit(1);
    });
}

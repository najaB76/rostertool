import { db } from './client.js';
import { applicationSources, shiftDefinitions, staffUsers } from './schema.js';

async function seed() {
  console.log('Seeding application sources...');
  await db.insert(applicationSources).values([
    { id: crypto.randomUUID(), name: 'HelpEx' },
    { id: crypto.randomUUID(), name: 'WorkAway' },
    { id: crypto.randomUUID(), name: 'Worldpackers' },
    { id: crypto.randomUUID(), name: 'Guest' },
  ]).onConflictDoNothing();

  console.log('Seeding shift definitions...');
  await db.insert(shiftDefinitions).values([
    {
      id: crypto.randomUUID(),
      name: 'Housekeeping',
      dayOfWeek: null, // Every day
      startTime: '10:00',
      endTime: '14:00',
      durationHours: 4.0,
      minStaff: 3,
      eligibleRoles: 'Housekeeping,Reception',
    },
    {
      id: crypto.randomUUID(),
      name: 'Reception Day',
      dayOfWeek: null,
      startTime: '08:00',
      endTime: '18:00',
      durationHours: 10.0,
      minStaff: 1,
      eligibleRoles: 'Reception',
    },
    {
      id: crypto.randomUUID(),
      name: 'Reception Evening (Sun-Thu)',
      dayOfWeek: null, // We'll handle Sun-Thu logic in queries/engine
      startTime: '16:00',
      endTime: '00:00',
      durationHours: 8.0,
      minStaff: 1,
      eligibleRoles: 'Reception',
    },
    {
      id: crypto.randomUUID(),
      name: 'Reception Evening (Fri-Sat)',
      dayOfWeek: null, // We'll handle Fri-Sat logic in queries/engine
      startTime: '17:00',
      endTime: '01:00',
      durationHours: 8.0,
      minStaff: 1,
      eligibleRoles: 'Reception',
    }
  ]).onConflictDoNothing();

  console.log('Seeding staff users...');
  await db.insert(staffUsers).values([
    { id: crypto.randomUUID(), fullName: 'Staff One', role: 'Receptionist' },
    { id: crypto.randomUUID(), fullName: 'Staff Two', role: 'Receptionist' },
    { id: crypto.randomUUID(), fullName: 'Staff Three', role: 'Receptionist' },
  ]).onConflictDoNothing();

  console.log('Seeding complete.');
}

seed().catch(console.error);

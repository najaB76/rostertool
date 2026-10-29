import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'path';

// Resolve database file path
const dbPath = path.resolve(process.cwd(), 'data/rostertool.sqlite');

// Initialize better-sqlite3
const sqlite = new Database(dbPath);

// Enable WAL mode for better concurrency and performance
sqlite.pragma('journal_mode = WAL');

// Ensure database schema updates
try {
  const staffCols = sqlite.pragma('table_info(staff_users)').map((c: any) => c.name);
  if (staffCols.length > 0 && !staffCols.includes('nationality')) {
    sqlite.exec("ALTER TABLE staff_users ADD COLUMN nationality TEXT DEFAULT 'ES' NOT NULL;");
  }

  const volCols = sqlite.pragma('table_info(volunteers)').map((c: any) => c.name);
  if (volCols.length > 0) {
    if (!volCols.includes('preferred_name')) {
      sqlite.exec("ALTER TABLE volunteers ADD COLUMN preferred_name TEXT;");
    }
    if (!volCols.includes('date_of_birth')) {
      sqlite.exec("ALTER TABLE volunteers ADD COLUMN date_of_birth TEXT;");
    }
  }

  // Create admin_users table if not exists
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      pin TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default admin account if table is empty
  const count = sqlite.prepare('SELECT count(*) as count FROM admin_users').get() as { count: number };
  if (count && count.count === 0) {
    sqlite.prepare('INSERT INTO admin_users (id, username, pin) VALUES (?, ?, ?)')
      .run('admin-default-id', 'admin', '1234');
  }

  // Clean up any existing duplicate shift assignments before creating index
  sqlite.exec(`
    DELETE FROM shift_assignments WHERE rowid NOT IN (
      SELECT MIN(rowid) FROM shift_assignments
      GROUP BY shift_definition_id, date, COALESCE(volunteer_id, ''), COALESCE(staff_id, '')
    );
  `);

  // Create unique index for staff assignments on shift slots
  sqlite.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS unq_shift_date_staff 
    ON shift_assignments (shift_definition_id, date, staff_id) 
    WHERE staff_id IS NOT NULL;
  `);

  // Create system_settings table if not exists
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Seed default system settings if missing
  const defaultSettings = [
    { key: 'housekeepers_per_day', value: '3' },
    { key: 'housekeeping_shifts_per_week', value: '4' },
    { key: 'housekeeping_start_time', value: '10:00' },
    { key: 'housekeeping_end_time', value: '14:00' }
  ];

  const insertSetting = sqlite.prepare(`
    INSERT OR IGNORE INTO system_settings (key, value) VALUES (?, ?);
  `);

  for (const s of defaultSettings) {
    insertSetting.run(s.key, s.value);
  }

} catch (e) {
  // Ignore
}

// Initialize Drizzle ORM
export const db = drizzle(sqlite);
export default db;

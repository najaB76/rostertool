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
} catch (e) {
  // Ignore
}

// Initialize Drizzle ORM
export const db = drizzle(sqlite);
export default db;

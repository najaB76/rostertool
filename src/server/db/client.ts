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
} catch (e) {
  // Ignore if table doesn't exist yet
}

// Initialize Drizzle ORM
export const db = drizzle(sqlite);
export default db;

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'path';

// Resolve database file path
const dbPath = path.resolve(process.cwd(), 'data/rostertool.sqlite');

// Initialize better-sqlite3
const sqlite = new Database(dbPath);

// Enable WAL mode for better concurrency and performance
sqlite.pragma('journal_mode = WAL');

// Initialize Drizzle ORM
export const db = drizzle(sqlite);
export default db;

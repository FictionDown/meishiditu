import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { config } from '../config';

let db: SqlJsDatabase | null = null;

// Ensure data directory exists (uses /tmp on Vercel via config.dbPath)
const dataDir = path.dirname(config.dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

async function initDatabaseEngine() {
  if (process.env.VERCEL) {
    const sqlJsRoot = path.dirname(require.resolve('sql.js/package.json'));
    return initSqlJs({
      locateFile: (file) => path.join(sqlJsRoot, 'dist', file),
    });
  }
  return initSqlJs();
}

export async function getDb(): Promise<SqlJsDatabase> {
  if (db) return db;

  const SQL = await initDatabaseEngine();
  const dbPath = config.dbPath;

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Auto-save on process exit
  const saveDb = () => {
    if (db) {
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);
    }
  };

  process.on('exit', saveDb);
  process.on('SIGINT', () => { saveDb(); process.exit(); });
  process.on('SIGTERM', () => { saveDb(); process.exit(); });

  return db;
}

// Helper to save the database manually
export function saveDb(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  const dbPath = config.dbPath;
  fs.writeFileSync(dbPath, buffer);
}

// Wrapper functions that mimic better-sqlite3 API
export function run(sql: string, params: any[] = []): void {
  if (!db) throw new Error('Database not initialized. Call getDb() first.');
  db.run(sql, params);
  saveDb();
}

export function get<T = any>(sql: string, params: any[] = []): T | undefined {
  if (!db) throw new Error('Database not initialized. Call getDb() first.');
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  if (stmt.step()) {
    const columns = stmt.getColumnNames();
    const values = stmt.get();
    stmt.free();
    const row: any = {};
    columns.forEach((col, i) => {
      row[col] = values[i];
    });
    return row as T;
  }
  stmt.free();
  return undefined;
}

export function all<T = any>(sql: string, params: any[] = []): T[] {
  if (!db) throw new Error('Database not initialized. Call getDb() first.');
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  const columns = stmt.getColumnNames();
  const rows: T[] = [];
  while (stmt.step()) {
    const values = stmt.get();
    const row: any = {};
    columns.forEach((col, i) => {
      row[col] = values[i];
    });
    rows.push(row as T);
  }
  stmt.free();
  return rows;
}

export function exec(sql: string): void {
  if (!db) throw new Error('Database not initialized. Call getDb() first.');
  db.run(sql);
  saveDb();
}

export function getLastInsertId(): number {
  if (!db) throw new Error('Database not initialized. Call getDb() first.');
  const result = db.exec('SELECT last_insert_rowid() as id');
  if (result.length > 0 && result[0].values.length > 0) {
    return result[0].values[0][0] as number;
  }
  return 0;
}

export function getChanges(): number {
  if (!db) throw new Error('Database not initialized. Call getDb() first.');
  return db.getRowsModified();
}

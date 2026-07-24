import fs from 'fs';
import path from 'path';
import { getDb, exec } from './connection';

export async function runMigrations(): Promise<void> {
  const db = await getDb();

  // Ensure _migrations tracking table exists
  db.run(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      run_at TEXT DEFAULT (datetime('now'))
    )
  `);

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const stmt = db.prepare('SELECT name FROM _migrations WHERE name = ?');
    stmt.bind([file]);
    const alreadyRun = stmt.step();
    stmt.free();

    if (!alreadyRun) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      console.log(`Running migration: ${file}`);
      // Split by semicolons and execute each statement
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      for (const statement of statements) {
        db.run(statement + ';');
      }
      db.run('INSERT INTO _migrations (name) VALUES (?)', [file]);
      console.log(`  OK ${file} complete`);
    }
  }
}

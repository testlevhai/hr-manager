import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pool } from './db/pool.ts';

const MIGRATIONS_DIR = path.join(import.meta.dirname, '..', 'migrations');
const SQL_EXTENSION = '.sql';

const runMigrations = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const appliedResult = await pool.query<{ name: string }>('SELECT name FROM schema_migrations');
  const appliedNames = new Set(appliedResult.rows.map((row) => row.name));

  const fileNames = (await readdir(MIGRATIONS_DIR))
    .filter((fileName) => fileName.endsWith(SQL_EXTENSION))
    .sort();

  for (const fileName of fileNames) {
    if (appliedNames.has(fileName)) continue;

    const sql = await readFile(path.join(MIGRATIONS_DIR, fileName), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [fileName]);
      await client.query('COMMIT');
      console.log(`applied ${fileName}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  await pool.end();
};

await runMigrations();

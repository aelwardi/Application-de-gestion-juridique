import { pool } from '../config/database.config';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  try {
    console.log('Running client migration...');

    const migrationPath = path.join(__dirname, '../database/migrations/007_create_clients.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    await pool.query(sql);

    console.log('Client migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
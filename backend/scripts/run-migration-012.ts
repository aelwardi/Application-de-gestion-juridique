import { pool } from '../src/config/database.config';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  try {
    console.log('🔄 Running migration 012: Fix cases foreign keys...\n');

    const migrationPath = path.join(__dirname, '../src/database/migrations/012_fix_cases_foreign_keys.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    await pool.query(sql);

    console.log('✅ Migration 012 executed successfully!');
    console.log('   - cases.lawyer_id now references lawyers(id) instead of users(id)');
    console.log('   - cases.client_id now references clients(id) instead of users(id)\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();

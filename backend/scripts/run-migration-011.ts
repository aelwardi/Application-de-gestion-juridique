import { pool } from '../src/config/database.config';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  try {
    console.log('🔄 Running migration 011_fix_appointments_foreign_keys.sql...\n');

    const migrationPath = path.join(__dirname, '../src/database/migrations/011_fix_appointments_foreign_keys.sql');
    
    // Read the SQL file
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 SQL file loaded successfully');
    console.log('⚡ Executing migration...\n');

    // Execute the SQL
    await pool.query(sql);
    
    console.log('✅ Migration executed successfully!');
    console.log('✅ Appointments table now references lawyers.id and clients.id\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();

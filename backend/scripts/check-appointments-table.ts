import { pool } from '../src/config/database.config';

async function checkAppointmentsTable() {
  try {
    console.log('🔍 Checking appointments table structure...\n');

    // Check if appointments table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'appointments'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ Appointments table does not exist!');
      process.exit(1);
    }

    // Check foreign key constraints
    const constraints = await pool.query(`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'appointments'
        AND kcu.column_name IN ('lawyer_id', 'client_id')
      ORDER BY tc.constraint_name;
    `);

    console.log('📋 Foreign key constraints:');
    if (constraints.rows.length === 0) {
      console.log('  ⚠️  No foreign key constraints found on lawyer_id or client_id');
    } else {
      constraints.rows.forEach(row => {
        console.log(`  ✓ ${row.column_name} -> ${row.foreign_table_name}(${row.foreign_column_name})`);
      });
    }

    // Check columns
    const columns = await pool.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'appointments'
        AND column_name IN ('location_type', 'location_address', 'location_latitude', 'location_longitude', 'meeting_url')
      ORDER BY column_name;
    `);

    console.log('\n📋 Location columns:');
    const requiredColumns = ['location_type', 'location_address', 'location_latitude', 'location_longitude', 'meeting_url'];
    const existingColumns = columns.rows.map(r => r.column_name);
    
    requiredColumns.forEach(col => {
      if (existingColumns.includes(col)) {
        console.log(`  ✓ ${col}`);
      } else {
        console.log(`  ❌ ${col} - MISSING`);
      }
    });

    // Check if appointments reference correct tables
    console.log('\n📊 Checking actual data references...');
    const refCheck = await pool.query(`
      SELECT 
        COUNT(*) as total_appointments,
        COUNT(DISTINCT a.lawyer_id) as unique_lawyers,
        COUNT(DISTINCT a.client_id) as unique_clients,
        COUNT(l.id) as valid_lawyer_refs,
        COUNT(cl.id) as valid_client_refs
      FROM appointments a
      LEFT JOIN lawyers l ON a.lawyer_id = l.id
      LEFT JOIN clients cl ON a.client_id = cl.id
    `);

    if (refCheck.rows[0].total_appointments > 0) {
      const data = refCheck.rows[0];
      console.log(`  Total appointments: ${data.total_appointments}`);
      console.log(`  Valid lawyer references: ${data.valid_lawyer_refs}/${data.total_appointments}`);
      console.log(`  Valid client references: ${data.valid_client_refs}/${data.total_appointments}`);
      
      if (data.valid_lawyer_refs < data.total_appointments || data.valid_client_refs < data.total_appointments) {
        console.log('\n  ⚠️  Some appointments have invalid references!');
        console.log('  ℹ️  You need to run migration 011 to fix the foreign keys');
      } else {
        console.log('\n  ✓ All appointments have valid references');
      }
    } else {
      console.log('  ℹ️  No appointments in database');
    }

    console.log('\n' + '='.repeat(60));
    
    // Determine if migration is needed
    const needsMigration = 
      existingColumns.length < requiredColumns.length ||
      constraints.rows.length === 0 ||
      !constraints.rows.some(r => r.foreign_table_name === 'lawyers') ||
      !constraints.rows.some(r => r.foreign_table_name === 'clients');

    if (needsMigration) {
      console.log('\n⚠️  MIGRATION REQUIRED!');
      console.log('Run: npx ts-node scripts/run-migration-011.ts');
    } else {
      console.log('\n✅ Database schema is up to date!');
    }

  } catch (error) {
    console.error('❌ Error checking appointments table:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkAppointmentsTable();

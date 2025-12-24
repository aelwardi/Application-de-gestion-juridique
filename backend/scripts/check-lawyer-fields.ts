import { pool } from '../src/config/database.config';

async function checkLawyerFields() {
  try {
    console.log('Checking lawyers table structure and data...\n');

    // Get table structure
    const structureQuery = `
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'lawyers'
      ORDER BY ordinal_position;
    `;
    
    const structure = await pool.query(structureQuery);
    console.log('Table structure:');
    console.table(structure.rows);

    // Get all lawyers data
    const lawyersQuery = `
      SELECT 
        l.*,
        u.email,
        u.first_name,
        u.last_name
      FROM lawyers l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT 5;
    `;
    
    const lawyers = await pool.query(lawyersQuery);
    console.log('\nRecent lawyers (last 5):');
    console.log('Total lawyers:', lawyers.rowCount);
    
    if (lawyers.rows.length > 0) {
      lawyers.rows.forEach((lawyer, index) => {
        console.log(`\n--- Lawyer ${index + 1} ---`);
        console.log('Email:', lawyer.email);
        console.log('Name:', `${lawyer.first_name} ${lawyer.last_name}`);
        console.log('Bar Number:', lawyer.bar_number);
        console.log('Specialties:', lawyer.specialties);
        console.log('Office Address:', lawyer.office_address);
        console.log('Office City:', lawyer.office_city);
        console.log('Years of Experience:', lawyer.years_of_experience);
        console.log('Bio:', lawyer.bio ? lawyer.bio.substring(0, 100) + '...' : null);
        console.log('Created At:', lawyer.created_at);
      });
    } else {
      console.log('No lawyers found in database');
    }

  } catch (error) {
    console.error('Error checking lawyers:', error);
  } finally {
    await pool.end();
  }
}

checkLawyerFields();

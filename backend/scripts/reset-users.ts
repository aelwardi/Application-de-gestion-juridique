import { pool } from '../src/config/database.config';
import { hashPassword } from '../src/utils/password.util';
import * as dotenv from 'dotenv';

dotenv.config();

const resetAndSeedUsers = async () => {
  try {
    console.log('Resetting users...\n');

    await pool.query('DELETE FROM users');
    console.log('Existing users deleted\n');

    const adminHash = await hashPassword('Admin123!');
    const avocatHash = await hashPassword('Avocat123!');
    const clientHash = await hashPassword('Client123!');
    const collabHash = await hashPassword('Collab123!');

    console.log('Password hashes generated\n');

    const query = `
      INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active, is_verified) VALUES
      ($1, $2, 'admin', 'Admin', 'Système', '+33612345678', true, true),
      ($3, $4, 'avocat', 'Marie', 'Dupont', '+33687654321', true, true),
      ($5, $6, 'client', 'Jean', 'Martin', '+33698765432', true, true),
      ($7, $8, 'collaborateur', 'Sophie', 'Bernard', '+33623456789', true, true)
    `;

    await pool.query(query, [
      'admin@juridique.com', adminHash,
      'avocat@juridique.com', avocatHash,
      'client@juridique.com', clientHash,
      'collab@juridique.com', collabHash
    ]);

    console.log('Users created successfully!\n');

    console.log('Creating lawyer profile...\n');

    const avocatUser = await pool.query(
      "SELECT id FROM users WHERE email = 'avocat@juridique.com'"
    );

    if (avocatUser.rows.length > 0) {
      const avocatId = avocatUser.rows[0].id;

      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'lawyers'
        );
      `);

      if (tableCheck.rows[0].exists) {
        const lawyerInsert = `
          INSERT INTO lawyers (
            user_id,
            bar_number,
            specialties,
            experience_years,
            office_address,
            office_city,
            office_postal_code,
            hourly_rate,
            description,
            languages,
            availability_status,
            verified_by_admin
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (user_id) DO NOTHING
        `;

        await pool.query(lawyerInsert, [
          avocatId,
          'BAR75-2025-MD',
          ['Droit pénal', 'Droit civil', 'Droit de la famille'],
          5,
          '123 Avenue des Champs-Élysées',
          'Paris',
          '75008',
          150.00,
          'Avocate spécialisée en droit pénal et civil avec 5 ans d\'expérience.',
          ['Français', 'Anglais'],
          'available',
          true
        ]);

        console.log('Lawyer profile created!\n');
      }
    }

    console.log('Login credentials:');
    console.log('-----------------------------------');
    console.log('Admin:');
    console.log('  Email: admin@juridique.com');
    console.log('  Password: Admin123!');
    console.log('');
    console.log('Avocat:');
    console.log('  Email: avocat@juridique.com');
    console.log('  Password: Avocat123!');
    console.log('');
    console.log('Client:');
    console.log('  Email: client@juridique.com');
    console.log('  Password: Client123!');
    console.log('');
    console.log('Collaborateur:');
    console.log('  Email: collab@juridique.com');
    console.log('  Password: Collab123!');
    console.log('-----------------------------------\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
};

resetAndSeedUsers();
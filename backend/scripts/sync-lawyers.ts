import { pool } from '../src/config/database.config';
import * as dotenv from 'dotenv';

dotenv.config();

async function syncLawyers() {
  console.log('Synchronisation des avocats...');

  try {
    const query = `
      SELECT u.id, u.email, u.first_name, u.last_name 
      FROM users u
      LEFT JOIN lawyers l ON u.id = l.user_id
      WHERE u.role = 'avocat' AND l.id IS NULL
    `;

    const result = await pool.query(query);
    const avocats = result.rows;

    console.log(`Trouvé ${avocats.length} avocat(s) à synchroniser`);

    if (avocats.length === 0) {
      console.log('Tous les avocats sont déjà synchronisés');
      return;
    }

    for (const avocat of avocats) {
      const barNumber = `BAR${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      const insertQuery = `
        INSERT INTO lawyers (
          user_id, 
          bar_number, 
          specialties, 
          experience_years,
          verified_by_admin
        )
        VALUES ($1, $2, $3, $4, $5)
      `;

      await pool.query(insertQuery, [
        avocat.id,
        barNumber,
        ['Droit général'],
        0,
        false
      ]);

      console.log(`Synchronisé: ${avocat.first_name} ${avocat.last_name} (${avocat.email})`);
    }

    console.log('Synchronisation terminée!');

  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

syncLawyers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
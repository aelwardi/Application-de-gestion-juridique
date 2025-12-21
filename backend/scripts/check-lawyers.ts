import { pool } from '../src/config/database.config';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkLawyers() {
  console.log('Vérification de la table lawyers...\n');

  try {
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'lawyers'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('La table lawyers n\'existe pas');
      console.log('Exécutez: npm run migrate');
      return;
    }

    console.log('Table lawyers existe\n');

    const usersResult = await pool.query(`
      SELECT id, email, first_name, last_name, role 
      FROM users 
      WHERE role = 'avocat'
    `);

    console.log(`Avocats dans 'users': ${usersResult.rows.length}`);
    usersResult.rows.forEach(user => {
      console.log(`   - ${user.first_name} ${user.last_name} (${user.email})`);
    });
    console.log('');

    const lawyersResult = await pool.query(`
      SELECT l.*, u.email, u.first_name, u.last_name
      FROM lawyers l
      INNER JOIN users u ON l.user_id = u.id
    `);

    console.log(`Avocats dans 'lawyers': ${lawyersResult.rows.length}`);
    lawyersResult.rows.forEach(lawyer => {
      console.log(`   - ${lawyer.first_name} ${lawyer.last_name} (${lawyer.email})`);
      console.log(`     Barreau: ${lawyer.bar_number}`);
      console.log(`     Ville: ${lawyer.office_city || 'Non renseignée'}`);
      console.log(`     Vérifié: ${lawyer.verified_by_admin ? 'Oui' : 'Non'}`);
    });
    console.log('');

    const missingResult = await pool.query(`
      SELECT u.id, u.email, u.first_name, u.last_name
      FROM users u
      LEFT JOIN lawyers l ON u.id = l.user_id
      WHERE u.role = 'avocat' AND l.id IS NULL
    `);

    if (missingResult.rows.length > 0) {
      console.log(`${missingResult.rows.length} avocat(s) sans profil dans 'lawyers':`);
      missingResult.rows.forEach(user => {
        console.log(`   - ${user.first_name} ${user.last_name} (${user.email})`);
      });
      console.log('\n🔧 Solution: npm run sync-lawyers\n');
    } else {
      console.log('Tous les avocats ont un profil dans la table lawyers\n');
    }

    console.log('Test de la requête getAllLawyers...');
    const testQuery = `
      SELECT 
        l.*,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.is_active
      FROM lawyers l
      INNER JOIN users u ON l.user_id = u.id
      WHERE 1=1
      ORDER BY l.created_at DESC
      LIMIT 20 OFFSET 0
    `;

    const testResult = await pool.query(testQuery);
    console.log(`Requête retourne ${testResult.rows.length} résultat(s)\n`);

    if (testResult.rows.length > 0) {
      console.log('La requête fonctionne correctement!');
      console.log('   Les avocats devraient s\'afficher sur /admin/lawyers');
    } else {
      console.log('La requête ne retourne aucun résultat');
      console.log('   Vérifiez que les avocats ont bien un profil dans la table lawyers');
    }

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await pool.end();
  }
}

checkLawyers();
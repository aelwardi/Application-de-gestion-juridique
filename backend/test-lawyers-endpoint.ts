/**
 * Script de test pour vérifier l'endpoint /api/lawyers
 * Usage: ts-node test-lawyers-endpoint.ts
 */

import { pool } from './src/config/database.config';
import * as lawyersQueries from './src/database/queries/lawyers.queries';

async function testLawyersEndpoint() {
  console.log('Test de l\'endpoint /api/lawyers\n');

  try {
    console.log('Test de connexion DB...');
    await pool.query('SELECT 1');
    console.log('Connexion DB OK\n');

    console.log('Comptage des avocats...');
    const countResult = await pool.query(`
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN verified_by_admin = true THEN 1 END) as verified
      FROM lawyers l
      INNER JOIN users u ON l.user_id = u.id
    `);
    const { total, verified } = countResult.rows[0];
    console.log(`Total avocats: ${total}`);
    console.log(`Avocats vérifiés: ${verified}\n`);

    console.log('Test getAllLawyers query...');
    const result = await lawyersQueries.getAllLawyers(1, 10, true);
    console.log(`Query réussie: ${result.lawyers.length} avocats récupérés`);
    console.log(`Total dans la DB: ${result.total}\n`);

    if (result.lawyers.length > 0) {
      const lawyer = result.lawyers[0];
      console.log('Premier avocat:');
      console.log(`Nom: ${lawyer.first_name} ${lawyer.last_name}`);
      console.log(`Email: ${lawyer.email}`);
      console.log(`Barreau: ${lawyer.bar_number}`);
      console.log(`Note: ${lawyer.rating}/5`);
      console.log(`Vérifié: ${lawyer.verified_by_admin ? 'Oui' : 'Non'}`);
      console.log(`Spécialités: ${lawyer.specialties?.join(', ') || 'Aucune'}\n`);
    }

    console.log('Test avec filtre ville...');
    const parisLawyers = await lawyersQueries.getAllLawyers(1, 10, true, 'Paris');
    console.log(`Avocats à Paris: ${parisLawyers.lawyers.length}\n`);

    console.log('TOUS LES TESTS RÉUSSIS! \n');

  } catch (error: any) {
    console.error('ERREUR:', error.message);
    console.error('\nStack trace:', error.stack);
  } finally {
    await pool.end();
    console.log('\nConnexion DB fermée');
  }
}

testLawyersEndpoint();
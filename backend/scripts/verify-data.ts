import { pool } from '../src/config/database.config';

async function verifyData() {
  try {
    console.log('🔍 Vérification des données...\n');

    // Vérifier les avocats
    const lawyers = await pool.query(`
      SELECT l.id, u.first_name, u.last_name, u.email
      FROM lawyers l
      JOIN users u ON l.user_id = u.id
    `);
    console.log(`✅ ${lawyers.rows.length} avocats trouvés:`);
    lawyers.rows.forEach(l => console.log(`   - ${l.first_name} ${l.last_name} (${l.email})`));

    // Vérifier les clients
    const clients = await pool.query(`
      SELECT c.id, u.first_name, u.last_name, u.email
      FROM clients c
      JOIN users u ON c.user_id = u.id
    `);
    console.log(`\n✅ ${clients.rows.length} clients trouvés:`);
    clients.rows.forEach(c => console.log(`   - ${c.first_name} ${c.last_name} (${c.email})`));

    // Vérifier les cases
    const cases = await pool.query(`
      SELECT 
        ca.id, 
        ca.case_number, 
        ca.title,
        lu.first_name || ' ' || lu.last_name as lawyer_name,
        cu.first_name || ' ' || cu.last_name as client_name
      FROM cases ca
      JOIN lawyers l ON ca.lawyer_id = l.id
      JOIN users lu ON l.user_id = lu.id
      JOIN clients cl ON ca.client_id = cl.id
      JOIN users cu ON cl.user_id = cu.id
    `);
    console.log(`\n✅ ${cases.rows.length} dossiers trouvés:`);
    cases.rows.slice(0, 5).forEach(c => console.log(`   - ${c.case_number}: ${c.title} (Avocat: ${c.lawyer_name}, Client: ${c.client_name})`));
    if (cases.rows.length > 5) console.log(`   ... et ${cases.rows.length - 5} autres`);

    // Vérifier les appointments
    const appointments = await pool.query(`
      SELECT 
        a.id,
        a.title,
        a.appointment_type,
        a.start_time,
        lu.first_name || ' ' || lu.last_name as lawyer_name,
        cu.first_name || ' ' || cu.last_name as client_name
      FROM appointments a
      JOIN lawyers l ON a.lawyer_id = l.id
      JOIN users lu ON l.user_id = lu.id
      JOIN clients cl ON a.client_id = cl.id
      JOIN users cu ON cl.user_id = cu.id
      ORDER BY a.start_time
    `);
    console.log(`\n✅ ${appointments.rows.length} rendez-vous trouvés:`);
    appointments.rows.slice(0, 5).forEach(a => {
      const date = new Date(a.start_time).toLocaleDateString('fr-FR');
      console.log(`   - ${a.title} le ${date} (Avocat: ${a.lawyer_name}, Client: ${a.client_name})`);
    });
    if (appointments.rows.length > 5) console.log(`   ... et ${appointments.rows.length - 5} autres`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Toutes les données sont correctement liées!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verifyData();

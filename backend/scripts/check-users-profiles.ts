import { pool } from "../src/config/database.config";

const checkClientsAndLawyers = async () => {
  try {
    console.log("🔍 Vérification des utilisateurs et leurs profils\n");
    console.log("=" .repeat(80));

    // Check lawyers
    console.log("\n📊 AVOCATS (role: 'avocat')");
    console.log("-".repeat(80));
    
    const lawyersResult = await pool.query(`
      SELECT 
        u.id,
        u.email,
        u.role,
        u.first_name,
        u.last_name,
        u.created_at,
        l.id as lawyer_id,
        l.bar_number,
        l.office_city
      FROM users u
      LEFT JOIN lawyers l ON l.user_id = u.id
      WHERE u.role = 'avocat'
      ORDER BY u.created_at DESC
    `);

    if (lawyersResult.rows.length === 0) {
      console.log("⚠️  Aucun avocat trouvé");
    } else {
      lawyersResult.rows.forEach((row, index) => {
        console.log(`\n${index + 1}. ${row.first_name} ${row.last_name} (${row.email})`);
        console.log(`   User ID: ${row.id}`);
        console.log(`   Créé le: ${new Date(row.created_at).toLocaleDateString('fr-FR')}`);
        if (row.lawyer_id) {
          console.log(`   ✅ Profil lawyer existe`);
          console.log(`   Lawyer ID: ${row.lawyer_id}`);
          console.log(`   Numéro barreau: ${row.bar_number}`);
          console.log(`   Ville: ${row.office_city || 'Non renseignée'}`);
        } else {
          console.log(`   ❌ PROBLÈME: Aucune entrée dans la table lawyers!`);
        }
      });
      
      const missingLawyers = lawyersResult.rows.filter(r => !r.lawyer_id).length;
      if (missingLawyers > 0) {
        console.log(`\n⚠️  ${missingLawyers} avocat(s) sans profil dans 'lawyers'`);
      } else {
        console.log(`\n✅ Tous les avocats ont un profil dans 'lawyers'`);
      }
    }

    // Check clients
    console.log("\n\n📊 CLIENTS (role: 'client')");
    console.log("-".repeat(80));
    
    const clientsResult = await pool.query(`
      SELECT 
        u.id,
        u.email,
        u.role,
        u.first_name,
        u.last_name,
        u.created_at,
        c.id as client_id,
        c.city,
        c.total_cases,
        c.active_cases
      FROM users u
      LEFT JOIN clients c ON c.user_id = u.id
      WHERE u.role = 'client'
      ORDER BY u.created_at DESC
    `);

    if (clientsResult.rows.length === 0) {
      console.log("⚠️  Aucun client trouvé");
    } else {
      clientsResult.rows.forEach((row, index) => {
        console.log(`\n${index + 1}. ${row.first_name} ${row.last_name} (${row.email})`);
        console.log(`   User ID: ${row.id}`);
        console.log(`   Créé le: ${new Date(row.created_at).toLocaleDateString('fr-FR')}`);
        if (row.client_id) {
          console.log(`   ✅ Profil client existe`);
          console.log(`   Client ID: ${row.client_id}`);
          console.log(`   Ville: ${row.city || 'Non renseignée'}`);
          console.log(`   Dossiers: ${row.total_cases} total, ${row.active_cases} actifs`);
        } else {
          console.log(`   ❌ PROBLÈME: Aucune entrée dans la table clients!`);
        }
      });
      
      const missingClients = clientsResult.rows.filter(r => !r.client_id).length;
      if (missingClients > 0) {
        console.log(`\n⚠️  ${missingClients} client(s) sans profil dans 'clients'`);
      } else {
        console.log(`\n✅ Tous les clients ont un profil dans 'clients'`);
      }
    }

    // Summary
    console.log("\n\n📈 RÉSUMÉ");
    console.log("=" .repeat(80));
    console.log(`Total utilisateurs avocats: ${lawyersResult.rows.length}`);
    console.log(`Total utilisateurs clients: ${clientsResult.rows.length}`);
    
    const missingLawyersCount = lawyersResult.rows.filter(r => !r.lawyer_id).length;
    const missingClientsCount = clientsResult.rows.filter(r => !r.client_id).length;
    
    if (missingLawyersCount === 0 && missingClientsCount === 0) {
      console.log("\n✅ Tout est correct! Tous les utilisateurs ont leurs profils associés.");
    } else {
      if (missingLawyersCount > 0) {
        console.log(`\n❌ ${missingLawyersCount} avocat(s) à corriger`);
      }
      if (missingClientsCount > 0) {
        console.log(`❌ ${missingClientsCount} client(s) à corriger`);
      }
      console.log("\n💡 Créez de nouveaux comptes pour tester la correction.");
    }

    console.log("\n" + "=" .repeat(80));
    
    await pool.end();
  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  }
};

checkClientsAndLawyers();

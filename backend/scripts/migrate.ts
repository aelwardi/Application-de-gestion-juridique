import { Pool } from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function runCompleteMigration(): Promise<void> {
  const client = await pool.connect();

  try {
    console.log("Démarrage de la migration de la base de données...\n");

    const migrationsDir = path.join(__dirname, "../src/database/migrations");

    if (!fs.existsSync(migrationsDir)) {
      throw new Error("Le dossier migrations n'existe pas!");
    }

    // Get all SQL files in the migrations folder and sort them
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      throw new Error("Aucun fichier de migration trouvé!");
    }

    console.log(`Fichiers de migration trouvés: ${migrationFiles.length}`);
    migrationFiles.forEach(file => console.log(`  - ${file}`));
    console.log();

    // Run each migration file
    for (const file of migrationFiles) {
      const migrationFilePath = path.join(migrationsDir, file);
      console.log(`Exécution de: ${file}...`);

      const sql = fs.readFileSync(migrationFilePath, "utf8");

      await client.query("BEGIN");
      await client.query(sql);
      await client.query("COMMIT");

      console.log(`✓ ${file} exécuté avec succès\n`);
    }

    console.log("Migration complète exécutée avec succès!");
    console.log("\nÉtat de la base de données:");

    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);

    console.log(`   • ${tablesResult.rows.length} tables créées`);
    tablesResult.rows.forEach(row => {
      console.log(`     - ${row.tablename}`);
    });

    const usersResult = await client.query("SELECT COUNT(*) as count FROM users");
    console.log(`\nUtilisateurs: ${usersResult.rows[0].count}`);

    console.log("\nBase de données prête à l'emploi!");

  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("\nErreur lors de la migration:", error.message);
    console.error("\nConseil: Vérifiez que la base de données existe et que les credentials sont corrects.");
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runCompleteMigration().catch(console.error);
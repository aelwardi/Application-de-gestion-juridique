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

    const migrationFilePath = path.join(__dirname, "../src/database/migrations/init-db.sql");

    if (!fs.existsSync(migrationFilePath)) {
      throw new Error("Le fichier de migration consolidée n'existe pas!");
    }

    const sql = fs.readFileSync(migrationFilePath, "utf8");

    console.log("Fichier de migration chargé");
    console.log("Exécution de la migration...\n");

    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");

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
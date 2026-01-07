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
    const migrationsDir = path.join(__dirname, "../src/database/migrations");

    if (!fs.existsSync(migrationsDir)) {
      throw new Error("Le dossier migrations n'existe pas!");
    }

    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      throw new Error("Aucun fichier de migration trouvé!");
    }

    for (const file of migrationFiles) {
      const migrationFilePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(migrationFilePath, "utf8");
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("COMMIT");
    }

    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);

    const usersResult = await client.query("SELECT COUNT(*) as count FROM users");
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("\nErreur lors de la migration:", error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runCompleteMigration().catch(console.error);
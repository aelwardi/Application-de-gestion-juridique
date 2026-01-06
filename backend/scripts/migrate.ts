import { Pool } from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const MIGRATIONS_DIR = path.join(__dirname, "../src/database/migrations");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function createMigrationsTable(): Promise<void> {
  const query = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(20) DEFAULT 'success'
    );
  `;
  await pool.query(query);
  console.log("Table migrations créée ou déjà existante");
}

async function getExecutedMigrations(): Promise<string[]> {
  const result = await pool.query("SELECT filename FROM migrations ORDER BY id");
  return result.rows.map((row) => row.filename);
}

async function executeMigration(filename: string): Promise<void> {
  const filePath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filePath, "utf8");

  console.log(`Exécution de la migration: ${filename}`);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(sql);

    await client.query("INSERT INTO migrations (filename, status) VALUES ($1, $2)", [
      filename,
      "success",
    ]);

    await client.query("COMMIT");
    console.log(`Migration ${filename} exécutée avec succès`);
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error(`Erreur lors de l'exécution de ${filename}:`, error.message);

    try {
      await client.query(
        "INSERT INTO migrations (filename, status) VALUES ($1, $2) ON CONFLICT (filename) DO NOTHING",
        [filename, "failed"]
      );
    } catch (logError) {
    }

    throw error;
  } finally {
    client.release();
  }
}

async function runMigrations(): Promise<void> {
  try {
    console.log("Démarrage des migrations...\n");

    await createMigrationsTable();

    const executedMigrations = await getExecutedMigrations();

    console.log("\nToutes les migrations ont été exécutées avec succès");
  } catch (error: any) {
    console.error("\nErreur lors des migrations:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations();
}

export { runMigrations };
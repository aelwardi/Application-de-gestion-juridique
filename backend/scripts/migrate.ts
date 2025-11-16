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
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
  console.log("✅ Table migrations créée ou déjà existante");
}

async function getExecutedMigrations(): Promise<string[]> {
  const result = await pool.query("SELECT filename FROM migrations ORDER BY id");
  return result.rows.map((row) => row.filename);
}

function getMigrationFiles(): string[] {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort();
}

async function executeMigration(filename: string): Promise<void> {
  const filePath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filePath, "utf8");

  console.log(`🔄 Exécution de la migration: ${filename}`);

  try {
    await pool.query(sql);
    await pool.query("INSERT INTO migrations (filename) VALUES ($1)", [filename]);
    console.log(`✅ Migration ${filename} exécutée avec succès`);
  } catch (error) {
    console.error(`❌ Erreur lors de l'exécution de ${filename}:`, error);
    throw error;
  }
}

async function runMigrations(): Promise<void> {
  try {
    console.log("🚀 Démarrage des migrations...\n");

    await createMigrationsTable();

    const executedMigrations = await getExecutedMigrations();
    const allMigrations = getMigrationFiles();

    const pendingMigrations = allMigrations.filter(
      (migration) => !executedMigrations.includes(migration)
    );

    if (pendingMigrations.length === 0) {
      console.log("✅ Toutes les migrations ont déjà été exécutées");
      return;
    }

    for (const migration of pendingMigrations) {
      await executeMigration(migration);
    }

    console.log("\n🎉 Toutes les migrations ont été exécutées avec succès");
  } catch (error) {
    console.error("\n💥 Erreur lors des migrations:", error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations();
}

export { runMigrations };

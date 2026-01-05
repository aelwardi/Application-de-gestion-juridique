import { Pool } from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const MIGRATIONS_DIR = path.join(__dirname, "../src/database/migrations");

// Liste des migrations obsolètes à ignorer (remplacées par la table users unifiée)
const OBSOLETE_MIGRATIONS = [
  "001_create_users.sql",        // Remplacé par 001_create_unified_users.sql
  "002_add_users_indexes.sql",   // Index maintenant dans 001_create_unified_users.sql
  "007_create_clients.sql",      // Table clients supprimée (intégrée dans users)
];

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
  console.log("✅ Table migrations créée ou déjà existante");
}

async function getExecutedMigrations(): Promise<string[]> {
  const result = await pool.query("SELECT filename FROM migrations ORDER BY id");
  return result.rows.map((row) => row.filename);
}

function getMigrationFiles(): string[] {
  const allFiles = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  // Filtrer les migrations obsolètes
  return allFiles.filter((file) => !OBSOLETE_MIGRATIONS.includes(file));
}

function isObsoleteMigration(filename: string): boolean {
  return OBSOLETE_MIGRATIONS.includes(filename);
}

async function executeMigration(filename: string): Promise<void> {
  const filePath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filePath, "utf8");

  console.log(`🔄 Exécution de la migration: ${filename}`);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Exécuter la migration
    await client.query(sql);

    // Enregistrer la migration comme exécutée
    await client.query("INSERT INTO migrations (filename, status) VALUES ($1, $2)", [
      filename,
      "success",
    ]);

    await client.query("COMMIT");
    console.log(`✅ Migration ${filename} exécutée avec succès`);
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error(`❌ Erreur lors de l'exécution de ${filename}:`, error.message);

    // Enregistrer l'échec (optionnel)
    try {
      await client.query(
        "INSERT INTO migrations (filename, status) VALUES ($1, $2) ON CONFLICT (filename) DO NOTHING",
        [filename, "failed"]
      );
    } catch (logError) {
      // Ignorer l'erreur de log
    }

    throw error;
  } finally {
    client.release();
  }
}

async function runMigrations(): Promise<void> {
  try {
    console.log("🚀 Démarrage des migrations...\n");

    await createMigrationsTable();

    const executedMigrations = await getExecutedMigrations();
    const allMigrations = getMigrationFiles();

    // Vérifier si des migrations obsolètes ont été exécutées
    const executedObsolete = executedMigrations.filter((m) =>
      OBSOLETE_MIGRATIONS.includes(m)
    );
    if (executedObsolete.length > 0) {
      console.log("⚠️  Migrations obsolètes détectées (seront ignorées):");
      executedObsolete.forEach((m) => console.log(`   - ${m}`));
      console.log("");
    }

    const pendingMigrations = allMigrations.filter(
      (migration) => !executedMigrations.includes(migration)
    );

    if (pendingMigrations.length === 0) {
      console.log("✅ Toutes les migrations ont déjà été exécutées");
      console.log(`📊 Total: ${allMigrations.length} migration(s) actives`);
      return;
    }

    console.log(`📋 ${pendingMigrations.length} migration(s) à exécuter:\n`);
    pendingMigrations.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m}`);
    });
    console.log("");

    for (const migration of pendingMigrations) {
      await executeMigration(migration);
    }

    console.log("\n🎉 Toutes les migrations ont été exécutées avec succès");
    console.log(`📊 Total: ${executedMigrations.length + pendingMigrations.length} migration(s) exécutées`);
  } catch (error: any) {
    console.error("\n💥 Erreur lors des migrations:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations();
}

export { runMigrations };

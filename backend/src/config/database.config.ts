import { Pool, PoolConfig } from "pg";
import dotenv from "dotenv";

dotenv.config();

const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20, 
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000, 
};

export const pool = new Pool(poolConfig);

pool.on("connect", () => {
  console.log("✅ Connexion PostgreSQL établie");
});

pool.on("error", (err: Error) => {
  console.error("❌ Erreur inattendue sur le client PostgreSQL", err);
  process.exit(-1);
});

export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log("✅ Test de connexion réussi:", result.rows[0]);
    client.release();
    return true;
  } catch (error) {
    console.error("❌ Erreur de connexion à la base de données:", error);
    return false;
  }
};

export const closePool = async (): Promise<void> => {
  await pool.end();
  console.log("🔒 Pool de connexions fermé");
};

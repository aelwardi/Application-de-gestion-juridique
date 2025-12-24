import { pool } from "../src/config/database.config";

const clearAllData = async () => {
  try {
    console.log("🗑️  Clearing all data from database...\n");

    // Delete in correct order due to foreign keys
    console.log("Deleting appointments...");
    await pool.query("DELETE FROM appointments");
    
    console.log("Deleting cases...");
    await pool.query("DELETE FROM cases");
    
    console.log("Deleting lawyers...");
    await pool.query("DELETE FROM lawyers");
    
    console.log("Deleting clients...");
    await pool.query("DELETE FROM clients");
    
    console.log("Deleting users...");
    await pool.query("DELETE FROM users WHERE role != 'admin'");

    console.log("\n✅ All data cleared successfully!");
    console.log("💡 Admin users were preserved.\n");

  } catch (error) {
    console.error("❌ Error clearing data:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

clearAllData();

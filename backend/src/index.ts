import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { pool } from "./config/database.config"; 
import userRoutes from "./routes/user.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.get("/db-test", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "OK", message: "Database connection successful", time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ status: "ERROR", message: "Database connection failed", error });
  }
});

app.use("/api/users", userRoutes);

const startServer = async () => {
  try {
    await pool.query("SELECT 1");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`DB Test: http://localhost:${PORT}/db-test`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down...");
  await pool.end();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down...");
  await pool.end();
  process.exit(0);
});

startServer();

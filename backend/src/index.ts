import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from 'path';
import cookieParser from "cookie-parser";
import { pool } from "./config/database.config";
import { testEmailConfiguration } from "./utils/email.util";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import emailRoutes from "./routes/email.routes";
import adminRoutes from "./routes/admin.routes";
import supportRoutes from "./routes/support.routes";
import clientRoutes from "./routes/client.routes";
import clientExtendedRoutes from "./routes/client-extended.routes";
import dossierRoutes from "./routes/dossier.routes";
import appointmentRoutes from "./routes/appointment.routes";
import offerRoutes from './routes/offer.routes';
import documentRoutes from "./routes/document.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

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
// Cette ligne est cruciale : elle lie l'URL /api/storage au dossier physique sur ton PC

const uploadPath = path.resolve(process.cwd(), 'uploads/documents');
console.log('📂 Dossier documents servi depuis :', uploadPath); // Pour vérifier au démarrage
app.use('/api/storage', express.static(uploadPath));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/clients-extended", clientExtendedRoutes);
app.use("/api/cases", dossierRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use('/api/offers', offerRoutes);
app.use("/api/documents", documentRoutes);
const startServer = async () => {
  try {
    await pool.query("SELECT 1");

    await testEmailConfiguration();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`DB Test: http://localhost:${PORT}/db-test`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
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
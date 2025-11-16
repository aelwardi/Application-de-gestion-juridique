import { Request, Response, NextFunction } from "express";
import { UserRole } from "../types/users.types";

export const validateCreateUser = (req: Request, res: Response, next: NextFunction) => {
  const { email, password_hash, role, first_name, last_name } = req.body;

  if (!email || typeof email !== "string") return res.status(400).json({ status: "ERROR", message: "Email requis" });
  if (!password_hash || typeof password_hash !== "string") return res.status(400).json({ status: "ERROR", message: "Mot de passe requis" });
  if (!role || !["admin","avocat","client","collaborateur"].includes(role)) return res.status(400).json({ status: "ERROR", message: "Role invalide" });
  if (!first_name || typeof first_name !== "string") return res.status(400).json({ status: "ERROR", message: "Prénom requis" });
  if (!last_name || typeof last_name !== "string") return res.status(400).json({ status: "ERROR", message: "Nom requis" });

  next();
};

export const validateUpdateUser = (req: Request, res: Response, next: NextFunction) => {
  if (Object.keys(req.body).length === 0) return res.status(400).json({ status: "ERROR", message: "Au moins un champ à mettre à jour" });
  next();
};

export const validateUserId = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!id || !uuidRegex.test(id)) return res.status(400).json({ status: "ERROR", message: "ID utilisateur invalide" });
  next();
};

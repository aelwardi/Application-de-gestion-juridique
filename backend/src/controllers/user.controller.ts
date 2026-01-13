import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { CreateUserInput, UpdateUserInput } from "../types/users.types";

const userService = new UserService();

export class UserController {
  async createUser(req: Request, res: Response) {
    try {
      const data: CreateUserInput = req.body;
      const user = await userService.createUser(data);
      res.status(201).json({ status: "SUCCESS", message: "Utilisateur créé", data: user });
    } catch (error: any) {
      res.status(500).json({ status: "ERROR", message: "Erreur création utilisateur", error: error.message });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      if (!user) return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Erreur récupération utilisateur", error: error.message });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const { users, total } = await userService.getAllUsers(limit, offset);
      res.json({ success: true, data: users, pagination: { total, limit, offset, count: users.length } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Erreur récupération utilisateurs", error: error.message });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateUserInput = req.body;

      const updatedUser = await userService.updateUser(id, data);
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
      }

      res.json({ success: true, message: "Utilisateur mis à jour", data: updatedUser });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Erreur mise à jour utilisateur", error: error.message });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await userService.deleteUser(id);
      if (!deleted) return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
      res.json({ success: true, message: "Utilisateur supprimé avec succès" });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, message: "Erreur suppression utilisateur", error: error.message });
    }
  }
}
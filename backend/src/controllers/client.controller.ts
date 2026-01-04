import { Request, Response } from "express";
import * as clientService from "../services/client.service";
import { UpdateClientInput, ClientSearchFilters } from "../types/client.types";

export class ClientController {
  async createClient(req: Request, res: Response): Promise<void> {
    try {
      // Note: createClient n'existe plus, utiliser la création via auth.service
      // Cette méthode devrait être supprimée ou redirigée vers auth/register

      res.status(501).json({
        success: false,
        message: "Utilisez /auth/register pour créer un client",
      });
    } catch (error: any) {
      console.error("Error creating client:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la création du client",
        error: error.message,
      });
    }
  }

  async getClientById(req: Request, res: Response): Promise<void> {
    try {
      const {id} = req.params;
      const client = await clientService.getClientById(id);

      if (!client) {
        res.status(404).json({
          success: false,
          message: "Client non trouvé",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: client,
      });
    } catch (error: any) {
      console.error("Error getting client:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération du client",
        error: error.message,
      });
    }
  }

  async getClientByUserId(req: Request, res: Response): Promise<void> {
    try {
      const {userId} = req.params;
      const client = await clientService.getClientById(userId);

      if (!client) {
        res.status(404).json({
          success: false,
          message: "Client non trouvé",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: client,
      });
    } catch (error: any) {
      console.error("Error getting client by user ID:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération du client",
        error: error.message,
      });
    }
  }

  async getAllClients(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const page = parseInt(req.query.page as string) || 1;

      const {clients, total} = await clientService.getAllClients(page, limit);

      res.status(200).json({
        success: true,
        data: clients,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      console.error("Error getting all clients:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des clients",
        error: error.message,
      });
    }
  }

  async searchClients(req: Request, res: Response): Promise<void> {
    try {
      const filters: ClientSearchFilters = {
        name: req.query.name as string,
        email: req.query.email as string,
        city: req.query.city as string,
        has_active_cases: req.query.has_active_cases === 'true',
        is_active: req.query.is_active === 'true',
        limit: parseInt(req.query.limit as string) || 50,
        offset: parseInt(req.query.offset as string) || 0,
      };

      const {clients, total} = await clientService.searchClients(filters);
      const page = Math.floor((filters.offset || 0) / (filters.limit || 50)) + 1;

      res.status(200).json({
        success: true,
        data: clients,
        pagination: {
          total,
          page,
          limit: filters.limit,
          totalPages: Math.ceil(total / (filters.limit || 50)),
        },
      });
    } catch (error: any) {
      console.error("Error searching clients:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la recherche des clients",
        error: error.message,
      });
    }
  }

  async getClientsByLawyer(req: Request, res: Response): Promise<void> {
    try {
      const {lawyerId} = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const page = Math.floor(offset / limit) + 1;

      const {clients, total} = await clientService.getClientsByLawyer(
          lawyerId,
          limit,
          offset
      );

      res.status(200).json({
        success: true,
        data: clients,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      console.error("Error getting clients by lawyer:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des clients de l'avocat",
        error: error.message,
      });
    }
  }

  async updateClient(req: Request, res: Response): Promise<void> {
    try {
      const {id} = req.params;
      const data: UpdateClientInput = req.body;

      const client = await clientService.updateClient(id, data);

      if (!client) {
        res.status(404).json({
          success: false,
          message: "Client non trouvé",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Client mis à jour avec succès",
        data: client,
      });
    } catch (error: any) {
      console.error("Error updating client:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour du client",
        error: error.message,
      });
    }
  }


  async deleteClient(req: Request, res: Response): Promise<void> {
    try {
      const {id} = req.params;
      const deleted = await clientService.deleteClient(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Client non trouvé",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Client supprimé avec succès",
      });
    } catch (error: any) {
      console.error("Error deleting client:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression du client",
        error: error.message,
      });
    }
  }

  async getClientStats(req: Request, res: Response): Promise<void> {
    try {
      const {userId} = req.params;
      const stats = await clientService.getClientStats(userId);

      if (!stats) {
        res.status(404).json({
          success: false,
          message: "Statistiques du client non trouvées",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error("Error getting client stats:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des statistiques",
        error: error.message,
      });
    }
  }
}

// TODO: Implémenter ces méthodes dans client.service.ts puis les décommenter ici:
// - getClientCases(userId)
// - getClientAppointments(userId)
// - getClientDocuments(userId)

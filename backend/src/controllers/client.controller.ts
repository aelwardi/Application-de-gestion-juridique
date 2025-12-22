import { Request, Response } from "express";
import { ClientService } from "../services";
import { CreateClientInput, UpdateClientInput, ClientSearchFilters } from "../types/client.types";

const clientService = new ClientService();

export class ClientController {
  async createClient(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateClientInput = req.body;
      const client = await clientService.createClient(data);

      res.status(201).json({
        success: true,
        message: "Client créé avec succès",
        data: client,
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
      const { id } = req.params;
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
      const { userId } = req.params;
      const client = await clientService.getClientByUserId(userId);

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
      const offset = parseInt(req.query.offset as string) || 0;
      const page = Math.floor(offset / limit) + 1;

      const { clients, total } = await clientService.getAllClients(limit, offset);

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

      const { clients, total } = await clientService.searchClients(filters);
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
      const { lawyerId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const page = Math.floor(offset / limit) + 1;

      const { clients, total } = await clientService.getClientsByLawyer(
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
      const { id } = req.params;
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

  async updateClientByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const data: UpdateClientInput = req.body;

      const client = await clientService.updateClientByUserId(userId, data);

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
      console.error("Error updating client by user ID:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour du client",
        error: error.message,
      });
    }
  }

  async deleteClient(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
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
      const { userId } = req.params;
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

  async getClientCases(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const page = Math.floor(offset / limit) + 1;

      const { cases, total } = await clientService.getClientCases(
        userId,
        limit,
        offset
      );

      res.status(200).json({
        success: true,
        data: cases,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      console.error("Error getting client cases:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des dossiers",
        error: error.message,
      });
    }
  }

  async getClientAppointments(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const page = Math.floor(offset / limit) + 1;

      const { appointments, total } = await clientService.getClientAppointments(
        userId,
        limit,
        offset
      );

      res.status(200).json({
        success: true,
        data: appointments,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      console.error("Error getting client appointments:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des rendez-vous",
        error: error.message,
      });
    }
  }

  async getClientDocuments(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const page = Math.floor(offset / limit) + 1;

      const { documents, total } = await clientService.getClientDocuments(
        userId,
        limit,
        offset
      );

      res.status(200).json({
        success: true,
        data: documents,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      console.error("Error getting client documents:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des documents",
        error: error.message,
      });
    }
  }
}
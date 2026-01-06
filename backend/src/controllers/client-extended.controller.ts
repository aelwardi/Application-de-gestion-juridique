import { Request, Response } from "express";
import { ClientExtendedService } from "../services";
import {
  CreateClientRequestInput,
  UpdateClientRequestInput,
  CreateClientNoteInput,
  UpdateClientNoteInput,
  CreateClientPaymentInput,
  UpdateClientPaymentInput,
  CreateClientCommunicationInput,
} from "../types/client-extended.types";

const clientExtendedService = new ClientExtendedService();

export class ClientExtendedController {
  async createClientRequest(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateClientRequestInput = req.body;
      const request = await clientExtendedService.createClientRequest(data);

      res.status(201).json({
        success: true,
        message: "Demande créée avec succès",
        data: request,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la création de la demande",
        error: error.message,
      });
    }
  }

  async getClientRequestsByClientId(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const { requests, total } = await clientExtendedService.getClientRequestsByClientId(
        clientId,
        limit,
        offset
      );

      res.status(200).json({
        success: true,
        data: requests,
        pagination: {
          total,
          page: Math.floor(offset / limit) + 1,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des demandes",
        error: error.message,
      });
    }
  }

  async getClientRequestsByLawyerId(req: Request, res: Response): Promise<void> {
    try {
      const { lawyerId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const { requests, total } = await clientExtendedService.getClientRequestsByLawyerId(
        lawyerId,
        limit,
        offset
      );

      res.status(200).json({
        success: true,
        data: requests,
        pagination: {
          total,
          page: Math.floor(offset / limit) + 1,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des demandes",
        error: error.message,
      });
    }
  }

  async updateClientRequest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateClientRequestInput = req.body;

      const request = await clientExtendedService.updateClientRequest(id, data);

      if (!request) {
        res.status(404).json({
          success: false,
          message: "Demande non trouvée",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Demande mise à jour avec succès",
        data: request,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour de la demande",
        error: error.message,
      });
    }
  }

  async deleteClientRequest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await clientExtendedService.deleteClientRequest(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Demande non trouvée",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Demande supprimée avec succès",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression de la demande",
        error: error.message,
      });
    }
  }

  async createClientNote(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateClientNoteInput = req.body;
      const note = await clientExtendedService.createClientNote(data);

      res.status(201).json({
        success: true,
        message: "Note créée avec succès",
        data: note,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la création de la note",
        error: error.message,
      });
    }
  }

  async getClientNotes(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const { notes, total } = await clientExtendedService.getClientNotesByClientId(
        clientId,
        limit,
        offset
      );

      res.status(200).json({
        success: true,
        data: notes,
        pagination: {
          total,
          page: Math.floor(offset / limit) + 1,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des notes",
        error: error.message,
      });
    }
  }

  async getPendingReminders(req: Request, res: Response): Promise<void> {
    try {
      const { lawyerId } = req.params;
      const reminders = await clientExtendedService.getPendingReminders(lawyerId);

      res.status(200).json({
        success: true,
        data: reminders,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des rappels",
        error: error.message,
      });
    }
  }

  async updateClientNote(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateClientNoteInput = req.body;

      const note = await clientExtendedService.updateClientNote(id, data);

      if (!note) {
        res.status(404).json({
          success: false,
          message: "Note non trouvée",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Note mise à jour avec succès",
        data: note,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour de la note",
        error: error.message,
      });
    }
  }

  async deleteClientNote(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await clientExtendedService.deleteClientNote(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Note non trouvée",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Note supprimée avec succès",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression de la note",
        error: error.message,
      });
    }
  }

  async createClientPayment(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateClientPaymentInput = req.body;
      const payment = await clientExtendedService.createClientPayment(data);

      res.status(201).json({
        success: true,
        message: "Paiement créé avec succès",
        data: payment,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la création du paiement",
        error: error.message,
      });
    }
  }

  async getClientPayments(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const { payments, total } = await clientExtendedService.getClientPaymentsByClientId(
        clientId,
        limit,
        offset
      );

      res.status(200).json({
        success: true,
        data: payments,
        pagination: {
          total,
          page: Math.floor(offset / limit) + 1,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des paiements",
        error: error.message,
      });
    }
  }

  async getClientFinancialSummary(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.params;
      const summary = await clientExtendedService.getClientFinancialSummary(clientId);

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération du résumé financier",
        error: error.message,
      });
    }
  }

  async getOverduePayments(req: Request, res: Response): Promise<void> {
    try {
      const { lawyerId } = req.params;
      const payments = await clientExtendedService.getOverduePayments(lawyerId);

      res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des paiements en retard",
        error: error.message,
      });
    }
  }

  async updateClientPayment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateClientPaymentInput = req.body;

      const payment = await clientExtendedService.updateClientPayment(id, data);

      if (!payment) {
        res.status(404).json({
          success: false,
          message: "Paiement non trouvé",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Paiement mis à jour avec succès",
        data: payment,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour du paiement",
        error: error.message,
      });
    }
  }

  async deleteClientPayment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await clientExtendedService.deleteClientPayment(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Paiement non trouvé",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Paiement supprimé avec succès",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression du paiement",
        error: error.message,
      });
    }
  }

  async createClientCommunication(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateClientCommunicationInput = req.body;
      const communication = await clientExtendedService.createClientCommunication(data);

      res.status(201).json({
        success: true,
        message: "Communication enregistrée avec succès",
        data: communication,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'enregistrement de la communication",
        error: error.message,
      });
    }
  }

  async getClientCommunications(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const { communications, total } =
        await clientExtendedService.getClientCommunicationsByClientId(
          clientId,
          limit,
          offset
        );

      res.status(200).json({
        success: true,
        data: communications,
        pagination: {
          total,
          page: Math.floor(offset / limit) + 1,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des communications",
        error: error.message,
      });
    }
  }

  async getClientActivitySummary(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.params;
      const summary = await clientExtendedService.getClientActivitySummary(clientId);

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération du résumé d'activité",
        error: error.message,
      });
    }
  }

  async getPendingFollowUps(req: Request, res: Response): Promise<void> {
    try {
      const { lawyerId } = req.params;
      const followUps = await clientExtendedService.getPendingFollowUps(lawyerId);

      res.status(200).json({
        success: true,
        data: followUps,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des suivis",
        error: error.message,
      });
    }
  }

  async deleteClientCommunication(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await clientExtendedService.deleteClientCommunication(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Communication non trouvée",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Communication supprimée avec succès",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression de la communication",
        error: error.message,
      });
    }
  }
}
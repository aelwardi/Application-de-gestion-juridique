import { Request, Response } from 'express';
import { dossierService } from '../services/dossier.service';
import { CreateCaseDTO, UpdateCaseDTO, CaseFilters } from '../types/case.types';

export const dossierController = {
  // Créer un nouveau dossier
  createCase: async (req: Request, res: Response) => {
    try {
      const caseData: CreateCaseDTO = req.body;
      
      // Validation basique
      if (!caseData.title || !caseData.case_type || !caseData.client_id) {
        return res.status(400).json({
          success: false,
          message: 'Les champs title, case_type et client_id sont requis'
        });
      }
      
      const result = await dossierService.createCase(caseData);
      return res.status(201).json(result);
    } catch (error: any) {
      console.error('Erreur dans createCase:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la création du dossier'
      });
    }
  },

  // Récupérer tous les dossiers avec filtres
  getAllCases: async (req: Request, res: Response) => {
    try {
      const filters: CaseFilters = {
        status: req.query.status as any,
        priority: req.query.priority as any,
        case_type: req.query.case_type as string,
        lawyer_id: req.query.lawyer_id as string,
        client_id: req.query.client_id as string,
        search: req.query.search as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
      };
      
      const result = await dossierService.getAllCases(filters);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Erreur dans getAllCases:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des dossiers'
      });
    }
  },

  // Récupérer un dossier par ID
  getCaseById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const result = await dossierService.getCaseById(id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Erreur dans getCaseById:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération du dossier'
      });
    }
  },

  // Mettre à jour un dossier
  updateCase: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData: UpdateCaseDTO = req.body;
      
      const result = await dossierService.updateCase(id, updateData);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Erreur dans updateCase:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour du dossier'
      });
    }
  },

  // Supprimer un dossier
  deleteCase: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const result = await dossierService.deleteCase(id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Erreur dans deleteCase:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression du dossier'
      });
    }
  },

  // Assigner un avocat à un dossier
  assignLawyer: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { lawyer_id } = req.body;
      
      if (!lawyer_id) {
        return res.status(400).json({
          success: false,
          message: 'Le champ lawyer_id est requis'
        });
      }
      
      const result = await dossierService.assignLawyer(id, lawyer_id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Erreur dans assignLawyer:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'assignation de l\'avocat'
      });
    }
  },

  // Récupérer les statistiques des dossiers
  getCaseStats: async (req: Request, res: Response) => {
    try {
      const lawyerId = req.query.lawyer_id as string;
      
      const result = await dossierService.getCaseStats(lawyerId);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Erreur dans getCaseStats:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des statistiques'
      });
    }
  },

  // Récupérer les dossiers d'un avocat
  getCasesByLawyer: async (req: Request, res: Response) => {
    try {
      const { lawyerId } = req.params;
      
      const filters: CaseFilters = {
        status: req.query.status as any,
        priority: req.query.priority as any,
        case_type: req.query.case_type as string,
        search: req.query.search as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
      };
      
      const result = await dossierService.getCasesByLawyer(lawyerId, filters);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Erreur dans getCasesByLawyer:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des dossiers'
      });
    }
  },

  // Récupérer les dossiers d'un client
  getCasesByClient: async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      
      const filters: CaseFilters = {
        status: req.query.status as any,
        priority: req.query.priority as any,
        case_type: req.query.case_type as string,
        search: req.query.search as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
      };
      
      const result = await dossierService.getCasesByClient(clientId, filters);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Erreur dans getCasesByClient:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des dossiers'
      });
    }
  },

  // Récupérer les prochaines audiences
  getUpcomingHearings: async (req: Request, res: Response) => {
    try {
      const lawyerId = req.query.lawyer_id as string;
      
      const result = await dossierService.getUpcomingHearings(lawyerId);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Erreur dans getUpcomingHearings:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des audiences'
      });
    }
  },

  // Fermer un dossier
  closeCase: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const result = await dossierService.closeCase(id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Erreur dans closeCase:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la fermeture du dossier'
      });
    }
  },

  // Archiver un dossier
  archiveCase: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const result = await dossierService.archiveCase(id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Erreur dans archiveCase:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'archivage du dossier'
      });
    }
  }
};

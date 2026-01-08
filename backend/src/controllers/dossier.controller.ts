import { Request, Response } from 'express';
import { dossierService } from '../services/dossier.service';
import * as adminQueries from '../database/queries/admin.queries';
import { CreateCaseDTO, UpdateCaseDTO, CaseFilters } from '../types/case.types';

export const dossierController = {
  createCase: async (req: Request, res: Response) => {
    try {
      const caseData: CreateCaseDTO = req.body;
      
      if (!caseData.title || !caseData.case_type || !caseData.client_id) {
        return res.status(400).json({
          success: false,
          message: 'Les champs title, case_type et client_id sont requis'
        });
      }
      
      const result = await dossierService.createCase(caseData);

      if (result.success && result.data && req.user?.userId) {
        try {
          await adminQueries.createActivityLog(
            req.user.userId,
            'CASE_CREATED',
            'case',
            result.data.id,
            req.ip || req.socket.remoteAddress || null,
            req.get('user-agent') || null,
            { title: caseData.title, case_type: caseData.case_type, client_id: caseData.client_id }
          );
        } catch (logError) {
          console.error('Failed to log CASE_CREATED activity:', logError);
        }
      }

      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la création du dossier'
      });
    }
  },

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
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des dossiers'
      });
    }
  },

  getCaseById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const result = await dossierService.getCaseById(id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération du dossier'
      });
    }
  },

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
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour du dossier'
      });
    }
  },

  deleteCase: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const result = await dossierService.deleteCase(id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression du dossier'
      });
    }
  },

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
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'assignation de l\'avocat'
      });
    }
  },

  getCaseStats: async (req: Request, res: Response) => {
    try {
      const lawyerId = req.query.lawyer_id as string;
      
      const result = await dossierService.getCaseStats(lawyerId);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des statistiques'
      });
    }
  },

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
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des dossiers'
      });
    }
  },

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
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des dossiers'
      });
    }
  },

  getUpcomingHearings: async (req: Request, res: Response) => {
    try {
      const lawyerId = req.query.lawyer_id as string;
      
      const result = await dossierService.getUpcomingHearings(lawyerId);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des audiences'
      });
    }
  },

  closeCase: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const result = await dossierService.closeCase(id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la fermeture du dossier'
      });
    }
  },

  archiveCase: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const result = await dossierService.archiveCase(id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'archivage du dossier'
      });
    }
  }
};
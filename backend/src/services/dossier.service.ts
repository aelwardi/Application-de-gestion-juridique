import { caseQueries } from '../database/queries/dossier.queries';
import { CreateCaseDTO, UpdateCaseDTO, CaseFilters } from '../types/case.types';

export const dossierService = {
  // Créer un nouveau dossier
  async createCase(data: CreateCaseDTO) {
    try {
      // Vérifier que le client existe
      // TODO: Ajouter une vérification si nécessaire
      
      // Vérifier que l'avocat existe si fourni
      if (data.lawyer_id) {
        // TODO: Ajouter une vérification si nécessaire
      }
      
      const newCase = await caseQueries.createCase(data);
      return {
        success: true,
        data: newCase,
        message: 'Dossier créé avec succès'
      };
    } catch (error: any) {
      console.error('Erreur lors de la création du dossier:', error);
      throw new Error(`Erreur lors de la création du dossier: ${error.message}`);
    }
  },

  // Récupérer tous les dossiers
  async getAllCases(filters: CaseFilters) {
    try {
      const cases = await caseQueries.getAllCases(filters);
      return {
        success: true,
        data: cases,
        total: cases.length
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des dossiers:', error);
      throw new Error(`Erreur lors de la récupération des dossiers: ${error.message}`);
    }
  },

  // Récupérer un dossier par ID
  async getCaseById(id: string) {
    try {
      const caseData = await caseQueries.getCaseById(id);
      
      if (!caseData) {
        return {
          success: false,
          message: 'Dossier non trouvé'
        };
      }
      
      return {
        success: true,
        data: caseData
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération du dossier:', error);
      throw new Error(`Erreur lors de la récupération du dossier: ${error.message}`);
    }
  },

  // Mettre à jour un dossier
  async updateCase(id: string, data: UpdateCaseDTO) {
    try {
      // Vérifier si le dossier existe
      const existingCase = await caseQueries.getCaseById(id);
      if (!existingCase) {
        return {
          success: false,
          message: 'Dossier non trouvé'
        };
      }
      
      // Si le statut passe à 'closed', définir la date de clôture
      if (data.status === 'closed' && !data.closing_date) {
        data.closing_date = new Date();
      }
      
      const updatedCase = await caseQueries.updateCase(id, data);
      
      return {
        success: true,
        data: updatedCase,
        message: 'Dossier mis à jour avec succès'
      };
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du dossier:', error);
      throw new Error(`Erreur lors de la mise à jour du dossier: ${error.message}`);
    }
  },

  // Supprimer un dossier
  async deleteCase(id: string) {
    try {
      const deleted = await caseQueries.deleteCase(id);
      
      if (!deleted) {
        return {
          success: false,
          message: 'Dossier non trouvé'
        };
      }
      
      return {
        success: true,
        message: 'Dossier supprimé avec succès'
      };
    } catch (error: any) {
      console.error('Erreur lors de la suppression du dossier:', error);
      throw new Error(`Erreur lors de la suppression du dossier: ${error.message}`);
    }
  },

  // Assigner un avocat à un dossier
  async assignLawyer(caseId: string, lawyerId: string) {
    try {
      const updatedCase = await caseQueries.assignLawyer(caseId, lawyerId);
      
      if (!updatedCase) {
        return {
          success: false,
          message: 'Dossier non trouvé'
        };
      }
      
      return {
        success: true,
        data: updatedCase,
        message: 'Avocat assigné avec succès'
      };
    } catch (error: any) {
      console.error('Erreur lors de l\'assignation de l\'avocat:', error);
      throw new Error(`Erreur lors de l'assignation de l'avocat: ${error.message}`);
    }
  },

  // Récupérer les statistiques des dossiers
  async getCaseStats(lawyerId?: string) {
    try {
      const stats = await caseQueries.getCaseStats(lawyerId);
      return {
        success: true,
        data: stats
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  },

  // Récupérer les dossiers d'un avocat
  async getCasesByLawyer(lawyerId: string, filters: CaseFilters = {}) {
    try {
      const cases = await caseQueries.getCasesByLawyer(lawyerId, filters);
      return {
        success: true,
        data: cases,
        total: cases.length
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des dossiers de l\'avocat:', error);
      throw new Error(`Erreur lors de la récupération des dossiers de l'avocat: ${error.message}`);
    }
  },

  // Récupérer les dossiers d'un client
  async getCasesByClient(clientId: string, filters: CaseFilters = {}) {
    try {
      const cases = await caseQueries.getCasesByClient(clientId, filters);
      return {
        success: true,
        data: cases,
        total: cases.length
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des dossiers du client:', error);
      throw new Error(`Erreur lors de la récupération des dossiers du client: ${error.message}`);
    }
  },

  // Récupérer les prochaines audiences
  async getUpcomingHearings(lawyerId?: string) {
    try {
      const hearings = await caseQueries.getUpcomingHearings(lawyerId);
      return {
        success: true,
        data: hearings,
        total: hearings.length
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des audiences:', error);
      throw new Error(`Erreur lors de la récupération des audiences: ${error.message}`);
    }
  },

  // Fermer un dossier
  async closeCase(id: string) {
    try {
      const closedCase = await caseQueries.closeCase(id);
      
      if (!closedCase) {
        return {
          success: false,
          message: 'Dossier non trouvé'
        };
      }
      
      return {
        success: true,
        data: closedCase,
        message: 'Dossier fermé avec succès'
      };
    } catch (error: any) {
      console.error('Erreur lors de la fermeture du dossier:', error);
      throw new Error(`Erreur lors de la fermeture du dossier: ${error.message}`);
    }
  },

  // Archiver un dossier
  async archiveCase(id: string) {
    try {
      const archivedCase = await caseQueries.archiveCase(id);
      
      if (!archivedCase) {
        return {
          success: false,
          message: 'Dossier non trouvé'
        };
      }
      
      return {
        success: true,
        data: archivedCase,
        message: 'Dossier archivé avec succès'
      };
    } catch (error: any) {
      console.error('Erreur lors de l\'archivage du dossier:', error);
      throw new Error(`Erreur lors de l'archivage du dossier: ${error.message}`);
    }
  }
};

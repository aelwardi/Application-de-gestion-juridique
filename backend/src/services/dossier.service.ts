import { caseQueries } from '../database/queries/dossier.queries';
import { CreateCaseDTO, UpdateCaseDTO, CaseFilters } from '../types/case.types';
import { sendCaseStatusChangedEmail } from '../utils/email.util';
import { pool } from '../config/database.config';

export const dossierService = {
  async createCase(data: CreateCaseDTO) {
    try {
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

  async updateCase(id: string, data: UpdateCaseDTO) {
    try {
      const existingCase = await caseQueries.getCaseById(id);
      if (!existingCase) {
        return {
          success: false,
          message: 'Dossier non trouvé'
        };
      }

      const oldStatus = existingCase.status;

      if (data.status === 'closed' && !data.closing_date) {
        data.closing_date = new Date();
      }
      
      const updatedCase = await caseQueries.updateCase(id, data);

      if (!updatedCase) {
        return {
          success: false,
          message: 'Erreur lors de la mise à jour du dossier'
        };
      }

      if (data.status && oldStatus !== data.status) {
        try {
          const clientQuery = await pool.query(
            'SELECT first_name, last_name, email FROM users WHERE id = $1',
            [updatedCase.client_id]
          );

          if (clientQuery.rows.length > 0) {
            const client = clientQuery.rows[0];

            sendCaseStatusChangedEmail(
              client.email,
              client.first_name,
              updatedCase.title,
              oldStatus,
              data.status,
              id
            ).catch(error => {
              console.error('Erreur lors de l\'envoi de l\'email de changement de statut:', error);
            });
          }
        } catch (emailError) {
          console.error('Erreur lors de la récupération des données pour l\'email:', emailError);
        }
      }

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
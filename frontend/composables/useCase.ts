import type { 
  Case, 
  CaseWithDetails, 
  CreateCaseDTO, 
  UpdateCaseDTO, 
  CaseFilters,
  CaseResponse,
  CasesResponse,
  CaseStatsResponse
} from '~/types/case';

export const useCase = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBaseUrl;
  const authStore = useAuthStore();

  // Helper pour obtenir les headers avec le token
  const getHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (authStore.accessToken) {
      headers['Authorization'] = `Bearer ${authStore.accessToken}`;
    }
    
    return headers;
  };

  /**
   * Créer un nouveau dossier
   */
  const createCase = async (caseData: CreateCaseDTO): Promise<CaseResponse> => {
    try {
      const response = await $fetch<CaseResponse>(`${baseURL}/cases`, {
        method: 'POST',
        headers: getHeaders(),
        body: caseData
      });
      return response;
    } catch (error: any) {
      console.error('Error creating case:', error);
      throw error;
    }
  };

  /**
   * Récupérer tous les dossiers avec filtres optionnels
   */
  const getAllCases = async (filters?: CaseFilters): Promise<CasesResponse> => {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.case_type) params.append('case_type', filters.case_type);
      if (filters?.lawyer_id) params.append('lawyer_id', filters.lawyer_id);
      if (filters?.client_id) params.append('client_id', filters.client_id);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());
      
      const queryString = params.toString();
      const url = queryString ? `${baseURL}/cases?${queryString}` : `${baseURL}/cases`;
      
      const response = await $fetch<CasesResponse>(url, {
        method: 'GET',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching cases:', error);
      throw error;
    }
  };

  /**
   * Récupérer un dossier par ID
   */
  const getCaseById = async (id: string): Promise<CaseResponse> => {
    try {
      const response = await $fetch<CaseResponse>(`${baseURL}/cases/${id}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching case:', error);
      throw error;
    }
  };

  /**
   * Mettre à jour un dossier
   */
  const updateCase = async (id: string, updates: UpdateCaseDTO): Promise<CaseResponse> => {
    try {
      const response = await $fetch<CaseResponse>(`${baseURL}/cases/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: updates
      });
      return response;
    } catch (error: any) {
      console.error('Error updating case:', error);
      throw error;
    }
  };

  /**
   * Supprimer un dossier
   */
  const deleteCase = async (id: string): Promise<CaseResponse> => {
    try {
      const response = await $fetch<CaseResponse>(`${baseURL}/cases/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error deleting case:', error);
      throw error;
    }
  };

  /**
   * Assigner un avocat à un dossier
   */
  const assignLawyer = async (caseId: string, lawyerId: string): Promise<CaseResponse> => {
    try {
      const response = await $fetch<CaseResponse>(`${baseURL}/cases/${caseId}/assign-lawyer`, {
        method: 'POST',
        headers: getHeaders(),
        body: { lawyer_id: lawyerId }
      });
      return response;
    } catch (error: any) {
      console.error('Error assigning lawyer:', error);
      throw error;
    }
  };

  /**
   * Récupérer les statistiques des dossiers
   */
  const getCaseStats = async (lawyerId?: string): Promise<CaseStatsResponse> => {
    try {
      const url = lawyerId 
        ? `${baseURL}/cases/stats?lawyer_id=${lawyerId}`
        : `${baseURL}/cases/stats`;
        
      const response = await $fetch<CaseStatsResponse>(url, {
        method: 'GET',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching case stats:', error);
      throw error;
    }
  };

  /**
   * Récupérer les dossiers d'un avocat
   */
  const getCasesByLawyer = async (lawyerId: string, filters?: CaseFilters): Promise<CasesResponse> => {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.case_type) params.append('case_type', filters.case_type);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());
      
      const queryString = params.toString();
      const url = queryString 
        ? `${baseURL}/cases/lawyer/${lawyerId}?${queryString}`
        : `${baseURL}/cases/lawyer/${lawyerId}`;
      
      const response = await $fetch<CasesResponse>(url, {
        method: 'GET',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching lawyer cases:', error);
      throw error;
    }
  };

  /**
   * Récupérer les dossiers d'un client
   */
  const getCasesByClient = async (clientId: string, filters?: CaseFilters): Promise<CasesResponse> => {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.case_type) params.append('case_type', filters.case_type);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());
      
      const queryString = params.toString();
      const url = queryString 
        ? `${baseURL}/cases/client/${clientId}?${queryString}`
        : `${baseURL}/cases/client/${clientId}`;
      
      const response = await $fetch<CasesResponse>(url, {
        method: 'GET',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching client cases:', error);
      throw error;
    }
  };

  /**
   * Récupérer les prochaines audiences
   */
  const getUpcomingHearings = async (lawyerId?: string): Promise<CasesResponse> => {
    try {
      const url = lawyerId 
        ? `${baseURL}/cases/upcoming-hearings?lawyer_id=${lawyerId}`
        : `${baseURL}/cases/upcoming-hearings`;
        
      const response = await $fetch<CasesResponse>(url, {
        method: 'GET',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching upcoming hearings:', error);
      throw error;
    }
  };

  /**
   * Fermer un dossier
   */
  const closeCase = async (id: string): Promise<CaseResponse> => {
    try {
      const response = await $fetch<CaseResponse>(`${baseURL}/cases/${id}/close`, {
        method: 'POST',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error closing case:', error);
      throw error;
    }
  };

  /**
   * Archiver un dossier
   */
  const archiveCase = async (id: string): Promise<CaseResponse> => {
    try {
      const response = await $fetch<CaseResponse>(`${baseURL}/cases/${id}/archive`, {
        method: 'POST',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error archiving case:', error);
      throw error;
    }
  };

  return {
    createCase,
    getAllCases,
    getCaseById,
    updateCase,
    deleteCase,
    assignLawyer,
    getCaseStats,
    getCasesByLawyer,
    getCasesByClient,
    getUpcomingHearings,
    closeCase,
    archiveCase
  };
};

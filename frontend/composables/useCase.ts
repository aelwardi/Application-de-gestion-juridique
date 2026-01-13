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

  const getHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (authStore.accessToken) {
      headers['Authorization'] = `Bearer ${authStore.accessToken}`;
    }
    return headers;
  };


  const getLawyers = async (): Promise<any[]> => {
    try {
      const response = await $fetch<any>(`${baseURL}/users`, {
        method: 'GET',
        headers: getHeaders()
      });

      const allUsers = Array.isArray(response) ? response : (response.data || []);

      return allUsers
        .filter((u: any) => 
          u.role === 'avocat' || 
          u.role === 'lawyer' || 
          u.user_type === 'lawyer'
        )
        .map((u: any) => {
          const lawyerData = u.lawyer_info || u.lawyer_profile || u;
          
          return {
            id: u.id,
            first_name: u.first_name,
            last_name: u.last_name,
            email: u.email,

            lawyerTableId: lawyerData.id || u.id,
            bar_number: lawyerData.bar_number || 'NC',
            specialties: lawyerData.specialties || [],
            experience_years: lawyerData.experience_years || 0,
            office_address: lawyerData.office_address || '',
            office_city: lawyerData.office_city || 'Paris',
            office_postal_code: lawyerData.office_postal_code || '',
            description: lawyerData.description || lawyerData.presentation || '',
            hourly_rate: lawyerData.hourly_rate || 0,
            availability_status: lawyerData.availability_status || 'available'
          };
        });
    } catch (error: any) {
      console.error('ERREUR FETCH USERS:', error.message);
      return [];
    }
  };


  const getPendingOffers = async (lawyerId: string): Promise<any[]> => {
    try {
      const response = await $fetch<any[]>(`${baseURL}/offers/pending/${lawyerId}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('ERREUR FETCH OFFERS:', error.data || error.message);
      return [];
    }
  };


  const acceptOffer = async (offerId: string): Promise<any> => {
    try {
      const response = await $fetch<any>(`${baseURL}/offers/${offerId}/accept`, {
        method: 'POST',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error accepting offer:', error);
      throw error;
    }
  };


  const declineOffer = async (offerId: string): Promise<any> => {
    try {
      const response = await $fetch<any>(`${baseURL}/offers/${offerId}/decline`, {
        method: 'POST',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error declining offer:', error);
      throw error;
    }
  };


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
      return {
        success: false,
        message: error.data?.message || error.message || 'Failed to create case',
        data: null as any
      };
    }
  };

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
      
      const response = await $fetch<any>(url, {
        method: 'GET',
        headers: getHeaders()
      });

      if (response.success !== undefined) {
        return response;
      } else if (response.data && response.total !== undefined) {
        return {
          success: true,
          data: response.data,
          total: response.total,
          message: 'Cases fetched successfully'
        } as any;
      } else {
        return {
          success: true,
          data: Array.isArray(response) ? response : [],
          total: Array.isArray(response) ? response.length : 0,
          message: 'Cases fetched successfully'
        } as any;
      }
    } catch (error: any) {
      console.error('Error fetching cases:', error);
      return {
        success: false,
        message: error.data?.message || error.message || 'Failed to fetch cases',
        data: []
      } as any;
    }
  };

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
        return {
        success: false,
        message: error.data?.message || error.message || 'Failed to update case',
        data: null as any
      };
    }
  };

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

  const getCasesByLawyer = async (lawyerId: string, filters?: CaseFilters): Promise<CasesResponse> => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.case_type) params.append('case_type', filters.case_type);
      if (filters?.search) params.append('search', filters.search);
      
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

  const getCasesByClient = async (clientId: string, filters?: CaseFilters): Promise<CasesResponse> => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      
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
    getPendingOffers,
    getLawyers, 
    acceptOffer,
    declineOffer,
    createCase,
    getAllCases,
    getCases: getAllCases,
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
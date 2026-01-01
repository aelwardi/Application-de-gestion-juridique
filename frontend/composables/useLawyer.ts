import type {
  LawyerRequest,
  CreateLawyerRequestInput,
  LawyerRequestStats,
  Lawyer,
  LawyerSearchFilters,
} from '~/types/lawyer';
import type { ApiResponse, PaginatedResponse } from '~/types/api';

export const useLawyer = () => {
  const { apiFetch } = useApi();

  /**
   * Créer une demande vers un avocat
   */
  const createLawyerRequest = async (data: CreateLawyerRequestInput): Promise<LawyerRequest> => {
    const response = await apiFetch<ApiResponse<LawyerRequest>>('/lawyer-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data!;
  };

  /**
   * Récupérer les demandes d'un client
   */
  const getClientRequests = async (
    clientId: string,
    limit = 20,
    offset = 0
  ): Promise<PaginatedResponse<LawyerRequest>> => {
    const response = await apiFetch<any>(`/lawyer-requests/client/${clientId}?limit=${limit}&offset=${offset}`);
    return {
      data: response.data,
      total: response.pagination.total,
      page: response.pagination.page,
      limit: response.pagination.limit,
      totalPages: response.pagination.totalPages,
    };
  };

  /**
   * Récupérer les demandes reçues par un avocat
   */
  const getLawyerRequests = async (
    lawyerId: string,
    status?: string,
    limit = 20,
    offset = 0
  ): Promise<PaginatedResponse<LawyerRequest>> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', String(limit));
    params.append('offset', String(offset));

    const response = await apiFetch<any>(`/lawyer-requests/lawyer/${lawyerId}?${params.toString()}`);
    return {
      data: response.data,
      total: response.pagination.total,
      page: response.pagination.page,
      limit: response.pagination.limit,
      totalPages: response.pagination.totalPages,
    };
  };

  /**
   * Récupérer une demande par ID
   */
  const getRequestById = async (requestId: string): Promise<LawyerRequest> => {
    const response = await apiFetch<ApiResponse<LawyerRequest>>(`/lawyer-requests/${requestId}`);
    return response.data!;
  };

  /**
   * Accepter une demande (avocat)
   */
  const acceptRequest = async (requestId: string): Promise<any> => {
    const response = await apiFetch<ApiResponse<any>>(`/lawyer-requests/${requestId}/accept`, {
      method: 'POST',
    });
    return response.data!;
  };

  /**
   * Rejeter une demande (avocat)
   */
  const rejectRequest = async (requestId: string, reason?: string): Promise<LawyerRequest> => {
    const response = await apiFetch<ApiResponse<LawyerRequest>>(`/lawyer-requests/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return response.data!;
  };

  /**
   * Annuler une demande (client)
   */
  const cancelRequest = async (requestId: string): Promise<LawyerRequest> => {
    const response = await apiFetch<ApiResponse<LawyerRequest>>(`/lawyer-requests/${requestId}/cancel`, {
      method: 'POST',
    });
    return response.data!;
  };

  /**
   * Statistiques des demandes pour un client
   */
  const getClientRequestStats = async (clientId: string): Promise<LawyerRequestStats> => {
    const response = await apiFetch<ApiResponse<LawyerRequestStats>>(`/lawyer-requests/client/${clientId}/stats`);
    return response.data!;
  };

  /**
   * Statistiques des demandes pour un avocat
   */
  const getLawyerRequestStats = async (lawyerId: string): Promise<LawyerRequestStats> => {
    const response = await apiFetch<ApiResponse<LawyerRequestStats>>(`/lawyer-requests/lawyer/${lawyerId}/stats`);
    return response.data!;
  };

  /**
   * Récupérer la liste des avocats
   */
  const searchLawyers = async (filters: LawyerSearchFilters = {}): Promise<PaginatedResponse<Lawyer>> => {
    const params = new URLSearchParams();

    if (filters.specialty) params.append('specialty', filters.specialty);
    if (filters.city) params.append('city', filters.city);
    if (filters.minRating !== undefined) params.append('minRating', String(filters.minRating));
    if (filters.maxRate !== undefined) params.append('maxRate', String(filters.maxRate));
    if (filters.availability) params.append('availability', filters.availability);
    if (filters.verified !== undefined) params.append('verified', String(filters.verified));
    params.append('limit', String(filters.limit || 20));
    params.append('offset', String(filters.offset || 0));

    const url = `/lawyers?${params.toString()}`;
    console.log('[useLawyer] Fetching lawyers from:', url);

    const response = await apiFetch<any>(url);
    console.log('[useLawyer] Raw response:', response);

    const result = {
      data: response.data || [],
      total: response.pagination?.total || 0,
      page: response.pagination?.page || 1,
      limit: response.pagination?.limit || 20,
      totalPages: response.pagination?.totalPages || 1,
    };

    console.log('[useLawyer] Processed result:', {
      dataCount: result.data.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    });

    return result;
  };

  /**
   * Récupérer les détails d'un avocat
   */
  const getLawyerById = async (lawyerId: string): Promise<Lawyer> => {
    const response = await apiFetch<ApiResponse<Lawyer>>(`/lawyers/${lawyerId}`);
    return response.data!;
  };

  /**
   * Récupérer les spécialités disponibles
   */
  const getSpecialties = async (): Promise<any[]> => {
    console.log('[useLawyer] 📡 Fetching specialties...');
    const response = await apiFetch<ApiResponse<any[]>>('/lawyers/specialties/list');
    console.log('[useLawyer] Specialties response:', response);
    const result = response.data || [];
    console.log('[useLawyer] Specialties loaded:', result.length);
    return result;
  };

  return {
    createLawyerRequest,
    getClientRequests,
    getLawyerRequests,
    getRequestById,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    getClientRequestStats,
    getLawyerRequestStats,
    searchLawyers,
    getLawyerById,
    getSpecialties,
  };
};
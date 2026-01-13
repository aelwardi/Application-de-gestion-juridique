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


  const createLawyerRequest = async (data: CreateLawyerRequestInput) => {
    try {
      const response = await apiFetch<ApiResponse<LawyerRequest>>('/lawyer-requests', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return { success: true, data: response.data! };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create lawyer request' };
    }
  };


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


  const getRequestById = async (requestId: string): Promise<LawyerRequest> => {
    const response = await apiFetch<ApiResponse<LawyerRequest>>(`/lawyer-requests/${requestId}`);
    return response.data!;
  };


  const acceptRequest = async (requestId: string): Promise<any> => {
    const response = await apiFetch<ApiResponse<any>>(`/lawyer-requests/${requestId}/accept`, {
      method: 'POST',
    });
    return response.data!;
  };


  const rejectRequest = async (requestId: string, reason?: string): Promise<LawyerRequest> => {
    const response = await apiFetch<ApiResponse<LawyerRequest>>(`/lawyer-requests/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return response.data!;
  };


  const cancelRequest = async (requestId: string): Promise<LawyerRequest> => {
    const response = await apiFetch<ApiResponse<LawyerRequest>>(`/lawyer-requests/${requestId}/cancel`, {
      method: 'POST',
    });
    return response.data!;
  };


  const getClientRequestStats = async (clientId: string): Promise<LawyerRequestStats> => {
    const response = await apiFetch<ApiResponse<LawyerRequestStats>>(`/lawyer-requests/client/${clientId}/stats`);
    return response.data!;
  };


  const getLawyerRequestStats = async (lawyerId: string): Promise<LawyerRequestStats> => {
    const response = await apiFetch<ApiResponse<LawyerRequestStats>>(`/lawyer-requests/lawyer/${lawyerId}/stats`);
    return response.data!;
  };


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

    try {
      const response = await apiFetch<any>(url);
      console.log('[useLawyer] Raw response:', response);

      let data: any[] = [];
      let total = 0;
      let page = 1;
      let limit = 20;
      let totalPages = 1;

      if (response) {
        if (response.data !== undefined) {
          data = response.data || [];
          if (response.pagination) {
            total = response.pagination.total || 0;
            page = response.pagination.page || 1;
            limit = response.pagination.limit || 20;
            totalPages = response.pagination.totalPages || 1;
          } else {
            total = response.total || 0;
            totalPages = Math.ceil(total / (filters.limit || 20));
          }
        } else if (Array.isArray(response)) {
          data = response;
          total = response.length;
        }
      }

      const result = {
        data,
        total,
        page,
        limit,
        totalPages,
      };

      console.log('[useLawyer] Processed result:', {
        dataCount: result.data.length,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages
      });

      return result;
    } catch (error: any) {
      if (error.status === 401 || error.status === 403 || error.statusCode === 401 || error.statusCode === 403) {
        throw error;
      }
      console.error('[useLawyer] Error fetching lawyers:', error);
      return {
        data: [],
        total: 0,
        page: 1,
        limit: filters.limit || 20,
        totalPages: 1,
      };
    }
  };


  const getLawyerById = async (lawyerId: string): Promise<Lawyer> => {
    const response = await apiFetch<ApiResponse<Lawyer>>(`/lawyers/${lawyerId}`);
    return response.data!;
  };


  const getSpecialties = async (): Promise<any[]> => {
    console.log('[useLawyer] 📡 Fetching specialties...');
    const response = await apiFetch<ApiResponse<any[]>>('/lawyers/specialties/list');
    console.log('[useLawyer] Specialties response:', response);
    const result = response.data || [];
    console.log('[useLawyer] Specialties loaded:', result.length);
    return result;
  };

  const getLawyers = async (filters?: LawyerSearchFilters) => {
    return await searchLawyers(filters);
  };

  const getLawyer = async (lawyerId: string) => {
    const data = await getLawyerById(lawyerId);
    return { success: true, data };
  };

  const updateLawyerProfile = async (lawyerId: string, data: any) => {
    try {
      const response = await apiFetch<ApiResponse<Lawyer>>(`/lawyers/${lawyerId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return { success: true, data: response.data! };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update profile' };
    }
  };

  const checkAvailability = async (data: any) => {
    try {
      const response = await apiFetch<any>('/lawyers/check-availability', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error: any) {
      return { available: false, error: error.message || 'Failed to check availability' };
    }
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
    getLawyers,
    getLawyer,
    updateLawyerProfile,
    checkAvailability,
  };
};
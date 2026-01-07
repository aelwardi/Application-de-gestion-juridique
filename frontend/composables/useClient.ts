import type {
  Client,
  UpdateClientInput,
  ClientSearchFilters,
  ClientStats,
} from '~/types/client';
import type { ApiResponse, PaginatedResponse } from '~/types/api';

export const useClient = () => {
  const { apiFetch } = useApi();


  const getClientById = async (id: string): Promise<Client> => {
    const response = await apiFetch<ApiResponse<Client>>(`/clients/${id}`);
    return response.data!;
  };

  const getClientByUserId = async (userId: string): Promise<Client> => {
    const response = await apiFetch<ApiResponse<Client>>(`/clients/user/${userId}`);
    return response.data!;
  };

  const getAllClients = async (
    page = 1,
    limit = 50
  ): Promise<PaginatedResponse<Client>> => {
    const response = await apiFetch<any>(`/clients?page=${page}&limit=${limit}`);
    return {
      data: response.data,
      total: response.pagination.total,
      page: response.pagination.page,
      limit: response.pagination.limit,
      totalPages: response.pagination.totalPages,
    };
  };

  const searchClients = async (
    filters: ClientSearchFilters
  ): Promise<PaginatedResponse<Client>> => {
    const params = new URLSearchParams();

    if (filters.name) params.append('name', filters.name);
    if (filters.email) params.append('email', filters.email);
    if (filters.city) params.append('city', filters.city);
    if (filters.hasActiveCases !== undefined) params.append('has_active_cases', String(filters.hasActiveCases));
    if (filters.isActive !== undefined) params.append('is_active', String(filters.isActive));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.offset) params.append('offset', String(filters.offset));

    const response = await apiFetch<any>(`/clients/search?${params.toString()}`);
    return {
      data: response.data,
      total: response.pagination.total,
      page: response.pagination.page,
      limit: response.pagination.limit,
      totalPages: response.pagination.totalPages,
    };
  };

  const getClientsByLawyer = async (
    lawyerId: string,
    limit = 50,
    offset = 0
  ): Promise<PaginatedResponse<Client>> => {
    const response = await apiFetch<any>(`/clients/lawyer/${lawyerId}?limit=${limit}&offset=${offset}`);
    return {
      data: response.data,
      total: response.pagination.total,
      page: response.pagination.page,
      limit: response.pagination.limit,
      totalPages: response.pagination.totalPages,
    };
  };

  const updateClient = async (id: string, data: UpdateClientInput): Promise<Client> => {
    const response = await apiFetch<ApiResponse<Client>>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data!;
  };


  const deleteClient = async (id: string): Promise<void> => {
    await apiFetch<ApiResponse<void>>(`/clients/${id}`, {
      method: 'DELETE',
    });
  };

  const getClientStats = async (userId: string): Promise<ClientStats> => {
    const response = await apiFetch<ApiResponse<ClientStats>>(`/clients/user/${userId}/stats`);
    return response.data!;
  };

  const getClientCases = async (userId: string, limit = 20, offset = 0) => {
    try {
      const response = await apiFetch<any>(`/cases?client_id=${userId}&limit=${limit}&offset=${offset}`);
      return { data: response.data || [] };
    } catch (error) {
      console.error('Error fetching client cases:', error);
      return { data: [] };
    }
  };

  const getClientAppointments = async (userId: string, limit = 20, offset = 0) => {
    try {
      const response = await apiFetch<any>(`/appointments?client_id=${userId}&limit=${limit}&offset=${offset}`);
      return { data: response.data || [] };
    } catch (error) {
      console.error('Error fetching client appointments:', error);
      return { data: [] };
    }
  };

  const getClientDocuments = async (userId: string, limit = 20, offset = 0) => {
    try {
      const response = await apiFetch<any>(`/documents?user_id=${userId}&limit=${limit}&offset=${offset}`);
      return { data: response.data || [] };
    } catch (error) {
      console.error('Error fetching client documents:', error);
      return { data: [] };
    }
  };

  return {
    getClientById,
    getClientByUserId,
    getAllClients,
    searchClients,
    getClientsByLawyer,
    updateClient,
    deleteClient,
    getClientStats,
    getClientCases,
    getClientAppointments,
    getClientDocuments,
  };
};
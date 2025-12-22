import type {
  Client,
  ClientWithUser,
  CreateClientInput,
  UpdateClientInput,
  ClientSearchFilters,
  ClientStats,
  ClientCase,
  ClientAppointment,
  ClientDocument,
} from '~/types/client';
import type { ApiResponse, PaginatedResponse } from '~/types/api';

export const useClient = () => {
  const { apiFetch } = useApi();

  const createClient = async (data: CreateClientInput): Promise<Client> => {
    const response = await apiFetch<ApiResponse<Client>>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data!;
  };

  const getClientById = async (id: string): Promise<ClientWithUser> => {
    const response = await apiFetch<ApiResponse<ClientWithUser>>(`/clients/${id}`);
    return response.data!;
  };

  const getClientByUserId = async (userId: string): Promise<ClientWithUser> => {
    const response = await apiFetch<ApiResponse<ClientWithUser>>(`/clients/user/${userId}`);
    return response.data!;
  };

  const getAllClients = async (
    limit = 50,
    offset = 0
  ): Promise<PaginatedResponse<ClientWithUser>> => {
    const response = await apiFetch<any>(`/clients?limit=${limit}&offset=${offset}`);
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
  ): Promise<PaginatedResponse<ClientWithUser>> => {
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
  ): Promise<PaginatedResponse<ClientWithUser>> => {
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

  const updateClientByUserId = async (userId: string, data: UpdateClientInput): Promise<Client> => {
    const response = await apiFetch<ApiResponse<Client>>(`/clients/user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data!;
  };

  const deleteClient = async (id: string): Promise<void> => {
    await apiFetch<ApiResponse>(`/clients/${id}`, {
      method: 'DELETE',
    });
  };

  const getClientStats = async (userId: string): Promise<ClientStats> => {
    const response = await apiFetch<ApiResponse<ClientStats>>(`/clients/user/${userId}/stats`);
    return response.data!;
  };

  const getClientCases = async (
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<PaginatedResponse<ClientCase>> => {
    const response = await apiFetch<any>(`/clients/user/${userId}/cases?limit=${limit}&offset=${offset}`);
    return {
      data: response.data,
      total: response.pagination.total,
      page: response.pagination.page,
      limit: response.pagination.limit,
      totalPages: response.pagination.totalPages,
    };
  };

  const getClientAppointments = async (
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<PaginatedResponse<ClientAppointment>> => {
    const response = await apiFetch<any>(`/clients/user/${userId}/appointments?limit=${limit}&offset=${offset}`);
    return {
      data: response.data,
      total: response.pagination.total,
      page: response.pagination.page,
      limit: response.pagination.limit,
      totalPages: response.pagination.totalPages,
    };
  };

  const getClientDocuments = async (
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<PaginatedResponse<ClientDocument>> => {
    const response = await apiFetch<any>(`/clients/user/${userId}/documents?limit=${limit}&offset=${offset}`);
    return {
      data: response.data,
      total: response.pagination.total,
      page: response.pagination.page,
      limit: response.pagination.limit,
      totalPages: response.pagination.totalPages,
    };
  };

  return {
    createClient,
    getClientById,
    getClientByUserId,
    getAllClients,
    searchClients,
    getClientsByLawyer,
    updateClient,
    updateClientByUserId,
    deleteClient,
    getClientStats,
    getClientCases,
    getClientAppointments,
    getClientDocuments,
  };
};
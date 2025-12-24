import type { 
  Appointment,
  AppointmentWithDetails, 
  CreateAppointmentDTO, 
  UpdateAppointmentDTO, 
  AppointmentFilters,
  AppointmentResponse,
  AppointmentsResponse,
  AppointmentStatsResponse
} from '~/types/appointment';

export const useAppointment = () => {
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
   * Créer un nouveau rendez-vous
   */
  const createAppointment = async (appointmentData: CreateAppointmentDTO): Promise<AppointmentResponse> => {
    try {
      const response = await $fetch<AppointmentResponse>(`${baseURL}/appointments`, {
        method: 'POST',
        headers: getHeaders(),
        body: appointmentData
      });
      return response;
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  };

  /**
   * Récupérer tous les rendez-vous avec filtres optionnels
   */
  const getAllAppointments = async (filters?: AppointmentFilters): Promise<AppointmentsResponse> => {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.appointment_type) params.append('appointment_type', filters.appointment_type);
      if (filters?.location_type) params.append('location_type', filters.location_type);
      if (filters?.lawyer_id) params.append('lawyer_id', filters.lawyer_id);
      if (filters?.client_id) params.append('client_id', filters.client_id);
      if (filters?.case_id) params.append('case_id', filters.case_id);
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());
      
      const queryString = params.toString();
      const url = queryString ? `${baseURL}/appointments?${queryString}` : `${baseURL}/appointments`;
      
      const response = await $fetch<AppointmentsResponse>(url, {
        method: 'GET',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  };

  /**
   * Récupérer un rendez-vous par ID
   */
  const getAppointmentById = async (id: string): Promise<AppointmentResponse> => {
    try {
      const response = await $fetch<AppointmentResponse>(`${baseURL}/appointments/${id}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching appointment:', error);
      throw error;
    }
  };

  /**
   * Mettre à jour un rendez-vous
   */
  const updateAppointment = async (id: string, updates: UpdateAppointmentDTO): Promise<AppointmentResponse> => {
    try {
      const response = await $fetch<AppointmentResponse>(`${baseURL}/appointments/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: updates
      });
      return response;
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  };

  /**
   * Supprimer un rendez-vous
   */
  const deleteAppointment = async (id: string): Promise<AppointmentResponse> => {
    try {
      const response = await $fetch<AppointmentResponse>(`${baseURL}/appointments/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  };

  /**
   * Récupérer les rendez-vous d'un avocat
   */
  const getAppointmentsByLawyer = async (lawyerId: string, filters?: AppointmentFilters): Promise<AppointmentsResponse> => {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.appointment_type) params.append('appointment_type', filters.appointment_type);
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());
      
      const queryString = params.toString();
      const url = queryString 
        ? `${baseURL}/appointments/lawyer/${lawyerId}?${queryString}`
        : `${baseURL}/appointments/lawyer/${lawyerId}`;
      
      const response = await $fetch<AppointmentsResponse>(url, {
        method: 'GET',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching lawyer appointments:', error);
      throw error;
    }
  };

  /**
   * Récupérer les rendez-vous d'un client
   */
  const getAppointmentsByClient = async (clientId: string, filters?: AppointmentFilters): Promise<AppointmentsResponse> => {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.appointment_type) params.append('appointment_type', filters.appointment_type);
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());
      
      const queryString = params.toString();
      const url = queryString 
        ? `${baseURL}/appointments/client/${clientId}?${queryString}`
        : `${baseURL}/appointments/client/${clientId}`;
      
      const response = await $fetch<AppointmentsResponse>(url, {
        method: 'GET',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching client appointments:', error);
      throw error;
    }
  };

  /**
   * Récupérer les rendez-vous d'un dossier
   */
  const getAppointmentsByCase = async (caseId: string): Promise<AppointmentsResponse> => {
    try {
      const response = await $fetch<AppointmentsResponse>(`${baseURL}/appointments/case/${caseId}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching case appointments:', error);
      throw error;
    }
  };

  /**
   * Récupérer les rendez-vous à venir
   */
  const getUpcomingAppointments = async (lawyerId?: string, clientId?: string, options?: { limit?: number }): Promise<AppointmentsResponse> => {
    try {
      const params = new URLSearchParams();
      if (lawyerId) params.append('lawyer_id', lawyerId);
      if (clientId) params.append('client_id', clientId);
      if (options?.limit) params.append('limit', options.limit.toString());
      
      const queryString = params.toString();
      const url = queryString 
        ? `${baseURL}/appointments/upcoming?${queryString}`
        : `${baseURL}/appointments/upcoming`;
      
      const response = await $fetch<AppointmentsResponse>(url, {
        method: 'GET',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching upcoming appointments:', error);
      throw error;
    }
  };

  /**
   * Récupérer les rendez-vous du jour
   */
  const getTodayAppointments = async (lawyerId?: string, clientId?: string): Promise<AppointmentsResponse> => {
    try {
      const params = new URLSearchParams();
      if (lawyerId) params.append('lawyer_id', lawyerId);
      if (clientId) params.append('client_id', clientId);
      
      const queryString = params.toString();
      const url = queryString 
        ? `${baseURL}/appointments/today?${queryString}`
        : `${baseURL}/appointments/today`;
      
      const response = await $fetch<AppointmentsResponse>(url, {
        method: 'GET',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching today appointments:', error);
      throw error;
    }
  };

  /**
   * Récupérer les statistiques des rendez-vous
   */
  const getAppointmentStats = async (lawyerId?: string, clientId?: string): Promise<AppointmentStatsResponse> => {
    try {
      const params = new URLSearchParams();
      if (lawyerId) params.append('lawyer_id', lawyerId);
      if (clientId) params.append('client_id', clientId);
      
      const queryString = params.toString();
      const url = queryString 
        ? `${baseURL}/appointments/stats?${queryString}`
        : `${baseURL}/appointments/stats`;
        
      const response = await $fetch<AppointmentStatsResponse>(url, {
        method: 'GET',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching appointment stats:', error);
      throw error;
    }
  };

  /**
   * Annuler un rendez-vous
   */
  const cancelAppointment = async (id: string): Promise<AppointmentResponse> => {
    try {
      const response = await $fetch<AppointmentResponse>(`${baseURL}/appointments/${id}/cancel`, {
        method: 'POST',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  };

  /**
   * Confirmer un rendez-vous
   */
  const confirmAppointment = async (id: string): Promise<AppointmentResponse> => {
    try {
      const response = await $fetch<AppointmentResponse>(`${baseURL}/appointments/${id}/confirm`, {
        method: 'POST',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error confirming appointment:', error);
      throw error;
    }
  };

  /**
   * Marquer un rendez-vous comme complété
   */
  const completeAppointment = async (id: string): Promise<AppointmentResponse> => {
    try {
      const response = await $fetch<AppointmentResponse>(`${baseURL}/appointments/${id}/complete`, {
        method: 'POST',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error completing appointment:', error);
      throw error;
    }
  };

  return {
    createAppointment,
    getAllAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByLawyer,
    getAppointmentsByClient,
    getAppointmentsByCase,
    getUpcomingAppointments,
    getTodayAppointments,
    getAppointmentStats,
    cancelAppointment,
    confirmAppointment,
    completeAppointment
  };
};

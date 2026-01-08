import type { AppointmentSuggestion, CreateSuggestionDTO, AvailableSlot } from '~/types/suggestion';

export const useSuggestion = () => {
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

  const createSuggestion = async (data: CreateSuggestionDTO): Promise<{ success: boolean; data?: AppointmentSuggestion; message?: string }> => {
    try {
      const response = await $fetch<any>(`${baseURL}/appointment-suggestions`, {
        method: 'POST',
        headers: getHeaders(),
        body: data
      });
      return response;
    } catch (error: any) {
      console.error('Error creating suggestion:', error);
      throw error;
    }
  };


  const getSentSuggestions = async (): Promise<{ success: boolean; data: AppointmentSuggestion[] }> => {
    try {
      const response = await $fetch<any>(`${baseURL}/appointment-suggestions/sent`, {
        method: 'GET',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching sent suggestions:', error);
      throw error;
    }
  };


  const getReceivedSuggestions = async (): Promise<{ success: boolean; data: AppointmentSuggestion[] }> => {
    try {
      const response = await $fetch<any>(`${baseURL}/appointment-suggestions/received`, {
        method: 'GET',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching received suggestions:', error);
      throw error;
    }
  };


  const acceptSuggestion = async (suggestionId: string): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
      const response = await $fetch<any>(`${baseURL}/appointment-suggestions/${suggestionId}/accept`, {
        method: 'POST',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error accepting suggestion:', error);
      throw error;
    }
  };


  const rejectSuggestion = async (suggestionId: string, reason?: string): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
      const response = await $fetch<any>(`${baseURL}/appointment-suggestions/${suggestionId}/reject`, {
        method: 'POST',
        headers: getHeaders(),
        body: { reason }
      });
      return response;
    } catch (error: any) {
      console.error('Error rejecting suggestion:', error);
      throw error;
    }
  };


  const counterSuggestion = async (
    suggestionId: string,
    suggested_start_time: string,
    suggested_end_time: string,
    notes?: string
  ): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
      const response = await $fetch<any>(`${baseURL}/appointment-suggestions/${suggestionId}/counter`, {
        method: 'POST',
        headers: getHeaders(),
        body: { suggested_start_time, suggested_end_time, notes }
      });
      return response;
    } catch (error: any) {
      console.error('Error countering suggestion:', error);
      throw error;
    }
  };


  const getAvailableSlots = async (lawyerId: string, date: string, duration: number = 60): Promise<{ success: boolean; data: AvailableSlot[] }> => {
    try {
      const response = await $fetch<any>(`${baseURL}/appointment-suggestions/available-slots/${lawyerId}?date=${date}&duration=${duration}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching available slots:', error);
      throw error;
    }
  };


  const getAppointmentSuggestions = async (appointmentId: string): Promise<{ success: boolean; data: AppointmentSuggestion[] }> => {
    try {
      const response = await $fetch<any>(`${baseURL}/appointment-suggestions/appointment/${appointmentId}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching appointment suggestions:', error);
      throw error;
    }
  };

  return {
    createSuggestion,
    getSentSuggestions,
    getReceivedSuggestions,
    acceptSuggestion,
    rejectSuggestion,
    counterSuggestion,
    getAvailableSlots,
    getAppointmentSuggestions
  };
};
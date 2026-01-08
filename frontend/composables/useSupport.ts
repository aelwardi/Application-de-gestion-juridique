export const useSupport = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBaseUrl;
  const authStore = useAuthStore();

  const getHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (authStore.accessToken) {
      headers['Authorization'] = `Bearer ${authStore.accessToken}`;
    }
    return headers;
  };


  const createTicket = async (data: {
    subject: string;
    description: string;
    priority?: string;
    category?: string;
  }) => {
    try {
      const response = await $fetch<any>(`${baseURL}/support/tickets`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return response;
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  };


  const getMyTickets = async () => {
    try {
      const response = await $fetch<any>(`${baseURL}/support/my-tickets`, {
        method: 'GET',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  };


  const getTicketDetails = async (ticketId: string) => {
    try {
      const response = await $fetch<any>(`${baseURL}/support/tickets/${ticketId}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching ticket details:', error);
      throw error;
    }
  };


  const addTicketMessage = async (ticketId: string, message: string) => {
    try {
      const response = await $fetch<any>(`${baseURL}/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ message })
      });
      return response;
    } catch (error: any) {
      console.error('Error adding message:', error);
      throw error;
    }
  };

  return {
    createTicket,
    getMyTickets,
    getTicketDetails,
    addTicketMessage
  };
};


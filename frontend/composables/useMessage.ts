export const useMessage = () => {
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


  const getConversations = async () => {
    try {
      const response = await $fetch<any>(`${baseURL}/messages/conversations`, {
        method: 'GET',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  };


  const getMessages = async (conversationId: string) => {
    try {
      const response = await $fetch<any>(`${baseURL}/messages/conversations/${conversationId}/messages`, {
        method: 'GET',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  };


  const createOrGetConversation = async (recipientId: string, caseId?: string, title?: string) => {
    try {
      const response = await $fetch<any>(`${baseURL}/messages/conversations`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          recipient_id: recipientId,
          case_id: caseId,
          title
        })
      });
      return response;
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };


  const sendMessage = async (conversationId: string, messageText: string, attachments?: any) => {
    try {
      const response = await $fetch<any>(`${baseURL}/messages/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          message_text: messageText,
          message_type: 'text',
          attachments
        })
      });
      return response;
    } catch (error: any) {
      console.error('Error sending message:', error);
      throw error;
    }
  };


  const getUnreadCount = async () => {
    try {
      const response = await $fetch<any>(`${baseURL}/messages/unread-count`, {
        method: 'GET',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching unread count:', error);
      return { success: true, count: 0 };
    }
  };

  return {
    getConversations,
    getMessages,
    createOrGetConversation,
    sendMessage,
    getUnreadCount
  };
};
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


  const sendMessageToConversation = async (conversationId: string, messageText: string, attachments?: any) => {
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

  const countUnread = async (userId: string): Promise<number> => {
    try {
      const response = await $fetch<any>(`${baseURL}/messages/user/${userId}/unread-count`, {
        method: 'GET',
        headers: getHeaders()
      });
      return response.count || 0;
    } catch (error: any) {
      console.error('Error counting unread messages:', error);
      return 0;
    }
  };

  const sendMessageDirect = async (data: { receiver_id: string; content: string; case_id?: string }) => {
    try {
      const response = await $fetch<any>(`${baseURL}/messages`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return response;
    } catch (error: any) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const getMessagesBetweenUsers = async (userId1: string, userId2: string) => {
    try {
      const response = await $fetch<any>(`${baseURL}/messages/between/${userId1}/${userId2}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const response = await $fetch<any>(`${baseURL}/messages/${messageId}/read`, {
        method: 'PATCH',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const response = await $fetch<any>(`${baseURL}/messages/${messageId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return response;
    } catch (error: any) {
      console.error('Error deleting message:', error);
      throw error;
    }
  };

  return {
    getConversations,
    getMessages: (arg1: string, arg2?: string) => {
      if (arg2) {
        return getMessagesBetweenUsers(arg1, arg2);
      } else {
        return getMessages(arg1);
      }
    },
    createOrGetConversation,
    sendMessage: (arg1: any, arg2?: string, arg3?: any) => {
      if (typeof arg1 === 'object' && arg1.receiver_id) {
        return sendMessageDirect(arg1);
      } else {
        return sendMessageToConversation(arg1, arg2!, arg3);
      }
    },
    getUnreadCount,
    countUnread,
    markAsRead,
    deleteMessage,
  };
};
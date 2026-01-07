import type { ApiResponse, PaginatedResponse } from '~/types/api';

export interface ApiNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  related_entity_type?: string;
  related_entity_id?: string;
  is_read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const { apiFetch } = useApi();


  const getUserNotifications = async (
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<PaginatedResponse<ApiNotification>> => {
    const response = await apiFetch<any>(`/notifications/user/${userId}?limit=${limit}&offset=${offset}`);
    return {
      data: response.data || [],
      total: response.pagination?.total || 0,
      page: response.pagination?.page || 1,
      limit: response.pagination?.limit || limit,
      totalPages: response.pagination?.totalPages || 1,
    };
  };


  const getUnreadNotifications = async (userId: string): Promise<ApiNotification[]> => {
    const response = await apiFetch<ApiResponse<ApiNotification[]>>(`/notifications/user/${userId}/unread`);
    return response.data || [];
  };

  const markAsRead = async (notificationId: string): Promise<void> => {
    await apiFetch(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  };


  const markAllAsRead = async (userId: string): Promise<void> => {
    await apiFetch(`/notifications/user/${userId}/read-all`, {
      method: 'PATCH',
    });
  };


  const deleteNotification = async (notificationId: string): Promise<void> => {
    await apiFetch(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  };


  const countUnread = async (userId: string): Promise<number> => {
    const response = await apiFetch<ApiResponse<{ count: number }>>(`/notifications/user/${userId}/unread/count`);
    return response.data?.count || 0;
  };

  return {
    getUserNotifications,
    getUnreadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    countUnread,
  };
};
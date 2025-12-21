export interface AdminStats {
  totalUsers: number;
  totalLawyers: number;
  totalClients: number;
  totalCollaborators: number;
  totalCases: number;
  totalAppointments: number;
  totalMessages: number;
  activeUsers: number;
  newUsersThisMonth: number;
  newCasesThisMonth: number;
}

export interface User {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  is_active: boolean;
  is_verified: boolean;
  last_login_at: Date | null;
  created_at: Date;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
  user_email?: string;
  user_name?: string;
}

export const useAdmin = () => {
  const { apiFetch } = useApi();

  /**
   * Get dashboard statistics
   */
  const getDashboardStats = async () => {
    try {
      const response = await apiFetch<{ success: boolean; data: AdminStats }>('/admin/stats', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  };

  /**
   * Get users with pagination and filters
   */
  const getUsers = async (params: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    isActive?: string;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.set('page', params.page.toString());
      if (params.limit) queryParams.set('limit', params.limit.toString());
      if (params.role) queryParams.set('role', params.role);
      if (params.search) queryParams.set('search', params.search);
      if (params.isActive) queryParams.set('isActive', params.isActive);

      const response = await apiFetch<any>(`/admin/users?${queryParams}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  };

  /**
   * Get user details
   */
  const getUserDetails = async (userId: string) => {
    try {
      const response = await apiFetch<{ success: boolean; data: User }>(`/admin/users/${userId}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  };

  /**
   * Toggle user status (activate/deactivate)
   */
  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await apiFetch<{ success: boolean; message: string }>(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });
      return response;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  };

  /**
   * Verify user
   */
  const verifyUser = async (userId: string) => {
    try {
      const response = await apiFetch<{ success: boolean; message: string }>(`/admin/users/${userId}/verify`, {
        method: 'PATCH',
      });
      return response;
    } catch (error) {
      console.error('Error verifying user:', error);
      throw error;
    }
  };

  /**
   * Delete user
   */
  const deleteUser = async (userId: string) => {
    try {
      const response = await apiFetch<{ success: boolean; message: string }>(`/admin/users/${userId}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  /**
   * Get user growth statistics
   */
  const getUserGrowthStats = async (days: number = 30) => {
    try {
      const response = await apiFetch<{ success: boolean; data: any[] }>(`/admin/stats/growth?days=${days}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching growth stats:', error);
      throw error;
    }
  };

  /**
   * Get activity logs
   */
  const getActivityLogs = async (params: {
    page?: number;
    limit?: number;
    userId?: string;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.set('page', params.page.toString());
      if (params.limit) queryParams.set('limit', params.limit.toString());
      if (params.userId) queryParams.set('userId', params.userId);

      const response = await apiFetch<any>(`/admin/logs?${queryParams}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }
  };

  /**
   * Send bulk email
   */
  const sendBulkEmail = async (
    recipientIds: string[],
    subject: string,
    htmlContent: string
  ) => {
    try {
      const response = await apiFetch<{ success: boolean; message: string; data: { sent: number } }>(
        '/admin/email/bulk',
        {
          method: 'POST',
          body: JSON.stringify({ recipientIds, subject, htmlContent }),
        }
      );
      return response;
    } catch (error) {
      console.error('Error sending bulk email:', error);
      throw error;
    }
  };

  /**
   * Export users data
   */
  const exportUsers = (role?: string) => {
    const params = new URLSearchParams();
    if (role) params.set('role', role);

    const url = `/api/admin/export/users${params.toString() ? '?' + params.toString() : ''}`;
    window.location.href = url;
  };

  return {
    getDashboardStats,
    getUsers,
    getUserDetails,
    toggleUserStatus,
    verifyUser,
    deleteUser,
    getUserGrowthStats,
    getActivityLogs,
    sendBulkEmail,
    exportUsers,
  };
};
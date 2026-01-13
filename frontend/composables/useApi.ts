
export const useApi = () => {
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

  const apiFetch = async <T = any>(
    endpoint: string,
    options?: any
  ): Promise<T> => {
    const url = endpoint.startsWith('http') ? endpoint : `${baseURL}${endpoint}`;

    try {
      return await $fetch<T>(url, {
        ...options,
        headers: {
          ...getHeaders(),
          ...options?.headers
        }
      } as any);
    } catch (error: any) {
      if (error.status === 401 || error.statusCode === 401) {
        const errorData = error.data || error.response?.data;

        if (errorData?.code === 'TOKEN_EXPIRED' && authStore.refreshAccessToken) {
          const refreshed = await authStore.refreshAccessToken();

          if (refreshed) {
            return await $fetch<T>(url, {
              ...options,
              headers: {
                ...getHeaders(),
                ...options?.headers
              }
            } as any);
          }
        }

        authStore.clearAuth();
        if (typeof navigateTo !== 'undefined') {
          await navigateTo('/auth/login');
        }
        throw error;
      }

      throw error;
    }
  };

  return {
    apiFetch
  };
};
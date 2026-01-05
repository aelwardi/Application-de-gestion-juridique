export const useApi = () => {
  const config = useRuntimeConfig();

  const apiFetch = async <T>(url: string, options: any = {}) => {
    const authStore = useAuthStore();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (authStore.accessToken) {
      headers['Authorization'] = `Bearer ${authStore.accessToken}`;
    }

    try {
      const response = await $fetch<T>(`${config.public.apiBaseUrl}${url}`, {
        ...options,
        headers,
      });
      return response;
    } catch (error: any) {
      if (error.status === 401 || error.statusCode === 401) {
        if (error.data?.code === 'TOKEN_EXPIRED') {
          const refreshed = await authStore.refreshAccessToken();
          if (refreshed) {
            headers['Authorization'] = `Bearer ${authStore.accessToken}`;
            return await $fetch<T>(`${config.public.apiBaseUrl}${url}`, {
              ...options,
              headers,
            });
          }
        }
        authStore.clearAuth();
        navigateTo('/auth/login');
      }
      throw error;
    }
  };

  return { apiFetch };
};
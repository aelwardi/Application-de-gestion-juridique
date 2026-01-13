import type { ApiResponse } from '~/types/api';

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
    options?: RequestInit & { method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'; body?: any }
  ): Promise<T> => {
    const url = endpoint.startsWith('http') ? endpoint : `${baseURL}${endpoint}`;

    return await $fetch<T>(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options?.headers
      }
    } as any);
  };

  return {
    apiFetch
  };
};
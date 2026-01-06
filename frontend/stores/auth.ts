import { defineStore } from 'pinia';
import type { User, RegisterData, LoginData, UpdateProfileData, ChangePasswordData } from '~/types/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
  }),

  getters: {
    isAdmin: (state): boolean => state.user?.role === 'admin',
    isLawyer: (state): boolean => state.user?.role === 'avocat',
    isClient: (state): boolean => state.user?.role === 'client',
    isCollaborator: (state): boolean => state.user?.role === 'collaborateur',
    fullName: (state): string => {
      if (!state.user) return '';
      return `${state.user.firstName} ${state.user.lastName}`;
    },
  },

  actions: {
    /**
     * Set authentication data
     */
    setAuth(user: User, accessToken: string, refreshToken: string) {
      this.user = user;
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.isAuthenticated = true;

      if (process.client) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      }
    },

    /**
     * Clear authentication data
     */
    clearAuth() {
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      this.isAuthenticated = false;

      if (process.client) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    },

    /**
     * Load tokens from localStorage
     */
    loadTokensFromStorage() {
      if (process.client) {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (accessToken && refreshToken) {
          this.accessToken = accessToken;
          this.refreshToken = refreshToken;
          this.isAuthenticated = true;
        }
      }
    },

    /**
     * Register a new user
     */
    async register(data: RegisterData) {
      console.log('AuthStore: register called with data:', data);
      this.isLoading = true;
      try {
        const config = useRuntimeConfig();
        const apiUrl = `${config.public.apiBaseUrl}/auth/register`;
        console.log('AuthStore: API URL:', apiUrl);

        const response = await $fetch<any>(apiUrl, {
          method: 'POST',
          body: data,
        });

        console.log('AuthStore: API response:', response);

        if (response.success && response.data) {
          console.log('AuthStore: Registration successful, setting auth...');
          this.setAuth(response.data.user, response.data.accessToken, response.data.refreshToken);
          return { success: true, data: response.data };
        }

        console.log('AuthStore: Registration failed:', response.message);
        return { success: false, message: response.message || 'Registration failed' };
      } catch (error: any) {
        console.error('AuthStore: Register error:', error);
        console.error('AuthStore: Error data:', error.data);
        console.error('AuthStore: Error status:', error.status || error.statusCode);
        return {
          success: false,
          message: error.data?.message || error.message || 'Registration failed',
          errors: error.data?.errors,
        };
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Login user
     */
    async login(data: LoginData) {
      this.isLoading = true;
      try {
        const config = useRuntimeConfig();
        const response = await $fetch<any>(`${config.public.apiBaseUrl}/auth/login`, {
          method: 'POST',
          body: data,
        });

        if (response.success && response.data) {
          this.setAuth(response.data.user, response.data.accessToken, response.data.refreshToken);
          return { success: true, data: response.data };
        }

        return { success: false, message: response.message || 'Login failed' };
      } catch (error: any) {
        console.error('Login error:', error);
        return {
          success: false,
          message: error.data?.message || error.message || 'Login failed',
        };
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Logout user
     */
    async logout() {
      try {
        const config = useRuntimeConfig();
        await $fetch(`${config.public.apiBaseUrl}/auth/logout`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
        });
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        this.clearAuth();
        if (process.client) {
          navigateTo('/auth/login');
        }
      }
    },

    /**
     * Fetch current user data
     */
    async fetchUser() {
      try {
        if (!this.user?.id) return;

        const config = useRuntimeConfig();
        const response = await $fetch<any>(`${config.public.apiBaseUrl}/users/${this.user.id}`, {
          headers: this.getAuthHeaders(),
        });

        if (response.success && response.data) {
          this.user = response.data;
        }
      } catch (error) {
        console.error('Fetch user error:', error);
      }
    },

    /**
     * Refresh access token
     */
    async refreshAccessToken() {
      try {
        if (!this.refreshToken) {
          throw new Error('No refresh token available');
        }

        const config = useRuntimeConfig();
        const response = await $fetch<any>(`${config.public.apiBaseUrl}/auth/refresh-token`, {
          method: 'POST',
          body: {
            refreshToken: this.refreshToken,
          },
        });

        if (response.success && response.data) {
          this.accessToken = response.data.accessToken;
          this.refreshToken = response.data.refreshToken;

          if (process.client) {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
          }

          return true;
        }

        return false;
      } catch (error) {
        console.error('Refresh token error:', error);
        this.clearAuth();
        return false;
      }
    },

    /**
     * Get current user profile
     */
    async getProfile() {
      this.isLoading = true;
      try {
        const config = useRuntimeConfig();
        const response = await $fetch<any>(`${config.public.apiBaseUrl}/auth/me`, {
          method: 'GET',
          headers: this.getAuthHeaders(),
        });

        if (response.success && response.data) {
          this.user = response.data;
          return { success: true, data: response.data };
        }

        return { success: false, message: response.message || 'Failed to get profile' };
      } catch (error: any) {
        console.error('Get profile error:', error);

        if (error.status === 401 || error.statusCode === 401) {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            return this.getProfile();
          }
          this.clearAuth();
        }

        return {
          success: false,
          message: error.data?.message || error.message || 'Failed to get profile',
        };
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Update user profile
     */
    async updateProfile(data: UpdateProfileData) {
      this.isLoading = true;
      try {
        const config = useRuntimeConfig();
        const response = await $fetch<any>(`${config.public.apiBaseUrl}/auth/me`, {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: data,
        });

        if (response.success && response.data) {
          this.user = response.data;
          return { success: true, data: response.data };
        }

        return { success: false, message: response.message || 'Failed to update profile' };
      } catch (error: any) {
        console.error('Update profile error:', error);
        return {
          success: false,
          message: error.data?.message || error.message || 'Failed to update profile',
          errors: error.data?.errors,
        };
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Change password
     */
    async changePassword(data: ChangePasswordData) {
      this.isLoading = true;
      try {
        const config = useRuntimeConfig();
        const response = await $fetch<any>(`${config.public.apiBaseUrl}/auth/me/password`, {
          method: 'PATCH',
          headers: this.getAuthHeaders(),
          body: data,
        });

        if (response.success) {
          return { success: true, message: response.message };
        }

        return { success: false, message: response.message || 'Failed to change password' };
      } catch (error: any) {
        console.error('Change password error:', error);
        return {
          success: false,
          message: error.data?.message || error.message || 'Failed to change password',
          errors: error.data?.errors,
        };
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Get auth headers for API requests
     */
    getAuthHeaders() {
      return {
        Authorization: `Bearer ${this.accessToken}`,
      };
    },

    /**
     * Initialize auth from stored tokens
     */
    async init() {
      if (!process.client) return;

      this.loadTokensFromStorage();

      if (this.accessToken) {
        try {
          await this.getProfile();
        } catch (error) {
          console.error('Failed to load profile on init:', error);
          this.clearAuth();
        }
      }
    },
  },
});


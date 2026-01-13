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


    async register(data: RegisterData) {
      this.isLoading = true;
      try {
        const config = useRuntimeConfig();
        const apiUrl = `${config.public.apiBaseUrl}/auth/register`;

        const response = await $fetch<any>(apiUrl, {
          method: 'POST',
          body: data,
        });

        if (response.success && response.data) {
          this.setAuth(response.data.user, response.data.accessToken, response.data.refreshToken);
          return { success: true, data: response.data };
        }

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


    async login(data: LoginData) {
      this.isLoading = true;
      try {
        const config = useRuntimeConfig();
        const response = await $fetch<any>(`${config.public.apiBaseUrl}/auth/login`, {
          method: 'POST',
          body: data,
        });

        if (response.success && response.data) {
          if (response.data.requiresTwoFactor && response.data.tempToken) {
            if (process.client) {
              navigateTo(`/auth/verify-2fa?token=${response.data.tempToken}`);
            }
            return {
              success: true,
              data: {
                requiresTwoFactor: true,
                tempToken: response.data.tempToken,
                user: response.data.user,
              },
            };
          }

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


    async getProfile(): Promise<{ success: boolean; data?: any; message?: string }> {
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


    getAuthHeaders() {
      return {
        Authorization: `Bearer ${this.accessToken}`,
      };
    },


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
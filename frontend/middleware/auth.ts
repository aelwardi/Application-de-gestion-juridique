export default defineNuxtRouteMiddleware(async (to, from) => {
  if (!process.client) return;

  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    authStore.loadTokensFromStorage();

    if (authStore.accessToken) {
      try {
        await authStore.getProfile();
      } catch (error) {
        console.error('Failed to load profile in auth middleware:', error);
        authStore.clearAuth();
        return navigateTo('/auth/login');
      }
    }
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login');
  }
});


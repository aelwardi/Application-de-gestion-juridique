export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated && process.client) {
    authStore.loadTokensFromStorage();
    if (authStore.accessToken) {
      await authStore.getProfile();
    }
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login');
  }

  if (!authStore.isLawyer) {
    return navigateTo('/dashboard');
  }
});


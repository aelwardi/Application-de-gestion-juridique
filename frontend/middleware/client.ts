export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login');
  }

  if (authStore.user?.role !== 'client') {
    return navigateTo('/dashboard');
  }
});
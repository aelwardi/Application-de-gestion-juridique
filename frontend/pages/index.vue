<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h1 class="text-2xl font-bold text-gray-900">Chargement...</h1>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
});

onMounted(() => {
  try {
    const authStore = useAuthStore();
    authStore.loadTokensFromStorage();

    if (authStore.accessToken) {
      authStore.getProfile().then((result) => {
        if (result.success) {
          navigateTo('/dashboard');
        } else {
          navigateTo('/auth/login');
        }
      }).catch(() => {
        navigateTo('/auth/login');
      });
    } else {
      navigateTo('/auth/login');
    }
  } catch (error) {
    console.error('Error during initialization:', error);
    navigateTo('/auth/login');
  }
});
</script>
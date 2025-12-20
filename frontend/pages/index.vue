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

const authStore = useAuthStore();

onMounted(async () => {
  try {
    authStore.loadTokensFromStorage();

    if (authStore.accessToken) {
      const result = await authStore.getProfile();
      if (result.success) {
        await navigateTo('/dashboard');
      } else {
        await navigateTo('/auth/login');
      }
    } else {
      await navigateTo('/auth/login');
    }
  } catch (error) {
    console.error('Error during initialization:', error);
    await navigateTo('/auth/login');
  }
});
</script>


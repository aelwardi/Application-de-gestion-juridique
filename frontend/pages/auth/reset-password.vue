<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Réinitialiser le mot de passe
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Entrez votre nouveau mot de passe
        </p>
      </div>

      <div v-if="successMessage" class="rounded-md bg-green-50 p-4">
        <div class="flex">
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800">
              {{ successMessage }}
            </h3>
          </div>
        </div>
      </div>

      <div v-if="errorMessage" class="rounded-md bg-red-50 p-4">
        <div class="flex">
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              {{ errorMessage }}
            </h3>
          </div>
        </div>
      </div>

      <form v-if="!successMessage" class="mt-8 space-y-6" @submit.prevent="handleResetPassword">
        <div class="space-y-4">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Nouveau mot de passe
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="••••••••"
            />
            <p class="mt-1 text-xs text-gray-500">
              Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
            </p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              required
              class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading">Réinitialisation...</span>
            <span v-else>Réinitialiser le mot de passe</span>
          </button>
        </div>
      </form>

      <div v-else class="text-center">
        <NuxtLink
          to="/auth/login"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Se connecter
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'guest',
  layout: false,
});

const route = useRoute();
const token = route.query.token as string;

const form = ref({
  password: '',
  confirmPassword: ''
});

const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

onMounted(() => {
  if (!token) {
    errorMessage.value = 'Token de réinitialisation manquant ou invalide';
  }
});

const handleResetPassword = async () => {
  console.log('Reset password requested');
  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  if (form.value.password !== form.value.confirmPassword) {
    errorMessage.value = 'Les mots de passe ne correspondent pas';
    isLoading.value = false;
    return;
  }

  try {
    const config = useRuntimeConfig();

    const response = await $fetch<any>(`${config.public.apiBaseUrl}/auth/reset-password`, {
      method: 'POST',
      body: {
        token: token,
        password: form.value.password
      }
    });

    if (response.success) {
      successMessage.value = response.message || 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.';
      console.log('Password reset successful');
    } else {
      errorMessage.value = response.message || 'Une erreur est survenue';
    }

  } catch (error: any) {
    console.error('Reset password error:', error);
    errorMessage.value = error.data?.message || 'Une erreur est survenue. Veuillez réessayer.';
  } finally {
    isLoading.value = false;
  }
};
</script>


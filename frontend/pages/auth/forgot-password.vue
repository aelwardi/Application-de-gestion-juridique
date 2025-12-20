<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Mot de passe oublié
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Entrez votre adresse email pour recevoir un lien de réinitialisation
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

      <form v-if="!successMessage" class="mt-8 space-y-6" @submit.prevent="handleForgotPassword">
        <div>
          <label for="email" class="sr-only">Email</label>
          <input
            id="email"
            v-model="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            class="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="Adresse email"
          />
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading">Envoi en cours...</span>
            <span v-else>Envoyer le lien de réinitialisation</span>
          </button>
        </div>

        <div class="text-center">
          <NuxtLink to="/auth/login" class="font-medium text-blue-600 hover:text-blue-500">
            Retour à la connexion
          </NuxtLink>
        </div>
      </form>

      <div v-else class="text-center">
        <NuxtLink
          to="/auth/login"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Aller à la page de connexion
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

const email = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const handleForgotPassword = async () => {
  console.log('Forgot password requested for:', email.value);
  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const config = useRuntimeConfig();

    const response = await $fetch<any>(`${config.public.apiBaseUrl}/auth/forgot-password`, {
      method: 'POST',
      body: { email: email.value }
    });

    if (response.success) {
      successMessage.value = response.message || `Un email de réinitialisation a été envoyé à ${email.value}. Veuillez vérifier votre boîte de réception.`;
      console.log('Password reset email sent');
    } else {
      errorMessage.value = response.message || 'Une erreur est survenue';
    }

  } catch (error: any) {
    console.error('Forgot password error:', error);
    errorMessage.value = error.data?.message || 'Une erreur est survenue. Veuillez réessayer.';
  } finally {
    isLoading.value = false;
  }
};
</script>


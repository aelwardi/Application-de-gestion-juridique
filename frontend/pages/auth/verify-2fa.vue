<script setup lang="ts">
import { ref } from 'vue';

definePageMeta({
  layout: 'default',
  middleware: 'guest',
});

const route = useRoute();
const router = useRouter();
const { apiFetch } = useApi();
const authStore = useAuthStore();

const tempToken = ref(route.query.token as string || '');
const code = ref('');
const loading = ref(false);
const error = ref('');

if (!tempToken.value) {
  navigateTo('/auth/login');
}

const handleSubmit = async () => {
  if (code.value.length < 6) {
    error.value = 'Le code doit contenir au moins 6 caractères';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const response: any = await apiFetch('/auth/login/2fa/complete', {
      method: 'POST',
      body: JSON.stringify({
        tempToken: tempToken.value,
        code: code.value.replace(/[-\s]/g, ''), // Remove dashes and spaces
      })
    } as any);

    if (response.success && response.data) {
      authStore.setAuth(response.data.user, response.data.accessToken, response.data.refreshToken);

      await router.push('/dashboard');
    }
  } catch (err: any) {
    console.error('2FA verification error:', err);
    error.value = err.data?.message || 'Code invalide ou expiré. Veuillez réessayer.';
    code.value = '';
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/auth/login');
};
</script>
<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-xl">
      <div>
        <div class="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100">
          <svg class="h-10 w-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Authentification à deux facteurs
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Entrez le code à 6 chiffres depuis votre application d'authentification
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span class="block sm:inline">{{ error }}</span>
        </div>

        <div>
          <label for="code" class="sr-only">Code de vérification</label>
          <input
            id="code"
            v-model="code"
            type="text"
            maxlength="8"
            inputmode="numeric"
            required
            class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-lg text-center tracking-widest"
            placeholder="000000"
            :disabled="loading"
          />
          <p class="mt-2 text-xs text-gray-500 text-center">
            Entrez le code à 6 chiffres ou un code de secours
          </p>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading || code.length < 6"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? 'Vérification...' : 'Vérifier' }}
          </button>
        </div>

        <div class="text-center">
          <button
            type="button"
            @click="handleCancel"
            class="text-sm text-gray-600 hover:text-gray-900 underline"
            :disabled="loading"
          >
            Annuler et retourner à la connexion
          </button>
        </div>
      </form>

      <div class="mt-6 border-t border-gray-200 pt-6">
        <details class="text-sm text-gray-600">
          <summary class="cursor-pointer font-medium text-gray-900 hover:text-blue-600">
            Problème d'accès ?
          </summary>
          <div class="mt-3 space-y-2 text-xs">
            <p><strong>Code non reçu ?</strong></p>
            <p>- Vérifiez l'heure de votre téléphone (elle doit être synchronisée)</p>
            <p>- Assurez-vous d'utiliser la bonne application d'authentification</p>
            <p><strong>Perdu l'accès ?</strong></p>
            <p>- Utilisez un de vos codes de secours (8 caractères)</p>
            <p>- Contactez le support si vous n'avez plus vos codes de secours</p>
          </div>
        </details>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type="text"] {
  letter-spacing: 0.5em;
  font-size: 1.5rem;
  font-weight: 600;
}

@media (max-width: 640px) {
  input[type="text"] {
    font-size: 1.25rem;
  }
}
</style>
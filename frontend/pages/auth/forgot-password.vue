<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-8">
    <div class="max-w-md w-full">
      <!-- Logo -->
      <div class="text-center mb-8">
        <NuxtLink to="/">
          <h1 class="text-3xl font-heading font-bold">
            <span class="text-primary-600">Lex</span><span class="text-neutral-800">Manager</span>
          </h1>
        </NuxtLink>
      </div>

      <!-- Card -->
      <div class="card p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h2 class="text-2xl font-heading font-bold text-neutral-900 mb-2">
            Mot de passe oublié ?
          </h2>
          <p class="text-neutral-600">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="bg-success-50 border border-success-200 rounded-lg p-4 mb-6">
          <div class="flex">
            <svg class="w-5 h-5 text-success-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <p class="text-sm text-success-800">{{ successMessage }}</p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="bg-accent-50 border border-accent-200 rounded-lg p-4 mb-6">
          <div class="flex">
            <svg class="w-5 h-5 text-accent-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <p class="text-sm text-accent-800">{{ errorMessage }}</p>
          </div>
        </div>

        <!-- Form -->
        <form v-if="!successMessage" @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-neutral-700 mb-2">
              Adresse email
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                </svg>
              </div>
              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                required
                class="input-field pl-10"
                placeholder="exemple@email.com"
              />
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="btn-primary w-full"
          >
            <span v-if="isLoading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Envoi en cours...
            </span>
            <span v-else>Envoyer le lien de réinitialisation</span>
          </button>
        </form>

        <!-- Back to Login Button -->
        <div v-if="successMessage" class="space-y-4">
          <NuxtLink to="/auth/login" class="btn-primary w-full block text-center">
            Retour à la connexion
          </NuxtLink>
        </div>

        <!-- Back to Login Link -->
        <div v-if="!successMessage" class="text-center mt-6">
          <NuxtLink to="/auth/login" class="text-sm text-neutral-600 hover:text-neutral-900 inline-flex items-center transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Retour à la connexion
          </NuxtLink>
        </div>
      </div>

      <!-- Help Text -->
      <div class="mt-8 text-center">
        <p class="text-sm text-neutral-600">
          Vous n'avez pas reçu l'email ? Vérifiez vos spams ou
          <button @click="handleSubmit" class="text-primary-600 hover:text-primary-700 font-medium">
            renvoyer
          </button>
        </p>
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

const handleSubmit = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    // TODO: Implement actual password reset API call
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

    successMessage.value = `Un email de réinitialisation a été envoyé à ${email.value}. Veuillez vérifier votre boîte de réception.`;
  } catch (error: any) {
    console.error('Password reset error:', error);
    errorMessage.value = 'Une erreur est survenue. Veuillez réessayer.';
  } finally {
    isLoading.value = false;
  }
};
</script>


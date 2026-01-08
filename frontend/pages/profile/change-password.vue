<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'authenticated',
});

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const form = ref({
  currentPassword: '',
  newPassword: '',
});

const confirmPassword = ref('');
const isLoading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const handleChangePassword = async () => {
  isLoading.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  if (form.value.newPassword !== confirmPassword.value) {
    errorMessage.value = 'Les nouveaux mots de passe ne correspondent pas';
    toast.warning('Les nouveaux mots de passe ne correspondent pas');
    isLoading.value = false;
    return;
  }

  try {
    const result = await authStore.changePassword(form.value);

    if (result.success) {
      successMessage.value = 'Mot de passe changé avec succès';
      toast.success('Mot de passe changé avec succès');
      form.value.currentPassword = '';
      form.value.newPassword = '';
      confirmPassword.value = '';

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } else {
      errorMessage.value = result.message || 'Échec du changement de mot de passe';
      toast.error(result.message || 'Échec du changement de mot de passe');
    }
  } catch (error: any) {
    console.error('Change password error:', error);
    errorMessage.value = 'Une erreur est survenue lors du changement de mot de passe';
    toast.error('Une erreur est survenue lors du changement de mot de passe');
  } finally {
    isLoading.value = false;
  }
};
</script>



<template>
  <div class="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">
            Changer le mot de passe
          </h2>

          <div v-if="successMessage" class="mb-4 rounded-md bg-green-50 p-4">
            <div class="flex">
              <div class="ml-3">
                <p class="text-sm font-medium text-green-800">
                  {{ successMessage }}
                </p>
              </div>
            </div>
          </div>

          <div v-if="errorMessage" class="mb-4 rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="ml-3">
                <p class="text-sm font-medium text-red-800">
                  {{ errorMessage }}
                </p>
              </div>
            </div>
          </div>

          <form @submit.prevent="handleChangePassword" class="space-y-6">
            <div>
              <label for="currentPassword" class="block text-sm font-medium text-gray-700">
                Mot de passe actuel
              </label>
              <input
                id="currentPassword"
                v-model="form.currentPassword"
                type="password"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700">
                Nouveau mot de passe
              </label>
              <input
                id="newPassword"
                v-model="form.newPassword"
                type="password"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p class="mt-1 text-xs text-gray-500">
                Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
              </p>
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                Confirmer le nouveau mot de passe
              </label>
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div class="flex justify-end space-x-4">
              <NuxtLink
                to="/dashboard"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md"
              >
                Annuler
              </NuxtLink>
              <button
                type="submit"
                :disabled="isLoading"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="isLoading">Changement en cours...</span>
                <span v-else>Changer le mot de passe</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
</template>


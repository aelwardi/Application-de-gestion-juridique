<template>
  <div class="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">
            Modifier le profil
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

          <form @submit.prevent="handleUpdate" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <input
                  id="firstName"
                  v-model="form.firstName"
                  type="text"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input
                  id="lastName"
                  v-model="form.lastName"
                  type="text"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
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
                <span v-if="isLoading">Enregistrement...</span>
                <span v-else>Enregistrer</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'authenticated',
});

const authStore = useAuthStore();

const form = ref({
  firstName: '',
  lastName: '',
  phone: '',
});

const isLoading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

onMounted(() => {
  if (authStore.user) {
    form.value = {
      firstName: authStore.user.firstName,
      lastName: authStore.user.lastName,
      phone: authStore.user.phone || '',
    };
  }
});

const handleUpdate = async () => {
  isLoading.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    const result = await authStore.updateProfile(form.value);

    if (result.success) {
      successMessage.value = 'Profil mis à jour avec succès';
    } else {
      errorMessage.value = result.message || 'Échec de la mise à jour du profil';
    }
  } catch (error: any) {
    console.error('Update profile error:', error);
    errorMessage.value = 'Une erreur est survenue lors de la mise à jour du profil';
  } finally {
    isLoading.value = false;
  }
};
</script>


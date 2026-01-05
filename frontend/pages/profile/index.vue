<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex items-center gap-6">
          <div class="relative">
            <img
              :src="user?.profilePictureUrl || '/images/default-avatar.png'"
              alt="Profile"
              class="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
            />
            <button
              @click="triggerFileUpload"
              class="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-lg"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleFileUpload"
            />
          </div>

          <div class="flex-grow">
            <h1 class="text-3xl font-bold text-gray-900">
              {{ user?.firstName }} {{ user?.lastName }}
            </h1>
            <p class="text-gray-600 mt-1">{{ user?.email }}</p>
            <div class="flex items-center gap-2 mt-2">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {{ getRoleLabel(user?.role) }}
              </span>
              <span
                v-if="user?.isVerified"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
              >
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                Vérifié
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md mb-6">
        <div class="border-b border-gray-200">
          <nav class="flex -mb-px">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="px-6 py-4 text-sm font-medium border-b-2 transition"
              :class="activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <div class="p-6">
          <div v-show="activeTab === 'personal'" class="space-y-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Informations personnelles</h2>
            <form @submit.prevent="updatePersonalInfo" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Prénom
                  </label>
                  <input
                    v-model="personalForm.firstName"
                    type="text"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    v-model="personalForm.lastName"
                    type="text"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  v-model="personalForm.email"
                  type="email"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  v-model="personalForm.phone"
                  type="tel"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div v-if="personalError" class="p-4 bg-red-50 border border-red-200 rounded-md">
                <p class="text-sm text-red-600">{{ personalError }}</p>
              </div>

              <div v-if="personalSuccess" class="p-4 bg-green-50 border border-green-200 rounded-md">
                <p class="text-sm text-green-600">{{ personalSuccess }}</p>
              </div>

              <button
                type="submit"
                :disabled="personalLoading"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="personalLoading">Enregistrement...</span>
                <span v-else>Enregistrer les modifications</span>
              </button>
            </form>
          </div>

          <div v-show="activeTab === 'security'" class="space-y-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Sécurité</h2>
            <form @submit.prevent="updatePassword" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe actuel
                </label>
                <input
                  v-model="securityForm.currentPassword"
                  type="password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  v-model="securityForm.newPassword"
                  type="password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  v-model="securityForm.confirmPassword"
                  type="password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div v-if="securityError" class="p-4 bg-red-50 border border-red-200 rounded-md">
                <p class="text-sm text-red-600">{{ securityError }}</p>
              </div>

              <div v-if="securitySuccess" class="p-4 bg-green-50 border border-green-200 rounded-md">
                <p class="text-sm text-green-600">{{ securitySuccess }}</p>
              </div>

              <button
                type="submit"
                :disabled="securityLoading"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="securityLoading">Modification...</span>
                <span v-else>Modifier le mot de passe</span>
              </button>
            </form>
          </div>

          <div v-show="activeTab === 'notifications'" class="space-y-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Préférences de notifications</h2>
            <form @submit.prevent="updateNotificationPreferences" class="space-y-4">
              <div class="space-y-3">
                <label class="flex items-center gap-3">
                  <input
                    v-model="notificationForm.emailNotifications"
                    type="checkbox"
                    class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span class="text-sm font-medium text-gray-700">
                    Recevoir les notifications par email
                  </span>
                </label>

                <label class="flex items-center gap-3">
                  <input
                    v-model="notificationForm.appointmentReminders"
                    type="checkbox"
                    class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span class="text-sm font-medium text-gray-700">
                    Rappels de rendez-vous
                  </span>
                </label>

                <label class="flex items-center gap-3">
                  <input
                    v-model="notificationForm.caseUpdates"
                    type="checkbox"
                    class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span class="text-sm font-medium text-gray-700">
                    Mises à jour des dossiers
                  </span>
                </label>

                <label class="flex items-center gap-3">
                  <input
                    v-model="notificationForm.messageAlerts"
                    type="checkbox"
                    class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span class="text-sm font-medium text-gray-700">
                    Alertes de nouveaux messages
                  </span>
                </label>
              </div>

              <button
                type="submit"
                :disabled="notificationLoading"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="notificationLoading">Enregistrement...</span>
                <span v-else>Enregistrer les préférences</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
  layout: 'authenticated',
});

const authStore = useAuthStore();
const user = computed(() => authStore.user);

const activeTab = ref('personal');
const fileInput = ref<HTMLInputElement | null>(null);

const tabs = [
  { id: 'personal', label: 'Informations personnelles' },
  { id: 'security', label: 'Sécurité' },
  { id: 'notifications', label: 'Notifications' },
];

const personalForm = ref({
  firstName: user.value?.firstName || '',
  lastName: user.value?.lastName || '',
  email: user.value?.email || '',
  phone: user.value?.phone || '',
});

const personalLoading = ref(false);
const personalError = ref('');
const personalSuccess = ref('');

const securityForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const securityLoading = ref(false);
const securityError = ref('');
const securitySuccess = ref('');

const notificationForm = ref({
  emailNotifications: true,
  appointmentReminders: true,
  caseUpdates: true,
  messageAlerts: true,
});

const notificationLoading = ref(false);

const getRoleLabel = (role: string | undefined) => {
  const labels: Record<string, string> = {
    client: 'Client',
    avocat: 'Avocat',
    collaborateur: 'Collaborateur',
    admin: 'Administrateur',
  };
  return labels[role || ''] || role;
};

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // TODO: Implémenter l'upload de la photo de profil
  console.log('File to upload:', file);
};

const updatePersonalInfo = async () => {
  personalLoading.value = true;
  personalError.value = '';
  personalSuccess.value = '';

  try {
    // TODO: Implémenter la mise à jour du profil
    await new Promise(resolve => setTimeout(resolve, 1000));
    personalSuccess.value = 'Informations mises à jour avec succès';
  } catch (error: any) {
    personalError.value = error.message || 'Une erreur est survenue';
  } finally {
    personalLoading.value = false;
  }
};

const updatePassword = async () => {
  securityLoading.value = true;
  securityError.value = '';
  securitySuccess.value = '';

  if (securityForm.value.newPassword !== securityForm.value.confirmPassword) {
    securityError.value = 'Les mots de passe ne correspondent pas';
    securityLoading.value = false;
    return;
  }

  try {
    // TODO: Implémenter la mise à jour du mot de passe
    await new Promise(resolve => setTimeout(resolve, 1000));
    securitySuccess.value = 'Mot de passe modifié avec succès';
    securityForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  } catch (error: any) {
    securityError.value = error.message || 'Une erreur est survenue';
  } finally {
    securityLoading.value = false;
  }
};

const updateNotificationPreferences = async () => {
  notificationLoading.value = true;

  try {
    // TODO: Implémenter la mise à jour des préférences
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error('Error updating notification preferences:', error);
  } finally {
    notificationLoading.value = false;
  }
};

watch(user, (newUser) => {
  if (newUser) {
    personalForm.value = {
      firstName: newUser.firstName || '',
      lastName: newUser.lastName || '',
      email: newUser.email || '',
      phone: newUser.phone || '',
    };
  }
}, { immediate: true });
</script>
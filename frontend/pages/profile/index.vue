<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Mon Profil</h1>
        <p class="text-gray-600 mt-2">Gérez vos informations personnelles</p>
      </div>

      <div class="bg-white rounded-lg shadow mb-8">
        <div class="p-6">
          <div class="flex items-center gap-6">
            <div class="relative">
              <div
                v-if="authStore.user?.profilePictureUrl"
                class="w-24 h-24 rounded-full bg-cover bg-center"
                :style="`background-image: url('${authStore.user.profilePictureUrl}')`"
              ></div>
              <div
                v-else
                class="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-semibold"
              >
                {{ getInitials() }}
              </div>
              <button
                class="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
                @click="showAvatarModal = true"
              >
                <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            <div class="flex-1">
              <h2 class="text-2xl font-bold text-gray-900">
                {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
              </h2>
              <p class="text-gray-600">{{ authStore.user?.email }}</p>
              <div class="flex gap-2 mt-2">
                <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {{ getRoleLabel(authStore.user?.role) }}
                </span>
                <span
                  v-if="authStore.user?.isVerified"
                  class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  ✓ Vérifié
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow mb-8">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <div class="p-6">
          <div v-if="activeTab === 'info'">
            <form @submit.prevent="updateProfile" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                  <input
                    v-model="profileForm.firstName"
                    type="text"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                  <input
                    v-model="profileForm.lastName"
                    type="text"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  v-model="profileForm.email"
                  type="email"
                  required
                  disabled
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p class="mt-1 text-sm text-gray-500">L'email ne peut pas être modifié</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  v-model="profileForm.phone"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div class="flex justify-end gap-4">
                <button
                  type="button"
                  @click="resetForm"
                  class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  :disabled="savingProfile"
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {{ savingProfile ? 'Enregistrement...' : 'Enregistrer' }}
                </button>
              </div>
            </form>
          </div>

          <div v-else-if="activeTab === 'security'">
            <form @submit.prevent="changePassword" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel *</label>
                <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe *</label>
                <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  required
                  minlength="8"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p class="mt-1 text-sm text-gray-500">Minimum 8 caractères</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe *</label>
                <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  required
                  minlength="8"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div v-if="passwordError" class="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                {{ passwordError }}
              </div>

              <div class="flex justify-end gap-4">
                <button
                  type="button"
                  @click="resetPasswordForm"
                  class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  :disabled="savingPassword"
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {{ savingPassword ? 'Modification...' : 'Changer le mot de passe' }}
                </button>
              </div>
            </form>
          </div>

          <div v-else-if="activeTab === 'preferences'">
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                <div class="space-y-4">
                  <label class="flex items-center justify-between py-2">
                    <span class="text-sm text-gray-700">Email pour nouveaux messages</span>
                    <input type="checkbox" v-model="preferences.emailMessages" class="rounded text-blue-600">
                  </label>
                  <label class="flex items-center justify-between py-2">
                    <span class="text-sm text-gray-700">Email pour rendez-vous</span>
                    <input type="checkbox" v-model="preferences.emailAppointments" class="rounded text-blue-600">
                  </label>
                  <label class="flex items-center justify-between py-2">
                    <span class="text-sm text-gray-700">Email pour mises à jour de dossiers</span>
                    <input type="checkbox" v-model="preferences.emailCaseUpdates" class="rounded text-blue-600">
                  </label>
                </div>
              </div>

              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Langue</h3>
                <select
                  v-model="preferences.language"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>

              <div class="flex justify-end">
                <button
                  @click="savePreferences"
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Enregistrer les préférences
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow border-2 border-red-200">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-red-600 mb-2">Zone de danger</h3>
          <p class="text-sm text-gray-600 mb-4">
            Actions irréversibles sur votre compte
          </p>
          <button
            @click="showDeleteModal = true"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h2 class="text-2xl font-bold text-red-600 mb-4">Supprimer le compte</h2>
        <p class="text-gray-600 mb-4">
          Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.
        </p>
        <div class="flex gap-4">
          <button
            @click="showDeleteModal = false"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            @click="deleteAccount"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>

    <div v-if="showAvatarModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h2 class="text-2xl font-bold mb-4">Changer la photo de profil</h2>
        <p class="text-gray-600 mb-4">Fonctionnalité en cours de développement...</p>
        <button
          @click="showAvatarModal = false"
          class="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Fermer
        </button>
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

const activeTab = ref('info');
const showDeleteModal = ref(false);
const showAvatarModal = ref(false);
const savingProfile = ref(false);
const savingPassword = ref(false);
const passwordError = ref('');

const tabs = [
  { id: 'info', name: 'Informations personnelles' },
  { id: 'security', name: 'Sécurité' },
  { id: 'preferences', name: 'Préférences' },
];

const profileForm = ref({
  firstName: authStore.user?.firstName || '',
  lastName: authStore.user?.lastName || '',
  email: authStore.user?.email || '',
  phone: authStore.user?.phone || '',
});

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const preferences = ref({
  emailMessages: true,
  emailAppointments: true,
  emailCaseUpdates: true,
  language: 'fr',
});

const getInitials = () => {
  if (!authStore.user) return '?';
  return `${authStore.user.firstName.charAt(0)}${authStore.user.lastName.charAt(0)}`.toUpperCase();
};

const getRoleLabel = (role?: string) => {
  const labels: Record<string, string> = {
    admin: 'Administrateur',
    avocat: 'Avocat',
    client: 'Client',
    collaborateur: 'Collaborateur',
  };
  return role ? labels[role] || role : '';
};

const updateProfile = async () => {
  try {
    savingProfile.value = true;
    // TODO: API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Profil mis à jour avec succès!');
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Erreur lors de la mise à jour');
  } finally {
    savingProfile.value = false;
  }
};

const changePassword = async () => {
  passwordError.value = '';

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'Les mots de passe ne correspondent pas';
    return;
  }

  try {
    savingPassword.value = true;
    // TODO: API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    resetPasswordForm();
    alert('Mot de passe changé avec succès!');
  } catch (error) {
    console.error('Error changing password:', error);
    passwordError.value = 'Erreur lors du changement de mot de passe';
  } finally {
    savingPassword.value = false;
  }
};

const savePreferences = async () => {
  try {
    // TODO: API call
    await new Promise(resolve => setTimeout(resolve, 500));
    alert('Préférences enregistrées!');
  } catch (error) {
    console.error('Error saving preferences:', error);
    alert('Erreur lors de l\'enregistrement');
  }
};

const resetForm = () => {
  profileForm.value = {
    firstName: authStore.user?.firstName || '',
    lastName: authStore.user?.lastName || '',
    email: authStore.user?.email || '',
    phone: authStore.user?.phone || '',
  };
};

const resetPasswordForm = () => {
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
  passwordError.value = '';
};

const deleteAccount = async () => {
  try {
    // TODO: API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    authStore.clearAuth();
    navigateTo('/auth/login');
  } catch (error) {
    console.error('Error deleting account:', error);
    alert('Erreur lors de la suppression du compte');
  }
};
</script>
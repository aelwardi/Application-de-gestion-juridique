<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin',
});

const route = useRoute();
const { apiFetch } = useApi();

const user = ref<any>(null);
const loading = ref(true);

const fetchUser = async () => {
  loading.value = true;
  try {
    const response = await apiFetch<any>(`/admin/users/${route.params.id}`, {
      method: 'GET',
    });

    if (response.success) {
      user.value = response.data;
    }
  } catch (error) {
    console.error('Failed to fetch user:', error);
  } finally {
    loading.value = false;
  }
};

const toggleStatus = async () => {
  if (!confirm(`Voulez-vous vraiment ${user.value.is_active ? 'désactiver' : 'activer'} cet utilisateur ?`)) {
    return;
  }

  try {
    const response = await apiFetch(`/admin/users/${user.value.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: !user.value.is_active }),
    });

    if (response.success) {
      user.value.is_active = !user.value.is_active;
    }
  } catch (error) {
    console.error('Failed to toggle user status:', error);
    alert('Erreur lors de la mise à jour');
  }
};

const verifyUser = async () => {
  if (!confirm('Voulez-vous vraiment vérifier cet utilisateur ?')) {
    return;
  }

  try {
    const response = await apiFetch(`/admin/users/${user.value.id}/verify`, {
      method: 'PATCH',
    });

    if (response.success) {
      user.value.is_verified = true;
    }
  } catch (error) {
    console.error('Failed to verify user:', error);
    alert('Erreur lors de la vérification');
  }
};

const deleteUser = async () => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer ${user.value.first_name} ${user.value.last_name} ? Cette action est irréversible.`)) {
    return;
  }

  try {
    const response = await apiFetch(`/admin/users/${user.value.id}`, {
      method: 'DELETE',
    });

    if (response.success) {
      alert('Utilisateur supprimé avec succès');
      navigateTo('/admin/users');
    }
  } catch (error) {
    console.error('Failed to delete user:', error);
    alert('Erreur lors de la suppression');
  }
};

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    admin: 'Administrateur',
    avocat: 'Avocat',
    client: 'Client',
    collaborateur: 'Collaborateur',
  };
  return labels[role] || role;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR');
};

onMounted(() => {
  fetchUser();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <NuxtLink
              to="/admin/users"
              class="text-gray-500 hover:text-gray-700"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </NuxtLink>
            <h1 class="text-3xl font-bold text-gray-900">Détails Utilisateur</h1>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Chargement...</p>
      </div>
    </div>

    <div v-else-if="user" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="lg:col-span-1">
          <div class="bg-white shadow rounded-lg p-6">
            <div class="text-center">
              <div class="inline-flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 mb-4">
                <span class="text-3xl font-bold text-blue-600">
                  {{ user.first_name?.charAt(0) }}{{ user.last_name?.charAt(0) }}
                </span>
              </div>
              <h2 class="text-2xl font-bold text-gray-900">{{ user.first_name }} {{ user.last_name }}</h2>
              <p class="text-gray-500">{{ user.email }}</p>

              <div class="mt-4 flex items-center justify-center space-x-2">
                <span
                  class="px-3 py-1 text-sm font-semibold rounded-full"
                  :class="{
                    'bg-purple-100 text-purple-800': user.role === 'admin',
                    'bg-blue-100 text-blue-800': user.role === 'avocat',
                    'bg-green-100 text-green-800': user.role === 'client',
                    'bg-yellow-100 text-yellow-800': user.role === 'collaborateur',
                  }"
                >
                  {{ getRoleLabel(user.role) }}
                </span>
                <span
                  class="px-3 py-1 text-sm font-semibold rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': user.is_active,
                    'bg-red-100 text-red-800': !user.is_active,
                  }"
                >
                  {{ user.is_active ? 'Actif' : 'Inactif' }}
                </span>
              </div>

              <div class="mt-6 space-y-3">
                <button
                  @click="toggleStatus"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  {{ user.is_active ? 'Désactiver' : 'Activer' }}
                </button>
                <button
                  v-if="!user.is_verified"
                  @click="verifyUser"
                  class="w-full px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Vérifier le compte
                </button>
                <button
                  @click="deleteUser"
                  class="w-full px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Informations</h3>
            <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">Email</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ user.email }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Téléphone</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ user.phone || 'Non renseigné' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Rôle</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ getRoleLabel(user.role) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Statut</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  <span :class="user.is_active ? 'text-green-600' : 'text-red-600'">
                    {{ user.is_active ? 'Actif' : 'Inactif' }}
                  </span>
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Vérifié</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  <span :class="user.is_verified ? 'text-green-600' : 'text-yellow-600'">
                    {{ user.is_verified ? 'Oui' : 'Non' }}
                  </span>
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Inscription</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDate(user.created_at) }}</dd>
              </div>
              <div v-if="user.last_login_at">
                <dt class="text-sm font-medium text-gray-500">Dernière connexion</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDate(user.last_login_at) }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center">
        <p class="text-gray-600">Utilisateur non trouvé</p>
        <NuxtLink to="/admin/users" class="mt-4 text-blue-600 hover:text-blue-800">
          Retour à la liste
        </NuxtLink>
      </div>
    </div>
  </div>
</template>


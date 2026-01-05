<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          Tableau de bord
        </h2>

        <div v-if="authStore.user" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="text-sm font-medium text-gray-500">Email</h3>
              <p class="mt-1 text-lg text-gray-900">{{ authStore.user.email }}</p>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="text-sm font-medium text-gray-500">Téléphone</h3>
              <p class="mt-1 text-lg text-gray-900">{{ authStore.user.phone || 'Non renseigné' }}</p>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="text-sm font-medium text-gray-500">Rôle</h3>
              <p class="mt-1 text-lg text-gray-900">{{ roleLabel }}</p>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="text-sm font-medium text-gray-500">Statut du compte</h3>
              <p class="mt-1 text-lg text-gray-900">
                <span v-if="authStore.user.isActive" class="text-green-600">Actif</span>
                <span v-else class="text-red-600">Inactif</span>
              </p>
            </div>
          </div>

          <div class="mt-6 flex space-x-4">
            <NuxtLink
              to="/profile"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Modifier le profil
            </NuxtLink>
            <NuxtLink
              to="/profile/change-password"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md"
            >
              Changer le mot de passe
            </NuxtLink>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Rendez-vous</h3>
            <p class="text-sm text-gray-600 mb-4">Gérez vos rendez-vous</p>
            <NuxtLink
              to="/appointments"
              class="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Voir les rendez-vous →
            </NuxtLink>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Dossiers</h3>
            <p class="text-sm text-gray-600 mb-4">Accédez à vos dossiers</p>
            <NuxtLink
              to="/cases"
              class="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Voir les dossiers →
            </NuxtLink>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Messages</h3>
            <p class="text-sm text-gray-600 mb-4">Consultez vos messages</p>
            <NuxtLink
              to="/messages"
              class="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Voir les messages →
            </NuxtLink>
          </div>
        </div>
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

onMounted(() => {
  if (authStore.isAdmin) {
    navigateTo('/admin/stats');
  } else if (authStore.user?.role === 'client') {
    navigateTo('/dashboard/client');
  } else if (authStore.user?.role === 'avocat') {
    navigateTo('/dashboard/avocat');
  }
});

const roleLabel = computed(() => {
  if (!authStore.user) return '';
  const roles: Record<string, string> = {
    admin: 'Administrateur',
    avocat: 'Avocat',
    client: 'Client',
    collaborateur: 'Collaborateur',
  };
  return roles[authStore.user.role] || authStore.user.role;
});
</script>
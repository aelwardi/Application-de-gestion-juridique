<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <NuxtLink to="/dashboard" class="text-xl font-bold text-blue-600">
              Gestion Juridique
            </NuxtLink>
            <ClientOnly>
              <div class="hidden md:flex space-x-4">
                <NuxtLink
                  v-if="authStore.isLawyer || authStore.isAdmin"
                  to="/cases"
                  class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dossiers
                </NuxtLink>
                <NuxtLink
                  to="/appointments"
                  class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Rendez-vous
                </NuxtLink>
                <NuxtLink
                  v-if="authStore.isClient"
                  to="/lawyers"
                  class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Avocats
                </NuxtLink>
                <NuxtLink
                  to="/messages"
                  class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Messages
                </NuxtLink>
                <NuxtLink
                  v-if="authStore.isAdmin"
                  to="/admin/stats"
                  class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Administration
                </NuxtLink>
              </div>
            </ClientOnly>
          </div>
          <ClientOnly>
            <div class="flex items-center space-x-4">
              <span v-if="authStore.user" class="text-sm text-gray-700">{{ authStore.fullName }}</span>
              <span v-if="roleLabel" class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {{ roleLabel }}
              </span>
              <button
                @click="handleLogout"
                class="px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Déconnexion
              </button>
            </div>
          </ClientOnly>
        </div>
      </div>
    </nav>

    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore();

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

const handleLogout = async () => {
  await authStore.logout();
};
</script>


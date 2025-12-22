<template>
  <div class="min-h-screen bg-gray-100">
    <nav v-if="authStore.isAdmin" class="bg-gradient-to-r from-purple-700 to-indigo-800 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <NuxtLink to="/admin/stats" class="text-xl font-bold text-white flex items-center">
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Back Office Admin
            </NuxtLink>
            <ClientOnly>
              <div class="hidden md:flex space-x-2">
                <NuxtLink
                  to="/admin/stats"
                  class="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Dashboard
                </NuxtLink>
                <NuxtLink
                  to="/admin/users"
                  class="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Utilisateurs
                </NuxtLink>
                <NuxtLink
                  to="/admin/support"
                  class="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Support
                </NuxtLink>
                <NuxtLink
                  to="/admin/logs"
                  class="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Logs
                </NuxtLink>
                <NuxtLink
                  to="/admin/create-admin"
                  class="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Créer Admin
                </NuxtLink>
              </div>
            </ClientOnly>
          </div>
          <ClientOnly>
            <div class="flex items-center space-x-4">
              <span v-if="authStore.user" class="text-sm text-white font-medium">{{ authStore.fullName }}</span>
              <span class="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-400 text-purple-900">
                👑 ADMIN
              </span>
              <button
                @click="handleLogout"
                class="px-4 py-2 text-sm font-medium text-purple-700 bg-white hover:bg-gray-100 rounded-md transition"
              >
                Déconnexion
              </button>
            </div>
          </ClientOnly>
        </div>
      </div>
    </nav>

    <nav v-else class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <NuxtLink to="/dashboard" class="text-xl font-bold text-blue-600">
              Gestion Juridique
            </NuxtLink>
            <ClientOnly>
              <div class="hidden md:flex space-x-4">
                <NuxtLink
                  v-if="authStore.isLawyer"
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
              </div>
            </ClientOnly>
          </div>
          <ClientOnly>
            <div class="flex items-center space-x-4">
              <NotificationDropdown />

              <NuxtLink
                to="/profile"
                class="flex items-center gap-2 text-gray-700 hover:text-blue-600"
              >
                <span v-if="authStore.user" class="text-sm">{{ authStore.fullName }}</span>
                <span v-if="roleLabel" class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {{ roleLabel }}
                </span>
              </NuxtLink>

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
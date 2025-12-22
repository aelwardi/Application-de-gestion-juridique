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
            <div class="flex items-center space-x-2">
              <NotificationDropdown />

              <div class="relative">
                <button
                  @click="toggleProfileMenu"
                  class="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <div
                    v-if="authStore.user?.profilePictureUrl"
                    class="w-10 h-10 rounded-full bg-cover bg-center border-2 border-blue-500"
                    :style="`background-image: url('${authStore.user.profilePictureUrl}')`"
                  ></div>
                  <div
                    v-else
                    class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold border-2 border-blue-600"
                  >
                    {{ getInitials() }}
                  </div>
                  <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <transition
                  enter-active-class="transition ease-out duration-200"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95"
                >
                  <div
                    v-if="showProfileMenu"
                    class="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                    @click.stop
                  >
                    <div class="p-4 border-b border-gray-200">
                      <div class="flex items-center gap-3">
                        <div
                          v-if="authStore.user?.profilePictureUrl"
                          class="w-12 h-12 rounded-full bg-cover bg-center"
                          :style="`background-image: url('${authStore.user.profilePictureUrl}')`"
                        ></div>
                        <div
                          v-else
                          class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg"
                        >
                          {{ getInitials() }}
                        </div>
                        <div class="flex-1">
                          <p class="font-semibold text-gray-900">{{ authStore.fullName }}</p>
                          <p class="text-sm text-gray-500">{{ authStore.user?.email }}</p>
                          <span v-if="roleLabel" class="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {{ roleLabel }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div class="py-2">
                      <NuxtLink
                        to="/profile"
                        @click="showProfileMenu = false"
                        class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div>
                          <p class="text-sm font-medium text-gray-900">Mon Profil</p>
                          <p class="text-xs text-gray-500">Gérer mes informations</p>
                        </div>
                      </NuxtLink>

                      <NuxtLink
                        to="/notifications"
                        @click="showProfileMenu = false"
                        class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <div>
                          <p class="text-sm font-medium text-gray-900">Notifications</p>
                          <p class="text-xs text-gray-500">Voir toutes les notifications</p>
                        </div>
                      </NuxtLink>

                      <NuxtLink
                        v-if="authStore.isClient"
                        to="/clients/requests"
                        @click="showProfileMenu = false"
                        class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p class="text-sm font-medium text-gray-900">Mes Demandes</p>
                          <p class="text-xs text-gray-500">Demandes aux avocats</p>
                        </div>
                      </NuxtLink>

                      <NuxtLink
                        v-if="authStore.isLawyer"
                        to="/clients"
                        @click="showProfileMenu = false"
                        class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <div>
                          <p class="text-sm font-medium text-gray-900">Mes Clients</p>
                          <p class="text-xs text-gray-500">Gérer mes clients</p>
                        </div>
                      </NuxtLink>
                    </div>

                    <div class="border-t border-gray-200 py-2">
                      <button
                        @click="handleLogout"
                        class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors w-full"
                      >
                        <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <div class="text-left">
                          <p class="text-sm font-medium text-red-600">Déconnexion</p>
                          <p class="text-xs text-gray-500">Se déconnecter du compte</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </transition>
              </div>
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
const showProfileMenu = ref(false);

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

const getInitials = () => {
  if (!authStore.user) return '?';
  return `${authStore.user.firstName.charAt(0)}${authStore.user.lastName.charAt(0)}`.toUpperCase();
};

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value;
};

const handleLogout = async () => {
  showProfileMenu.value = false;
  await authStore.logout();
};

onMounted(() => {
  document.addEventListener('click', () => {
    if (showProfileMenu.value) {
      showProfileMenu.value = false;
    }
  });
});
</script>